import {useEffect,useMemo,useState} from "react";
import type {ExecutionTrace,TraceEvent} from "../types";
import {ApiError,RagApi} from "../api";

function EventRow({event,depth,onToggle,open}:{event:TraceEvent;depth:number;onToggle:()=>void;open:boolean}) {
  const payload = event.payload ?? {};
  const error = typeof payload.error === "object" && payload.error !== null;
  const detail = event.duration_ms != null ? `${event.duration_ms} ms` : "running";
  return <article className={`trace-event ${event.status === "failed" || error ? "trace-failed" : ""}`} style={{marginLeft:depth*18}}>
    <button className="trace-event-header" onClick={onToggle} aria-expanded={open}>
      <span className="trace-seq">{event.sequence}</span>
      <span className="trace-main"><strong>{event.name}</strong><small>{event.stage} · {event.kind}</small></span>
      <span className="trace-status">{event.status}</span>
      <span className="trace-duration">{detail}</span>
    </button>
    {open && <div className="trace-event-detail">
      <dl className="detail-row"><span>Event</span><strong>{event.event_id}</strong></dl>
      {event.parent_id && <dl className="detail-row"><span>Parent</span><strong>{event.parent_id}</strong></dl>}
      <dl className="detail-row"><span>Started</span><strong>{event.started_at}</strong></dl>
      {event.completed_at && <dl className="detail-row"><span>Completed</span><strong>{event.completed_at}</strong></dl>}
      <pre>{JSON.stringify(payload,null,2)}</pre>
    </div>}
  </article>;
}

export function TracePage({api,traceId,onBack}:{api:RagApi;traceId:string;onBack:()=>void}) {
  const [data,setData]=useState<ExecutionTrace|null>(null);
  const [error,setError]=useState("");
  const [filter,setFilter]=useState("all");
  const [open,setOpen]=useState<Record<string,boolean>>({});
  useEffect(()=>{setError("");api.trace(traceId).then(setData).catch(e=>{
    setError(e instanceof ApiError && e.status===403 ? "Diagnostics access denied (diagnostics:read required)." : e instanceof Error ? e.message : "Unable to load trace");
  });},[api,traceId]);

  const layaEvents=useMemo(()=>data?.trace.filter(e=>e.kind==="system1"||e.stage==="laya") ?? [],[data]);
  const visible=useMemo(()=>data?.trace.filter(e=>filter==="all"||e===undefined||e.kind===filter||e.stage===filter) ?? [],[data,filter]);
  const visibleIds=new Set(visible.map(e=>e.event_id));
  const depth=(event:TraceEvent)=>{
    let n=0; let parent=event.parent_id;
    while(parent && n<20){const p=data?.trace.find(e=>e.event_id===parent);if(!p)break;n++;parent=p.parent_id;}
    return n;
  };
  async function copyJson(){if(data) await navigator.clipboard.writeText(JSON.stringify(data,null,2));}
  function downloadJson(){if(!data)return;const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`trace-${data.trace_id}.json`;a.click();URL.revokeObjectURL(url);}

  return <main className="content">
    <button className="ghost" onClick={onBack}>← Operations</button>
    <div className="page-title"><p className="eyebrow">LEVEL 3 · PRIVILEGED</p><h1>CTO Diagnostics</h1><p>Full execution trace for authorised diagnostics access.</p></div>
    {error&&<div className="error banner" role="alert">{error}</div>}
    {data&&<><section className="stats-row">
      <div><strong>{data.status}</strong><span>Status</span></div>
      <div><strong>{data.duration_ms ?? "—"} ms</strong><span>Duration</span></div>
      <div><strong>{data.trace.length}</strong><span>Events</span></div>
      <div><strong>{String(data.metrics.trace_events ?? data.trace.length)}</strong><span>Recorded</span></div>
    </section>
    <section className="detail-card trace-summary"><div className="detail-row"><span>Trace ID</span><strong>{data.trace_id}</strong></div><div className="detail-row"><span>Request ID</span><strong>{data.request_id ?? "—"}</strong></div><div className="detail-row"><span>Schema</span><strong>{data.schema_version}</strong></div>{data.error&&<div className="error banner">{JSON.stringify(data.error)}</div>}</section>
    {layaEvents.length>0&&<section className="detail-card trace-summary">
      <div className="section-head"><h2>Laya System-1</h2><span>{layaEvents.length} decision{layaEvents.length===1?"":"s"}</span></div>
      {layaEvents.map(event=>{
        const answers=event.payload?.answers;
        const routing=event.payload?.routing;
        const error=event.payload?.error;
        return <article key={event.event_id} className={event.status==="failed"?"trace-failed":""}>
          <div className="detail-row"><span>Decision</span><strong>{typeof answers==="object"&&answers?JSON.stringify(answers):"—"}</strong></div>
          <div className="detail-row"><span>Model</span><strong>{typeof routing==="object"&&routing&&"model" in routing?String((routing as Record<string,unknown>).model):"—"}</strong></div>
          <div className="detail-row"><span>Latency</span><strong>{event.duration_ms ?? "—"} ms</strong></div>
          {error&&<div className="error banner">{JSON.stringify(error)}</div>}
          {event.status!=="completed"&&!error&&<div className="error banner">Laya {event.status}</div>}
        </article>;
      })}
    </section>}
    <section className="trace-panel"><div className="section-head"><h2>Execution waterfall</h2><div className="trace-controls">
      {["all","llm","tool","retrieval","agent","system1"].map(value=><button key={value} className={filter===value?"":"ghost"} onClick={()=>setFilter(value)}>{value}</button>)}
      <button className="ghost" onClick={()=>setOpen(Object.fromEntries(visible.map(e=>[e.event_id,true])))}>Expand</button>
      <button className="ghost" onClick={()=>setOpen({})}>Collapse</button>
    </div></div>
    <div className="trace-list">{visible.map(e=><EventRow key={e.event_id} event={e} depth={depth(e)} open={!!open[e.event_id]} onToggle={()=>setOpen(p=>({...p,[e.event_id]:!p[e.event_id]}))}/>)}</div>
    {visible.length===0&&<div className="empty">No trace events match this filter.</div>}
    <small className="trace-filter-note">{visibleIds.size} of {data.trace.length} events shown · indentation follows parent_id</small>
    </section>
    <div className="actions"><button onClick={()=>void copyJson()}>Copy JSON</button><button className="secondary" onClick={downloadJson}>Export JSON</button></div>
    <details><summary>Logs</summary><pre>{JSON.stringify(data.logs,null,2)}</pre></details>
    <details><summary>Metrics</summary><pre>{JSON.stringify(data.metrics,null,2)}</pre></details>
    <details><summary>Raw JSON</summary><pre>{JSON.stringify(data,null,2)}</pre></details>
    </>}
  </main>;
}
