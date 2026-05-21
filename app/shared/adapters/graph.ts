import { graphEdges, graphNodes, graphQueries } from "~/lib/knowledge-data";
import type { KnowledgeGraphEdge, KnowledgeGraphNode } from "~/lib/types";
import type { RuntimeConfig } from "~/shared/config/runtime";
import { getRuntimeConfig } from "~/shared/config/runtime";

export type RelationshipQueryResult = {
  id: string;
  title: string;
  result: string;
  evidenceIds: string[];
};

export type GraphRepository = {
  listNodes(): Promise<KnowledgeGraphNode[]>;
  listEdges(): Promise<KnowledgeGraphEdge[]>;
  answerRelationshipQuery(queryId: string): Promise<RelationshipQueryResult | undefined>;
};

export function createInMemoryGraphRepository(): GraphRepository {
  return {
    async listNodes() {
      return graphNodes.map((node) => ({ ...node }));
    },
    async listEdges() {
      return graphEdges.map((edge) => ({ ...edge }));
    },
    async answerRelationshipQuery(queryId) {
      const query = graphQueries.find((item) => item.id === queryId);
      return query ? { ...query, evidenceIds: [...query.evidenceIds] } : undefined;
    },
  };
}

export function createGraphRepository(config: RuntimeConfig = getRuntimeConfig()): GraphRepository {
  if (config.mode === "demo") return createInMemoryGraphRepository();
  if (!config.neo4jUri) {
    throw new Error(`OPS_DESK_MODE=${config.mode} graph requires NEO4J_URI for the Neo4j adapter.`);
  }
  if (!config.neo4jUser || !config.neo4jPassword) {
    throw new Error(`OPS_DESK_MODE=${config.mode} graph requires NEO4J_USER and NEO4J_PASSWORD for the Neo4j adapter.`);
  }
  throw new Error("Neo4j graph adapter is configured but not implemented in this demo phase.");
}
