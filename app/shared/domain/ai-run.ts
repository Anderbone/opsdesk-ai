export type AiAction =
  | "ticket.triage"
  | "response.template_select"
  | "document.extract"
  | "followup.suggest"
  | "knowledge.ingest"
  | "retrieve.context"
  | "agent.evaluate";

export type AiRun = {
  id: string;
  ticketId: string;
  action: AiAction;
  model: string;
  promptVersion: string;
  inputHash: string;
  confidence: number;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  validationStatus: "valid" | "needs_review" | "failed";
  approvalStatus: "pending" | "approved" | "rejected" | "not_required";
  createdAt: string;
  output: Record<string, unknown>;
  feedback?: string;
};
