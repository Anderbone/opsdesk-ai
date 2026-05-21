import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebhookDeliveryAttempt, WebhookEndpoint } from "~/lib/types";
import { webhookDeliveries } from "~/lib/webhook-data";
import type { RuntimeConfig } from "~/shared/config/runtime";
import { getRuntimeConfig } from "~/shared/config/runtime";

export type WebhookPayload = Record<string, string | number | boolean | null | undefined>;

export type SignedWebhook = {
  timestamp: string;
  idempotencyKey: string;
  canonicalPayload: string;
  signature: string;
};

export type WebhookDeliveryInput = {
  endpoint: WebhookEndpoint;
  eventId: string;
  ticketId: string;
  payload: WebhookPayload;
  attemptNumber?: number;
  responseCode?: number;
  deliveredAt?: string;
};

export function canonicalizePayload(payload: WebhookPayload): string {
  const sorted = Object.keys(payload)
    .sort()
    .reduce<WebhookPayload>((canonical, key) => {
      const value = payload[key];
      if (value !== undefined) canonical[key] = value;
      return canonical;
    }, {});
  return JSON.stringify(sorted);
}

export function signWebhookPayload(payload: WebhookPayload, secret: string, timestamp = new Date().toISOString()): SignedWebhook {
  const canonicalPayload = canonicalizePayload(payload);
  const hmac = createHmac("sha256", secret);
  hmac.update(`${timestamp}.${canonicalPayload}`);
  return {
    timestamp,
    canonicalPayload,
    idempotencyKey: String(payload.idempotencyKey ?? `${payload.eventId ?? "event"}:${timestamp}`),
    signature: `sha256=${hmac.digest("hex")}`,
  };
}

export function verifyWebhookSignature(payload: WebhookPayload, secret: string, timestamp: string, signature: string) {
  const expected = Buffer.from(signWebhookPayload(payload, secret, timestamp).signature);
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function nextRetryAt(attemptNumber: number, deliveredAt: string) {
  const retryDelaysMinutes = [5, 30, 120, 360];
  const delay = retryDelaysMinutes[Math.min(attemptNumber - 1, retryDelaysMinutes.length - 1)];
  return new Date(new Date(deliveredAt).getTime() + delay * 60_000).toISOString();
}

export function createWebhookDeliveryAttempt(
  input: WebhookDeliveryInput,
  secret = "demo-webhook-secret",
): WebhookDeliveryAttempt {
  const attemptNumber = input.attemptNumber ?? 1;
  const timestamp = input.deliveredAt ?? new Date().toISOString();
  const signed = signWebhookPayload({ ...input.payload, eventId: input.eventId }, secret, timestamp);
  const responseCode = input.responseCode ?? 202;
  const status: WebhookDeliveryAttempt["status"] =
    responseCode >= 200 && responseCode < 300 ? "delivered" : attemptNumber >= 3 ? "failed" : "retry_scheduled";

  return {
    id: `whd-${input.eventId}-${attemptNumber}`,
    endpointId: input.endpoint.id,
    eventId: input.eventId,
    ticketId: input.ticketId,
    attemptNumber,
    status,
    responseCode,
    timestamp,
    signature: signed.signature,
    payload: Object.fromEntries(
      Object.entries(input.payload).filter((entry): entry is [string, string | number | boolean] => {
        const value = entry[1];
        return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
      }),
    ),
    nextRetryAt: status === "retry_scheduled" ? nextRetryAt(attemptNumber, timestamp) : undefined,
  };
}

export type WebhookDeliveryClient = {
  deliver(input: WebhookDeliveryInput): Promise<WebhookDeliveryAttempt>;
};

export function createWebhookDeliveryClient(config: RuntimeConfig = getRuntimeConfig()): WebhookDeliveryClient {
  return {
    async deliver(input) {
      if (!config.webhookOutboundEnabled) {
        return createWebhookDeliveryAttempt({ ...input, responseCode: input.responseCode ?? 202 });
      }
      throw new Error("Real outbound webhook delivery is intentionally opt-in and not implemented in this demo phase.");
    },
  };
}

export function listDemoWebhookDeliveries() {
  return webhookDeliveries.map((delivery) => ({ ...delivery, payload: { ...delivery.payload } }));
}
