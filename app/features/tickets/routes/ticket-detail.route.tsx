import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, redirect, useLoaderData } from "react-router";
import { Check, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import { DocumentExtractionPanel, DocumentsPanel } from "~/features/documents/ui/document-components";
import { ticketActionIntentSchema } from "~/features/tickets/domain/schemas";
import { EmptyState, PageHeader, PriorityBadge, RelativeTime, StatusBadge } from "~/shared/ui/ui";

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.ticket ? `OpsDesk AI | ${data.ticket.number}` : "OpsDesk AI | Ticket" },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { getTicketBundle } = await import("~/features/tickets/data/repository.server");
  const bundle = await getTicketBundle(request, params.ticketId ?? "");
  if (!bundle) throw new Response("Ticket not found", { status: 404 });
  return bundle;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const ticketId = params.ticketId ?? "";
  const formData = await request.formData();
  const intent = ticketActionIntentSchema.safeParse(String(formData.get("intent") ?? ""));
  const store = await import("~/features/tickets/data/repository.server");
  let headers: HeadersInit | undefined;

  if (!intent.success) {
    return redirect(`/tickets/${ticketId}`);
  }

  switch (intent.data) {
    case "approve-draft":
      headers = await store.approveDraft(request, ticketId);
      break;
    case "regenerate-draft":
      headers = await store.regenerateDraft(request, ticketId);
      break;
    case "extract-document":
      headers = await store.addDocumentExtraction(request, ticketId, String(formData.get("documentText") ?? ""));
      break;
    case "add-followup":
      headers = await store.addFollowUp(
        request,
        ticketId,
        String(formData.get("followupTitle") ?? "Review ticket"),
        String(formData.get("owner") ?? "Morgan"),
      );
      break;
  }

  return redirect(`/tickets/${ticketId}`, { headers });
}

export default function TicketDetail() {
  const { ticket, aiRuns, documents, followUps } = useLoaderData<typeof loader>();
  const latestRun = aiRuns[0];
  const responseWasAutoSent = ticket.draft?.deliveryMode === "auto_sent";
  const decision = ticket.automationDecision;

  return (
    <>
      <PageHeader
        kicker={`${ticket.number} · ${ticket.customerCompany}`}
        title={ticket.title}
        description={ticket.aiSummary}
        actions={
          <>
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            <Link className="button button-secondary" to="/dashboard">
              Back to desk
            </Link>
          </>
        }
      />

      <section className="detail-grid">
        <div className="detail-stack">
          <div className="surface content-block">
            <h2>Inbound message</h2>
            <div className="source-text">{ticket.sourceText}</div>
          </div>

          <div className="surface content-block">
            <div className="surface-header" style={{ padding: 0, borderBottom: 0, minHeight: 0, marginBottom: 14 }}>
              <div>
                <h2>Customer response</h2>
                <p>
                  {responseWasAutoSent
                    ? "Approved template was sent automatically because the policy gate passed."
                    : "Human review is required before this response goes to the customer."}
                </p>
              </div>
              {!responseWasAutoSent ? (
                <Form method="post">
                  <input type="hidden" name="intent" value="regenerate-draft" />
                  <button className="button button-secondary" type="submit">
                    <RefreshCw size={15} />
                    Regenerate
                  </button>
                </Form>
              ) : null}
            </div>
            {decision ? (
              <div className="decision-card">
                <ShieldCheck size={17} />
                <div>
                  <strong>{decision.mode === "auto_response" ? "Auto response allowed" : "Human review required"}</strong>
                  <span>
                    {Math.round(decision.confidence * 100)}% confidence · {decision.channel} ·{" "}
                    {decision.templateName ?? "no template"}
                  </span>
                  <p>{decision.reason}</p>
                </div>
              </div>
            ) : null}
            {ticket.draft ? (
              <>
                <div className="draft-box">{ticket.draft.body}</div>
                {!responseWasAutoSent ? (
                  <Form method="post" style={{ marginTop: 14 }}>
                    <input type="hidden" name="intent" value="approve-draft" />
                    <button className="button button-primary" type="submit">
                      <Check size={15} />
                      Approve draft
                    </button>
                  </Form>
                ) : null}
              </>
            ) : (
              <EmptyState title="No draft yet" body="Run draft generation to create a reply." />
            )}
          </div>

          <DocumentExtractionPanel />
        </div>

        <aside className="detail-stack">
          <div className="surface content-block">
            <h2>AI triage</h2>
            <ul className="split-list">
              <li>
                <span>Customer</span>
                <strong>{ticket.customerName}</strong>
              </li>
              <li>
                <span>Channel</span>
                <strong>{ticket.channel}</strong>
              </li>
              <li>
                <span>Preferred contact</span>
                <strong>{ticket.preferredContactMethod}</strong>
              </li>
              <li>
                <span>Assigned</span>
                <strong>{ticket.assignedTo}</strong>
              </li>
              <li>
                <span>Updated</span>
                <strong>
                  <RelativeTime value={ticket.updatedAt} />
                </strong>
              </li>
            </ul>
            <h3 style={{ marginTop: 20 }}>Missing information</h3>
            <div className="pill-list">
              {ticket.missingInfo.map((item) => (
                <span key={item} className="badge">
                  {item}
                </span>
              ))}
            </div>
            <h3 style={{ marginTop: 20 }}>Risks</h3>
            <ul className="split-list">
              {ticket.risks.map((risk) => (
                <li key={risk}>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface content-block">
            <h2>Follow-up tasks</h2>
            <ul className="split-list">
              {followUps.map((task) => (
                <li key={task.id}>
                  <span>
                    {task.title}
                    <br />
                    <span className="muted">{task.owner}</span>
                  </span>
                  <strong>{task.status}</strong>
                </li>
              ))}
            </ul>
            <Form method="post" className="form-grid" style={{ marginTop: 16 }}>
              <input type="hidden" name="intent" value="add-followup" />
              <div className="field full">
                <label htmlFor="followupTitle">New task</label>
                <input id="followupTitle" name="followupTitle" defaultValue="Call customer with update" />
              </div>
              <div className="field">
                <label htmlFor="owner">Owner</label>
                <input id="owner" name="owner" defaultValue={ticket.assignedTo} />
              </div>
              <div className="field">
                <label>&nbsp;</label>
                <button className="button button-secondary" type="submit">
                  <Plus size={15} />
                  Add task
                </button>
              </div>
            </Form>
          </div>

          <DocumentsPanel documents={documents} />

          <div className="surface content-block">
            <h2>Latest AI run</h2>
            {latestRun ? (
              <div className="code-box">
                {JSON.stringify(
                  {
                    action: latestRun.action,
                    model: latestRun.model,
                    confidence: latestRun.confidence,
                    approval: latestRun.approvalStatus,
                    output: latestRun.output,
                  },
                  null,
                  2,
                )}
              </div>
            ) : (
              <EmptyState title="No AI runs" body="This ticket has no AI output yet." />
            )}
          </div>
        </aside>
      </section>
    </>
  );
}
