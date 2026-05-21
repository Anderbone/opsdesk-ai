import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Cloud,
  Container,
  Database,
  FileJson,
  GitBranch,
  KeyRound,
  LineChart,
  MailCheck,
  Network,
  RadioTower,
  RotateCcw,
  Search,
  ServerCog,
  ShieldCheck,
  Webhook,
  Workflow,
} from "lucide-react";
import { PageHeader } from "~/shared/ui/ui";

export const meta: MetaFunction = () => [{ title: "OpsDesk AI | Architecture" }];

const exampleFlow = [
  {
    icon: MailCheck,
    area: "intake",
    step: "1",
    label: "Customer input",
    title: "Email says Wi-Fi drops at 2pm",
    body: "The raw message is captured first, before any model call can summarise or change it.",
    artifact: "sourceText on OD-1025",
    to: "/tickets/tkt-wifi",
  },
  {
    icon: ServerCog,
    area: "app",
    step: "2",
    label: "Web action",
    title: "React Router app",
    body: "The route validates the enquiry, creates the ticket, and hands slow work to the background lane.",
    artifact: "ticket tkt-wifi",
    to: "/tickets/tkt-wifi",
  },
  {
    icon: Database,
    area: "store",
    step: "3",
    label: "Durable state",
    title: "PostgreSQL + Drizzle",
    body: "Ticket, draft, follow-up, AI run, and audit rows share one stable ticket ID.",
    artifact: "tickets, ai_runs, audit_events",
    to: "/tickets/tkt-wifi",
  },
  {
    icon: Workflow,
    area: "worker",
    step: "4",
    label: "Worker lane",
    title: "pg-boss jobs",
    body: "triage.ticket and response.template_select run with retryable job boundaries.",
    artifact: "airun-003 + airun-004",
    to: "/watchtower",
  },
  {
    icon: Search,
    area: "knowledge",
    step: "5",
    label: "Evidence lookup",
    title: "RAG knowledge",
    body: "Policies, playbooks, similar tickets, and document extracts can be retrieved with metadata filters.",
    artifact: "Wi-Fi playbook citations",
    to: "/knowledge?q=wifi",
  },
  {
    icon: BrainCircuit,
    area: "ai",
    step: "6",
    label: "Model boundary",
    title: "Structured AI output",
    body: "The model produces category, priority, missing info, template choice, confidence, and cost.",
    artifact: "demo-template-router-v1",
    to: "/watchtower",
  },
  {
    icon: ShieldCheck,
    area: "gate",
    step: "7",
    label: "Safety gate",
    title: "Watchtower says review",
    body: "Urgent phone contact is useful, but it cannot auto-send; Priya owns the outbound action.",
    artifact: "approvalStatus=pending",
    to: "/watchtower",
  },
  {
    icon: RadioTower,
    area: "event",
    step: "8",
    label: "Contract event",
    title: "ai.draft.review_required",
    body: "The decision is published with correlation ID, schema version, producer, and idempotency key.",
    artifact: "evt-1025-human-review",
    to: "/events?topic=opsdesk.ai.actions",
  },
  {
    icon: Webhook,
    area: "webhook",
    step: "9",
    label: "Integration",
    title: "CRM webhook delivered",
    body: "Signed payload tells the CRM that Priya must review the urgent Wi-Fi draft.",
    artifact: "whd-wifi-001 HTTP 200",
    to: "/webhooks",
  },
];

const platformLanes = [
  {
    icon: Cloud,
    title: "Hosted demo lane",
    body: "Seeded state, fake session storage, deterministic AI, and in-memory adapters keep the public demo credential-free.",
    tools: ["React Router", "Cookie session store", "Demo repository", "Static Netlify deploy"],
  },
  {
    icon: Container,
    title: "Local production lane",
    body: "Docker profiles turn on Postgres/pgvector first, then optional events, search, graph, and workers.",
    tools: ["Postgres", "pgvector", "pg-boss", "Redpanda/OpenSearch/Neo4j adapters"],
  },
  {
    icon: GitBranch,
    title: "Cloud rollout lane",
    body: "The same contracts map to Terraform, Kubernetes manifests, CI gates, observability exporters, and signed integrations.",
    tools: ["Terraform", "Kubernetes", "OpenTelemetry", "Webhook registry"],
  },
];

