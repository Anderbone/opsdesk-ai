import { createHash, randomUUID } from "node:crypto";
import { runtimeConfig } from "~/shared/config/runtime";
import type { AiRun } from "./ai-run";

type DemoAiRunInput = {
  action: AiRun["action"];
  approvalStatus: AiRun["approvalStatus"];
  input: string;
  output: Record<string, unknown>;
  confidence: number;
  ticketId?: string;
  validationStatus?: AiRun["validationStatus"];
};

function hashInput(input: string) {
  return `sha256:${createHash("sha256").update(input).digest("hex").slice(0, 12)}`;
}

export function createDemoAiRun({
  action,
  approvalStatus,
  input,
  output,
  confidence,
  ticketId = "",
  validationStatus = confidence < 0.8 ? "needs_review" : "valid",
}: DemoAiRunInput): AiRun {
  const promptTokens = Math.max(320, Math.round(input.length * 1.7));
  const completionTokens = Math.max(140, Math.round(JSON.stringify(output).length * 1.2));

  return {
    id: `airun-${randomUUID().slice(0, 8)}`,
    ticketId,
    action,
    model: runtimeConfig.aiModel,
    promptVersion: `${action}-2026-05-20`,
    inputHash: hashInput(input),
    confidence,
    latencyMs: 500 + Math.round(Math.random() * 900),
    promptTokens,
    completionTokens,
    estimatedCostUsd: Number(((promptTokens + completionTokens) * 0.000003).toFixed(4)),
    validationStatus,
    approvalStatus,
    createdAt: new Date().toISOString(),
    output,
  };
}
