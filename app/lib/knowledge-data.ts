import type { KnowledgeGraphEdge, KnowledgeGraphNode, SearchDocument } from "~/lib/types";

export const searchDocuments: SearchDocument[] = [
  {
    id: "kdoc-ticket-wifi",
    title: "Office Wi-Fi drops every afternoon",
    category: "ticket",
    sourceType: "customer_message",
    risk: "high",
    owner: "Priya",
    aiAction: "ticket.triage",
    ticketId: "tkt-wifi",
    customerCompany: "Harbour & Co Solicitors",
    summary: "Recurring afternoon Wi-Fi outage affects client video calls and creates SLA escalation risk.",
    citations: ["ticket:tkt-wifi", "ai_run:airun-003"],
    lastIndexedAt: "2026-05-20T10:00:00.000Z",
  },
  {
    id: "kdoc-playbook-wifi",
    title: "Afternoon Wi-Fi congestion diagnostic playbook",
    category: "playbook",
    sourceType: "internal_playbook",
    risk: "medium",
    owner: "Priya",
    aiAction: "retrieve.context",
    ticketId: "tkt-wifi",
    customerCompany: "Harbour & Co Solicitors",
    summary: "Check AP model, channel utilisation, scheduled backups, wired service stability, and interference reports.",
    citations: ["playbook:wifi-congestion-004", "ticket:tkt-wifi"],
    lastIndexedAt: "2026-05-20T10:04:00.000Z",
  },
  {
    id: "kdoc-document-invoice",
    title: "Invoice and delivery note mismatch",
    category: "document",
    sourceType: "uploaded_document",
    risk: "high",
    owner: "Morgan",
    aiAction: "document.extract",
    ticketId: "tkt-invoice",
    documentId: "doc-invoice",
    aiRunId: "airun-005",
    customerCompany: "BrightBake Kitchens",
    summary: "Invoice requests payment for 24 detector bases while delivery note confirms 20 received.",
    citations: ["document:doc-invoice", "ai_run:airun-005"],
    lastIndexedAt: "2026-05-20T09:10:00.000Z",
  },
  {
    id: "kdoc-ticket-cctv",
    title: "Warehouse CCTV quote prerequisites",
    category: "ticket",
    sourceType: "customer_message",
    risk: "medium",
    owner: "Morgan",
    aiAction: "response.template_select",
    ticketId: "tkt-cctv",
    aiRunId: "airun-002",
    customerCompany: "Northbank Storage",
    summary: "CCTV quote requires site size, floor plan, camera locations, night coverage, and install deadline.",
    citations: ["ticket:tkt-cctv", "playbook:cctv-quote-001", "ai_run:airun-002"],
    lastIndexedAt: "2026-05-20T10:08:00.000Z",
  },
  {
    id: "kdoc-ai-complaint",
    title: "Complaint response safety gate",
    category: "ai_run",
    sourceType: "watchtower_run",
    risk: "high",
    owner: "Priya",
    aiAction: "response.template_select",
    ticketId: "tkt-complaint",
    aiRunId: "airun-010",
    customerCompany: "Townsend Dental",
    summary: "Angry missed-visit complaint remains human-owned before any apology or recovery commitment is sent.",
    citations: ["ticket:tkt-complaint", "ai_run:airun-010"],
    lastIndexedAt: "2026-05-20T07:18:00.000Z",
  },
  {
    id: "kdoc-compliance-insurance",
    title: "Insurance certificate follow-up",
    category: "ticket",
    sourceType: "customer_message",
    risk: "medium",
    owner: "Ava",
    aiAction: "followup.suggest",
    ticketId: "tkt-insurance",
    aiRunId: "airun-006",
    customerCompany: "Rivergate Nursery",
    summary: "Council inspection depends on updated contractor insurance certificate before expiry.",
    citations: ["ticket:tkt-insurance", "followup:fu-insurance", "ai_run:airun-006"],
    lastIndexedAt: "2026-05-20T08:40:00.000Z",
  },
];

