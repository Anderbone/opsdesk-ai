import type { TicketDocument } from "~/features/documents/domain/types";
import type { AiRun } from "~/shared/domain/ai-run";

export type TicketPriority = "urgent" | "high" | "normal" | "low";
export type ContactMethod = "email" | "message" | "phone";
export type AutomationMode = "auto_response" | "human_review";
export type TicketStatus =
  | "new"
  | "triaged"
  | "waiting_customer"
  | "awaiting_approval"
  | "approved"
  | "scheduled"
  | "closed";

export type TicketCategory =
  | "quote"
  | "incident"
  | "document_issue"
  | "compliance"
  | "complaint";

export type FollowUpTask = {
  id: string;
  ticketId: string;
  title: string;
  owner: string;
  dueAt: string;
  status: "open" | "done";
  source: "ai_suggested" | "ai_auto_sent" | "human_created";
};

export type TicketDraft = {
  id: string;
  body: string;
  tone: "calm" | "professional" | "urgent" | "apologetic";
  status: "draft" | "approved" | "sent";
  createdByRunId: string;
  updatedAt: string;
  templateId?: string;
  channel?: ContactMethod;
  deliveryMode?: "auto_sent" | "approval_required";
};

export type AutomationDecision = {
  mode: AutomationMode;
  confidence: number;
  threshold: number;
  channel: ContactMethod;
  reason: string;
  nextStep: string;
  templateId?: string;
  templateName?: string;
};

export type Ticket = {
  id: string;
  number: string;
  title: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  preferredContactMethod: ContactMethod;
  channel: "email" | "widget" | "upload" | "phone-note";
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  sentiment: "positive" | "neutral" | "concerned" | "angry";
  createdAt: string;
  updatedAt: string;
  dueAt: string;
  sourceText: string;
  aiSummary: string;
  missingInfo: string[];
  risks: string[];
  suggestedNextAction: string;
  assignedTo: string;
  tags: string[];
  automationDecision?: AutomationDecision;
  draft?: TicketDraft;
};

export type OpsDeskState = {
  tickets: Ticket[];
  aiRuns: AiRun[];
  documents: TicketDocument[];
  followUps: FollowUpTask[];
};

export type { AiRun, TicketDocument };
