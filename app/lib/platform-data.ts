import { dataContracts } from "~/lib/event-data";

export const modeComparisons = [
  ["Data store", "Seeded TypeScript state + cookie replay", "Postgres, pgvector, Drizzle migrations, backups"],
  ["Jobs", "Static contract simulator", "pg-boss workers with retry, DLQ, and idempotency"],
  ["Events", "Kafka/Redpanda-shaped envelopes on screen", "Redpanda or MSK topics with schema compatibility checks"],
  ["Search", "Deterministic in-memory selectors", "OpenSearch lexical/vector hybrid retrieval"],
  ["Graph", "Relationship panel in knowledge route", "Neo4j or Postgres graph projection for investigations"],
  ["Observability", "Demo trace view in Watchtower", "OpenTelemetry exporter path to managed tracing"],
];

export const awsServerlessPath = [
  ["Edge entry", "Netlify or CloudFront routes React Router requests and keeps intake fast."],
  ["Async queue", "SQS or EventBridge receives ticket lifecycle and AI action events."],
  ["Workers", "Lambda runs triage, document extraction, retrieval, and webhook delivery."],
  ["Persistence", "RDS Postgres keeps tickets, ai_runs, audit events, and pgvector knowledge chunks."],
  ["Search", "OpenSearch indexes playbooks, tickets, uploaded documents, and AI run metadata."],
];

export const deliveryPipeline = [
  ["Pull request", "TypeScript, unit tests, route smoke tests, schema diff check"],
  ["Preview deploy", "Seeded demo data, no paid credentials, deterministic session replay"],
  ["Release gate", "Playwright smoke suite, AI fixture regression pack, accessibility snapshot"],
  ["Production deploy", "Migrations first, workers after schema, canary webhook endpoints"],
];

export const infrastructureBoundaries = [
  ["Terraform owns", "VPC, RDS, queues/topics, OpenSearch, secrets, IAM, alarms"],
  ["App deploy owns", "React Router bundle, worker image, env-specific feature flags"],
  ["Kubernetes option", "Run web, worker, and replay services as separate deployments with HPA"],
  ["Secrets", "Webhook HMAC keys rotate by version and are never exposed in payloads"],
];

export { dataContracts };
