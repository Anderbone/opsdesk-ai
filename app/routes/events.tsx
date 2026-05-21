import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, useLoaderData } from "react-router";
import { AlertTriangle, FileJson, RadioTower, RotateCcw } from "lucide-react";
import {
  consumerStates,
  dataContracts,
  deadLetterEvents,
  filterEventsByTopic,
  getEventTopics,
  groupEventsByTicket,
  summarizeConsumerLag,
} from "~/lib/event-data";
import { Metric, PageHeader } from "~/shared/ui/ui";

export const meta: MetaFunction = () => [{ title: "OpsDesk AI | Events" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic") ?? "all";
  const events = filterEventsByTopic(topic);
  return {
    selectedTopic: topic,
    topics: getEventTopics(),
    events,
    groupedEvents: groupEventsByTicket(events),
    consumerStates,
    deadLetterEvents,
    lagSummary: summarizeConsumerLag(),
    schema: dataContracts.find((contract) => contract.id === "contract-ticket-v2"),
  };
}

export default function EventsRoute() {
  const { selectedTopic, topics, events, groupedEvents, consumerStates, deadLetterEvents, lagSummary, schema } =
    useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader
        kicker="Event simulator"
        title="Kafka-shaped contracts without Kafka"
        description="The hosted page uses deterministic envelopes to show the event-driven contract. Local and production mode can back the same shapes with Redpanda, Kafka, or EventBridge."
        actions={
          <Link className="button button-primary" to="/webhooks">
            Delivery attempts
          </Link>
        }
      />

      <section className="metric-strip" aria-label="Event metrics">
        <Metric label="Events shown" value={events.length} detail="Filtered deterministic envelopes" />
        <Metric label="Total lag" value={lagSummary.totalLag} detail="Across simulated consumers" />
        <Metric label="Max lag" value={lagSummary.maxLag} detail="webhook-delivery is catching up" />
        <Metric label="DLQ items" value={deadLetterEvents.length} detail="Retry or operator action required" />
      </section>

      <section className="ops-layout">
        <div className="surface">
          <div className="surface-header">
            <div>
              <h2>Topic timeline grouped by ticket</h2>
              <p>Correlation IDs, idempotency keys, and schema versions stay visible.</p>
            </div>
            <Form method="get" className="inline-filter">
              <label htmlFor="topic">Topic</label>
              <select id="topic" name="topic" defaultValue={selectedTopic}>
                <option value="all">All topics</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <button className="button button-secondary" type="submit">Apply</button>
            </Form>
          </div>
          <div className="event-timeline">
            {Object.entries(groupedEvents).map(([ticketId, ticketEvents]) => (
              <article className="event-group" key={ticketId}>
                <h3>{ticketId}</h3>
                {ticketEvents.map((event) => (
                  <div className="event-row" key={event.id}>
                    <RadioTower size={16} />
                    <div>
                      <strong>{event.eventType}</strong>
                      <span>{event.topic} · {event.schemaVersion} · {new Date(event.occurredAt).toLocaleTimeString("en-GB")}</span>
                      <code>{event.idempotencyKey}</code>
                    </div>
                    <small>{event.correlationId}</small>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </div>

        <aside className="surface">
          <div className="surface-header">
            <div>
              <h2>Consumer lag</h2>
              <p>Projected consumer health for reviewer inspection.</p>
            </div>
            <RotateCcw size={18} color="var(--accent)" />
          </div>
          <div className="content-block">
            <ul className="split-list">
              {consumerStates.map((state) => (
                <li key={state.id}>
                  <span>{state.consumerGroup}<br /><small className="muted">{state.topic}</small></span>
                  <strong>{state.lag} lag · {state.status.replace("_", " ")}</strong>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="ops-layout">
        <div className="surface">
          <div className="surface-header">
            <div>
              <h2>Schema version preview</h2>
              <p>{schema?.name} is the ticket lifecycle contract currently shown by the simulator.</p>
            </div>
            <FileJson size={18} color="var(--accent)" />
          </div>
          <div className="schema-grid">
            {schema?.fields.map((field) => (
              <div className="schema-field" key={field.name}>
                <strong>{field.name}</strong>
                <span>{field.type} · {field.required ? "required" : "optional"}</span>
                <p>{field.note}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="surface">
          <div className="surface-header">
            <div>
              <h2>Retry and DLQ</h2>
              <p>Dead-letter records show operator context, not just a failed offset.</p>
            </div>
            <AlertTriangle size={18} color="var(--accent-2)" />
          </div>
          <div className="content-block">
            {deadLetterEvents.map((event) => (
              <div className="source-text" key={event.id}>
                {event.eventId}
                {"\n"}{event.reason}
                {"\n"}retry_count={event.retryCount}
                {"\n"}next_action={event.nextAction}
              </div>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}
