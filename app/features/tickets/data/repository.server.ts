import { randomUUID } from "node:crypto";
import { createCookieSessionStorage } from "react-router";
import { createDemoState } from "./demo-data";
import { extractDocument } from "~/features/documents/services/document-extraction.server";
import { draftReply, triageMessage } from "~/features/tickets/services/ai-triage.server";
import { runtimeConfig } from "~/shared/config/runtime";
import type { TicketDocument } from "~/features/documents/domain/types";
import type { ContactMethod, FollowUpTask, OpsDeskState, Ticket } from "~/features/tickets/domain/types";

type CreateTicketEvent = {
  type: "create-ticket";
  id: string;
  number: string;
  createdAt: string;
  dueAt: string;
  draftId: string;
  triageRunId: string;
  draftRunId: string;
  form: {
    name: string;
    company: string;
    email: string;
    preferredContactMethod: ContactMethod;
    title: string;
    message: string;
  };
};

type ApproveDraftEvent = {
  type: "approve-draft";
  ticketId: string;
  at: string;
};

type RegenerateDraftEvent = {
  type: "regenerate-draft";
  ticketId: string;
  draftId: string;
  runId: string;
  at: string;
};

type ExtractDocumentEvent = {
  type: "extract-document";
  ticketId: string;
  text: string;
  documentId: string;
  runId: string;
  at: string;
};

type AddFollowUpEvent = {
  type: "add-followup";
  ticketId: string;
  title: string;
  owner: string;
  taskId: string;
  dueAt: string;
  at: string;
};

type DemoEvent =
  | CreateTicketEvent
  | ApproveDraftEvent
  | RegenerateDraftEvent
  | ExtractDocumentEvent
  | AddFollowUpEvent;

type DraftReply = ReturnType<typeof draftReply>;

type DemoSession = {
  events?: DemoEvent[];
};

const MAX_EVENTS = 10;
const MAX_FIELD_LENGTH = 360;
const MAX_SESSION_BYTES = 2400;

