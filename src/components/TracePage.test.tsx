import {describe,expect,it,vi} from "vitest";
import {cleanup,render,screen,waitFor} from "@testing-library/react";
import {TracePage} from "./TracePage";
import type {ExecutionTrace} from "../types";

const trace: ExecutionTrace={
  schema_version:"1.0",trace_id:"trace-1",request_id:"req-1",started_at:"2026-09-28T05:00:00Z",
  completed_at:"2026-09-28T05:00:01Z",duration_ms:1000,status:"completed",
  logs:[{level:"INFO",message:"done"}],metrics:{trace_events:2},
  trace:[
    {event_id:"agent",parent_id:null,sequence:1,kind:"agent",stage:"agent",name:"agent.run",status:"completed",started_at:"2026-09-28T05:00:00Z",duration_ms:1000,payload:{}},
    {event_id:"llm",parent_id:"agent",sequence:2,kind:"llm",stage:"llm",name:"iteration.1",status:"completed",started_at:"2026-09-28T05:00:00Z",duration_ms:900,payload:{messages:[{role:"user",content:"hello"}]}}
  ]
};

afterEach(()=>cleanup());

describe("TracePage",()=>{
  it("renders hierarchical trace and privileged payload controls",async()=>{
    const api={trace:vi.fn().mockResolvedValue(trace)} as never;
    render(<TracePage api={api} traceId="trace-1" onBack={vi.fn()}/>);
    await waitFor(()=>expect(screen.getByText("iteration.1")).toBeInTheDocument());
    expect(screen.getByText("CTO Diagnostics")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 events shown")).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Expand"})).toBeInTheDocument();
    expect(screen.getByText("Raw JSON")).toBeInTheDocument();
  });

  it("shows an explicit diagnostics authorization error",async()=>{
    const api={trace:vi.fn().mockRejectedValue({status:403})} as never;
    render(<TracePage api={api} traceId="trace-1" onBack={vi.fn()}/>);
    await waitFor(()=>expect(screen.getByRole("alert")).toHaveTextContent("diagnostics:read"));
  });
});
