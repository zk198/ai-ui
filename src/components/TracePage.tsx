import {useEffect,useState} from "react";
import type {ExecutionTrace,TraceEvent} from "../types";
import {RagApi} from "../api";

function Event({event}:{event:TraceEvent}) {
  const [open,setOpen]=useState(false);
  return <article style={{marginLeft:event.parent_id?20:0}}>
    <button onClick={()=>setOpen(!open)} aria-expanded={open}>{event.sequence}. {event.stage} / {event.name} — {event.status} {event.duration_ms != null ? "("+event.duration_ms+" ms)" : ""}</button>
    {open && <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(event.payload,null,2)}</pre>}
  </article>;
}
export function TracePage({api,traceId,onBack}:{api:RagApi;traceId:string;onBack:()=>void}) {
 const [data,setData]=useState<ExecutionTrace|null>(null); const [error,setError]=useState("");
 useEffect(()=>{api.trace(traceId).then(setData).catch(e=>setError(e instanceof Error?e.message:"Unable to load trace"));},[api,traceId]);
 return <main className="page"><button onClick={onBack}>← Back</button><h1>CTO Diagnostics</h1><p>Trace: {traceId}</p>
 {error&&<p role="alert">{error}</p>}
 {data&&<><dl><dt>Status</dt><dd>{data.status}</dd><dt>Duration</dt><dd>{data.duration_ms ?? "—"} ms</dd><dt>Request</dt><dd>{data.request_id ?? "—"}</dd></dl>
 <section><h2>Execution trace</h2>{data.trace.map(e=><Event key={e.event_id} event={e}/>)}</section>
 <details><summary>Logs</summary><pre>{JSON.stringify(data.logs,null,2)}</pre></details>
 <details><summary>Metrics</summary><pre>{JSON.stringify(data.metrics,null,2)}</pre></details>
 <details><summary>Raw JSON</summary><pre>{JSON.stringify(data,null,2)}</pre></details></>}
 </main>;
}
