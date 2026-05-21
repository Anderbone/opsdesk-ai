import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import {
  ArrowUpRight,
  Blocks,
  BrainCircuit,
  CheckCircle2,
  Database,
  GitBranch,
  LineChart,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Metric, PageHeader } from "~/shared/ui/ui";

export const meta: MetaFunction = () => [{ title: "OpsDesk AI | Agent Delivery" }];

const deliveryStages = [
  {
    title: "Domain discovery",
    owner: "Client teams + AI engineer",
    body: "Interview operations, support, finance, and engineering stakeholders to capture domain challenges, constraints, and measurable success metrics.",
    proof: "Success metrics: first response time, manual touches, escalation rate, quote cycle time.",
  },
  {
    title: "Solution translation",
    owner: "Technical advisor",
    body: "Convert business requirements into an agentic architecture with clear tools, memory policy, retrieval scope, human approval gates, and audit events.",
    proof: "Output: agent blueprint, risk register, data contracts, guardrails.",
  },
  {
    title: "Prototype agents",
    owner: "AI engineer",
    body: "Build LLM agents with prompt structures, orchestration logic, RAG retrieval, vector search, deterministic validators, and replayable evaluations.",
    proof: "Stack: AI SDK boundary, pg-boss jobs, pgvector, Drizzle, structured outputs.",
  },
  {
    title: "Production transition",
    owner: "MLE owner",
    body: "Move from proof-of-concept to production by tracking reliability, latency, cost, feedback, rollout cohorts, and measurable ROI.",
    proof: "SLOs: 99.5% job completion, p95 under 2s for retrieval, zero autonomous commitments.",
  },
];

const agentGraph = [
  ["Intake classifier", "Normalises messy enquiries into ticket category, priority, sentiment, risks, and missing information."],
  ["Retrieval planner", "Builds query intents and searches pgvector knowledge chunks from policies, playbooks, tickets, and documents."],
  ["Drafting worker", "Generates customer-safe replies and internal next actions using the retrieved evidence bundle."],
  ["Validation judge", "Checks schema validity, confidence, citation coverage, compliance language, and forbidden actions."],
  ["Approval handoff", "Routes drafts, document mismatches, and low-confidence decisions to a human owner before action."],
];

const reusableComponents = [
  ["Prompt contracts", "Versioned system prompts, JSON schemas, model settings, and test fixtures for each AI action."],
  ["RAG pipeline", "Source ingestion, chunking, embeddings, pgvector HNSW search, metadata filters, and citation payloads."],
  ["Evaluation harness", "Golden scenarios, regression checks, hallucination labels, latency budgets, and cost per resolution."],
  ["Advisor pack", "Discovery templates, ROI calculator, rollout checklist, adoption plan, and stakeholder success review."],
];

const qualificationSignals = [
  ["Production AI/data", "Full-stack service workflow with persisted tickets, background jobs, auditable runs, and human review."],
  ["GenAI hands-on", "LLM prompts, RAG, vector database design, agent orchestration, validators, and retrieval-aware drafting."],
  ["Python + MLE", "Designed for model development, deployment, monitoring, evaluation, and reusable MLE workflows."],
  ["Trusted advisor", "Frames technical choices around client outcomes, adoption risk, success metrics, and measurable ROI."],
];

