import { describe, expect, it } from "vitest";
import { extractDocument } from "~/features/documents/services/document-extraction.server";
import { demoTickets } from "~/features/tickets/data/demo-data";
import type { Ticket } from "~/features/tickets/domain/types";
import { draftReply, triageMessage } from "~/features/tickets/services/ai-triage.server";

function ticket(overrides: Partial<Ticket>) {
  return {
    ...structuredClone(demoTickets[0]),
    id: "tkt-test",
    ...overrides,
  };
}

describe("AI triage policy", () => {
  it("classifies urgent Wi-Fi or network messages as urgent incidents", () => {
    const { result, run } = triageMessage({
      title: "Urgent Wi-Fi down",
      body: "The office network is offline and video calls are failing.",
      customerCompany: "Harbour Legal",
    });

    expect(result.category).toBe("incident");
    expect(result.priority).toBe("urgent");
    expect(result.tags).toContain("diagnostics");
    expect(run.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("keeps complaint drafts in human review even at high confidence", () => {
    const reply = draftReply(
      ticket({
        category: "complaint",
        priority: "high",
        sentiment: "angry",
        missingInfo: ["engineer schedule note", "reason for no-show", "preferred recovery slot"],
      }),
      0.96,
    );

    expect(reply.decision.mode).toBe("human_review");
    expect(reply.decision.nextStep).toMatch(/human owner/i);
    expect(reply.run.approvalStatus).toBe("pending");
  });

  it("marks document mismatch extraction as needing review", () => {
    const run = extractDocument(
      "PO-4481. Supplier invoice quantity 24. Delivery note quantity 20 received.",
      "tkt-invoice",
    );

    expect(run.action).toBe("document.extract");
    expect(run.validationStatus).toBe("needs_review");
    expect(run.approvalStatus).toBe("pending");
    expect(run.output).toMatchObject({
      purchaseOrder: "PO-4481",
      invoiceQuantity: 24,
      deliveredQuantity: 20,
      mismatch: true,
    });
  });

  it("auto-sends only high-confidence replies from approved templates", () => {
    const reply = draftReply(
      ticket({
        category: "quote",
        priority: "normal",
        sentiment: "neutral",
        preferredContactMethod: "email",
        missingInfo: ["site size", "floor plan", "preferred install date"],
      }),
      0.9,
    );

    expect(reply.decision.mode).toBe("auto_response");
    expect(reply.decision.templateId).toBe("tpl-quote-site-form-email");
    expect(reply.run.approvalStatus).toBe("not_required");
  });

  it("keeps urgent incidents human-owned even with high confidence", () => {
    const reply = draftReply(
      ticket({
        category: "incident",
        priority: "urgent",
        sentiment: "concerned",
        preferredContactMethod: "phone",
        missingInfo: ["affected area", "equipment model", "wired connection status", "recent changes"],
      }),
      0.97,
    );

    expect(reply.decision.mode).toBe("human_review");
    expect(reply.decision.templateId).toBe("tpl-incident-diagnostics-phone");
    expect(reply.decision.nextStep).toMatch(/human owner/i);
    expect(reply.run.approvalStatus).toBe("pending");
  });
});
