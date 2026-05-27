import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  ClipboardCheck,
  Database,
  GitBranch,
  History,
  LockKeyhole,
  MessageSquareText,
  MonitorCheck,
  Network,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export const meta: MetaFunction = () => [{ title: "OpsDesk AI | Portfolio Case Study" }];

const caseMetrics = [
  ["5", "seeded DragonTech cases across quotes, incidents, documents, compliance, and complaints"],
  ["2", "AI decisions per ticket: triage plus controlled response-template selection"],
  ["0", "silent AI actions on urgent, low-confidence, complaint, payment, or mismatch cases"],
  ["100%", "model actions logged with prompt version, validation state, confidence, cost, and reviewer outcome"],
];

const reviewerPath = [
  ["/case-study", "Start", "Business problem, product story, AI boundary, and production-shaped architecture."],
  ["/enquiry", "Try workflow", "Submit a messy customer enquiry and trigger deterministic AI triage."],
  ["/dashboard", "Review queue", "Inspect owners, priorities, summaries, policy status, and follow-up work."],
  ["/watchtower", "Inspect safety", "Review prompts, validation, costs, trace spans, approvals, and audit events."],
  ["/platform", "Production path", "See hosted demo mode mapped to database, queue, webhook, search, and observability boundaries."],
];

const showcaseMedia = [
  {
    type: "Screenshot",
    title: "Operations desk",
    src: "/showcase/dashboard.png",
    body: "Ticket queue with owners, AI summaries, status, priority, and follow-up work visible in one scan.",
  },
  {
    type: "GIF",
    title: "AI handoff loop",
    src: "/showcase/opsdesk-flow.gif",
    body: "A compact walkthrough from ticket queue to Watchtower review and the architecture trace.",
  },
  {
    type: "Screenshot",
    title: "Watchtower audit",
    src: "/showcase/watchtower.png",
    body: "Every model call shows validation, approval state, cost, prompt version, trace, and event evidence.",
  },
];

const productFlow = [
  {
    icon: MessageSquareText,
    title: "Capture",
    body: "Website enquiries, email-like messages, and file notes become durable tickets with raw source retained.",
  },
  {
    icon: BrainCircuit,
    title: "Triage",
    body: "AI classifies category, priority, missing info, risk, and the next suggested desk action.",
  },
  {
    icon: ClipboardCheck,
    title: "Draft",
    body: "Only approved response templates can be selected; business commitments stay out of automation.",
  },
  {
    icon: ShieldCheck,
    title: "Review",
    body: "Policy gates route urgent incidents, complaints, mismatches, and low confidence to named humans.",
  },
  {
    icon: MonitorCheck,
    title: "Audit",
    body: "Watchtower keeps prompts, outputs, validation, approvals, trace IDs, tokens, and cost inspectable.",
  },
];

const architectureNodes = [
  ["Ticket intake", "React Router actions validate enquiries and persist the raw customer source."],
  ["AI triage", "Structured outputs force category, confidence, missing info, priority, and next action fields."],
  ["Knowledge/RAG", "pgvector-ready chunks support cited retrieval from policies, documents, and past tickets."],
  ["Policy gate", "Template permissions, confidence, urgency, complaints, and mismatches decide auto-send or review."],
  ["Event/webhook", "Kafka-shaped events and signed webhooks hand review tasks to CRM or downstream tools."],
  ["Audit/Watchtower", "AI runs, audit events, trace spans, and approval outcomes share the ticket correlation ID."],
];

const reviewLedger = [
  ["Source retained", "Raw email, uploaded note, and extracted document fields stay beside the AI summary."],
  ["Policy evaluated", "The gate checks confidence, urgency, category, customer risk, and template permissions."],
  ["Human assigned", "Priya owns OD-1025 because urgent phone contact cannot auto-send from the model output."],
  ["Decision recorded", "Approval, rejection, edit notes, prompt hash, template ID, trace ID, tokens, and cost are logged."],
];

