import type { DataContract, DeadLetterEvent, EventConsumerState, EventEnvelope } from "~/lib/types";

const base = new Date("2026-05-20T10:30:00.000Z");

function iso(minutesAgo: number) {
  return new Date(base.getTime() - minutesAgo * 60 * 1000).toISOString();
}

export const eventEnvelopes: EventEnvelope[] = [
  {
    id: "evt-1024-created",
    ticketId: "tkt-cctv",
    topic: "opsdesk.ticket.lifecycle",
    eventType: "ticket.created",
    schemaVersion: "ticket.v2",
    occurredAt: iso(72),
    correlationId: "corr-tkt-cctv",
    idempotencyKey: "ticket:tkt-cctv:created:v2",
    producer: "intake.widget",
    payload: {
      ticketNumber: "OD-1024",
      customerCompany: "Northbank Storage",
      category: "quote",
      priority: "high",
      missingInfo: ["site size", "floor plan", "camera locations"],
    },
  },
  {
    id: "evt-1024-draft-sent",
    ticketId: "tkt-cctv",
    topic: "opsdesk.ai.actions",
    eventType: "ai.draft.auto_sent",
    schemaVersion: "ai_action.v1",
    occurredAt: iso(24),
    correlationId: "corr-tkt-cctv",
    idempotencyKey: "draft:draft-cctv:sent:v1",
    producer: "response.template_select",
    payload: {
      aiRunId: "airun-002",
      templateId: "tpl-quote-site-form-message",
      channel: "message",
      confidence: 0.88,
    },
  },
  {
    id: "evt-1025-triaged",
    ticketId: "tkt-wifi",
    topic: "opsdesk.ticket.lifecycle",
    eventType: "ticket.triaged",
    schemaVersion: "ticket.v2",
    occurredAt: iso(198),
    correlationId: "corr-tkt-wifi",
    idempotencyKey: "ticket:tkt-wifi:triaged:v2",
    producer: "triage.ticket",
    payload: {
      ticketNumber: "OD-1025",
      customerCompany: "Harbour & Co Solicitors",
      category: "incident",
      priority: "urgent",
      owner: "Priya",
    },
  },
  {
    id: "evt-1025-human-review",
    ticketId: "tkt-wifi",
    topic: "opsdesk.ai.actions",
    eventType: "ai.draft.review_required",
    schemaVersion: "ai_action.v1",
    occurredAt: iso(54),
    correlationId: "corr-tkt-wifi",
    idempotencyKey: "draft:draft-wifi:review:v1",
    producer: "response.template_select",
    payload: {
      aiRunId: "airun-004",
      reason: "urgent incident phone contact",
      templateId: "tpl-incident-diagnostics-phone",
      owner: "Priya",
    },
  },
  {
    id: "evt-1026-document-mismatch",
    ticketId: "tkt-invoice",
    topic: "opsdesk.documents",
    eventType: "document.quantity_mismatch.detected",
    schemaVersion: "document_extract.v1",
    occurredAt: iso(90),
    correlationId: "corr-tkt-invoice",
    idempotencyKey: "document:doc-invoice:quantity-mismatch:v1",
    producer: "extract.document",
    payload: {
      aiRunId: "airun-005",
      documentId: "doc-invoice",
      invoiceQuantity: 24,
      deliveredQuantity: 20,
      customerCompany: "BrightBake Kitchens",
    },
  },
  {
    id: "evt-1027-followup",
    ticketId: "tkt-insurance",
    topic: "opsdesk.followups",
    eventType: "followup.created",
    schemaVersion: "followup.v1",
    occurredAt: iso(120),
    correlationId: "corr-tkt-insurance",
    idempotencyKey: "followup:fu-insurance:created:v1",
    producer: "followup.suggest",
    payload: {
      aiRunId: "airun-006",
      owner: "Ava",
      dueInHours: 24,
      customerCompany: "Rivergate Nursery",
    },
  },
  {
    id: "evt-1028-complaint",
    ticketId: "tkt-complaint",
    topic: "opsdesk.ticket.lifecycle",
    eventType: "ticket.complaint.flagged",
    schemaVersion: "ticket.v2",
    occurredAt: iso(762),
    correlationId: "corr-tkt-complaint",
    idempotencyKey: "ticket:tkt-complaint:complaint:v2",
    producer: "triage.ticket",
    payload: {
      ticketNumber: "OD-1028",
      customerCompany: "Townsend Dental",
      sentiment: "angry",
      owner: "Priya",
      requiresHumanReview: true,
    },
  },
];

