# AI Platform UI

React + TypeScript + Vite web application for the AI Platform. The browser communicates exclusively with `ai-gateway`; internal platform services are not browser-facing APIs.

## Capabilities
- Local JWT authentication for the current deployment mode.
- Document/file upload and retrieval search.
- Grounded chat and answer streaming.
- Conversation continuation and citation/source navigation.
- Operational diagnostics and trace views through the authenticated gateway boundary.
- Optional Laya System-1 diagnostics surfaced by the gateway.

The retrieval `/search` operation remains retrieval-only. Answer generation and agent orchestration are handled by `ai-gateway` and `agent-core`.

## Development
Requires Node.js 22+.
```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```
Set `VITE_API_BASE_URL` to the `ai-gateway` URL. A local JWT can be supplied through `VITE_LOCAL_JWT_TOKEN` or entered in the login screen. Never place privileged service credentials in Vite environment variables: browser-exposed values are public.

## Architecture boundary
The UI must not connect directly to PostgreSQL, Qdrant, ingestion, retrieval, agent-core, MCP tools, Bifrost or model inference. Authorization and privileged trace access are enforced by the gateway.

## Scope
OIDC/enterprise identity, full production RBAC, live Gmail/Outlook connectors, richer knowledge lifecycle management, persistent production observability backends and production secret/token lifecycle remain future work unless explicitly implemented in the application.
