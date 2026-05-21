import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect, useNavigation } from "react-router";
import { Send, Sparkles } from "lucide-react";
import { enquiryFormSchema } from "~/features/tickets/domain/schemas";
import { Button, PageHeader } from "~/shared/ui/ui";

export const meta: MetaFunction = () => [{ title: "OpsDesk AI | Public Enquiry" }];

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const payload = enquiryFormSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    email: String(formData.get("email") ?? ""),
    preferredContactMethod: String(formData.get("preferredContactMethod") ?? "message"),
    title: String(formData.get("title") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!payload.success) {
    return { error: "All fields are required for the demo intake." };
  }

  const { createTicketFromEnquiry } = await import("~/features/tickets/data/repository.server");
  const { ticket, headers } = await createTicketFromEnquiry(request, payload.data);
  return redirect(`/tickets/${ticket?.id ?? "tkt-cctv"}`, { headers });
}

export default function Enquiry() {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <>
      <PageHeader
        kicker="Public widget"
        title="Create a customer enquiry"
        description="Submit a message as if it came from a website widget. OpsDesk saves the ticket, runs AI triage, then either sends an approved information-gathering template or routes the case for human review."
      />

      <div className="detail-grid">
        <section className="surface content-block">
          <Form method="post" className="form-grid">
            <div className="field">
              <label htmlFor="name">Customer name</label>
              <input id="name" name="name" defaultValue="Elliot Hughes" />
            </div>
            <div className="field">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" defaultValue="Oakline Fitness" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" defaultValue="elliot@oakline.example" />
            </div>
            <div className="field">
              <label htmlFor="preferredContactMethod">Preferred follow-up</label>
              <select id="preferredContactMethod" name="preferredContactMethod" defaultValue="message">
                <option value="message">Message</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="title">Subject</label>
              <input id="title" name="title" defaultValue="Need quote for CCTV and access control" />
            </div>
            <div className="field full">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                defaultValue="We are opening a second gym unit and need a quote for CCTV plus door access control. We need something reliable before opening weekend, but I am not sure how many cameras are required."
              />
            </div>
            <div className="field full">
              <Button type="submit" tone="primary" disabled={busy}>
                <Send size={16} />
                {busy ? "Creating ticket..." : "Submit and run AI triage"}
              </Button>
            </div>
          </Form>
        </section>

        <aside className="surface content-block">
          <h2>What happens after submit</h2>
          <ul className="split-list">
            <li>
              <span>Ticket saved</span>
              <strong>source first</strong>
            </li>
            <li>
              <span>AI classifies intent, urgency, missing info, and risks</span>
              <strong>triage run</strong>
            </li>
            <li>
              <span>AI selects an approved template and checks the confidence threshold</span>
              <strong>policy gate</strong>
            </li>
            <li>
              <span>Simple missing-info cases can be contacted automatically; risky cases stay queued</span>
              <strong>template only</strong>
            </li>
            <li>
              <span>Watchtower receives model, prompt, hash, confidence, tokens, and cost</span>
              <strong>auditable</strong>
            </li>
          </ul>
          <div className="source-text" style={{ marginTop: 18 }}>
            <Sparkles size={16} /> AI can ask for missing facts from approved templates. Complaints, document issues, urgent incidents, and low-confidence cases go to a person.
          </div>
        </aside>
      </div>
    </>
  );
}
