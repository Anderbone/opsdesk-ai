import { randomUUID } from "node:crypto";
import { traceRuns } from "~/lib/trace-data";
import type { TraceRun, TraceSpan } from "~/lib/types";
import type { RuntimeConfig } from "~/shared/config/runtime";
import { getRuntimeConfig } from "~/shared/config/runtime";

export type SpanInput = Omit<TraceSpan, "id" | "startMs" | "durationMs"> & {
  id?: string;
  startMs?: number;
  durationMs?: number;
};

export type TraceMetadataInput = {
  ticketId: string;
  aiRunId?: string;
  title: string;
  status?: TraceRun["status"];
  startedAt?: string;
  spans?: SpanInput[];
};

export function createSpanMetadata(input: SpanInput): TraceSpan {
  return {
    id: input.id ?? `span-${randomUUID()}`,
    parentSpanId: input.parentSpanId,
    serviceName: input.serviceName,
    name: input.name,
    kind: input.kind,
    status: input.status,
    startMs: input.startMs ?? 0,
    durationMs: input.durationMs ?? 0,
    attributes: { ...input.attributes },
    linkedEventId: input.linkedEventId,
    linkedWebhookAttemptId: input.linkedWebhookAttemptId,
  };
}

export function createTraceMetadata(input: TraceMetadataInput, config: RuntimeConfig = getRuntimeConfig()): TraceRun {
  const spans = input.spans?.map(createSpanMetadata) ?? [];
  return {
    id: `trace-${input.ticketId}-${input.aiRunId ?? randomUUID()}`,
    ticketId: input.ticketId,
    aiRunId: input.aiRunId,
    title: input.title,
    status: input.status ?? "ok",
    startedAt: input.startedAt ?? new Date().toISOString(),
    durationMs: spans.reduce((max, span) => Math.max(max, span.startMs + span.durationMs), 0),
    mode: config.mode === "demo" ? "hosted_demo" : "production_path",
    spans,
  };
}

function cloneTraceRun(run: TraceRun): TraceRun {
  return {
    ...run,
    spans: run.spans.map((span) => ({ ...span, attributes: { ...span.attributes } })),
  };
}

export type TraceRepository = {
  listRuns(): TraceRun[];
  findByAiRunId(aiRunId: string): TraceRun | undefined;
};

export function createDemoTraceRepository(runs: TraceRun[] = traceRuns): TraceRepository {
  return {
    listRuns() {
      return runs.map(cloneTraceRun);
    },
    findByAiRunId(aiRunId) {
      const run = runs.find((item) => item.aiRunId === aiRunId);
      return run ? cloneTraceRun(run) : undefined;
    },
  };
}
