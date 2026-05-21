import {
  documentMatchesKnowledgeFilters,
  searchDocuments,
  type FacetField,
  type KnowledgeFilters,
} from "~/lib/knowledge-data";
import type { SearchDocument } from "~/lib/types";
import type { RuntimeConfig } from "~/shared/config/runtime";
import { getRuntimeConfig } from "~/shared/config/runtime";

export type FacetCounts = Record<string, number>;

export type SearchRepository = {
  indexDocument(document: SearchDocument): Promise<void>;
  searchDocuments(filters: KnowledgeFilters): Promise<SearchDocument[]>;
  facetCounts(field: FacetField): Promise<FacetCounts>;
  rebuildReadModel(documents?: SearchDocument[]): Promise<number>;
};

function cloneDocument(document: SearchDocument): SearchDocument {
  return { ...document, citations: [...document.citations] };
}

export function createInMemorySearchRepository(seedDocuments: SearchDocument[] = searchDocuments): SearchRepository {
  let indexedDocuments = seedDocuments.map(cloneDocument);

  return {
    async indexDocument(document) {
      indexedDocuments = indexedDocuments.filter((item) => item.id !== document.id);
      indexedDocuments.push(cloneDocument(document));
    },

    async searchDocuments(filters) {
      return indexedDocuments
        .filter((document) => documentMatchesKnowledgeFilters(document, filters))
        .map(cloneDocument);
    },

    async facetCounts(field) {
      return indexedDocuments.reduce<FacetCounts>((counts, document) => {
        counts[document[field]] = (counts[document[field]] ?? 0) + 1;
        return counts;
      }, {});
    },

    async rebuildReadModel(documents = seedDocuments) {
      indexedDocuments = documents.map(cloneDocument);
      return indexedDocuments.length;
    },
  };
}

export function createSearchRepository(config: RuntimeConfig = getRuntimeConfig()): SearchRepository {
  if (config.mode === "demo") return createInMemorySearchRepository();
  if (!config.opensearchUrl) {
    throw new Error(`OPS_DESK_MODE=${config.mode} search requires OPENSEARCH_URL for the OpenSearch adapter.`);
  }
  throw new Error("OpenSearch adapter is configured but not implemented in this demo phase.");
}
