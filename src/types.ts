export type SearchResult = {
  id?: string;
  chunk_id?: string | number;
  text: string;
  score?: number;
  source_name?: string;
  title?: string;
  filename?: string;
  message_id?: string;
  document_id?: string;
  created_at?: string;
  parent_kind?: "message" | "document";
  parent?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type Source = {
  source_name: string;
  item_count?: number;
  message_count?: number;
  document_count?: number;
  updated_at?: string;
  [key: string]: unknown;
};

export type Stats = Record<string, number | string | null>;

export type AnswerCitation = {id:string;chunk_id:string;source_name:string;text:string};
export type AnswerStreamEvent =
  | {type:"delta";content:string}
  | {type:"done";conversation_id:string;citations:AnswerCitation[]}
  | {type:"error";detail:string};


export type TraceEvent = {
  event_id: string;
  parent_id?: string | null;
  sequence: number;
  kind: string;
  stage: string;
  name: string;
  status: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number | null;
  payload: Record<string, unknown>;
};

export type ExecutionTrace = {
  schema_version: string;
  trace_id: string;
  request_id?: string | null;
  started_at: string;
  completed_at?: string | null;
  duration_ms?: number | null;
  status: string;
  error?: Record<string, unknown> | null;
  logs: Array<Record<string, unknown>>;
  metrics: Record<string, unknown>;
  trace: TraceEvent[];
};

export type RequestStatus = {
  request_id: string;
  trace_id?: string;
  status: "queued" | "running" | "completed" | "failed";
  duration_ms?: number;
  stages: Array<{name: string; status: string; duration_ms?: number}>;
};

export type OperationalStatus = {
  status: "ok" | "degraded";
  request_id: string;
  services: Record<string, {status: string; latency_ms?: number; http_status?: number; reason?: string}>;
};
