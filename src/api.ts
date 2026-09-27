import type { AnswerCitation, AnswerStreamEvent, SearchResult, Source, Stats } from "./types";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export class RagApi {
  constructor(private baseUrl: string, private token: string) {}

  private requestId(): string { return crypto.randomUUID(); }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${this.token}`);
    headers.set("X-Request-ID", this.requestId());
    if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(`${this.baseUrl}${path}`, {...init, headers});
    const text = await response.text();
    let data: unknown = undefined;
    try { data = text ? JSON.parse(text) : undefined; } catch { data = text; }
    if (!response.ok) {
      const detail = typeof data === "object" && data && "detail" in data ? String((data as {detail: unknown}).detail) : response.statusText;
      throw new ApiError(response.status, detail || "Request failed");
    }
    return data as T;
  }

  search(query: string, limit = 10): Promise<SearchResult[]> {
    return this.request<SearchResult[]>("/search", {method:"POST", body:JSON.stringify({query,limit})});
  }

  sources(): Promise<Source[]> { return this.request<Source[]>("/sources"); }
  stats(): Promise<Stats> { return this.request<Stats>("/stats"); }
  message(id: string): Promise<Record<string, unknown>> { return this.request<Record<string, unknown>>(`/messages/${encodeURIComponent(id)}`); }
  document(id: string): Promise<Record<string, unknown>> { return this.request<Record<string, unknown>>(`/documents/${encodeURIComponent(id)}`); }

  upload(file: File, sourceName = "default"): Promise<Record<string, unknown>> {
    const form = new FormData();
    form.append("file", file);
    form.append("source_name", sourceName);
    return this.request<Record<string, unknown>>("/upload", {method:"POST", body:form});
  }

  async *streamAnswer(question: string, conversationId?: string): AsyncGenerator<AnswerStreamEvent> {
    const headers = new Headers({"Authorization": `Bearer ${this.token}`, "Content-Type": "application/json", "X-Request-ID": this.requestId()});
    const response = await fetch(`${this.baseUrl}/api/v1/answer/stream`, {
      method: "POST", headers,
      body: JSON.stringify({question, ...(conversationId ? {conversation_id: conversationId} : {})}),
    });
    if (!response.ok) {
      const text = await response.text();
      let detail = response.statusText;
      try { const data = JSON.parse(text) as {detail?: unknown}; if (data.detail) detail = String(data.detail); } catch {}
      throw new ApiError(response.status, detail || "Chat request failed");
    }
    if (!response.body) throw new ApiError(0, "Streaming is not supported by this browser");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let event = "message";
    let data = "";
    const emit = async function* (): AsyncGenerator<AnswerStreamEvent> {
      if (!data) return;
      let payload: Record<string, unknown>;
      try { payload = JSON.parse(data) as Record<string, unknown>; } catch { throw new ApiError(0, "Invalid streaming response"); }
      if (event === "delta") yield {type:"delta", content:String(payload.content ?? "")};
      else if (event === "done") yield {
        type:"done",
        conversation_id:String(payload.conversation_id ?? ""),
        citations:Array.isArray(payload.citations) ? payload.citations as AnswerCitation[] : [],
      };
      else if (event === "error") yield {type:"error", detail:String(payload.detail ?? "Chat request failed")};
      event="message";
      data="";
    };
    while(true) {
      const {value,done}=await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), {stream:!done});
      const blocks=buffer.split("\n\n");
      buffer=blocks.pop() ?? "";
      for(const block of blocks) {
        for(const line of block.split("\n")) {
          if(line.startsWith("event: ")) event=line.slice(7).trim();
          else if(line.startsWith("data: ")) data+=line.slice(6);
        }
        yield* emit();
      }
      if(done) break;
    }
    if(buffer.trim()) {
      for(const line of buffer.split("\n")) {
        if(line.startsWith("event: ")) event=line.slice(7).trim();
        else if(line.startsWith("data: ")) data+=line.slice(6);
      }
      yield* emit();
    }
  }
}
