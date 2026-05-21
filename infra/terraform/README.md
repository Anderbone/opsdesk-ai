# OpsDesk AI Terraform Skeleton

This folder is a safe planning skeleton for a future production deployment. It is not part of normal demo verification, and it does not contain provider credentials, account IDs, remote state, or deployable cloud resources.

Normal verification remains:

```bash
pnpm test:unit
pnpm typecheck
pnpm build
```

## Layout

- `envs/dev` wires module inputs for a future development environment.
- `modules/network` reserves the network boundary.
- `modules/app` reserves the web and worker runtime boundary.
- `modules/database` reserves Postgres/pgvector storage.
- `modules/events` reserves Redpanda/Kafka-compatible topics.
- `modules/observability` reserves tracing, metrics, and log export.
- `modules/search` reserves OpenSearch indexes.
- `modules/storage` reserves object/document storage.

## Guardrails

- Do not add secrets to `.tf`, `.tfvars`, or README files.
- Do not add a real provider block until there is an explicit target cloud and owner.
- Do not make Terraform a required path for Netlify, `pnpm dev`, or CI.
- Keep module interfaces aligned with the runtime adapter contracts in `app/shared/adapters`.

## Future Apply Prerequisites

Before this skeleton becomes deployable, choose the cloud/runtime target, configure remote state, define identity and least-privilege IAM, add secret management, and write a teardown process.
