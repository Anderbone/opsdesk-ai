import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { demoDocuments } from "../app/features/documents/data/demo-data";
import { createDemoState } from "../app/features/tickets/data/demo-data";
import { responseTemplates } from "../app/features/tickets/services/response-templates";
import { demoAiRuns } from "../app/features/watchtower/data/demo-data";
import { eventEnvelopes } from "../app/lib/event-data";
import { searchDocuments } from "../app/lib/knowledge-data";
import { loadLocalEnv } from "./lib/local-env";

const businessKey = "business:dragontech-facilities";
const businessId = stableUuid(businessKey);
const seedArgs = new Set(process.argv.slice(2));
const demoState = createDemoState();

loadLocalEnv();

const file = path.join(process.cwd(), "data", "opsdesk-demo.json");
await mkdir(path.dirname(file), { recursive: true });
await writeFile(file, JSON.stringify(demoState, null, 2));
console.log(`Seeded demo data at ${file}`);

if (shouldSeedDatabase()) {
  await seedDatabase();
}

function shouldSeedDatabase() {
  return seedArgs.has("--database") || process.env.OPS_DESK_MODE === "local" || process.env.OPS_DESK_MODE === "prod";
}

function stableUuid(input: string) {
  const hash = createHash("sha256").update(input).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function toDate(value: string) {
  return new Date(value);
}

function vectorLiteral(seed: string) {
  const hash = createHash("sha256").update(seed).digest();
  const values = Array.from({ length: 1536 }, (_, index) => {
    if (index >= hash.length) return "0";
    return ((hash[index] - 128) / 128).toFixed(6);
  });
  return `[${values.join(",")}]`;
}

async function seedDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed local Postgres. Copy .env.example to .env or export DATABASE_URL.");
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    if (seedArgs.has("--reset-database")) {
      await resetSeededData(client);
    }
    await upsertSeededData(client);
    console.log("Seeded local Postgres with idempotent OpsDesk demo records.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not seed local Postgres at DATABASE_URL: ${message}`);
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function resetSeededData(client: Client) {
  await client.query("delete from audit_events where actor = 'opsdesk-demo-seed'");
  await client.query("delete from ai_runs where id = any($1::uuid[])", [demoAiRuns.map((run) => stableUuid(run.id))]);
  await client.query("delete from follow_up_tasks where id = any($1::uuid[])", [
    demoState.followUps.map((task) => stableUuid(task.id)),
  ]);
  await client.query("delete from ticket_drafts where id = any($1::uuid[])", [
    demoState.tickets
      .map((ticket) => ticket.draft?.id)
      .filter(Boolean)
      .map((id) => stableUuid(String(id))),
  ]);
  await client.query("delete from ticket_documents where id = any($1::uuid[])", [
    demoDocuments.map((document) => stableUuid(document.id)),
  ]);
  await client.query("delete from ticket_messages where ticket_id = any($1::uuid[])", [
    demoState.tickets.map((ticket) => stableUuid(ticket.id)),
  ]);
  await client.query("delete from tickets where id = any($1::uuid[])", [
    demoState.tickets.map((ticket) => stableUuid(ticket.id)),
  ]);
  await client.query("delete from agent_evaluation_runs where id = $1", [stableUuid("agent-eval:service-desk-golden-v1")]);
  await client.query("delete from agent_blueprints where id = $1", [stableUuid("agent-blueprint:opsdesk-triage")]);
  await client.query("delete from client_discovery_sessions where id = $1", [stableUuid("discovery:dragontech")]);
  await client.query("delete from knowledge_chunks where source_id = any($1::uuid[])", [
    searchDocuments.map((document) => stableUuid(`knowledge:${document.id}`)),
  ]);
  await client.query("delete from knowledge_sources where id = any($1::uuid[])", [
    searchDocuments.map((document) => stableUuid(`knowledge:${document.id}`)),
  ]);
  await client.query("delete from response_templates where id = any($1::uuid[])", [
    responseTemplates.map((template) => stableUuid(template.id)),
  ]);
  await client.query("delete from businesses where id = $1", [businessId]);
}

async function upsertSeededData(client: Client) {
  await client.query(
    `
      insert into businesses (id, name, trading_name)
      values ($1, $2, $3)
      on conflict (id) do update set
        name = excluded.name,
        trading_name = excluded.trading_name
    `,
    [businessId, "DragonTech Facilities Ltd", "DragonTech Facilities"],
  );

  for (const template of responseTemplates) {
    await client.query(
      `
        insert into response_templates (
          id, template_key, business_id, name, category, channel, purpose, required_info, body, auto_send_allowed, active, updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, true, now())
        on conflict (id) do update set
          name = excluded.name,
          category = excluded.category,
          channel = excluded.channel,
          purpose = excluded.purpose,
          required_info = excluded.required_info,
          body = excluded.body,
          auto_send_allowed = excluded.auto_send_allowed,
          active = excluded.active,
          updated_at = now()
      `,
      [
        stableUuid(template.id),
        template.id,
        businessId,
        template.name,
        template.category,
        template.channel,
        template.purpose,
        JSON.stringify(template.requiredInfo),
        template.body,
        template.autoSendAllowed,
      ],
    );
  }

  for (const ticket of demoState.tickets) {
    await client.query(
      `
        insert into tickets (
          id, business_id, number, title, customer_name, customer_company, customer_email, preferred_contact_method,
          channel, category, priority, status, sentiment, source_text, ai_summary, missing_info, risks,
          suggested_next_action, assigned_to, tags, automation_decision, due_at, created_at, updated_at
        )
        values (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15, $16::jsonb, $17::jsonb,
          $18, $19, $20::jsonb, $21::jsonb, $22, $23, $24
        )
        on conflict (id) do update set
          title = excluded.title,
          customer_name = excluded.customer_name,
          customer_company = excluded.customer_company,
          customer_email = excluded.customer_email,
          preferred_contact_method = excluded.preferred_contact_method,
          channel = excluded.channel,
          category = excluded.category,
          priority = excluded.priority,
          status = excluded.status,
          sentiment = excluded.sentiment,
          source_text = excluded.source_text,
          ai_summary = excluded.ai_summary,
          missing_info = excluded.missing_info,
          risks = excluded.risks,
          suggested_next_action = excluded.suggested_next_action,
          assigned_to = excluded.assigned_to,
          tags = excluded.tags,
          automation_decision = excluded.automation_decision,
          due_at = excluded.due_at,
          updated_at = excluded.updated_at
      `,
      [
        stableUuid(ticket.id),
        businessId,
        ticket.number,
        ticket.title,
        ticket.customerName,
        ticket.customerCompany,
        ticket.customerEmail,
        ticket.preferredContactMethod,
        ticket.channel,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.sentiment,
        ticket.sourceText,
        ticket.aiSummary,
        JSON.stringify(ticket.missingInfo),
        JSON.stringify(ticket.risks),
        ticket.suggestedNextAction,
        ticket.assignedTo,
        JSON.stringify(ticket.tags),
        ticket.automationDecision ? JSON.stringify(ticket.automationDecision) : null,
        toDate(ticket.dueAt),
        toDate(ticket.createdAt),
        toDate(ticket.updatedAt),
      ],
    );

    await client.query(
      `
        insert into ticket_messages (id, ticket_id, direction, author, body, is_ai_draft, created_at)
        values ($1, $2, 'inbound', $3, $4, false, $5)
        on conflict (id) do update set
          author = excluded.author,
          body = excluded.body
      `,
      [
        stableUuid(`message:${ticket.id}:inbound`),
        stableUuid(ticket.id),
        ticket.customerName,
        ticket.sourceText,
        toDate(ticket.createdAt),
      ],
    );

    if (ticket.draft) {
      await client.query(
        `
          insert into ticket_drafts (
            id, ticket_id, body, tone, status, template_id, channel, delivery_mode, created_by_run_id, updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          on conflict (id) do update set
            body = excluded.body,
            tone = excluded.tone,
            status = excluded.status,
            template_id = excluded.template_id,
            channel = excluded.channel,
            delivery_mode = excluded.delivery_mode,
            created_by_run_id = excluded.created_by_run_id,
            updated_at = excluded.updated_at
        `,
        [
          stableUuid(ticket.draft.id),
          stableUuid(ticket.id),
          ticket.draft.body,
          ticket.draft.tone,
          ticket.draft.status,
          ticket.draft.templateId ? stableUuid(ticket.draft.templateId) : null,
          ticket.draft.channel,
          ticket.draft.deliveryMode,
          stableUuid(ticket.draft.createdByRunId),
          toDate(ticket.draft.updatedAt),
        ],
      );
    }
  }

  for (const document of demoState.documents) {
    await client.query(
      `
        insert into ticket_documents (
          id, ticket_id, file_name, file_type, extracted_fields, mismatch_flags, uploaded_at
        )
        values ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7)
        on conflict (id) do update set
          file_name = excluded.file_name,
          file_type = excluded.file_type,
          extracted_fields = excluded.extracted_fields,
          mismatch_flags = excluded.mismatch_flags,
          uploaded_at = excluded.uploaded_at
      `,
      [
        stableUuid(document.id),
        stableUuid(document.ticketId),
        document.fileName,
        document.fileType,
        JSON.stringify(document.extractedFields),
        JSON.stringify(document.mismatchFlags),
        toDate(document.uploadedAt),
      ],
    );
  }

  for (const task of demoState.followUps) {
    await client.query(
      `
        insert into follow_up_tasks (id, ticket_id, title, owner, due_at, status, source)
        values ($1, $2, $3, $4, $5, $6, $7)
        on conflict (id) do update set
          title = excluded.title,
          owner = excluded.owner,
          due_at = excluded.due_at,
          status = excluded.status,
          source = excluded.source
      `,
      [stableUuid(task.id), stableUuid(task.ticketId), task.title, task.owner, toDate(task.dueAt), task.status, task.source],
    );
  }

  for (const run of demoAiRuns) {
    await client.query(
      `
        insert into ai_runs (
          id, ticket_id, action, model, prompt_version, input_hash, output, confidence, latency_ms,
          prompt_tokens, completion_tokens, estimated_cost_usd, validation_status, approval_status, created_at
        )
        values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15)
        on conflict (id) do update set
          action = excluded.action,
          model = excluded.model,
          prompt_version = excluded.prompt_version,
          input_hash = excluded.input_hash,
          output = excluded.output,
          confidence = excluded.confidence,
          latency_ms = excluded.latency_ms,
          prompt_tokens = excluded.prompt_tokens,
          completion_tokens = excluded.completion_tokens,
          estimated_cost_usd = excluded.estimated_cost_usd,
          validation_status = excluded.validation_status,
          approval_status = excluded.approval_status,
          created_at = excluded.created_at
      `,
      [
        stableUuid(run.id),
        run.ticketId ? stableUuid(run.ticketId) : null,
        run.action,
        run.model,
        run.promptVersion,
        run.inputHash,
        JSON.stringify(run.output),
        run.confidence,
        run.latencyMs,
        run.promptTokens,
        run.completionTokens,
        run.estimatedCostUsd,
        run.validationStatus,
        run.approvalStatus,
        toDate(run.createdAt),
      ],
    );
  }

  await seedKnowledge(client);
  await seedAgentRecords(client);
  await seedAuditEvents(client);
}

async function seedKnowledge(client: Client) {
  for (const document of searchDocuments) {
    const sourceId = stableUuid(`knowledge:${document.id}`);
    const sourceType = document.category === "ai_run" ? "metric" : document.category;
    await client.query(
      `
        insert into knowledge_sources (id, business_id, source_type, title, uri, content_hash, metadata, ingested_at)
        values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
        on conflict (id) do update set
          source_type = excluded.source_type,
          title = excluded.title,
          uri = excluded.uri,
          content_hash = excluded.content_hash,
          metadata = excluded.metadata,
          ingested_at = excluded.ingested_at
      `,
      [
        sourceId,
        businessId,
        sourceType,
        document.title,
        `opsdesk://knowledge/${document.id}`,
        createHash("sha256").update(`${document.id}:${document.summary}`).digest("hex"),
        JSON.stringify({
          category: document.category,
          sourceType: document.sourceType,
          risk: document.risk,
          owner: document.owner,
          aiAction: document.aiAction,
          ticketId: document.ticketId,
          aiRunId: document.aiRunId,
          documentId: document.documentId,
          citations: document.citations,
        }),
        toDate(document.lastIndexedAt),
      ],
    );

    await client.query(
      `
        insert into knowledge_chunks (id, source_id, chunk_index, body, embedding_model, embedding, metadata)
        values ($1, $2, 0, $3, 'demo-embedding-deterministic-v1', $4::vector, $5::jsonb)
        on conflict (id) do update set
          body = excluded.body,
          embedding_model = excluded.embedding_model,
          embedding = excluded.embedding,
          metadata = excluded.metadata
      `,
      [
        stableUuid(`chunk:${document.id}:0`),
        sourceId,
        document.summary,
        vectorLiteral(document.id),
        JSON.stringify({ citations: document.citations, customerCompany: document.customerCompany }),
      ],
    );
  }
}

async function seedAgentRecords(client: Client) {
  const discoveryId = stableUuid("discovery:dragontech");
  const blueprintId = stableUuid("agent-blueprint:opsdesk-triage");
  await client.query(
    `
      insert into client_discovery_sessions (
        id, business_id, domain_challenge, current_process, success_metrics, constraints, stakeholder_notes
      )
      values ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb)
      on conflict (id) do update set
        domain_challenge = excluded.domain_challenge,
        current_process = excluded.current_process,
        success_metrics = excluded.success_metrics,
        constraints = excluded.constraints,
        stakeholder_notes = excluded.stakeholder_notes
    `,
    [
      discoveryId,
      businessId,
      "Local service teams need faster triage, safe template follow-up, and fewer missed operational commitments.",
      "Shared inbox, manual document checks, ad hoc follow-up reminders, and no consistent AI audit trail.",
      JSON.stringify(["Reduce first response from 4h to 20m", "99.5% background job completion", "80% draft approval or edit rate"]),
      JSON.stringify(["No autonomous close, refund, price commitment, or risky customer contact", "Every AI action must be replayable"]),
      JSON.stringify({ sponsor: "Service operations", riskOwner: "Priya", dataOwner: "Morgan" }),
    ],
  );

  await client.query(
    `
      insert into agent_blueprints (
        id, business_id, name, stage, objective, prompt_version, orchestration, memory_policy,
        retrieval_policy, guardrails, reusable_components, updated_at
      )
      values ($1, $2, $3, 'pilot', $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, now())
      on conflict (id) do update set
        name = excluded.name,
        stage = excluded.stage,
        objective = excluded.objective,
        prompt_version = excluded.prompt_version,
        orchestration = excluded.orchestration,
        memory_policy = excluded.memory_policy,
        retrieval_policy = excluded.retrieval_policy,
        guardrails = excluded.guardrails,
        reusable_components = excluded.reusable_components,
        updated_at = now()
    `,
    [
      blueprintId,
      businessId,
      "OpsDesk triage and retrieval assistant",
      "Classify enquiries, retrieve evidence, draft approved replies, and route risky cases to human owners.",
      "triage-2026-05-20",
      JSON.stringify({ jobs: ["triage.ticket", "retrieve.context", "response.template_select", "agent.evaluate"] }),
      JSON.stringify({ scope: "tenant_ticket_history", retentionDays: 90 }),
      JSON.stringify({ vectorIndex: "knowledge_chunks_embedding_hnsw_idx", citationsRequired: true }),
      JSON.stringify(["Human approval for complaints", "No refunds or price commitments", "No outbound delivery unless enabled"]),
      JSON.stringify(["Prompt contracts", "RAG pipeline", "Evaluation harness", "Advisor pack"]),
    ],
  );

  await client.query(
    `
      insert into agent_evaluation_runs (
        id, blueprint_id, dataset_name, scenario_count, pass_rate, hallucination_rate,
        p95_latency_ms, cost_per_resolution_usd, roi_estimate
      )
      values ($1, $2, 'service-desk-golden-v1', 42, 0.91, 0.03, 1840, 0.018, $3::jsonb)
      on conflict (id) do update set
        scenario_count = excluded.scenario_count,
        pass_rate = excluded.pass_rate,
        hallucination_rate = excluded.hallucination_rate,
        p95_latency_ms = excluded.p95_latency_ms,
        cost_per_resolution_usd = excluded.cost_per_resolution_usd,
        roi_estimate = excluded.roi_estimate
    `,
    [stableUuid("agent-eval:service-desk-golden-v1"), blueprintId, JSON.stringify({ paybackWeeks: 7, weeklyHoursSaved: 11.4 })],
  );
}

async function seedAuditEvents(client: Client) {
  for (const event of eventEnvelopes) {
    await client.query(
      `
        insert into audit_events (id, ticket_id, actor, event_type, metadata, created_at)
        values ($1, $2, 'opsdesk-demo-seed', $3, $4::jsonb, $5)
        on conflict (id) do update set
          event_type = excluded.event_type,
          metadata = excluded.metadata,
          created_at = excluded.created_at
      `,
      [
        stableUuid(`audit:${event.id}`),
        stableUuid(event.ticketId),
        event.eventType,
        JSON.stringify({
          topic: event.topic,
          schemaVersion: event.schemaVersion,
          correlationId: event.correlationId,
          idempotencyKey: event.idempotencyKey,
          producer: event.producer,
          payload: event.payload,
        }),
        toDate(event.occurredAt),
      ],
    );
  }
}
