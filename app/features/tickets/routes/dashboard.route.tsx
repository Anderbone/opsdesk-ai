import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, redirect, useLoaderData } from "react-router";
import { ArrowUpRight, BrainCircuit, Clock3, RotateCcw, ShieldCheck } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { LinkButton, Metric, PageHeader, PriorityBadge, RelativeTime, StatusBadge } from "~/shared/ui/ui";

export const meta: MetaFunction = () => [{ title: "OpsDesk AI | Dashboard" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const { getState } = await import("~/features/tickets/data/repository.server");
  const state = await getState(request);
  const openTickets = state.tickets.filter((ticket) => ticket.status !== "closed");
  const pendingDrafts = state.tickets.filter((ticket) => ticket.draft?.status === "draft").length;
  const autoResponses = state.tickets.filter((ticket) => ticket.draft?.deliveryMode === "auto_sent").length;
  const urgentTickets = state.tickets.filter((ticket) => ticket.priority === "urgent" || ticket.priority === "high").length;
  const aiPending = state.aiRuns.filter((run) => run.approvalStatus === "pending").length;
  return {
    tickets: state.tickets,
    followUps: state.followUps.slice(0, 6),
    aiRuns: state.aiRuns.slice(0, 5),
    metrics: {
      openTickets,
      pendingDrafts,
      autoResponses,
      urgentTickets,
      aiPending,
    },
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const { resetDemoState } = await import("~/features/tickets/data/repository.server");
  const headers = await resetDemoState(request);
  return redirect("/dashboard", { headers });
}

export default function Dashboard() {
  const { tickets, followUps, aiRuns, metrics } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader
        kicker="DragonTech Facilities"
        title="AI-assisted service desk"
        description="Inbound requests become tickets, AI runs become visible evidence, and simple missing-info requests can use approved auto-response templates while risky work waits for a person."
        actions={
          <>
            <LinkButton href="/enquiry" tone="primary">
              New enquiry
              <ArrowUpRight size={16} />
            </LinkButton>
            <Form method="post">
              <button className="button button-secondary" type="submit">
                <RotateCcw size={15} />
                Reset demo
              </button>
            </Form>
          </>
        }
      />

      <section className="metric-strip" aria-label="Desk metrics">
        <Metric label="Open tickets" value={metrics.openTickets.length} detail="Across email, widget, and upload channels" />
        <Metric label="Auto responses" value={metrics.autoResponses} detail="Approved templates sent after policy checks" />
        <Metric label="Drafts awaiting approval" value={metrics.pendingDrafts} detail="Complex or low-confidence cases" />
        <Metric label="High priority" value={metrics.urgentTickets} detail="Urgent and high priority queue" />
      </section>

      <section className="dashboard-grid">
        <div className="surface">
          <div className="surface-header">
            <div>
              <h2>Ticket queue</h2>
              <p>Five seeded local-business cases plus enquiries created through the widget.</p>
            </div>
            <Link className="button button-ghost" to="/watchtower">
              <BrainCircuit size={15} />
              Watch AI
            </Link>
          </div>

          <div className="ticket-list">
            {tickets.map((ticket) => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="ticket-row">
                <div className="ticket-title">
                  <strong>{ticket.title}</strong>
                  <span>
                    {ticket.number} · {ticket.customerCompany}
                  </span>
                </div>
                <div className="ticket-summary">{ticket.aiSummary}</div>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
                <span className="muted">
                  <RelativeTime value={ticket.updatedAt} />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="detail-stack">
          <div className="surface">
            <div className="surface-header">
              <div>
                <h2>Next follow-ups</h2>
                <p>AI can ask for missing facts; humans own escalations.</p>
              </div>
              <Clock3 size={18} color="var(--accent)" />
            </div>
            <div className="timeline">
              {followUps.map((task) => (
                <Link to={`/tickets/${task.ticketId}`} key={task.id} className="timeline-item">
                  <div>
                    <strong>{task.title}</strong>
                    <span>
                      {task.owner} · due {formatDistanceToNowStrict(new Date(task.dueAt), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="surface">
            <div className="surface-header">
              <div>
                <h2>Recent AI actions</h2>
                <p>Every model output is auditable.</p>
              </div>
              <ShieldCheck size={18} color="var(--accent)" />
            </div>
            <div className="timeline">
              {aiRuns.map((run) => (
                <Link to="/watchtower" key={run.id} className="timeline-item">
                  <div>
                    <strong>{run.action.replace(".", " · ")}</strong>
                    <span>
                      {Math.round(run.confidence * 100)}% confidence · {run.approvalStatus.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
