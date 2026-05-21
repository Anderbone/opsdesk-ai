import { describe, expect, it } from "vitest";
import { createInMemoryEventBus } from "~/shared/adapters/event-bus";
import { createInMemoryGraphRepository } from "~/shared/adapters/graph";
import { createTraceMetadata } from "~/shared/adapters/observability";
import { createInMemorySearchRepository } from "~/shared/adapters/search";
import {
  createWebhookDeliveryClient,
  signWebhookPayload,
  verifyWebhookSignature,
} from "~/shared/adapters/webhooks";
import { getRuntimeConfig } from "~/shared/config/runtime";
import { eventEnvelopes } from "~/lib/event-data";
import { webhookEndpoints } from "~/lib/webhook-data";

describe("phase 3 runtime and adapter contracts", () => {
  it("defaults to demo mode and reports missing local dependencies without throwing", () => {
    expect(getRuntimeConfig({}).mode).toBe("demo");

    const localConfig = getRuntimeConfig({ OPS_DESK_MODE: "local" });

    expect(localConfig.mode).toBe("local");
    expect(localConfig.missingDependencies).toEqual(["DATABASE_URL"]);
  });

  it("publishes idempotent envelopes and sends handler failures to the dead-letter path", async () => {
    const bus = createInMemoryEventBus([]);
    const handled: string[] = [];
    const envelope = eventEnvelopes[0];

    await bus.publish(envelope);
    const duplicate = await bus.publish({ ...envelope, id: "evt-duplicate-id" });
    bus.subscribe(envelope.topic, (event) => {
      handled.push(event.id);
    });
    bus.subscribe(envelope.topic, () => {
      throw new Error("consumer unavailable");
    });

    await bus.dispatch(envelope.topic);

    expect(duplicate).toMatchObject({ accepted: true, duplicate: true });
    expect(handled).toEqual([envelope.id]);
    expect(bus.listDeadLetters().at(-1)).toMatchObject({
      eventId: envelope.id,
      retryCount: 1,
      reason: "consumer unavailable",
    });
  });

  it("creates trace metadata with production/demo mode labels and linked span context", () => {
    const trace = createTraceMetadata(
      {
        ticketId: "tkt-cctv",
        aiRunId: "airun-test",
        title: "Adapter test trace",
        spans: [
          {
            id: "span-test",
            serviceName: "ai-worker",
            name: "ticket.triage",
            kind: "internal",
            status: "ok",
            startMs: 20,
            durationMs: 80,
            attributes: { correlationId: "corr-test" },
            linkedEventId: "evt-test",
          },
        ],
      },
      getRuntimeConfig({ OPS_DESK_MODE: "demo" }),
    );

    expect(trace).toMatchObject({
      mode: "hosted_demo",
      durationMs: 100,
      spans: [expect.objectContaining({ linkedEventId: "evt-test" })],
    });
  });

  it("signs webhook payloads canonically and keeps outbound delivery opt-in", async () => {
    const payload = { ticketId: "tkt-cctv", eventId: "evt-1024", idempotencyKey: "idem-1" };
    const signed = signWebhookPayload(payload, "secret", "2026-05-20T10:00:00.000Z");
    const client = createWebhookDeliveryClient(getRuntimeConfig({ OPS_DESK_MODE: "demo" }));
    const deliveryConfig = getRuntimeConfig({ OPS_DESK_MODE: "demo", WEBHOOK_DELIVERY_ENABLED: "true" });

    const attempt = await client.deliver({
      endpoint: webhookEndpoints[0],
      eventId: "evt-1024",
      ticketId: "tkt-cctv",
      payload,
      deliveredAt: signed.timestamp,
    });

    expect(signed.canonicalPayload).toBe('{"eventId":"evt-1024","idempotencyKey":"idem-1","ticketId":"tkt-cctv"}');
    expect(verifyWebhookSignature(payload, "secret", signed.timestamp, signed.signature)).toBe(true);
    expect(deliveryConfig.webhookOutboundEnabled).toBe(true);
    expect(attempt).toMatchObject({ status: "delivered", responseCode: 202 });
  });

  it("searches and rebuilds the demo read model through the repository interface", async () => {
    const repository = createInMemorySearchRepository();

    expect(await repository.searchDocuments({ query: "invoice", risk: "high" })).toHaveLength(1);
    expect(await repository.facetCounts("risk")).toMatchObject({ high: 3, medium: 3 });
    expect(await repository.rebuildReadModel([])).toBe(0);
    expect(await repository.searchDocuments({ query: "invoice" })).toHaveLength(0);
  });

  it("answers predefined relationship queries through the graph repository", async () => {
    const repository = createInMemoryGraphRepository();

    await expect(repository.listNodes()).resolves.toHaveLength(10);
    await expect(repository.listEdges()).resolves.toHaveLength(7);
    await expect(repository.answerRelationshipQuery("supplier-open-invoices")).resolves.toMatchObject({
      evidenceIds: ["kdoc-document-invoice"],
    });
  });
});