const caseEvidence = [
  ["Ticket", "OD-1025 · tkt-wifi · urgent incident · owner Priya"],
  ["AI runs", "airun-003 triage valid, airun-004 draft selection pending approval"],
  ["Trace", "trace-wifi-review links triage, policy gate, and CRM delivery spans"],
  ["Webhook", "whd-wifi-001 delivered to CRM with the draft review event"],
];

const jobContracts = [
  ["triage.ticket", "Classify, summarise, prioritise, detect risks, and write an AI run."],
  ["response.template_select", "Pick an approved template and decide auto-send versus human review."],
  ["extract.document", "Extract uploaded document fields and flag mismatches."],
  ["knowledge.ingest", "Chunk sources, create embeddings, and store vector-ready knowledge rows."],
  ["retrieve.context", "Fetch cited context for a ticket, query, and metadata filter set."],
  ["agent.evaluate", "Score golden scenarios for quality, hallucination rate, latency, cost, and ROI."],
  ["suggest.followup", "Create human-owned follow-up tasks from ticket state and AI findings."],
];

const dataGroups = [
  {
    title: "Operations",
    tables: ["businesses", "tickets", "ticket_messages", "ticket_documents", "ticket_drafts", "follow_up_tasks"],
    useful: "Runs the service desk workflow without depending on AI being available.",
  },
  {
    title: "Agent system",
    tables: ["client_discovery_sessions", "agent_blueprints", "agent_evaluation_runs"],
    useful: "Connects consulting discovery, reusable agent design, and measurable rollout quality.",
  },
  {
    title: "Knowledge",
    tables: ["knowledge_sources", "knowledge_chunks"],
    useful: "Stores retrieval sources, metadata filters, and pgvector embeddings for cited RAG.",
  },
  {
    title: "Audit",
    tables: ["ai_runs", "audit_events"],
    useful: "Keeps prompts, outputs, approval states, feedback, and operator actions reviewable.",
  },
];

