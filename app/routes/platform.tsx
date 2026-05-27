import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Boxes, Cloud, Container, FileJson, GitPullRequestArrow, Network, RadioTower } from "lucide-react";
import {
  awsServerlessPath,
  dataContracts,
  deliveryPipeline,
  infrastructureBoundaries,
  modeComparisons,
  productionNextItems,
} from "~/lib/platform-data";
import { Metric, PageHeader } from "~/shared/ui/ui";

export const meta: MetaFunction = () => [{ title: "OpsDesk AI | Platform" }];

export default function PlatformRoute() {
  return (
    <>
      <PageHeader
        kicker="Production map"
        title="Hosted demo today, production path tomorrow"
        description="The Netlify demo stays deterministic and free, while each panel shows the concrete boundary that would move into cloud infrastructure, queues, observability, and data contracts."
        actions={
          <>
            <Link className="button button-primary" to="/events">
              Event contracts
            </Link>
            <Link className="button button-secondary" to="/knowledge">
              Search and graph
            </Link>
          </>
        }
      />

      <section className="metric-strip" aria-label="Platform readiness metrics">
        <Metric label="Demo mode" value="0 creds" detail="Seeded state, no paid cloud services" />
        <Metric label="Async jobs" value="7" detail="pg-boss job contracts mapped" />
        <Metric label="Contract surfaces" value={dataContracts.length} detail="Events, webhooks, and AI runs" />
        <Metric label="Deploy checks" value="4" detail="Unit, typecheck, build, e2e" />
      </section>

      <section className="ops-layout">
        <div className="surface">
          <div className="surface-header">
            <div>
              <h2>Demo mode vs local/prod mode</h2>
              <p>What is simulated on Netlify and what changes when infrastructure is enabled.</p>
            </div>
            <RadioTower size={18} color="var(--accent)" />
          </div>
          <table className="compact-table">
            <thead>
              <tr>
                <th>Boundary</th>
                <th>Hosted demo</th>
                <th>Local/prod path</th>
              </tr>
            </thead>
            <tbody>
              {modeComparisons.map(([boundary, demo, production]) => (
                <tr key={boundary}>
                  <td><strong>{boundary}</strong></td>
                  <td>{demo}</td>
                  <td>{production}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="surface">
          <div className="surface-header">
            <div>
              <h2>Observability summary</h2>
              <p>Watchtower shows trace-shaped data without requiring a collector.</p>
            </div>
            <Network size={18} color="var(--accent)" />
          </div>
          <div className="content-block">
            <ul className="split-list">
              <li><span>Hosted</span><strong>Demo trace view linked to AI runs, events, and webhook attempts</strong></li>
              <li><span>Production</span><strong>OTLP/JSON trace payloads from Watchtower spans</strong></li>
              <li><span>Config</span><strong>OTEL_SERVICE_NAME and OTEL_EXPORTER_OTLP_* drive the export target</strong></li>
              <li><span>Review</span><strong>Approval status and policy gates stay visible beside cost and latency</strong></li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="ops-grid">
        <div className="ops-panel">
          <Cloud size={18} />
          <h2>Serverless AWS path</h2>
          <ol>
            {awsServerlessPath.map(([title, body]) => (
              <li key={title}><strong>{title}</strong><span>{body}</span></li>
            ))}
          </ol>
        </div>
        <div className="ops-panel">
          <GitPullRequestArrow size={18} />
          <h2>CI/CD and test gates</h2>
          <ol>
            {deliveryPipeline.map(([title, body]) => (
              <li key={title}><strong>{title}</strong><span>{body}</span></li>
            ))}
          </ol>
        </div>
        <div className="ops-panel">
          <Container size={18} />
          <h2>IaC and container boundary</h2>
          <ol>
            {infrastructureBoundaries.map(([title, body]) => (
              <li key={title}><strong>{title}</strong><span>{body}</span></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="story-band">
        <h2>Data contracts make the demo reviewable.</h2>
        <div className="contract-list">
          {dataContracts.map((contract) => (
            <article className="contract-preview" key={contract.id}>
              <div>
                <span className="eyebrow">{contract.transport}</span>
                <h3>{contract.name}</h3>
                <p>{contract.owner} · version {contract.version} · linked ticket {contract.linkedTicketId}</p>
              </div>
              <div className="field-list">
                {contract.fields.map((field) => (
                  <span key={field.name}>
                    <FileJson size={14} />
                    {field.name}: {field.type}{field.required ? " required" : " optional"}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="architecture-flow" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {["React Router app", "Postgres + pgvector", "Queue workers", "Events/webhooks"].map((label) => (
          <div className="flow-node" key={label}>
            <Boxes size={18} color="var(--accent)" />
            <strong>{label}</strong>
            <span>Kept as an explicit boundary so a reviewer can map demo behavior to production infrastructure.</span>
          </div>
        ))}
      </section>

      <section className="story-band">
        <h2>Production next is tracked as implementation work.</h2>
        <div className="case-proof-list">
          {productionNextItems.map(([title, body]) => (
            <article key={title}>
              <RadioTower size={18} />
              <strong>{title}</strong>
              <span>{body}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
