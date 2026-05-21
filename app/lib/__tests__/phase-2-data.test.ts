import { describe, expect, it } from "vitest";
import {
  filterEventsByTopic,
  groupEventsByTicket,
  summarizeConsumerLag,
} from "~/lib/event-data";
import { searchKnowledgeDocuments } from "~/lib/knowledge-data";
import { getTraceStatusCounts } from "~/lib/trace-data";
import {
  buildWebhookSignatureBase,
  getDeliveriesForEndpoint,
  getWebhookDeliveryStats,
} from "~/lib/webhook-data";

describe("phase 2 data selectors", () => {
  it("filters and groups event envelopes by ticket", () => {
    const events = filterEventsByTopic("opsdesk.ai.actions");
    const grouped = groupEventsByTicket(events);

    expect(events.map((event) => event.topic)).toEqual(expect.arrayContaining(["opsdesk.ai.actions"]));
    expect(grouped["tkt-cctv"].map((event) => event.id)).toContain("evt-1024-draft-sent");
    expect(grouped["tkt-wifi"].map((event) => event.id)).toContain("evt-1025-human-review");
  });

  it("summarizes consumer lag without hiding unhealthy groups", () => {
    expect(summarizeConsumerLag()).toMatchObject({
      totalLag: 19,
      maxLag: 17,
      unhealthyGroups: 1,
    });
  });

  it("builds deterministic webhook signature bases and delivery stats", () => {
    const payload = { eventId: "evt-1024-draft-sent", ticketId: "tkt-cctv" };

    expect(buildWebhookSignatureBase("2026-05-20T10:06:12.000Z", payload)).toBe(
      '2026-05-20T10:06:12.000Z.{"eventId":"evt-1024-draft-sent","ticketId":"tkt-cctv"}',
    );
    expect(getDeliveriesForEndpoint("wh-finance")).toHaveLength(2);
    expect(getWebhookDeliveryStats()).toEqual({ delivered: 2, retrying: 1, failed: 1 });
  });

  it("searches knowledge documents across query and facets", () => {
    const results = searchKnowledgeDocuments({
      query: "invoice",
      risk: "high",
      owner: "Morgan",
      category: "document",
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      ticketId: "tkt-invoice",
      documentId: "doc-invoice",
      aiRunId: "airun-005",
    });
  });

  it("counts trace statuses linked to tickets and integrations", () => {
    expect(getTraceStatusCounts()).toEqual({
      ok: 1,
      error: 1,
      needs_review: 1,
    });
  });
});
