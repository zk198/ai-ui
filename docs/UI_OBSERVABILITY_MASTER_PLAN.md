# UI Observability Master Plan

## Purpose

Define a three-level observability experience for the AI UI. The backend produces one structured observability contract; the UI presents progressively more detail without duplicating telemetry logic.

## Three levels

### Level 1 — Request status (end user)
- Current request state: queued, running, completed, failed.
- Total duration and high-level stage timings.
- Request/trace ID for support.
- High-level stages only: gateway, agent, retrieval/tools, LLM.
- No prompts, tool arguments, raw model output, or internal infrastructure details.

### Level 2 — Operational status (operator/admin)
- Dedicated operational status view.
- Service/dependency health: gateway, agent, retrieval, ingestion, database and LLM path where available.
- State: healthy, degraded, unavailable.
- Probe latency, HTTP status, failure reason and last-known update.
- Aggregated request/error/latency metrics where available.
- Must not expose user prompts or raw execution payloads.

### Level 3 — CTO diagnostics (privileged)
- Separate endpoint and separate UI view.
- Requires an explicit diagnostics:read capability/role.
- Tenant scoping is the default; cross-tenant access is a separate explicit privilege.
- Full execution trace is intentionally visible for debugging:
  - user/system/developer prompts
  - exact model request/response content
  - model, iteration and token/context metadata when available
  - tool calls, exact arguments and results
  - retrieval queries, returned evidence and scores
  - MCP calls/results
  - timings and errors
  - parent/child execution ordering
- Secrets remain excluded: bearer tokens, API keys, credentials, environment secrets and authorization headers.

## Canonical observability object

Create a backend class/model as the source of truth. It serializes to stable structured JSON and contains:

- schema_version
- trace_id
- request_id
- tenant_id (subject to access policy)
- user_id (subject to access policy)
- started_at, completed_at, duration_ms
- status, error
- logs[]
- metrics{}
- trace

trace is an ordered tree/DAG of spans/events, for example:

request
  -> gateway
  -> agent
     -> llm iteration 1
        -> tool call
           -> tool result
     -> llm iteration 2
  -> final response

Each trace event has stable IDs, parent ID, sequence, timestamps/duration, stage/type, status, and payload appropriate to the access level.

## API contract

- Level 1: request/response metadata may be returned inline or from a request-status endpoint.
- Level 2: GET /api/v1/ops/status.
- Level 3: GET /api/v1/traces/{trace_id} with privileged authorization.
- Level 3 must never be folded into /ops/status.

## Backend ownership

- agent-core: create and populate the canonical execution trace around LLM, retrieval/tool and MCP execution.
- ai-gateway: propagate trace_id, own the privileged read boundary, and expose the Level 3 endpoint.
- ai-ui: consume the contract and render Level 1/2/3 views.
- ai-infra: expose only health/metrics needed by the operational contract.

## Storage and retention

Start with an explicit trace-store interface rather than coupling the UI to a database schema. Development can use an in-memory implementation; production can replace it with a bounded persistent store.

Full-fidelity Level 3 traces can contain sensitive and large payloads. Retention, access audit, size limits and optional sampling must therefore be configurable. Normal request telemetry should not block the request path synchronously.

## UI information architecture

- Request status: inline request activity + request detail drawer.
- Operations: dedicated Operations page.
- CTO diagnostics: dedicated Diagnostics page with trace search, trace timeline/tree, event detail and raw structured JSON.
- Level 3 should make execution order obvious and allow expansion of prompts, tool args/results, retrieval evidence, timings and errors.

## Acceptance criteria

1. One canonical class/model serializes logs, metrics and traces to deterministic JSON.
2. Trace IDs are propagated end-to-end.
3. Every LLM iteration has timing and an ordered trace event.
4. Every tool/retrieval/MCP call records timing, arguments and result at Level 3.
5. Errors are attached to the relevant trace node and request.
6. Level 1 cannot retrieve Level 3 payloads.
7. Level 2 cannot retrieve Level 3 payloads.
8. Level 3 requires diagnostics:read.
9. Level 3 is tenant-scoped by default.
10. Secrets/authorization material are never serialized.
11. UI tests cover all three levels and authorization failures.
12. The structured JSON contract is versioned and documented.

## Delivery sequence

1. Contract + canonical trace class.
2. Agent-core trace instrumentation.
3. Gateway propagation/store/privileged endpoint.
4. UI API client and Level 1 request status.
5. UI Level 2 operations view.
6. UI Level 3 diagnostics/timeline/raw JSON.
7. End-to-end tests, failure injection and security review.

## Non-goals for this slice

- Replacing OpenTelemetry or another telemetry backend.
- Long-term analytics warehouse.
- Cross-tenant diagnostics by default.
- Exposing secrets.
- Making full traces available to ordinary users.
