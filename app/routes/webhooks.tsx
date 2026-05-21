import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, useActionData, useLoaderData } from "react-router";
import { KeyRound, RotateCcw, ShieldCheck, Webhook } from "lucide-react";
import {
  buildWebhookSignatureBase,
  getDeliveriesForEndpoint,
  getWebhookDeliveryStats,
  inboundWebhookExamples,
  webhookDeliveries,
  webhookEndpoints,
} from "~/lib/webhook-data";
import { Metric, PageHeader } from "~/shared/ui/ui";

export const meta: MetaFunction = () => [{ title: "OpsDesk AI | Webhooks" }];

export async function loader() {
  const firstDelivery = webhookDeliveries[0];
  return {
    endpoints: webhookEndpoints,
    deliveries: webhookDeliveries,
    inboundWebhookExamples,
    stats: getWebhookDeliveryStats(),
    signatureBase: buildWebhookSignatureBase(firstDelivery.timestamp, firstDelivery.payload),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const deliveryId = String(formData.get("deliveryId") ?? "");
  return { replayedDeliveryId: deliveryId, replayedAt: new Date("2026-05-20T10:30:00.000Z").toISOString() };
}

export default function WebhooksRoute() {
  const { endpoints, deliveries, inboundWebhookExamples, stats, signatureBase } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <PageHeader
        kicker="Integrations"
        title="Signed webhooks with replayable delivery"
        description="Endpoint registry, HMAC signature details, retry scheduling, inbound examples, and idempotency are visible without calling any third-party service."
        actions={
          <Link className="button button-primary" to="/events">
            Event source
          </Link>
        }
      />

      <section className="metric-strip" aria-label="Webhook delivery metrics">
        <Metric label="Endpoints" value={endpoints.length} detail="CRM, finance, and form handoffs" />
        <Metric label="Delivered" value={stats.delivered} detail="2xx accepted attempts" />
        <Metric label="Retrying" value={stats.retrying} detail="Backoff schedule visible" />
        <Metric label="Failed" value={stats.failed} detail="DLQ-backed operator review" />
      </section>

      <section className="ops-layout">
        <div className="surface">
          <div className="surface-header">
            <div>
              <h2>Endpoint registry</h2>
              <p>Each endpoint lists owned event types, secret version, and linked ticket context.</p>
            </div>
            <Webhook size={18} color="var(--accent)" />
          </div>
          <div className="endpoint-list">
            {endpoints.map((endpoint) => (
              <article className="endpoint-row" key={endpoint.id}>
                <div>
                  <strong>{endpoint.name}</strong>
                  <span>{endpoint.url}</span>
                </div>
                <div className="pill-list">
                  {endpoint.eventTypes.map((eventType) => <span className="badge" key={eventType}>{eventType}</span>)}
                </div>
                <small>{endpoint.status.replace("_", " ")} · {endpoint.signingSecretVersion} · {endpoint.owner}</small>
              </article>
            ))}
          </div>
        </div>

        <aside className="surface">
          <div className="surface-header">
            <div>
              <h2>Signed payload preview</h2>
              <p>HMAC base string uses timestamp plus JSON payload.</p>
            </div>
            <KeyRound size={18} color="var(--accent)" />
          </div>
          <div className="content-block">
            <div className="source-text">{signatureBase}</div>
            <ul className="split-list" style={{ marginTop: 14 }}>
              <li><span>Timestamp tolerance</span><strong>Five minutes</strong></li>
              <li><span>Idempotency</span><strong>eventId + endpointId + attemptNumber</strong></li>
              <li><span>Secret rotation</span><strong>Accept current and previous version during cutover</strong></li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="surface" style={{ marginTop: 22, overflow: "auto" }}>
        <div className="surface-header">
          <div>
            <h2>Delivery attempts</h2>
            <p>Retry state is deterministic in the hosted demo; production workers would schedule the next job.</p>
          </div>
          {actionData ? <span className="live-chip">Replayed {actionData.replayedDeliveryId}</span> : null}
        </div>
        <table className="compact-table">
          <thead>
            <tr>
              <th>Delivery</th>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Signature</th>
              <th>Retry</th>
              <th>Replay</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => {
              const endpoint = endpoints.find((item) => item.id === delivery.endpointId);
              return (
                <tr key={delivery.id}>
                  <td><strong>{delivery.id}</strong><br /><span className="muted">{delivery.eventId}</span></td>
                  <td>{endpoint?.name}<br /><span className="muted">{delivery.ticketId}</span></td>
                  <td>{delivery.status.replace("_", " ")}<br /><span className="muted">HTTP {delivery.responseCode}</span></td>
                  <td><code>{delivery.signature}</code></td>
                  <td>{delivery.nextRetryAt ? new Date(delivery.nextRetryAt).toLocaleTimeString("en-GB") : "none"}</td>
                  <td>
                    <Form method="post">
                      <input type="hidden" name="deliveryId" value={delivery.id} />
                      <button className="button button-secondary" type="submit">
                        <RotateCcw size={14} />
                        Replay
                      </button>
                    </Form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="ops-grid">
        <div className="ops-panel">
          <ShieldCheck size={18} />
          <h2>Inbound event examples</h2>
          <ol>
            {inboundWebhookExamples.map((example) => (
              <li key={example.id}><strong>{example.source}</strong><span>{example.eventType} · {example.ticketId}<br />{example.body}</span></li>
            ))}
          </ol>
        </div>
        {endpoints.map((endpoint) => (
          <div className="ops-panel" key={endpoint.id}>
            <Webhook size={18} />
            <h2>{endpoint.name}</h2>
            <ol>
              {getDeliveriesForEndpoint(endpoint.id).map((delivery) => (
                <li key={delivery.id}><strong>Attempt {delivery.attemptNumber}</strong><span>{delivery.status.replace("_", " ")} · HTTP {delivery.responseCode}</span></li>
              ))}
            </ol>
          </div>
        ))}
      </section>
    </>
  );
}