const stackProof = [
  ["TypeScript", "Domain types for tickets, AI runs, documents, events, webhooks, traces, search, and graph records."],
  ["React Router", "Full-stack loaders/actions for enquiry intake, ticket workspaces, Watchtower, and platform routes."],
  ["PostgreSQL + pgvector", "Drizzle schema models tickets, response templates, knowledge chunks, AI runs, and evaluations."],
  ["Vercel AI SDK", "AI boundary is ready for model calls while the public demo stays deterministic and reviewable."],
  ["Vitest", "Unit coverage for AI triage, repositories, runtime config, adapters, and OTLP trace export payloads."],
  ["Playwright", "Route smoke tests cover the desk, enquiry flow, Watchtower, architecture, case study, and integrations."],
];

const dataModel = [
  ["Ticket", "Raw customer source, company, contact, category, priority, owner, status, sentiment, and SLA context."],
  ["AI run", "Prompt version, model, confidence, validation result, selected template, tokens, latency, cost, and output hash."],
  ["Knowledge chunk", "Policy/document/ticket evidence prepared for retrieval with source metadata and pgvector-ready shape."],
  ["Audit event", "Policy decision, reviewer action, trace span, event envelope, webhook attempt, and replay context."],
];

const policyGate = [
  ["Allowed to auto-send", "High-confidence missing-information requests using approved templates only."],
  ["Queued for review", "Urgent incidents, complaints, low confidence, document/payment mismatches, refunds, closes, or price commitments."],
  ["Always logged", "Every model output keeps prompt version, validation result, correlation ID, cost, latency, and reviewer outcome."],
];

const productionNext = [
  ["Auth/RBAC", "Add tenant-aware roles for operator, manager, auditor, and integration-admin workflows."],
  ["Observability", "Implemented now: Watchtower traces can be converted to OTLP/JSON via OTEL_EXPORTER_OTLP_* config."],
  ["Evals", "Expand fixture regression packs for template selection, retrieval citations, and policy-gate decisions."],
  ["Queue retries", "Move pg-boss job contracts from simulator to retryable workers with DLQ replay controls."],
  ["Customer config", "Persist per-customer channels, templates, SLA rules, risk settings, and webhook destinations."],
];

const roleProof = [
  [
    "Solution",
    "Structured ticketing, AI triage, document extraction, retrieval-aware drafting, human approval gates, and Watchtower audit records.",
  ],
  [
    "My role",
    "I designed the workflow, modeled ticket and AI-run data, built the UI and demo flow, defined policy gates, and separated production adapters.",
  ],
  [
    "Tradeoffs",
    "The public demo stays deterministic for reliability while real database, queue, webhook, search, graph, and observability adapters remain explicit boundaries.",
  ],
];

const proofList = [
  {
    icon: Bot,
    title: "Junior-operator behavior",
    body: "AI can suggest, extract, summarise, and select approved missing-info templates, but it cannot close tickets, make commitments, or silently change business-critical records.",
  },
  {
    icon: Workflow,
    title: "End-to-end service story",
    body: "The seeded cases show quote intake, urgent incident triage, document mismatch handling, compliance chasing, and complaint recovery.",
  },
  {
    icon: Database,
    title: "Production-shaped backend",
    body: "The repo includes database, queue, vector retrieval, evaluation, event, webhook, and observability boundaries that can grow into a deployed app.",
  },
  {
    icon: Network,
    title: "Integration proof",
    body: "Kafka-shaped events and signed webhooks show how review-required decisions leave the desk without losing correlation, replay, or idempotency.",
  },
  {
    icon: GitBranch,
    title: "Consulting narrative",
    body: "Agent delivery pages connect discovery, prototype, rollout controls, and ROI so the project reads like a client-ready implementation case.",
  },
  {
    icon: History,
    title: "Audit posture",
    body: "Watchtower preserves prompt versions, output hashes, validation failures, approvals, and feedback so every AI action can be reviewed later.",
  },
];

function SectionHeading({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return (
    <div>
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id}>{title}</h2>
    </div>
  );
}

