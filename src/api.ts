import type { SearchResult, Source, Stats } from "./types";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export class RagApi {
  constructor(private baseUrl: string, private token: string) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${this.token}`);
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

  upload(file: File, sourceName = "default"): Promise<Record<string, unknown>> {
    const form = new FormData();
    form.append("file", file);
    form.append("source_name", sourceName);
    return this.request<Record<string, unknown>>("/upload", {method:"POST", body:form});
  }
}
