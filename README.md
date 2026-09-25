# rag-ui

Private React + TypeScript + Vite UI for the RAG gateway.

## Phase 1.b

The browser communicates only with rag-gateway. It supports local JWT login, retrieval search, and file upload. Internal PostgreSQL, Qdrant, ingestion, and retrieval services are never called directly.

## Local development

Install Node.js 22+, then run npm install and npm run dev. Set VITE_API_BASE_URL to the gateway URL. A local JWT can be supplied through VITE_LOCAL_JWT_TOKEN or pasted into the login screen.

## Phase 1.c roadmap

Out of scope for 1.b: OIDC identity integration; chat/RAG answer generation; evaluation and citation UX for generated answers; admin/user provisioning and RBAC; richer ingestion lifecycle and retry controls; email synchronization/connectors; document editing/annotation; advanced search controls and saved searches; observability/admin dashboards; production CSP/CSRF/token-rotation/deployment-secret hardening; performance/load testing and large-file upload strategy.

The retrieval search endpoint remains retrieval-only. Phase 1.c will evaluate a separate open-source chat/RAG orchestration library for answer generation and citations.
