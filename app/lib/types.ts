export type TraceSpan = {
  id: string;
  parentSpanId?: string;
  serviceName: string;
  name: string;
  kind: "server" | "client" | "producer" | "consumer" | "internal";
  status: "ok" | "error" | "needs_review";
  startMs: number;
  durationMs: number;
  attributes: Record<string, string | number | boolean>;
  linkedEventId?: string;
  linkedWebhookAttemptId?: string;
};

export type TraceRun = {
  id: string;
  ticketId: string;
  aiRunId?: string;
  title: string;
  status: "ok" | "error" | "needs_review";
  startedAt: string;
  durationMs: number;
  mode: "hosted_demo" | "production_path";
  spans: TraceSpan[];
};

export type EventEnvelope = {
  id: string;
  ticketId: string;
  topic: string;
  eventType: string;
  schemaVersion: string;
  occurredAt: string;
  correlationId: string;
  idempotencyKey: string;
  producer: string;
  payload: Record<string, string | number | boolean | string[]>;
};

export type EventConsumerState = {
  id: string;
  topic: string;
  consumerGroup: string;
  status: "healthy" | "catching_up" | "paused";
  committedOffset: number;
  latestOffset: number;
  lag: number;
  linkedTicketId: string;
};

export type DeadLetterEvent = {
  id: string;
  eventId: string;
  ticketId: string;
  topic: string;
  reason: string;
  retryCount: number;
  failedAt: string;
  nextAction: string;
};

export type WebhookEndpoint = {
  id: string;
  name: string;
  url: string;
  owner: string;
  status: "active" | "rotating_secret" | "paused";
  eventTypes: string[];
  signingSecretVersion: string;
  linkedTicketId: string;
};

export type WebhookDeliveryAttempt = {
  id: string;
  endpointId: string;
  eventId: string;
  ticketId: string;
  attemptNumber: number;
  status: "delivered" | "retry_scheduled" | "failed";
  responseCode: number;
  timestamp: string;
  signature: string;
  payload: Record<string, string | number | boolean>;
  nextRetryAt?: string;
};

export type SearchDocument = {
  id: string;
  title: string;
  category: "ticket" | "document" | "playbook" | "ai_run";
  sourceType: "customer_message" | "uploaded_document" | "internal_playbook" | "watchtower_run";
  risk: "low" | "medium" | "high";
  owner: string;
  aiAction: string;
  ticketId?: string;
  aiRunId?: string;
  documentId?: string;
  customerCompany: string;
  summary: string;
  citations: string[];
  lastIndexedAt: string;
};

export type KnowledgeGraphNode = {
  id: string;
  label: string;
  kind: "ticket" | "customer" | "asset" | "supplier" | "owner" | "risk" | "document";
  linkedTicketId?: string;
};

export type KnowledgeGraphEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
  evidenceId: string;
};

export type DataContract = {
  id: string;
  name: string;
  owner: string;
  version: string;
  transport: "event" | "webhook" | "job" | "database";
  linkedTicketId: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    note: string;
  }>;
};
