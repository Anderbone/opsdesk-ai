# OpsDesk AI

AI service desk demo for local businesses. The app turns incoming enquiries and uploaded document notes into structured tickets, AI triage, retrieval-aware draft replies, follow-up tasks, reusable agent blueprints, and an auditable AI Watchtower.

**Live demo:** [opsdesk-ai.netlify.app](https://opsdesk-ai.netlify.app/)

## Demo Story

The seeded business is **DragonTech Facilities**. The app includes five realistic cases:

- CCTV quote request
- Office Wi-Fi issue
- Invoice/delivery note mismatch
- Insurance certificate expiry
- Angry customer complaint

AI behaves like a junior operations assistant. It can classify, summarise, extract, select approved response templates, and suggest follow-ups. If confidence is high and the case is only asking for missing facts, it can auto-send a pre-approved message/form through the customer's preferred channel. Complaints, urgent incidents, document/payment mismatches, low-confidence outputs, closes, refunds, and price commitments stay with a human reviewer.

The expanded Agent Delivery and Platform routes also show the consulting and MLE story: client discovery, success metrics, agentic solution design, LLM prototyping, RAG with pgvector, event contracts, webhooks, evaluation, production rollout, monitoring, and ROI measurement.

## Stack

- React Router framework mode
- React 19
- TypeScript
- Drizzle schema for PostgreSQL
- pgvector-ready knowledge schema for RAG
- pg-boss worker scaffold
- AI SDK-ready boundary with deterministic demo AI
- Custom shadcn-inspired UI system

## Run Locally

```bash
pnpm install
pnpm dev
```

Open the local URL shown by React Router.

The app works immediately from seeded demo data in code. Local clicks are stored in the same cookie-backed fake session store used for the hosted demo, and Reset demo clears that browser session.

Runtime mode is controlled by `OPS_DESK_MODE=demo|local|prod` and defaults to `demo`. Demo mode does not require Docker, databases, cloud credentials, or outbound integrations.

## Deploy on Netlify

The app is configured for Netlify with `@netlify/vite-plugin-react-router` and `netlify.toml`.

```bash
pnpm install
pnpm build
```

Netlify should use:

- Build command: `pnpm build`
- Publish directory: `build/client`

The public demo uses a cookie-backed fake session store. Each visitor starts from the seeded demo state, and their clicks are replayed in their own browser session without requiring a database.

Optional Netlify environment variable:

- `SESSION_SECRET` - signs the demo session cookie.

## Optional Local Production Runtime

Netlify, standard CI, and the default `pnpm dev` path do not use Docker profiles. The local production runtime is optional and documented in [docs/architecture/local-runtime.md](docs/architecture/local-runtime.md).

Copy optional runtime settings when you want to exercise local production-style dependencies:

```bash
cp .env.example .env
```

Set `OPS_DESK_MODE=local` in `.env` when you want the app to check local dependency configuration instead of staying in seeded demo mode.

Start only the services you need. Postgres/pgvector is the first local adapter target:

```bash
docker compose --profile postgres up -d
pnpm db:push
pnpm seed
pnpm worker
```

`pnpm seed` remains safe for demo mode. In local mode it also upserts the demo business, tickets, documents, AI runs, knowledge chunks, audit events, and agent/evaluation records into Postgres without duplicating rows.

Other optional profiles are independent:

```bash
docker compose --profile events up -d
docker compose --profile search up -d
docker compose --profile graph up -d
```

You can combine profiles when you need more of the local stack:

```bash
docker compose --profile postgres --profile events --profile search --profile graph up -d
```

Simple wrappers are available for the common local path:

```bash
pnpm local:up
pnpm local:seed
pnpm local:worker
pnpm local:down
```

Use `pnpm local:reset` only when you want to delete local service volumes.

The Drizzle schema lives in `app/shared/db/schema.ts`. It includes tickets, response templates, AI runs, client discovery sessions, agent blueprints, vector knowledge sources/chunks, and evaluation runs. The compose database uses `db/init/001-pgvector.sql` to enable the `vector` extension on a fresh volume. The pg-boss worker scaffold lives in `scripts/worker.ts`.

## Adapter Boundaries

Phase 3 adds explicit boundaries under `app/shared/adapters`:

- Runtime config: `OPS_DESK_MODE`, dependency checks, and outbound-webhook opt-in.
- Event bus: publish, subscribe/dispatch, retry metadata, idempotency, and DLQ records.
- Observability: trace and span metadata that links Watchtower, events, and webhook attempts.
- Webhooks: canonical payloads, HMAC signatures, idempotency keys, retry scheduling, and no real outbound calls unless configured.
- Search: document indexing, faceted search, and read-model rebuild contracts.
- Graph: relationship node/edge listing and predefined graph query answers.

Demo implementations are deterministic and credential-free. Local/prod factories fail with clear configuration errors until the corresponding Redpanda, OpenSearch, or Neo4j adapter is implemented and configured.

## Infrastructure Skeletons

Terraform skeletons live in `infra/terraform/` and are safe to inspect only; they do not configure providers, account IDs, remote state, or deployable resources. Kubernetes manifests live in `k8s/` and document a future web/worker deployment shape. They are not part of required verification, and the Kubernetes path requires real health endpoints before apply.

## Hiring Reviewer Map

- Product workflow: `/dashboard`, `/enquiry`, and `/tickets/:ticketId` show intake, triage, drafts, document extraction, and follow-ups.
- AI safety/evaluation: `/watchtower` shows prompt versions, validation status, approval gates, costs, and demo trace details.
- Observability: `/watchtower` links AI runs to trace spans, events, and webhook attempts, with an OpenTelemetry exporter path for production.
- Event-driven architecture: `/events` shows Kafka/Redpanda-shaped envelopes, schema versions, idempotency keys, consumer lag, retries, and DLQ context.
- Webhooks/integration: `/webhooks` shows endpoint ownership, signed payloads, timestamp tolerance, idempotency, secret rotation, retries, inbound examples, and replay.
- CI/CD/testing: `/platform` maps unit, typecheck, build, route smoke, preview deploy, and release gates.
- Cloud/IaC/Kubernetes path: `/platform` separates hosted demo mode from AWS serverless, Terraform, container, and Kubernetes deployment boundaries.
- Search/graph/data modeling: `/knowledge` shows faceted retrieval, OpenSearch mapping, RAG citations, and graph queries backed by ticket, document, and AI-run evidence.

Hosted demo behavior is deterministic and credential-free. Local/prod mode swaps the same contracts onto Postgres, pgvector, pg-boss workers, OpenSearch, queues/topics, tracing exporters, and signed integration endpoints.

## Key Routes

- `/dashboard` - ticket queue and operational overview
- `/enquiry` - public enquiry widget simulation
- `/tickets/:ticketId` - ticket workspace with AI draft approval and document extraction
- `/watchtower` - AI run monitoring and audit log
- `/agent-delivery` - client discovery, agent framework, pgvector/RAG, rollout, and ROI showcase
- `/platform` - hosted demo versus production path, CI/CD, IaC, Kubernetes, observability, and data contracts
- `/events` - Kafka/Redpanda-style event contract simulator with lag, retry, DLQ, schema, idempotency, and correlation IDs
- `/webhooks` - endpoint registry, HMAC signature preview, delivery attempts, retry schedule, inbound examples, and replay
- `/knowledge` - faceted search, OpenSearch mapping preview, RAG citations, and graph relationship queries
- `/case-study` - portfolio-ready case study page
- `/architecture` - build plan, queue contract, and table map