export default function AgentDelivery() {
  return (
    <>
      <PageHeader
        kicker="Agentic framework"
        title="Client challenge to production AI agent"
        description="A deeper portfolio view of how OpsDesk AI would be delivered with client teams: discovery, scalable agent design, LLM prototyping, RAG with pgvector, reliability, ROI, and reusable deployment components."
        actions={
          <>
            <Link className="button button-primary" to="/architecture">
              View system design
              <ArrowUpRight size={16} />
            </Link>
            <Link className="button button-secondary" to="/watchtower">
              Inspect AI runs
            </Link>
          </>
        }
      />

      <section className="metric-strip" aria-label="Agent delivery metrics">
        <Metric label="Target deflection" value="38%" detail="Repeat enquiries resolved with approved playbooks" />
        <Metric label="Manual time saved" value="11.4h" detail="Estimated weekly reduction from triage and drafting" />
        <Metric label="RAG citation coverage" value="94%" detail="Answers grounded in retrieved sources" />
        <Metric label="ROI payback" value="7 wks" detail="Based on service desk hours and avoided escalations" />
      </section>

      <section className="agent-workspace">
        <div className="delivery-map">
          <div className="surface-header">
            <div>
              <h2>Delivery lifecycle</h2>
              <p>How the build moves from client discovery into production operations.</p>
            </div>
            <Workflow size={18} color="var(--accent)" />
          </div>
          <div className="delivery-stages">
            {deliveryStages.map((stage, index) => (
              <article className="delivery-stage" key={stage.title}>
                <span className="stage-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{stage.title}</strong>
                  <small>{stage.owner}</small>
                  <p>{stage.body}</p>
                  <span>{stage.proof}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="solution-brief">
          <div className="surface-header">
            <div>
              <h2>Client success brief</h2>
              <p>Discovery artifacts translated into measurable delivery criteria.</p>
            </div>
            <LineChart size={18} color="var(--accent)" />
          </div>
          <div className="brief-body">
            <div>
              <span className="eyebrow">Domain challenge</span>
              <p>
                Local service teams need faster triage, safe template-based follow-up, and fewer missed operational
                commitments without letting AI silently change records or handle risky customer contact.
              </p>
            </div>
            <ul className="split-list">
              <li>
                <span>Success metric</span>
                <strong>Reduce first response from 4h to 20m</strong>
              </li>
              <li>
                <span>Reliability metric</span>
                <strong>99.5% background job completion</strong>
              </li>
              <li>
                <span>Adoption metric</span>
                <strong>80% of drafts approved or edited weekly</strong>
              </li>
              <li>
                <span>Risk control</span>
                <strong>No autonomous close, refund, price commitment, or risky contact</strong>
              </li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="agent-section">
        <div className="section-copy">
          <span className="eyebrow">LLM agent system</span>
          <h2>Prompted workers with retrieval, memory, and validation.</h2>
          <p>
            The agentic framework is deliberately modular: each worker has a prompt contract, tool permissions,
            structured output schema, retrieval policy, and audit trail.
          </p>
        </div>
        <div className="agent-graph">
          {agentGraph.map(([title, body], index) => (
            <div className="graph-node" key={title}>
              {index === 1 ? <Database size={18} /> : index === 3 ? <ShieldCheck size={18} /> : <BrainCircuit size={18} />}
              <strong>{title}</strong>
              <span>{body}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rag-panel">
        <div>
          <span className="eyebrow">pgvector retrieval</span>
          <h2>Knowledge that can be measured.</h2>
          <p>
            Production mode stores support playbooks, policies, ticket history, and document extracts as embedded chunks.
            Retrieval is logged with source metadata so every AI answer can cite the evidence it used.
          </p>
        </div>
        <div className="rag-telemetry" aria-label="RAG telemetry">
          <div>
            <Network size={18} />
            <strong>HNSW cosine index</strong>
            <span>1536-dimension embeddings with source and tenant filters.</span>
          </div>
          <div>
            <GitBranch size={18} />
            <strong>Replayable context</strong>
            <span>Input hashes, retrieved chunk IDs, prompt versions, and output JSON stay linked.</span>
          </div>
          <div>
            <Sparkles size={18} />
            <strong>Evaluation loop</strong>
            <span>Golden scenarios score answer quality, citation coverage, latency, and cost.</span>
          </div>
        </div>
      </section>

      <section className="registry-grid">
        <div className="surface-header registry-heading">
          <div>
            <h2>Reusable deployment components</h2>
            <p>Framework pieces that make the next client deployment faster.</p>
          </div>
          <Blocks size={18} color="var(--accent)" />
        </div>
        {reusableComponents.map(([title, body]) => (
          <div className="registry-item" key={title}>
            <CheckCircle2 size={18} color="var(--accent)" />
            <strong>{title}</strong>
            <span>{body}</span>
          </div>
        ))}
      </section>

      <section className="qualification-strip">
        {qualificationSignals.map(([title, body]) => (
          <div key={title}>
            <strong>{title}</strong>
            <span>{body}</span>
          </div>
        ))}
      </section>
    </>
  );
}
