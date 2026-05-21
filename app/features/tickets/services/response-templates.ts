import type { ContactMethod, Ticket, TicketCategory } from "~/features/tickets/domain/types";

export type ResponseTemplatePurpose =
  | "confirm_date"
  | "collect_site_info"
  | "collect_diagnostics"
  | "confirm_document_mismatch";

export type ResponseTemplate = {
  id: string;
  name: string;
  category: TicketCategory;
  channel: ContactMethod;
  purpose: ResponseTemplatePurpose;
  requiredInfo: string[];
  autoSendAllowed: boolean;
  body: string;
};

export const responseTemplates: ResponseTemplate[] = [
  {
    id: "tpl-quote-site-form-message",
    name: "Quote site details form",
    category: "quote",
    channel: "message",
    purpose: "collect_site_info",
    requiredInfo: ["site size", "floor plan", "preferred install date", "survey windows"],
    autoSendAllowed: true,
    body:
      "Hi {{firstName}}, thanks for the enquiry. To prepare the quote, please complete this follow-up form with site size, floor plan or photos, preferred install date, and two survey windows: {{formLink}}",
  },
  {
    id: "tpl-quote-site-form-email",
    name: "Quote site details email",
    category: "quote",
    channel: "email",
    purpose: "collect_site_info",
    requiredInfo: ["site size", "floor plan", "preferred install date", "survey windows"],
    autoSendAllowed: true,
    body:
      "Hi {{firstName}},\n\nThanks for the enquiry. To prepare the quote, could you send the site size, a floor plan or photos, preferred install date, and two survey windows?\n\nYou can also use this follow-up form: {{formLink}}\n\nRegards,\nDragonTech Facilities",
  },
  {
    id: "tpl-compliance-date-email",
    name: "Compliance date confirmation",
    category: "compliance",
    channel: "email",
    purpose: "confirm_date",
    requiredInfo: ["inspection date/time", "required certificate"],
    autoSendAllowed: true,
    body:
      "Hi {{firstName}},\n\nWe are checking the certificate request. Please confirm the inspection date and time, and whether the council needs the current certificate only or any additional contractor documents.\n\nRegards,\nDragonTech Facilities",
  },
  {
    id: "tpl-incident-diagnostics-phone",
    name: "Incident diagnostics call script",
    category: "incident",
    channel: "phone",
    purpose: "collect_diagnostics",
    requiredInfo: ["affected area", "equipment model", "wired connection status", "recent changes"],
    autoSendAllowed: false,
    body:
      "Call {{firstName}} and confirm: affected area, router or access point model, whether wired devices stay online, and any recent network changes. If the issue is live, transfer to the on-call engineer.",
  },
  {
    id: "tpl-document-mismatch-email",
    name: "Document mismatch confirmation",
    category: "document_issue",
    channel: "email",
    purpose: "confirm_document_mismatch",
    requiredInfo: ["supplier confirmation", "warehouse receiving note", "invoice approval status"],
    autoSendAllowed: false,
    body:
      "Hi {{firstName}},\n\nThe document check found a possible mismatch. Before anyone approves the invoice, please confirm the receiving note, supplier confirmation, and invoice approval status.\n\nRegards,\nDragonTech Facilities",
  },
];

export function selectResponseTemplate(ticket: Ticket) {
  const preferred = responseTemplates.find(
    (template) => template.category === ticket.category && template.channel === ticket.preferredContactMethod,
  );
  if (preferred) return preferred;

  return responseTemplates.find((template) => template.category === ticket.category);
}

export function renderResponseTemplate(template: ResponseTemplate, ticket: Ticket) {
  return template.body
    .replaceAll("{{firstName}}", ticket.customerName.split(" ")[0] ?? ticket.customerName)
    .replaceAll("{{formLink}}", `https://opsdesk.example/forms/${ticket.id}`);
}
