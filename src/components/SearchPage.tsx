import {FormEvent, useState} from "react";
import type {SearchResult} from "../types";
import {RagApi} from "../api";

type Props = {api:RagApi; onLogout:()=>void; onUpload:()=>void};

export function SearchPage({api,onLogout,onUpload}: Props) {
  const [query,setQuery]=useState("");
  const [results,setResults]=useState<SearchResult[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  async function submit(e:FormEvent) {
    e.preventDefault(); if(!query.trim()) return;
    setLoading(true); setError("");
    try { setResults(await api.search(query.trim())); } catch(err) { setError(err instanceof Error ? err.message : "Search failed"); }
    finally { setLoading(false); }
  }
  return <div className="app-shell">
    <header className="topbar"><div><strong>Private Knowledge</strong><span>Search</span></div><nav><button className="secondary" onClick={onUpload}>Add knowledge</button><button className="ghost" onClick={onLogout}>Sign out</button></nav></header>
    <main className="content">
      <section className="hero"><p className="eyebrow">YOUR KNOWLEDGE</p><h1>What are you looking for?</h1><p>Search across your indexed emails and documents.</p>
      <form className="search-box" onSubmit={submit}><input aria-label="Search query" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ask a question or search for a phrase…" /><button type="submit" disabled={loading || !query.trim()}>{loading?"Searching…":"Search"}</button></form>
      </section>
      {error && <div className="error banner">{error}</div>}
      <section className="results"><div className="section-head"><h2>Results</h2>{results.length>0 && <span>{results.length} found</span>}</div>
      {results.length===0 && !loading ? <div className="empty"><div className="empty-icon">⌕</div><h3>Nothing searched yet</h3><p>Enter a question above to search your private knowledge base.</p></div> :
      results.map((r,i)=><article className="result-card" key={r.id || String(i)}><div className="result-meta">{r.source_name || "Unknown source"}{r.created_at && <> · {new Date(r.created_at).toLocaleDateString()}</>}</div><h3>{r.title || r.filename || "Search result"}</h3><p>{r.text}</p>{r.score != null && <small>Relevance {r.score.toFixed(3)}</small>}</article>)}
      </section>
    </main>
  </div>;
}
