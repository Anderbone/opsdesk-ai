import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { Activity, BrainCircuit, ShieldAlert } from "lucide-react";
import { getTraceStatusCounts, traceRuns } from "~/lib/trace-data";
import { Metric, PageHeader } from "~/shared/ui/ui";

export const meta: MetaFunction = () => [{ title: "OpsDesk AI | Watchtower" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const { getState } = await import("~/features/tickets/data/repository.server");
  const state = await getState(request);
  const totalCost = state.aiRuns.reduce((sum, run) => sum + run.estimatedCostUsd, 0);
  const avgLatency = Math.round(state.aiRuns.reduce((sum, run) => sum + run.latencyMs, 0) / state.aiRuns.length);
  const reviewCount = state.aiRuns.filter((run) => run.validationStatus === "needs_review").length;
  return {
    aiRuns: state.aiRuns,
    tickets: state.tickets,
    traceRuns,
    traceCounts: getTraceStatusCounts(),
    metrics: {
      totalRuns: state.aiRuns.length,
      totalCost: `$${totalCost.toFixed(4)}`,
      avgLatency: `${avgLatency}ms`,
      reviewCount,
    },
  };
}

export default function Watchtower() {
  const { aiRuns, tickets, traceRuns, traceCounts, metrics } = useLoaderData<typeof loader>();
  const ticketById = new Map(tickets.map((ticket) => [ticket.id, ticket]));

  return (
    <>
      <PageHeader
        kicker="AI Watchtower"
        title="Every AI action is visible"
        description="Prompt version, model, input hash, selected template, confidence, latency, tokens, cost, validation status, and approval state stay attached to the ticket."
      />

      <section className="metric-strip" aria-label="AI run metrics">
        <Metric label="AI runs" value={metrics.totalRuns} detail="Triage, extraction, drafts, and follow-ups" />
        <Metric label="Estimated cost" value={metrics.totalCost} detail="Demo calculation from token usage" />
        <Metric label="Average latency" value={metrics.avgLatency} detail="Recorded per AI run" />
        <Metric label="Needs review" value={metrics.reviewCount} detail="Validation or policy requires human attention" />
      </section>

      <section className="trace-grid" aria-label="Demo trace view">
        {traceRuns.map((trace) => {
          const ticket = ticketById.get(trace.ticketId);
          return (
            <article className="trace-card" key={trace.id}>
              <div className="trace-card-header">
                <div>
                  <strong>{trace.title}</strong>
                  <span>
                    {ticket?.number ?? trace.ticketId} · {trace.durationMs}ms · demo trace view
                  </span>
                </div>
                <span className="trace-status">{trace.status.replace("_", " ")}</span>
              </div>
              <div className="span-list">
                {trace.spans.map((span) => (
                  <div className="span-row" key={span.id}>
                    <span className="span-offset">+{span.startMs}ms</span>
                    <div>
                      <strong>{span.name}</strong>
                      <span>
                        {span.serviceName} · {span.kind} · {span.durationMs}ms · {span.status.replace("_", " ")}
                      </span>
                      <span>
                        {span.linkedEventId ? `event ${span.linkedEventId}` : "no linked event"}
                        {span.linkedWebhookAttemptId ? ` · webhook ${span.linkedWebhookAttemptId}` : ""}
                      </span>
                      <span>
                        {Object.entries(span.attributes)
                          .map(([key, value]) => `${key}=${value}`)
                          .join(" · ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section className="surface" style={{ marginTop: 22, overflow: "auto" }}>
        <div className="surface-header">
          <div>
            <h2>Run log</h2>
            <p>Watchtower is the product feature that makes the AI boundary concrete.</p>
          </div>
          <ShieldAlert size={18} color="var(--accent)" />
        </div>
        <table className="watchtower-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Ticket</th>
              <th>Model / prompt</th>
              <th>Confidence</th>
              <th>Validation</th>
              <th>Approval</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {aiRuns.map((run) => {
              const ticket = ticketById.get(run.ticketId);
              return (
                <tr key={run.id}>
                  <td>
                    <strong>{run.action}</strong>
                    <br />
                    <span className="muted">{run.inputHash}</span>
                  </td>
                  <td>
                    {ticket ? (
                      <Link to={`/tickets/${ticket.id}`}>
                        {ticket.number}
                        <br />
                        <span className="muted">{ticket.title}</span>
                      </Link>
                    ) : (
                      <span className="muted">Unknown ticket</span>
                    )}
                  </td>
                  <td>
                    {run.model}
                    <br />
                    <span className="muted">{run.promptVersion}</span>
                  </td>
                  <td>
                    <div className="confidence-bar" aria-label={`${Math.round(run.confidence * 100)} percent confidence`}>
                      <span style={{ width: `${Math.round(run.confidence * 100)}%` }} />
                    </div>
                    <span className="muted">{Math.round(run.confidence * 100)}%</span>
                  </td>
                  <td>{run.validationStatus.replace("_", " ")}</td>
                  <td>{run.approvalStatus.replace("_", " ")}</td>
                  <td>
                    ${run.estimatedCostUsd.toFixed(4)}
                    <br />
                    <span className="muted">
                      {run.promptTokens + run.completionTokens} tokens · {run.latencyMs}ms
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="story-band">
        <h2>AI can move simple cases, not risky ones.</h2>
        <p>
          The demo records each AI output as a reviewable artifact. Approved templates can be sent automatically when
          confidence is high and the request is only collecting missing facts. Complaints, urgent incidents, document
          mismatches, and low-confidence outputs remain human-owned. Hosted mode shows a demo trace view; production
          mode can convert the same span boundaries into OTLP/JSON payloads for an OpenTelemetry collector.
        </p>
      </section>

      <section className="architecture-flow">
        {[
          ["Input saved", `${traceCounts.ok} ok traces`],
          ["pg-boss job", "retryable worker span"],
          ["AI run", "prompt and token attributes"],
          ["Policy gate", `${traceCounts.needs_review} review trace`],
          ["Human fallback", `${traceCounts.error} integration error`],
        ].map(([label, detail], index) => (
          <div className="flow-node" key={label}>
            {index === 2 ? (
              <BrainCircuit size={18} color="var(--accent)" />
            ) : (
              <Activity size={18} color={index === 3 ? "var(--accent-2)" : "var(--muted)"} />
            )}
            <strong>{label}</strong>
            <span>
              {[
                "Raw customer message is persisted before AI touches it.",
                "Background jobs isolate slow AI work from request handling.",
                "Model, prompt, hash, selected template, tokens, and latency are logged.",
                "Confidence, category, sentiment, and template policy decide the route.",
                "Risky or complex actions wait for a person.",
              ][index]}
              {" "}
              {detail}.
            </span>
          </div>
        ))}
      </section>
    </>
  );
}
