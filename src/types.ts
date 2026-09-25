export type SearchResult = {
  id: string;
  text: string;
  score?: number;
  source_name?: string;
  title?: string;
  filename?: string;
  message_id?: string;
  document_id?: string;
  created_at?: string;
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