export const graphNodes: KnowledgeGraphNode[] = [
  { id: "node-wifi-ticket", label: "OD-1025 Wi-Fi outage", kind: "ticket", linkedTicketId: "tkt-wifi" },
  { id: "node-ap-model", label: "UniFi U6-LR access point", kind: "asset", linkedTicketId: "tkt-wifi" },
  { id: "node-priya", label: "Priya", kind: "owner", linkedTicketId: "tkt-wifi" },
  { id: "node-sla-risk", label: "SLA escalation risk", kind: "risk", linkedTicketId: "tkt-wifi" },
  { id: "node-invoice-ticket", label: "OD-1026 invoice mismatch", kind: "ticket", linkedTicketId: "tkt-invoice" },
  { id: "node-supplier", label: "Detector base supplier", kind: "supplier", linkedTicketId: "tkt-invoice" },
  { id: "node-brightbake", label: "BrightBake Kitchens", kind: "customer", linkedTicketId: "tkt-invoice" },
  { id: "node-cctv-ticket", label: "OD-1024 CCTV quote", kind: "ticket", linkedTicketId: "tkt-cctv" },
  { id: "node-camera-model", label: "Night-capable dome camera", kind: "asset", linkedTicketId: "tkt-cctv" },
  { id: "node-complaint-ticket", label: "OD-1028 missed visit complaint", kind: "ticket", linkedTicketId: "tkt-complaint" },
];

export const graphEdges: KnowledgeGraphEdge[] = [
  { id: "edge-wifi-model", from: "node-wifi-ticket", to: "node-ap-model", label: "mentions failing asset model", evidenceId: "kdoc-ticket-wifi" },
  { id: "edge-wifi-owner", from: "node-wifi-ticket", to: "node-priya", label: "assigned to", evidenceId: "kdoc-ticket-wifi" },
  { id: "edge-wifi-risk", from: "node-priya", to: "node-sla-risk", label: "owner load creates", evidenceId: "kdoc-ticket-wifi" },
  { id: "edge-invoice-supplier", from: "node-invoice-ticket", to: "node-supplier", label: "supplier quantity issue", evidenceId: "kdoc-document-invoice" },
  { id: "edge-invoice-customer", from: "node-supplier", to: "node-brightbake", label: "affects open invoice", evidenceId: "kdoc-document-invoice" },
  { id: "edge-cctv-asset", from: "node-cctv-ticket", to: "node-camera-model", label: "quote depends on", evidenceId: "kdoc-ticket-cctv" },
  { id: "edge-complaint-owner", from: "node-complaint-ticket", to: "node-priya", label: "competes for same owner", evidenceId: "kdoc-ai-complaint" },
];

export const graphQueries = [
  {
    id: "shared-failing-asset-model",
    title: "Shared failing asset model",
    result: "OD-1025 is linked to UniFi U6-LR access points; similar asset mentions are searchable before dispatch.",
    evidenceIds: ["kdoc-ticket-wifi", "kdoc-playbook-wifi"],
  },
  {
    id: "supplier-open-invoices",
    title: "Supplier issue affecting open invoices",
    result: "The detector base supplier is linked to OD-1026 and the BrightBake payment exception queue.",
    evidenceIds: ["kdoc-document-invoice"],
  },
  {
    id: "engineer-overload-sla",
    title: "Engineer overload causing SLA risk",
    result: "Priya owns both the urgent Wi-Fi case and missed-visit complaint, raising near-term SLA risk.",
    evidenceIds: ["kdoc-ticket-wifi", "kdoc-ai-complaint"],
  },
];

export type KnowledgeFilters = {
  query?: string;
  category?: string;
  sourceType?: string;
  risk?: string;
  owner?: string;
  aiAction?: string;
};

export type FacetField = keyof Pick<SearchDocument, "category" | "sourceType" | "risk" | "owner" | "aiAction">;

export const knowledgeFacetFields: FacetField[] = ["category", "sourceType", "risk", "owner", "aiAction"];

function matchesFacet(document: SearchDocument, field: FacetField, value?: string) {
  return !value || value === "all" || document[field] === value;
}

export function documentMatchesKnowledgeFilters(document: SearchDocument, filters: KnowledgeFilters) {
  const normalizedQuery = filters.query?.trim().toLowerCase();
  if (normalizedQuery) {
    const haystack = `${document.title} ${document.summary} ${document.customerCompany}`.toLowerCase();
    if (!haystack.includes(normalizedQuery)) return false;
  }

  return knowledgeFacetFields.every((field) => matchesFacet(document, field, filters[field]));
}

export function searchKnowledgeDocuments(filters: KnowledgeFilters) {
  return searchDocuments.filter((document) => documentMatchesKnowledgeFilters(document, filters));
}

export function getFacetValues(field: FacetField) {
  return Array.from(new Set(searchDocuments.map((document) => document[field]))).sort();
}