export default function Architecture() {
  return (
    <>
      <PageHeader
        kicker="Working flow"
        title="Follow one Wi-Fi incident through the stack"
        description="OD-1025 is the concrete example: an urgent customer email becomes a durable ticket, worker jobs run triage and drafting, retrieval supplies evidence, Watchtower blocks risky auto-contact, and a signed CRM webhook records the review handoff."
        actions={
          <>
            <Link className="button button-primary" to="/tickets/tkt-wifi">
              Open OD-1025
            </Link>
            <Link className="button button-secondary" to="/watchtower">
              Open Watchtower
            </Link>
            <Link className="button button-secondary" to="/platform">
              Production path
            </Link>
          </>
        }
      />

      <section className="case-flow-section" aria-label="Working Wi-Fi incident flow">
        <aside className="case-brief">
          <div>
            <span className="eyebrow">Example case</span>
            <h2>OD-1025: Office Wi-Fi drops every afternoon</h2>
            <p>
              Ben at Harbour & Co reports dropped calls around 2pm. AI can help classify the incident and draft the
              diagnostics questions, but the policy gate keeps urgent phone contact human-owned.
            </p>
          </div>
          <div className="case-message">
            "The office Wi-Fi has dropped three afternoons this week. Video calls fail around 2pm and staff switch to
            hotspots. Please treat as urgent."
          </div>
          <ul className="case-evidence-list">
            {caseEvidence.map(([title, body]) => (
              <li key={title}>
                <CheckCircle2 size={16} />
                <strong>{title}</strong>
                <span>{body}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="case-flow-picture">
          <svg className="case-flow-lines" viewBox="0 0 1000 690" preserveAspectRatio="none" aria-hidden="true">
            <path d="M170 100 C250 100 265 100 345 100" />
            <path d="M485 100 C570 100 595 100 675 100" />
            <path d="M760 160 C760 218 610 208 575 265" />
            <path d="M455 295 C410 248 286 242 235 295" />
            <path d="M455 350 C536 350 570 350 652 350" />
            <path d="M755 420 C755 470 758 492 758 540" />
            <path d="M648 445 C560 492 472 505 380 540" />
            <path d="M485 600 C570 600 598 600 678 600" />
          </svg>

          <div className="case-flow-grid">
            {exampleFlow.map((node) => (
              <Link className={`case-flow-node ${node.area}`} key={node.step} to={node.to}>
                <span className="case-step-number">{node.step}</span>
                <node.icon size={17} />
                <span className="case-node-label">{node.label}</span>
                <strong>{node.title}</strong>
                <span>{node.body}</span>
                <code>{node.artifact}</code>
                <span className="case-open-link">
                  Open artifact
                  <ArrowRight size={13} />
                </span>
              </Link>
            ))}
            <div className="case-human-node">
              <span className="case-step-number">10</span>
              <ShieldCheck size={17} />
              <span className="case-node-label">Human action</span>
              <strong>Priya calls the customer</strong>
              <span>The system gives a safe draft and missing-info list; the human decides the next operational move.</span>
              <Link to="/tickets/tkt-wifi">
                Open ticket
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="case-flow-caption">
            <RotateCcw size={16} />
            <span>
              Human edits, approval outcome, trace spans, and evaluation results loop back into prompt versions,
              retrieval policy, and rollout metrics.
            </span>
          </div>
        </div>
      </section>

      <section className="architecture-lanes" aria-label="Runtime lanes">
        {platformLanes.map((lane) => (
          <article className="lane-panel" key={lane.title}>
            <lane.icon size={19} />
            <h2>{lane.title}</h2>
            <p>{lane.body}</p>
            <div className="pill-list">
              {lane.tools.map((tool) => (
                <span className="badge" key={tool}>{tool}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="story-band architecture-contract-band">
        <div>
          <span className="eyebrow">Worker contract</span>
          <h2>Background jobs make the flow reliable.</h2>
          <p>
            pg-boss is the retryable queue boundary. Each job takes a small ID-shaped input, writes durable output, and
            leaves an audit trail that Watchtower and events can show later.
          </p>
        </div>
        <div className="job-contract-grid">
          {jobContracts.map(([name, body]) => (
            <article key={name}>
              <FileJson size={16} />
              <strong>{name}</strong>
              <span>{body}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="story-band architecture-data-band">
        <div>
          <span className="eyebrow">Data ownership</span>
          <h2>Tables are grouped by the decision they protect.</h2>
          <p>
            The schema separates operational work, agent design, retrieval knowledge, and audit evidence so production
            services can scale without hiding what the AI changed.
          </p>
        </div>
        <div className="data-group-grid">
          {dataGroups.map((group) => (
            <article key={group.title}>
              {group.title === "Knowledge" ? <Search size={17} /> : group.title === "Audit" ? <KeyRound size={17} /> : <Database size={17} />}
              <strong>{group.title}</strong>
              <span>{group.useful}</span>
              <div className="pill-list">
                {group.tables.map((table) => (
                  <span className="badge" key={table}>{table}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="architecture-flow architecture-review-strip">
        {[
          ["Events", "Kafka/Redpanda-shaped envelopes carry schema version, correlation ID, and idempotency key.", Network],
          ["Webhooks", "Signed deliveries show endpoint ownership, replay, retry state, and secret rotation.", Webhook],
          ["Watchtower", "Trace spans link tickets, events, webhooks, and AI runs into one review surface.", LineChart],
          ["Evaluation", "Golden scenarios track pass rate, citations, hallucinations, latency, cost, and ROI.", BrainCircuit],
        ].map(([title, body, Icon]) => (
          <div className="flow-node" key={title as string}>
            <Icon size={18} color="var(--accent)" />
            <strong>{title as string}</strong>
            <span>{body as string}</span>
          </div>
        ))}
      </section>
    </>
  );
}
