const KEY = "rag-ui.jwt";

export function loadToken(prefill = ""): string {
  return localStorage.getItem(KEY) || prefill;
}
export function saveToken(token: string): void { localStorage.setItem(KEY, token); }
export function clearToken(): void { localStorage.removeItem(KEY); }
