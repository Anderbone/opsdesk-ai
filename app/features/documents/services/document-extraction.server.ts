import { createHash, randomUUID } from "node:crypto";
import { runtimeConfig } from "~/shared/config/runtime";
import type { AiRun } from "~/shared/domain/ai-run";

function hashInput(input: string) {
  return `sha256:${createHash("sha256").update(input).digest("hex").slice(0, 12)}`;
}

export function extractDocument(input: string, ticketId: string): AiRun {
  const output = {
    purchaseOrder: input.match(/PO[-\s]?\d+/i)?.[0] ?? "PO-UNKNOWN",
    invoiceQuantity: Number(input.match(/invoice[^0-9]*(\d+)/i)?.[1] ?? 24),
    deliveredQuantity: Number(input.match(/delivery[^0-9]*(\d+)/i)?.[1] ?? 20),
    mismatch: true,
    note: "Demo extraction is deterministic; production mode can use AI SDK with validation.",
  };
  const promptTokens = Math.max(320, Math.round(`${ticketId}:${input}`.length * 1.7));
  const completionTokens = Math.max(140, Math.round(JSON.stringify(output).length * 1.2));

  return {
    id: `airun-${randomUUID().slice(0, 8)}`,
    ticketId,
    action: "document.extract",
    model: runtimeConfig.aiModel,
    promptVersion: "document.extract-2026-05-20",
    inputHash: hashInput(`${ticketId}:${input}`),
    confidence: 0.78,
    latencyMs: 500 + Math.round(Math.random() * 900),
    promptTokens,
    completionTokens,
    estimatedCostUsd: Number(((promptTokens + completionTokens) * 0.000003).toFixed(4)),
    validationStatus: "needs_review",
    approvalStatus: "pending",
    createdAt: new Date().toISOString(),
    output,
  };
}
