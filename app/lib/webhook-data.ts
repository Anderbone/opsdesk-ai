import type { WebhookDeliveryAttempt, WebhookEndpoint } from "~/lib/types";

export const webhookEndpoints: WebhookEndpoint[] = [
  {
    id: "wh-crm",
    name: "Harbour CRM activity sync",
    url: "https://crm.example.test/hooks/opsdesk",
    owner: "Priya",
    status: "active",
    eventTypes: ["ticket.triaged", "ai.draft.review_required"],
    signingSecretVersion: "whsec_v3",
    linkedTicketId: "tkt-wifi",
  },
  {
    id: "wh-finance",
    name: "BrightBake finance exception queue",
    url: "https://finance.example.test/hooks/exceptions",
    owner: "Morgan",
    status: "rotating_secret",
    eventTypes: ["document.quantity_mismatch.detected"],
    signingSecretVersion: "whsec_v2_to_v3",
    linkedTicketId: "tkt-invoice",
  },
  {
    id: "wh-forms",
    name: "Northbank quote form handoff",
    url: "https://forms.example.test/hooks/site-surveys",
    owner: "Morgan",
    status: "active",
    eventTypes: ["ai.draft.auto_sent"],
    signingSecretVersion: "whsec_v3",
    linkedTicketId: "tkt-cctv",
  },
];

export const webhookDeliveries: WebhookDeliveryAttempt[] = [
  {
    id: "whd-cctv-001",
    endpointId: "wh-forms",
    eventId: "evt-1024-draft-sent",
    ticketId: "tkt-cctv",
    attemptNumber: 1,
    status: "delivered",
    responseCode: 202,
    timestamp: "2026-05-20T10:06:12.000Z",
    signature: "sha256=8a2f5b6c8f3a91e4f0cctv",
    payload: {
      ticketId: "tkt-cctv",
      eventType: "ai.draft.auto_sent",
      templateId: "tpl-quote-site-form-message",
      idempotencyKey: "draft:draft-cctv:sent:v1",
    },
  },
  {
    id: "whd-wifi-001",
    endpointId: "wh-crm",
    eventId: "evt-1025-human-review",
    ticketId: "tkt-wifi",
    attemptNumber: 1,
    status: "delivered",
    responseCode: 200,
    timestamp: "2026-05-20T09:36:18.000Z",
    signature: "sha256=40fbb2a477e12f9d0wifi",
    payload: {
      ticketId: "tkt-wifi",
      eventType: "ai.draft.review_required",
      owner: "Priya",
      idempotencyKey: "draft:draft-wifi:review:v1",
    },
  },
  {
    id: "whd-invoice-001",
    endpointId: "wh-finance",
    eventId: "evt-1026-document-mismatch",
    ticketId: "tkt-invoice",
    attemptNumber: 1,
    status: "failed",
    responseCode: 422,
    timestamp: "2026-05-20T09:02:44.000Z",
    signature: "sha256=271a73bb4ee01f67invoice",
    payload: {
      ticketId: "tkt-invoice",
      eventType: "document.quantity_mismatch.detected",
      invoiceQuantity: 24,
      deliveredQuantity: 20,
    },
  },
  {
    id: "whd-invoice-002",
    endpointId: "wh-finance",
    eventId: "evt-1026-document-mismatch",
    ticketId: "tkt-invoice",
    attemptNumber: 2,
    status: "retry_scheduled",
    responseCode: 429,
    timestamp: "2026-05-20T09:12:44.000Z",
    signature: "sha256=3c551dba907def14invoice",
    nextRetryAt: "2026-05-20T09:42:44.000Z",
    payload: {
      ticketId: "tkt-invoice",
      eventType: "document.quantity_mismatch.detected",
      invoiceQuantity: 24,
      deliveredQuantity: 20,
    },
  },
];

export const inboundWebhookExamples = [
  {
    id: "inbound-form-cctv",
    source: "Quote form",
    ticketId: "tkt-cctv",
    eventType: "quote_form.submitted",
    body: "{ siteSizeSqFt: 18000, preferredSurveyWindow: 'Friday 10:00' }",
  },
  {
    id: "inbound-crm-wifi",
    source: "CRM call note",
    ticketId: "tkt-wifi",
    eventType: "crm.call.logged",
    body: "{ caller: 'Ben Carter', wiredServiceStable: true, affectedFloor: 'second' }",
  },
];

export function buildWebhookSignatureBase(timestamp: string, payload: Record<string, unknown>) {
  return `${timestamp}.${JSON.stringify(payload)}`;
}

export function getDeliveriesForEndpoint(endpointId: string) {
  return webhookDeliveries.filter((delivery) => delivery.endpointId === endpointId);
}

export function getWebhookDeliveryStats(deliveries: WebhookDeliveryAttempt[] = webhookDeliveries) {
  return deliveries.reduce(
    (stats, delivery) => ({
      delivered: stats.delivered + (delivery.status === "delivered" ? 1 : 0),
      retrying: stats.retrying + (delivery.status === "retry_scheduled" ? 1 : 0),
      failed: stats.failed + (delivery.status === "failed" ? 1 : 0),
    }),
    { delivered: 0, retrying: 0, failed: 0 },
  );
}
