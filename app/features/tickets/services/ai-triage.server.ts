import {
  renderResponseTemplate,
  selectResponseTemplate,
} from "./response-templates";
import type { AutomationDecision, Ticket, TicketCategory, TicketPriority } from "~/features/tickets/domain/types";
import type { AiRun } from "~/shared/domain/ai-run";
import { createDemoAiRun } from "~/shared/domain/ai-run.server";

const AUTO_RESPONSE_CONFIDENCE_THRESHOLD = 0.86;

type TriageResult = {
  category: TicketCategory;
  priority: TicketPriority;
  sentiment: Ticket["sentiment"];
  summary: string;
  missingInfo: string[];
  risks: string[];
  suggestedNextAction: string;
  tags: string[];
};

function hasAny(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

export function triageMessage(input: {
  title: string;
  body: string;
  customerCompany: string;
}): { result: TriageResult; run: AiRun } {
  const text = `${input.title}\n${input.body}`;
  let category: TicketCategory = "quote";
  let priority: TicketPriority = "normal";
  let sentiment: Ticket["sentiment"] = "neutral";
  let missingInfo = ["preferred deadline", "site/contact details"];
  let risks = ["May need human review before customer commitment"];
  let tags = ["new-enquiry"];
  let suggestedNextAction = "Review AI triage and approve a short information-gathering reply.";

  if (hasAny(text, ["wifi", "wi-fi", "internet", "network", "offline", "urgent"])) {
    category = "incident";
    priority = "urgent";
    sentiment = "concerned";
    missingInfo = ["affected area", "equipment model", "wired connection status", "recent changes"];
    risks = ["Operational disruption", "Potential escalation if response is delayed"];
    tags = ["incident", "network", "diagnostics"];
    suggestedNextAction = "Call the customer, gather diagnostics, and schedule an engineer if the issue is repeatable.";
  } else if (hasAny(text, ["invoice", "delivery", "po", "purchase order", "mismatch"])) {
    category = "document_issue";
    priority = "normal";
    missingInfo = ["supplier confirmation", "warehouse receiving note", "invoice approval status"];
    risks = ["Overpayment risk", "Inventory mismatch"];
    tags = ["documents", "invoice"];
    suggestedNextAction = "Extract fields from uploaded documents and ask the customer to confirm disputed quantities.";
  } else if (hasAny(text, ["insurance", "certificate", "compliance", "inspection"])) {
    category = "compliance";
    priority = "high";
    missingInfo = ["current certificate", "inspection date/time"];
    risks = ["Compliance blocker for customer inspection"];
    tags = ["compliance", "certificate"];
    suggestedNextAction = "Chase the updated certificate and schedule a reminder before the customer inspection.";
  } else if (hasAny(text, ["unacceptable", "angry", "complaint", "nobody called", "missed"])) {
    category = "complaint";
    priority = "high";
    sentiment = "angry";
    missingInfo = ["internal schedule note", "reason for failure", "preferred recovery slot"];
    risks = ["Customer relationship risk", "Potential refund or service credit"];
    tags = ["complaint", "service-recovery"];
    suggestedNextAction = "Approve an apologetic reply, investigate the failure, and offer a priority recovery slot.";
  } else if (hasAny(text, ["quote", "cctv", "camera", "install", "warehouse"])) {
    category = "quote";
    priority = hasAny(text, ["month end", "this week", "urgent"]) ? "high" : "normal";
    missingInfo = ["site size", "floor plan", "quantity range", "preferred install date"];
    risks = ["Quote may be inaccurate without site survey"];
    tags = ["quote", "site-survey"];
    suggestedNextAction = "Ask for a floor plan and survey windows before preparing a quote outline.";
  }

  const result: TriageResult = {
    category,
    priority,
    sentiment,
    summary: `${input.customerCompany} needs help with ${input.title.toLowerCase()}. AI identified ${category.replace("_", " ")} intent and ${priority} priority.`,
    missingInfo,
    risks,
    suggestedNextAction,
    tags,
  };

  return {
    result,
    run: createDemoAiRun({
      action: "ticket.triage",
      approvalStatus: "not_required",
      input: text,
      output: result,
      confidence: confidenceFor(priority, category),
    }),
  };
}

export function draftReply(ticket: Ticket, triageConfidence = 0.83): { body: string; run: AiRun; decision: AutomationDecision } {
  const template = selectResponseTemplate(ticket);
  const blockers = getHumanReviewBlockers(ticket, template?.autoSendAllowed ?? false);
  const canAutoRespond =
    Boolean(template) && triageConfidence >= AUTO_RESPONSE_CONFIDENCE_THRESHOLD && blockers.length === 0;
  const channel = template?.channel ?? ticket.preferredContactMethod;
  const decision: AutomationDecision = {
    mode: canAutoRespond ? "auto_response" : "human_review",
    confidence: Number(triageConfidence.toFixed(2)),
    threshold: AUTO_RESPONSE_CONFIDENCE_THRESHOLD,
    channel,
    reason: canAutoRespond
      ? "Safe information-gathering template matched the ticket intent and contact preference."
      : blockers[0] ?? "No approved response template matched this ticket.",
    nextStep: canAutoRespond
      ? "Send the selected approved template and wait for the customer's missing information."
      : "Route the response to a human owner before contacting the customer.",
    templateId: template?.id,
    templateName: template?.name,
  };
  const body = template ? renderResponseTemplate(template, ticket) : fallbackDraft(ticket);

  return {
    body,
    run: createDemoAiRun({
      action: "response.template_select",
      approvalStatus: canAutoRespond ? "not_required" : "pending",
      input: `${ticket.id}:${ticket.sourceText}:${ticket.updatedAt}`,
      output: {
        decision,
        templateId: template?.id ?? null,
        templateName: template?.name ?? null,
        requiredInfo: template?.requiredInfo ?? ticket.missingInfo.slice(0, 3),
      },
      confidence: canAutoRespond ? triageConfidence : Math.min(triageConfidence, 0.84),
    }),
    decision,
  };
}

function getHumanReviewBlockers(ticket: Ticket, templateAllowsAutoSend: boolean) {
  const blockers: string[] = [];
  if (!templateAllowsAutoSend) blockers.push("Template is marked review-only.");
  if (ticket.category === "complaint" || ticket.sentiment === "angry") {
    blockers.push("Complaint or angry sentiment requires service recovery review.");
  }
  if (ticket.category === "document_issue") {
    blockers.push("Document mismatch can affect payment or stock records.");
  }
  if (ticket.priority === "urgent") {
    blockers.push("Urgent operational incidents need human ownership before outbound contact.");
  }
  if (ticket.missingInfo.some((item) => /internal|reason|approval|refund|credit/i.test(item))) {
    blockers.push("Missing information includes internal or commercial judgement.");
  }
  return blockers;
}

function fallbackDraft(ticket: Ticket) {
  const opener =
    ticket.sentiment === "angry"
      ? "I am sorry about the disruption and lack of communication."
      : "Thanks for the details.";
  const missing =
    ticket.missingInfo.length > 0
      ? `To move this forward, could you send ${ticket.missingInfo.slice(0, 3).join(", ")}?`
      : "We have enough detail to start the next step.";
  return `Hi ${ticket.customerName.split(" ")[0]},\n\n${opener} ${missing}\n\n${ticket.suggestedNextAction} We will keep this ticket open until a human approves the next customer-facing action.\n\nRegards,\nDragonTech Facilities`;
}

function confidenceFor(priority: TicketPriority, category: TicketCategory) {
  if (priority === "urgent") return 0.91;
  if (category === "document_issue") return 0.79;
  return 0.86;
}
