import { z } from "zod";

export const documentExtractionInputSchema = z.object({
  ticketId: z.string().min(1),
  text: z.string().min(1).max(360),
});

export const extractedDocumentFieldsSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));

export type DocumentExtractionInput = z.infer<typeof documentExtractionInputSchema>;
export type ExtractedDocumentFields = z.infer<typeof extractedDocumentFieldsSchema>;
