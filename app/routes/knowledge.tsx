import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, useLoaderData } from "react-router";
import { BrainCircuit, Database, GitBranch, Search } from "lucide-react";
import {
  getFacetValues,
  graphEdges,
  graphNodes,
  graphQueries,
  searchKnowledgeDocuments,
} from "~/lib/knowledge-data";
import { Metric, PageHeader } from "~/shared/ui/ui";

export const meta: MetaFunction = () => [{ title: "OpsDesk AI | Knowledge" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const params = new URL(request.url).searchParams;
  const filters = {
    query: params.get("q") ?? "",
    category: params.get("category") ?? "all",
    sourceType: params.get("sourceType") ?? "all",
    risk: params.get("risk") ?? "all",
    owner: params.get("owner") ?? "all",
    aiAction: params.get("aiAction") ?? "all",
  };
  return {
    filters,
    results: searchKnowledgeDocuments(filters),
    facets: {
      category: getFacetValues("category"),
      sourceType: getFacetValues("sourceType"),
      risk: getFacetValues("risk"),
      owner: getFacetValues("owner"),
      aiAction: getFacetValues("aiAction"),
    },
    graphNodes,
    graphEdges,
    graphQueries,
  };
}

export default function KnowledgeRoute() {
  const { filters, results, facets, graphNodes, graphEdges, graphQueries } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader
        kicker="Search and graph"
        title="Operational knowledge with citations"
        description="Tickets, uploaded documents, playbooks, and AI runs are searchable with facets, RAG citations, and a relationship panel for reviewer-friendly graph queries."
        actions={
          <Link className="button button-primary" to="/watchtower">
            Inspect AI evidence
          </Link>
        }
      />

      <section className="metric-strip" aria-label="Knowledge metrics">
        <Metric label="Results" value={results.length} detail="Matching deterministic documents" />
        <Metric label="Sources" value={facets.sourceType.length} detail="Tickets, docs, playbooks, Watchtower" />
        <Metric label="Graph nodes" value={graphNodes.length} detail="Operational relationships" />
        <Metric label="Graph edges" value={graphEdges.length} detail="Evidence-backed links" />
      </section>

      <section className="knowledge-workspace">
        <aside className="surface">
          <div className="surface-header">
            <div>
              <h2>Search facets</h2>
              <p>OpenSearch-style filters mapped to seeded demo data.</p>
            </div>
            <Search size={18} color="var(--accent)" />
          </div>
          <Form method="get" className="facet-form">
            <label>
              Query
              <input name="q" defaultValue={filters.query} placeholder="wifi, invoice, complaint" />
            </label>
            {[
              ["category", "Category"],
              ["sourceType", "Source type"],
              ["risk", "Risk"],
              ["owner", "Owner"],
              ["aiAction", "AI action"],
            ].map(([field, label]) => (
              <label key={field}>
                {label}
                <select name={field} defaultValue={filters[field as keyof typeof filters]}>
                  <option value="all">All</option>
                  {facets[field as keyof typeof facets].map((value) => (
                    <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
                  ))}
                </select>
              </label>
            ))}
            <button className="button button-primary" type="submit">Search</button>
          </Form>
        </aside>

        <div className="surface">
          <div className="surface-header">
            <div>
              <h2>Search results</h2>
              <p>Each result carries source identity and RAG citations.</p>
            </div>
            <BrainCircuit size={18} color="var(--accent)" />
          </div>
          <div className="result-list">
            {results.map((document) => (
              <article className="result-row" key={document.id}>
                <div>
                  <span className="eyebrow">{document.category} · {document.risk} risk</span>
                  <h3>{document.title}</h3>
                  <p>{document.summary}</p>
                  <div className="pill-list">
                    {document.citations.map((citation) => <span className="badge" key={citation}>{citation}</span>)}
                  </div>
                </div>
                <aside>
                  <strong>{document.customerCompany}</strong>
                  <span>{document.owner} · {document.aiAction}</span>
                  {document.ticketId ? <Link to={`/tickets/${document.ticketId}`}>Open ticket</Link> : null}
                </aside>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ops-layout">
        <div className="surface">
          <div className="surface-header">
            <div>
              <h2>OpenSearch mapping preview</h2>
              <p>Production mode can swap the selector for lexical/vector retrieval with the same metadata.</p>
            </div>
            <Database size={18} color="var(--accent)" />
          </div>
          <div className="code-box">{`index: opsdesk_knowledge
fields:
  title: text + keyword
  summary: text
  sourceType: keyword
  risk: keyword
  owner: keyword
  aiAction: keyword
  ticketId: keyword
  embedding: knn_vector(1536)
retrieval:
  filters: tenant, sourceType, risk, owner
  citations: ticket, document, ai_run, playbook ids`}</div>
        </div>

        <aside className="surface">
          <div className="surface-header">
            <div>
              <h2>Graph relationship panel</h2>
              <p>Graph starts here to keep the demo focused.</p>
            </div>
            <GitBranch size={18} color="var(--accent)" />
          </div>
          <div className="graph-query-list">
            {graphQueries.map((query) => (
              <article key={query.id}>
                <strong>{query.title}</strong>
                <span>{query.result}</span>
                <small>{query.evidenceIds.join(" · ")}</small>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="surface" style={{ marginTop: 22 }}>
        <div className="surface-header">
          <div>
            <h2>Relationship edges</h2>
            <p>Edges retain evidence IDs so graph answers remain auditable.</p>
          </div>
        </div>
        <div className="edge-list">
          {graphEdges.map((edge) => {
            const from = graphNodes.find((node) => node.id === edge.from);
            const to = graphNodes.find((node) => node.id === edge.to);
            return (
              <div className="edge-row" key={edge.id}>
                <strong>{from?.label}</strong>
                <span>{edge.label}</span>
                <strong>{to?.label}</strong>
                <small>{edge.evidenceId}</small>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
