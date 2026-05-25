import type { AiRun } from "~/shared/domain/ai-run";
import { createDemoAiRun } from "~/shared/domain/ai-run.server";

export function extractDocument(input: string, ticketId: string): AiRun {
  const output = {
    purchaseOrder: input.match(/PO[-\s]?\d+/i)?.[0] ?? "PO-UNKNOWN",
    invoiceQuantity: Number(input.match(/invoice[^0-9]*(\d+)/i)?.[1] ?? 24),
    deliveredQuantity: Number(input.match(/delivery[^0-9]*(\d+)/i)?.[1] ?? 20),
    mismatch: true,
    note: "Demo extraction is deterministic; production mode can use AI SDK with validation.",
  };
  const runInput = `${ticketId}:${input}`;

  return createDemoAiRun({
    ticketId,
    action: "document.extract",
    approvalStatus: "pending",
    input: runInput,
    output,
    confidence: 0.78,
    validationStatus: "needs_review",
  });
}
