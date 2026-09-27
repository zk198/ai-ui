import {useEffect,useState} from "react";
import type {OperationalStatus} from "../types";
import {RagApi} from "../api";

export function ObservabilityPage({api,onBack,onTrace}:{api:RagApi;onBack:()=>void;onTrace:(id:string)=>void}) {
  const [status,setStatus]=useState<OperationalStatus|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{api.opsStatus().then(setStatus).catch(e=>setError(e instanceof Error?e.message:"Unable to load status"));},[api]);
  return <main className="page">
    <button onClick={onBack}>← Back</button>
    <h1>Operations</h1>
    {error && <p role="alert">{error}</p>}
    {status && <section aria-label="service health"><h2>{status.status}</h2>
      {Object.entries(status.services).map(([name,item])=><article key={name}><strong>{name}</strong> — {item.status} {item.latency_ms != null ? item.latency_ms+" ms" : ""}</article>)}
    </section>}
    <section><h2>CTO diagnostics</h2><p>Level 3 is privileged and requires diagnostics:read.</p>
      <label>Trace ID <input aria-label="Trace ID" id="trace-id"/></label>
      <button onClick={()=>{const id=(document.getElementById("trace-id") as HTMLInputElement).value.trim();if(id)onTrace(id)}}>Open trace</button>
    </section>
  </main>;
}
