import type { TicketDocument } from "~/features/documents/domain/types";

const now = new Date("2026-05-20T10:30:00.000Z");

function iso(hoursAgo: number) {
  return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();
}

export const demoDocuments: TicketDocument[] = [
  {
    id: "doc-invoice",
    ticketId: "tkt-invoice",
    fileName: "PO-4481_invoice_delivery-note.pdf",
    fileType: "application/pdf",
    uploadedAt: iso(6),
    extractedFields: {
      purchaseOrder: "PO-4481",
      invoiceNumber: "INV-9134",
      invoiceQuantity: 24,
      deliveredQuantity: 20,
      lineItem: "Smoke detector base",
    },
    mismatchFlags: ["Invoice quantity exceeds delivered quantity by 4 units"],
  },
  {
    id: "doc-insurance",
    ticketId: "tkt-insurance",
    fileName: "contractor-insurance-current.pdf",
    fileType: "application/pdf",
    uploadedAt: iso(9),
    extractedFields: {
      policyNumber: "DTF-INS-2025-11",
      expiryDate: "2026-05-29",
      holder: "DragonTech Facilities Ltd",
    },
    mismatchFlags: ["Certificate expires within 10 days"],
  },
];