export default function CaseStudy() {
  return (
    <>
      <section className="case-hero">
        <div className="case-hero-content">
          <span className="eyebrow">Portfolio case study</span>
          <h1>OpsDesk AI</h1>
          <p>
            OpsDesk AI is a full-stack, policy-gated AI workflow demo that turns messy service enquiries into structured
            tickets, retrieval-aware drafts, human approval gates, audit trails, and production-ready integration
            boundaries.
          </p>
          <div className="page-actions case-hero-actions">
            <Link className="button button-primary" to="/dashboard">
              Open the demo
              <ArrowUpRight size={16} />
            </Link>
            <Link className="button button-secondary" to="/architecture">
              View architecture
            </Link>
            <Link className="button button-ghost" to="/agent-delivery">
              Agent delivery
            </Link>
          </div>
        </div>

        <div className="case-hero-visual" aria-label="OpsDesk AI product walkthrough preview">
          <img src="/showcase/opsdesk-flow.gif" alt="Animated OpsDesk AI demo walkthrough" />
          <div className="case-hero-visual-caption">
            <span>AI handoff loop</span>
            <strong>Ticket queue {"->"} review gate {"->"} audit trail</strong>
          </div>
        </div>
      </section>

      <section className="case-metric-strip" aria-label="Case study highlights">
        {caseMetrics.map(([value, label]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="case-reviewer-path" aria-labelledby="reviewer-path-title">
        <SectionHeading
          eyebrow="Reviewer path"
          id="reviewer-path-title"
          title="If you only have a few minutes, follow the workflow in this order."
        />
        <div className="case-reviewer-links">
          {reviewerPath.map(([href, title, body]) => (
            <Link key={href} to={href}>
              <strong>{title}</strong>
              <span>{body}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="story-band">
        <h2>The problem</h2>
        <div className="case-story-copy">
          <p>
            Local service businesses lose time inside email threads, PDFs, half-written quotes, missed follow-ups, and
            unclear ownership. A chatbot does not fix that. The workflow needs ticket state, background jobs, human
            review, and an audit trail that makes AI output inspectable.
          </p>
          <p>
            OpsDesk AI is framed around DragonTech Facilities, a small operator handling installation quotes, urgent
            incidents, supplier mismatches, compliance chasing, and customer complaints from the same queue.
          </p>
        </div>
      </section>

      <section className="story-band">
        <h2>Workflow and data model</h2>
        <div className="case-story-copy">
          <p>
            The core product object is a ticket, not a chat message. Each ticket keeps the raw customer input beside AI
            summaries, selected templates, policy decisions, events, webhook attempts, and Watchtower trace spans.
          </p>
          <p>
            That model makes the workflow obvious: intake creates durable state, AI prepares a bounded recommendation,
            policy decides whether automation is allowed, and the audit trail explains the decision later.
          </p>
        </div>
        <div className="case-proof-list">
          {dataModel.map(([title, body]) => (
            <article key={title}>
              <Database size={18} />
              <strong>{title}</strong>
              <span>{body}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="case-role-section" aria-label="Solution, role, and tradeoffs">
        {roleProof.map(([title, body]) => (
          <article key={title}>
            <span className="eyebrow">{title}</span>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="case-showcase-section" aria-labelledby="case-showcase-title">
        <SectionHeading
          eyebrow="Screenshots and GIF"
          id="case-showcase-title"
          title="A portfolio page with product evidence, not just claims."
        />
        <div className="showcase-media-grid">
          {showcaseMedia.map((item) => (
            <figure className="showcase-media" key={item.title}>
              <img src={item.src} alt={`${item.title} in OpsDesk AI`} />
              <figcaption>
                <span>{item.type}</span>
                <strong>{item.title}</strong>
                <small>{item.body}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="story-band" aria-label="Technical stack proof">
        <h2>Full-stack implementation proof</h2>
        <div className="case-proof-list">
          {stackProof.map(([title, body]) => (
            <article key={title}>
              <Bot size={18} />
              <strong>{title}</strong>
              <span>{body}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="case-product-section" aria-labelledby="case-product-title">
        <SectionHeading eyebrow="Product loop" id="case-product-title" title="The product workflow" />
        <div className="architecture-flow case-product-flow">
          {productFlow.map((step) => (
            <div className="flow-node" key={step.title}>
              <step.icon size={18} color="var(--accent)" />
              <strong>{step.title}</strong>
              <span>{step.body}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="case-architecture-section" aria-labelledby="case-architecture-title">
        <div className="case-architecture-heading">
          <SectionHeading
            eyebrow="Architecture diagram"
            id="case-architecture-title"
            title="The AI path is separated from durable operations state."
          />
          <p>
            The design keeps intake, queueing, AI output, retrieval, audit, and integration contracts explicit, so a
            reviewer can inspect what happened without trusting a black box.
          </p>
        </div>
        <div className="case-architecture-diagram" aria-label="OpsDesk AI architecture diagram">
          {architectureNodes.map(([title, body], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <small>{body}</small>
              {index < architectureNodes.length - 1 ? <ArrowRight size={16} aria-hidden="true" /> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="case-review-section" aria-labelledby="case-review-title">
        <div className="case-review-copy">
          <SectionHeading
            eyebrow="Human review and audit"
            id="case-review-title"
            title="AI can prepare work. Humans own risk."
          />
          <p>
            OD-1025 is the clearest story: AI summarises an urgent Wi-Fi incident and drafts diagnostic questions, but
            the policy gate blocks auto-send because phone contact and customer urgency require a named human owner.
          </p>
          <div className="policy-list" aria-label="AI policy boundary">
            {policyGate.map(([title, body]) => (
              <article key={title}>
                <strong>{title}</strong>
                <span>{body}</span>
              </article>
            ))}
          </div>
          <Link className="button button-primary" to="/watchtower">
            Open Watchtower
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="review-ledger" aria-label="Human review audit ledger">
          {reviewLedger.map(([title, body]) => (
            <article key={title}>
              <LockKeyhole size={17} />
              <div>
                <strong>{title}</strong>
                <span>{body}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="story-band">
        <h2>Outcome</h2>
        <div className="case-story-copy">
          <p>
            DragonTech gets one queue for quotes, urgent incidents, compliance chasing, document exceptions, and
            complaints. Operators can scan ownership and next actions quickly, while reviewers can inspect every AI
            decision before trusting it.
          </p>
          <p>
            The result is a demo that shows the ambiguous business problem, the workflow model, the data model, and the
            AI boundary on the page instead of hiding those details in architecture notes.
          </p>
        </div>
      </section>

      <section className="story-band">
        <h2>Technical shape</h2>
        <div className="case-story-copy">
          <p>
            Built as a React Router full-stack app with server loaders/actions, seeded demo state, Drizzle schema for
            PostgreSQL and pgvector, pg-boss worker scaffolding, AI SDK-ready boundaries, retrieval-aware agent
            contracts, evaluation tables, and a restrained operations UI designed for repeated use.
          </p>
          <p>
            The expanded delivery view shows how the project would be sold and adopted with a client team: stakeholder
            discovery, success metrics, agent blueprinting, RAG pipeline design, rollout controls, and ROI measurement.
          </p>
          <p>
            This project reflects the same implementation pattern I use in enterprise software delivery: understand the
            real operational workflow, protect data integrity, automate the repeatable path, keep exceptions reviewable,
            and design the result so it can be demoed, supported, and extended.
          </p>
        </div>
      </section>

      <section className="story-band">
        <h2>Production next</h2>
        <div className="case-proof-list">
          {productionNext.map(([title, body]) => (
            <article key={title}>
              <MonitorCheck size={18} />
              <strong>{title}</strong>
              <span>{body}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="story-band">
        <h2>Why it demos well</h2>
        <div className="case-proof-list">
          {proofList.map(({ icon: Icon, title, body }) => (
            <article key={title}>
              <Icon size={18} />
              <strong>{title}</strong>
              <span>{body}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