const sessionStorage = createCookieSessionStorage<DemoSession>({
  cookie: {
    name: "opsdesk_demo",
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secrets: [runtimeConfig.sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

function clean(value: string, fallback = "") {
  const trimmed = value.trim();
  return (trimmed || fallback).slice(0, MAX_FIELD_LENGTH);
}

function getEvents(session: Awaited<ReturnType<typeof sessionStorage.getSession>>) {
  const events = session.get("events");
  return Array.isArray(events) ? events : [];
}

async function readSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

async function commitEvents(request: Request, events: DemoEvent[]) {
  const session = await readSession(request);
  session.set("events", trimEvents(events));
  return {
    "Set-Cookie": await sessionStorage.commitSession(session),
  };
}

function trimEvents(events: DemoEvent[]) {
  let next = events.slice(-MAX_EVENTS);
  while (next.length > 1 && JSON.stringify({ events: next }).length > MAX_SESSION_BYTES) {
    next = next.slice(1);
  }
  return next;
}

async function readEvents(request?: Request) {
  if (!request) return [];
  const session = await readSession(request);
  return getEvents(session);
}

function buildState(events: DemoEvent[]) {
  const state = createDemoState();
  for (const event of events) {
    applyEvent(state, event);
  }
  return state;
}

function applyEvent(state: OpsDeskState, event: DemoEvent) {
  if (event.type === "create-ticket") {
    applyCreateTicket(state, event);
    return;
  }

  const ticket = state.tickets.find((item) => item.id === event.ticketId);
  if (!ticket) return;

  if (event.type === "approve-draft") {
    if (ticket.draft) {
      ticket.draft.status = "approved";
      ticket.status = "approved";
      ticket.updatedAt = event.at;
      const run = state.aiRuns.find((item) => item.id === ticket.draft?.createdByRunId);
      if (run) run.approvalStatus = "approved";
    }
    return;
  }

  if (event.type === "regenerate-draft") {
    const reply = draftReply(ticket);
    reply.run.id = event.runId;
    reply.run.ticketId = ticket.id;
    reply.run.createdAt = event.at;
    applyDraftReply(ticket, reply, event.draftId, event.at);
    ticket.updatedAt = event.at;
    state.aiRuns.unshift(reply.run);
    return;
  }

  if (event.type === "extract-document") {
    const run = extractDocument(event.text, ticket.id);
    run.id = event.runId;
    run.createdAt = event.at;
    const fields = run.output as Record<string, string | number | boolean>;
    const document: TicketDocument = {
      id: event.documentId,
      ticketId: ticket.id,
      fileName: "manual-demo-extract.txt",
      fileType: "text/plain",
      uploadedAt: event.at,
      extractedFields: fields,
      mismatchFlags:
        fields.invoiceQuantity !== fields.deliveredQuantity
          ? [`Invoice quantity ${fields.invoiceQuantity} does not match delivery quantity ${fields.deliveredQuantity}`]
          : [],
    };
    ticket.status = "waiting_customer";
    ticket.updatedAt = event.at;
    state.documents.unshift(document);
    state.aiRuns.unshift(run);
    return;
  }

  if (event.type === "add-followup") {
    const task: FollowUpTask = {
      id: event.taskId,
      ticketId: ticket.id,
      title: event.title,
      owner: event.owner,
      dueAt: event.dueAt,
      status: "open",
      source: "human_created",
    };
    state.followUps.unshift(task);
    ticket.updatedAt = event.at;
  }
}

function applyCreateTicket(state: OpsDeskState, event: CreateTicketEvent) {
  const triage = triageMessage({
    title: event.form.title,
    body: event.form.message,
    customerCompany: event.form.company,
  });
  const ticket: Ticket = {
    id: event.id,
    number: event.number,
    title: event.form.title,
    customerName: event.form.name,
    customerCompany: event.form.company,
    customerEmail: event.form.email,
    preferredContactMethod: event.form.preferredContactMethod,
    channel: "widget",
    category: triage.result.category,
    priority: triage.result.priority,
    status: "triaged",
    sentiment: triage.result.sentiment,
    createdAt: event.createdAt,
    updatedAt: event.createdAt,
    dueAt: event.dueAt,
    sourceText: event.form.message,
    aiSummary: triage.result.summary,
    missingInfo: triage.result.missingInfo,
    risks: triage.result.risks,
    suggestedNextAction: triage.result.suggestedNextAction,
    assignedTo: triage.result.priority === "urgent" ? "Priya" : "Morgan",
    tags: triage.result.tags,
  };
  triage.run.id = event.triageRunId;
  triage.run.ticketId = ticket.id;
  triage.run.createdAt = event.createdAt;
  const reply = draftReply(ticket, triage.run.confidence);
  reply.run.id = event.draftRunId;
  reply.run.ticketId = ticket.id;
  reply.run.createdAt = event.createdAt;
  applyDraftReply(ticket, reply, event.draftId, event.createdAt);

  state.tickets.unshift(ticket);
  state.aiRuns.unshift(reply.run, triage.run);
  state.followUps.unshift({
    id: `fu-${event.id.replace(/^tkt-/, "")}`,
    ticketId: ticket.id,
    title: ticket.suggestedNextAction,
    owner: ticket.assignedTo,
    dueAt: ticket.dueAt,
    status: "open",
    source: reply.decision.mode === "auto_response" ? "ai_auto_sent" : "ai_suggested",
  });
}

function applyDraftReply(ticket: Ticket, reply: DraftReply, draftId: string, updatedAt: string) {
  const autoResponse = reply.decision.mode === "auto_response";
  ticket.automationDecision = reply.decision;
  ticket.status = autoResponse ? "waiting_customer" : "awaiting_approval";
  ticket.draft = {
    id: draftId,
    body: reply.body,
    tone: draftTone(ticket),
    status: autoResponse ? "sent" : "draft",
    createdByRunId: reply.run.id,
    updatedAt,
    templateId: reply.decision.templateId,
    channel: reply.decision.channel,
    deliveryMode: autoResponse ? "auto_sent" : "approval_required",
  };
}

function draftTone(ticket: Ticket) {
  if (ticket.sentiment === "angry") return "apologetic";
  if (ticket.priority === "urgent") return "urgent";
  return "professional";
}

export async function getState(request?: Request) {
  return buildState(await readEvents(request));
}

export async function resetDemoState(request: Request) {
  return commitEvents(request, []);
}

export async function getTicketBundle(request: Request, ticketId: string) {
  const state = await getState(request);
  const ticket = state.tickets.find((item) => item.id === ticketId);
  if (!ticket) return null;
  return {
    ticket,
    aiRuns: state.aiRuns.filter((run) => run.ticketId === ticketId),
    documents: state.documents.filter((document) => document.ticketId === ticketId),
    followUps: state.followUps.filter((task) => task.ticketId === ticketId),
  };
}

export async function createTicketFromEnquiry(
  request: Request,
  form: {
    name: string;
    company: string;
    email: string;
    preferredContactMethod?: string;
    title: string;
    message: string;
  },
) {
  const events = await readEvents(request);
  const baseTicketCount = buildState(events).tickets.length;
  const now = new Date().toISOString();
  const ticketId = `tkt-${randomUUID().slice(0, 8)}`;
  const formPayload = {
    name: clean(form.name),
    company: clean(form.company),
    email: clean(form.email),
    preferredContactMethod: cleanContactMethod(form.preferredContactMethod),
    title: clean(form.title),
    message: clean(form.message),
  };
  const triage = triageMessage({
    title: formPayload.title,
    body: formPayload.message,
    customerCompany: formPayload.company,
  });
  const event: CreateTicketEvent = {
    type: "create-ticket",
    id: ticketId,
    number: `OD-${1024 + baseTicketCount + 1}`,
    createdAt: now,
    dueAt: new Date(Date.now() + (triage.result.priority === "urgent" ? 2 : 24) * 60 * 60 * 1000).toISOString(),
    draftId: `draft-${randomUUID().slice(0, 8)}`,
    triageRunId: `airun-${randomUUID().slice(0, 8)}`,
    draftRunId: `airun-${randomUUID().slice(0, 8)}`,
    form: formPayload,
  };
  const nextEvents = [...events, event];
  const ticket = buildState(nextEvents).tickets.find((item) => item.id === ticketId);
  return {
    ticket,
    headers: await commitEvents(request, nextEvents),
  };
}

function cleanContactMethod(value?: string): ContactMethod {
  if (value === "message" || value === "phone" || value === "email") return value;
  return "email";
}

export async function approveDraft(request: Request, ticketId: string) {
  const events = await readEvents(request);
  const nextEvents: DemoEvent[] = [
    ...events,
    {
      type: "approve-draft",
      ticketId,
      at: new Date().toISOString(),
    },
  ];
  return commitEvents(request, nextEvents);
}

export async function regenerateDraft(request: Request, ticketId: string) {
  const events = await readEvents(request);
  const nextEvents: DemoEvent[] = [
    ...events,
    {
      type: "regenerate-draft",
      ticketId,
      draftId: `draft-${randomUUID().slice(0, 8)}`,
      runId: `airun-${randomUUID().slice(0, 8)}`,
      at: new Date().toISOString(),
    },
  ];
  return commitEvents(request, nextEvents);
}

export async function addDocumentExtraction(request: Request, ticketId: string, text: string) {
  const events = await readEvents(request);
  const nextEvents: DemoEvent[] = [
    ...events,
    {
      type: "extract-document",
      ticketId,
      text: clean(text, "PO-4481. Supplier invoice quantity 24. Delivery note quantity 20 received."),
      documentId: `doc-${randomUUID().slice(0, 8)}`,
      runId: `airun-${randomUUID().slice(0, 8)}`,
      at: new Date().toISOString(),
    },
  ];
  return commitEvents(request, nextEvents);
}

export async function addFollowUp(request: Request, ticketId: string, title: string, owner: string) {
  const events = await readEvents(request);
  const nextEvents: DemoEvent[] = [
    ...events,
    {
      type: "add-followup",
      ticketId,
      title: clean(title, "Review ticket"),
      owner: clean(owner, "Morgan"),
      taskId: `fu-${randomUUID().slice(0, 8)}`,
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      at: new Date().toISOString(),
    },
  ];
  return commitEvents(request, nextEvents);
}
