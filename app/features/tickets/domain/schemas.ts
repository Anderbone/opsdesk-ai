import { z } from "zod";

export const contactMethodSchema = z.enum(["email", "message", "phone"]);

export const enquiryFormSchema = z.object({
  name: z.string().trim().min(1, "All fields are required for the demo intake.").max(360),
  company: z.string().trim().min(1, "All fields are required for the demo intake.").max(360),
  email: z.string().trim().min(1, "All fields are required for the demo intake.").max(360),
  preferredContactMethod: contactMethodSchema.default("message"),
  title: z.string().trim().min(1, "All fields are required for the demo intake.").max(360),
  message: z.string().trim().min(1, "All fields are required for the demo intake.").max(360),
});

export const ticketActionIntentSchema = z.enum([
  "approve-draft",
  "regenerate-draft",
  "extract-document",
  "add-followup",
]);

export type EnquiryFormInput = z.infer<typeof enquiryFormSchema>;
export type TicketActionIntent = z.infer<typeof ticketActionIntentSchema>;
