export type TicketDocument = {
  id: string;
  ticketId: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  extractedFields: Record<string, string | number | boolean>;
  mismatchFlags: string[];
};
