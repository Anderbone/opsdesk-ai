import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Inbox,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const meta: MetaFunction = () => [
  { title: "OpsDesk AI | Overview" },
  {
    name: "description",
    content: "See how OpsDesk AI turns customer enquiries into reviewed service desk work.",
  },
];

const flowSteps = [
  {
    title: "Customer asks",
    detail: "Website, email, or uploaded note arrives as raw customer language.",
    example: "Need CCTV and door access before opening weekend.",
    icon: MessageSquareText,
  },
  {
    title: "Ticket created",
    detail: "OpsDesk stores the request, company, contact, source, and timeline.",
    example: "Oakline Fitness - new installation request.",
    icon: Inbox,
  },
  {
    title: "AI triages",
    detail: "The assistant extracts intent, urgency, missing details, risks, and next steps.",
    example: "High priority, quote needed, site survey recommended.",
    icon: BrainCircuit,
  },
  {
    title: "Template routed",
    detail: "AI selects an approved response template and checks the confidence gate.",
    example: "Ask for floor plan, preferred install date, and access hours.",
    icon: FileText,
  },
  {
    title: "Policy decides",
    detail: "Simple missing-info asks can send automatically; risky cases wait for review.",
    example: "Auto-send form, approve draft, or assign a human follow-up.",
    icon: ShieldCheck,
  },
];

const proofPoints = [
  "Every AI run is logged with model, prompt, selected template, confidence, tokens, and cost.",
  "AI can only send pre-approved information-gathering templates.",
  "The desk keeps raw customer input beside the AI summary and next action.",
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-copy">
          <span className="eyebrow">OpsDesk AI</span>
          <h1 id="home-title">Customer requests become reviewed desk work.</h1>
          <p>
            A simple service-desk demo for local businesses: capture the enquiry, let AI route approved templates for
            simple follow-up questions, and keep complex work in human hands.
          </p>
          <div className="home-actions">
            <Link className="button button-primary" to="/enquiry">
              Try the example
              <ArrowRight size={16} />
            </Link>
            <Link className="button button-ghost" to="/dashboard">
              Open the desk
            </Link>
          </div>
        </div>

        <div className="example-panel" aria-label="Simple OpsDesk example">
          <div className="example-panel-header">
            <span>Example enquiry</span>
            <Sparkles size={17} />
          </div>
          <blockquote>
            "We are opening a second gym unit and need a quote for CCTV plus door access control before opening weekend."
          </blockquote>
          <div className="example-result">
            <div>
              <span>AI summary</span>
              <strong>New installation quote, time-sensitive</strong>
            </div>
            <div>
              <span>Policy action</span>
              <strong>Send site-details form or route to review</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="flow-section" aria-labelledby="flow-title">
        <div className="flow-heading">
          <span className="eyebrow">Main workflow</span>
          <h2 id="flow-title">One clear path from message to approved response.</h2>
        </div>

        <div className="home-flow" aria-label="OpsDesk AI flow chart">
          {flowSteps.map((step, index) => (
            <article className="home-flow-step" key={step.title}>
              <div className="flow-step-icon">
                <step.icon size={19} />
              </div>
              <span className="flow-step-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
              <strong>{step.example}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="clarity-section" aria-label="Why this app exists">
        <div>
          <span className="eyebrow">What the app does</span>
          <h2>It removes service-desk admin without removing human judgment.</h2>
        </div>
        <ul>
          {proofPoints.map((point) => (
            <li key={point}>
              <CheckCircle2 size={17} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
