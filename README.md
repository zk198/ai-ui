# AI Platform UI

Private React + TypeScript + Vite UI for `ai-gateway`.

## Phase 1

The browser communicates only with `ai-gateway`. It supports local JWT authentication, retrieval/search, file upload, grounded chat, streaming answers, conversation continuation, and citation/source navigation. Internal PostgreSQL, Qdrant, ingestion, retrieval, agent, tool, and LLM services are never called directly by the browser.

The retrieval `/search` endpoint remains retrieval-only. Answer generation and agent orchestration are provided above that boundary by `ai-gateway` and `agent-core`.

## Local development

Install Node.js 22+, then run:

```bash
npm install
npm run dev
```

Set `VITE_API_BASE_URL` to the `ai-gateway` URL. A local JWT can be supplied through `VITE_LOCAL_JWT_TOKEN` or pasted into the login screen.

## Observability

The UI preserves request correlation IDs and exposes operations/diagnostic views through the authenticated gateway boundary. Privileged trace access is controlled by the gateway; the browser does not connect directly to internal services.

## Deferred scope

OIDC/enterprise identity, full RBAC, live Gmail/Outlook connectors, richer knowledge lifecycle management, advanced search controls, persistent production observability backends, production secret/token lifecycle, hostile-code sandboxing, and performance/load testing remain later-phase work.
