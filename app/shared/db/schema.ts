import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

export const ticketPriority = pgEnum("ticket_priority", ["urgent", "high", "normal", "low"]);
export const ticketStatus = pgEnum("ticket_status", [
  "new",
  "triaged",
  "waiting_customer",
  "awaiting_approval",
  "approved",
  "scheduled",
  "closed",
]);
export const ticketCategory = pgEnum("ticket_category", [
  "quote",
  "incident",
  "document_issue",
  "compliance",
  "complaint",
]);
export const aiApprovalStatus = pgEnum("ai_approval_status", ["pending", "approved", "rejected", "not_required"]);
export const aiValidationStatus = pgEnum("ai_validation_status", ["valid", "needs_review", "failed"]);
export const agentStage = pgEnum("agent_stage", ["discovery", "prototype", "pilot", "production"]);
export const retrievalSourceType = pgEnum("retrieval_source_type", [
  "ticket",
  "document",
  "playbook",
  "policy",
  "metric",
]);

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  tradingName: text("trading_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const responseTemplates = pgTable(
  "response_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateKey: text("template_key").notNull().unique(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: ticketCategory("category").notNull(),
    channel: text("channel").notNull(),
    purpose: text("purpose").notNull(),
    requiredInfo: jsonb("required_info").$type<string[]>().notNull().default([]),
    body: text("body").notNull(),
    autoSendAllowed: boolean("auto_send_allowed").notNull().default(false),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    businessIdx: index("response_templates_business_idx").on(table.businessId),
    categoryIdx: index("response_templates_category_idx").on(table.category),
  }),
);

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id),
    number: text("number").notNull().unique(),
    title: text("title").notNull(),
    customerName: text("customer_name").notNull(),
    customerCompany: text("customer_company").notNull(),
    customerEmail: text("customer_email").notNull(),
    preferredContactMethod: text("preferred_contact_method").notNull().default("email"),
    channel: text("channel").notNull(),
    category: ticketCategory("category").notNull(),
    priority: ticketPriority("priority").notNull(),
    status: ticketStatus("status").notNull().default("new"),
    sentiment: text("sentiment").notNull().default("neutral"),
    sourceText: text("source_text").notNull(),
    aiSummary: text("ai_summary"),
    missingInfo: jsonb("missing_info").$type<string[]>().notNull().default([]),
    risks: jsonb("risks").$type<string[]>().notNull().default([]),
    suggestedNextAction: text("suggested_next_action"),
    assignedTo: text("assigned_to"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    automationDecision: jsonb("automation_decision").$type<Record<string, unknown>>(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("tickets_status_idx").on(table.status),
    priorityIdx: index("tickets_priority_idx").on(table.priority),
    businessIdx: index("tickets_business_idx").on(table.businessId),
  }),
);

export const ticketMessages = pgTable("ticket_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(),
  author: text("author").notNull(),
  body: text("body").notNull(),
  isAiDraft: boolean("is_ai_draft").notNull().default(false),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ticketDocuments = pgTable("ticket_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  storageKey: text("storage_key"),
  extractedFields: jsonb("extracted_fields").$type<Record<string, string | number | boolean>>().notNull().default({}),
  mismatchFlags: jsonb("mismatch_flags").$type<string[]>().notNull().default([]),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ticketDrafts = pgTable("ticket_drafts", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  tone: text("tone").notNull(),
  status: text("status").notNull().default("draft"),
  templateId: uuid("template_id").references(() => responseTemplates.id, { onDelete: "set null" }),
  channel: text("channel"),
  deliveryMode: text("delivery_mode").notNull().default("approval_required"),
  createdByRunId: uuid("created_by_run_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const followUpTasks = pgTable("follow_up_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  owner: text("owner").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("open"),
  source: text("source").notNull().default("ai_suggested"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clientDiscoverySessions = pgTable(
  "client_discovery_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }),
    domainChallenge: text("domain_challenge").notNull(),
    currentProcess: text("current_process").notNull(),
    successMetrics: jsonb("success_metrics").$type<string[]>().notNull().default([]),
    constraints: jsonb("constraints").$type<string[]>().notNull().default([]),
    stakeholderNotes: jsonb("stakeholder_notes").$type<Record<string, string>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    businessIdx: index("client_discovery_business_idx").on(table.businessId),
  }),
);

export const agentBlueprints = pgTable(
  "agent_blueprints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    stage: agentStage("stage").notNull().default("prototype"),
    objective: text("objective").notNull(),
    promptVersion: text("prompt_version").notNull(),
    orchestration: jsonb("orchestration").$type<Record<string, unknown>>().notNull().default({}),
    memoryPolicy: jsonb("memory_policy").$type<Record<string, unknown>>().notNull().default({}),
    retrievalPolicy: jsonb("retrieval_policy").$type<Record<string, unknown>>().notNull().default({}),
    guardrails: jsonb("guardrails").$type<string[]>().notNull().default([]),
    reusableComponents: jsonb("reusable_components").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    businessIdx: index("agent_blueprints_business_idx").on(table.businessId),
    stageIdx: index("agent_blueprints_stage_idx").on(table.stage),
  }),
);

export const knowledgeSources = pgTable(
  "knowledge_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }),
    sourceType: retrievalSourceType("source_type").notNull(),
    title: text("title").notNull(),
    uri: text("uri"),
    contentHash: text("content_hash").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    businessIdx: index("knowledge_sources_business_idx").on(table.businessId),
    hashIdx: index("knowledge_sources_hash_idx").on(table.contentHash),
  }),
);

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => knowledgeSources.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    body: text("body").notNull(),
    embeddingModel: text("embedding_model").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sourceIdx: index("knowledge_chunks_source_idx").on(table.sourceId),
    embeddingIdx: index("knowledge_chunks_embedding_hnsw_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  }),
);

export const agentEvaluationRuns = pgTable(
  "agent_evaluation_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blueprintId: uuid("blueprint_id").references(() => agentBlueprints.id, { onDelete: "cascade" }),
    datasetName: text("dataset_name").notNull(),
    scenarioCount: integer("scenario_count").notNull(),
    passRate: doublePrecision("pass_rate").notNull(),
    hallucinationRate: doublePrecision("hallucination_rate").notNull(),
    p95LatencyMs: integer("p95_latency_ms").notNull(),
    costPerResolutionUsd: doublePrecision("cost_per_resolution_usd").notNull(),
    roiEstimate: jsonb("roi_estimate").$type<Record<string, number | string>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    blueprintIdx: index("agent_eval_blueprint_idx").on(table.blueprintId),
  }),
);

export const aiRuns = pgTable(
  "ai_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id").references(() => tickets.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    model: text("model").notNull(),
    promptVersion: text("prompt_version").notNull(),
    inputHash: text("input_hash").notNull(),
    output: jsonb("output").$type<Record<string, unknown>>().notNull(),
    confidence: doublePrecision("confidence").notNull(),
    latencyMs: integer("latency_ms").notNull(),
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    estimatedCostUsd: doublePrecision("estimated_cost_usd").notNull().default(0),
    validationStatus: aiValidationStatus("validation_status").notNull().default("needs_review"),
    approvalStatus: aiApprovalStatus("approval_status").notNull().default("pending"),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ticketIdx: index("ai_runs_ticket_idx").on(table.ticketId),
    actionIdx: index("ai_runs_action_idx").on(table.action),
  }),
);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").references(() => tickets.id, { onDelete: "set null" }),
  actor: text("actor").notNull(),
  eventType: text("event_type").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
