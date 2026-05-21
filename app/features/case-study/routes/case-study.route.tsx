import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowUpRight, Bot, CheckCircle2, Database, Workflow } from "lucide-react";

export const meta: MetaFunction = () => [{ title: "OpsDesk AI | Portfolio Case Study" }];

export default function CaseStudy() {
  return (
    <>
      <section className="case-hero">
        <div className="case-hero-content">
          <span className="eyebrow">Portfolio demo</span>
          <h1>OpsDesk AI</h1>
          <p>
            A full-stack AI service desk for local businesses: capture messy enquiries, turn them into tickets, draft
            controlled replies, extract document facts, and audit every model action.
          </p>
          <div className="page-actions" style={{ justifyContent: "flex-start", marginTop: 24 }}>
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
      </section>

      <section className="story-band">
        <h2>The problem</h2>
        <p>
          Local service businesses lose time inside email threads, PDFs, half-written quotes, missed follow-ups, and
          unclear ownership. A chatbot does not fix that. The workflow needs ticket state, background jobs, human review,
          and an audit trail that makes AI output inspectable.
        </p>
      </section>

      <section className="story-band">
        <h2>The product</h2>
        <div className="architecture-flow">
          {[
            ["Capture", "Website enquiries, email-like messages, and file notes become tickets."],
            ["Triage", "AI classifies category, priority, missing info, risks, and next action."],
            ["Draft", "Replies and quote outlines are prepared for staff approval."],
            ["Extract", "Document fields and mismatches are surfaced for review."],
            ["Audit", "AI Watchtower stores model, prompt, hash, output, confidence, tokens, and approval state."],
          ].map(([title, body]) => (
            <div className="flow-node" key={title}>
              <CheckCircle2 size={18} color="var(--accent)" />
              <strong>{title}</strong>
              <span>{body}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="story-band">
        <h2>Technical shape</h2>
        <p>
          Built as a React Router full-stack app with server loaders/actions, a seeded demo store, Drizzle schema for
          PostgreSQL and pgvector, pg-boss worker scaffolding, AI SDK-ready boundaries, retrieval-aware agent contracts,
          evaluation tables, and a restrained operations UI designed for repeated use rather than a marketing splash page.
        </p>
      </section>

      <section className="story-band">
        <h2>Consulting angle</h2>
        <p>
          The expanded delivery view shows how the project would be sold, shaped, and adopted with a client team:
          stakeholder discovery, success metrics, agent blueprinting, RAG pipeline design, rollout controls, and ROI
          measurement.
        </p>
      </section>

      <section className="story-band">
        <h2>Why it demos well</h2>
        <div className="detail-stack">
          <div className="source-text">
            <Bot size={18} /> AI behaves like a junior operations assistant. It can suggest, extract, summarise, and
            select approved missing-info templates, but it cannot close tickets, make commitments, or silently change
            business-critical records.
          </div>
          <div className="source-text">
            <Workflow size={18} /> The five seeded DragonTech cases show quote intake, urgent incident triage, document
            mismatch handling, compliance chasing, and complaint recovery.
          </div>
          <div className="source-text">
            <Database size={18} /> The repo includes production database and queue scaffolding so the portfolio story can
            grow into a deployed app with vector retrieval, evaluation runs, and client-specific agent blueprints.
          </div>
        </div>
      </section>
    </>
  );
}