export const consumerStates: EventConsumerState[] = [
  {
    id: "consumer-watchtower",
    topic: "opsdesk.ai.actions",
    consumerGroup: "watchtower-projector",
    status: "healthy",
    committedOffset: 18412,
    latestOffset: 18414,
    lag: 2,
    linkedTicketId: "tkt-cctv",
  },
  {
    id: "consumer-webhooks",
    topic: "opsdesk.ticket.lifecycle",
    consumerGroup: "webhook-delivery",
    status: "catching_up",
    committedOffset: 29104,
    latestOffset: 29121,
    lag: 17,
    linkedTicketId: "tkt-wifi",
  },
  {
    id: "consumer-documents",
    topic: "opsdesk.documents",
    consumerGroup: "risk-register-projector",
    status: "healthy",
    committedOffset: 7330,
    latestOffset: 7330,
    lag: 0,
    linkedTicketId: "tkt-invoice",
  },
];

export const deadLetterEvents: DeadLetterEvent[] = [
  {
    id: "dlq-1026-finance",
    eventId: "evt-1026-document-mismatch",
    ticketId: "tkt-invoice",
    topic: "opsdesk.documents",
    reason: "Finance webhook rejected payload because supplier_account_code was absent.",
    retryCount: 3,
    failedAt: iso(32),
    nextAction: "Hold payment sync until Sophie confirms whether four detector bases are backordered.",
  },
];

export const dataContracts: DataContract[] = [
  {
    id: "contract-ticket-v2",
    name: "ticket.lifecycle.v2",
    owner: "Service desk platform",
    version: "2.1.0",
    transport: "event",
    linkedTicketId: "tkt-wifi",
    fields: [
      { name: "ticketId", type: "string", required: true, note: "Stable primary key for joins and replays." },
      { name: "correlationId", type: "string", required: true, note: "Links intake, AI runs, events, and webhooks." },
      { name: "priority", type: "enum", required: true, note: "Drives SLA and owner assignment." },
      { name: "riskFlags", type: "string[]", required: false, note: "Human-review reasons when automation is blocked." },
    ],
  },
  {
    id: "contract-ai-action-v1",
    name: "ai.action.v1",
    owner: "AI Watchtower",
    version: "1.4.0",
    transport: "event",
    linkedTicketId: "tkt-cctv",
    fields: [
      { name: "aiRunId", type: "string", required: true, note: "Traceable Watchtower record." },
      { name: "promptVersion", type: "string", required: true, note: "Replay and regression boundary." },
      { name: "confidence", type: "number", required: true, note: "Compared against policy threshold." },
      { name: "approvalStatus", type: "enum", required: true, note: "Blocks autonomous action when pending." },
    ],
  },
  {
    id: "contract-webhook-v1",
    name: "webhook.delivery.v1",
    owner: "Integrations",
    version: "1.0.0",
    transport: "webhook",
    linkedTicketId: "tkt-invoice",
    fields: [
      { name: "eventId", type: "string", required: true, note: "Idempotency and replay handle." },
      { name: "timestamp", type: "iso8601", required: true, note: "Rejected outside five-minute tolerance." },
      { name: "signature", type: "hmac-sha256", required: true, note: "Computed over timestamp and JSON body." },
      { name: "deliveryAttempt", type: "number", required: true, note: "Retry schedule visibility." },
    ],
  },
];

export function getEventTopics() {
  return Array.from(new Set(eventEnvelopes.map((event) => event.topic))).sort();
}

export function filterEventsByTopic(topic?: string) {
  if (!topic || topic === "all") return eventEnvelopes;
  return eventEnvelopes.filter((event) => event.topic === topic);
}

export function groupEventsByTicket(events: EventEnvelope[]) {
  return events.reduce<Record<string, EventEnvelope[]>>((groups, event) => {
    groups[event.ticketId] ??= [];
    groups[event.ticketId].push(event);
    return groups;
  }, {});
}

export function summarizeConsumerLag(states: EventConsumerState[] = consumerStates) {
  return states.reduce(
    (summary, state) => ({
      totalLag: summary.totalLag + state.lag,
      maxLag: Math.max(summary.maxLag, state.lag),
      unhealthyGroups: summary.unhealthyGroups + (state.status === "healthy" ? 0 : 1),
    }),
    { totalLag: 0, maxLag: 0, unhealthyGroups: 0 },
  );
}
