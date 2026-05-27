import { createHash, randomUUID } from "node:crypto";
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

export type OtlpAttributeValue = {
  stringValue?: string;
  intValue?: number;
  doubleValue?: number;
  boolValue?: boolean;
};

export type OtlpJsonTracePayload = {
  resourceSpans: Array<{
    resource: {
      attributes: Array<{ key: string; value: OtlpAttributeValue }>;
    };
    scopeSpans: Array<{
      scope: { name: string; version: string };
      spans: Array<{
        traceId: string;
        spanId: string;
        parentSpanId?: string;
        name: string;
        kind: string;
        startTimeUnixNano: string;
        endTimeUnixNano: string;
        attributes: Array<{ key: string; value: OtlpAttributeValue }>;
        status: { code: string; message?: string };
      }>;
    }>;
  }>;
};

const spanKindMap: Record<TraceSpan["kind"], string> = {
  server: "SPAN_KIND_SERVER",
  client: "SPAN_KIND_CLIENT",
  producer: "SPAN_KIND_PRODUCER",
  consumer: "SPAN_KIND_CONSUMER",
  internal: "SPAN_KIND_INTERNAL",
};

const statusCodeMap: Record<TraceSpan["status"], string> = {
  ok: "STATUS_CODE_OK",
  error: "STATUS_CODE_ERROR",
  needs_review: "STATUS_CODE_UNSET",
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

function stableHexId(value: string, length: number) {
  return createHash("sha256").update(value).digest("hex").slice(0, length);
}

function toUnixNano(value: string, offsetMs: number) {
  const unixMs = new Date(value).getTime() + offsetMs;
  return String(BigInt(unixMs) * 1_000_000n);
}

function toOtlpValue(value: string | number | boolean): OtlpAttributeValue {
  if (typeof value === "boolean") return { boolValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { intValue: value } : { doubleValue: value };
  }
  return { stringValue: value };
}

function appendTracePath(endpoint: string) {
  const cleanEndpoint = endpoint.replace(/\/$/, "");
  return cleanEndpoint.endsWith("/v1/traces") ? cleanEndpoint : `${cleanEndpoint}/v1/traces`;
}

export function getOtlpTraceExportTarget(config: RuntimeConfig = getRuntimeConfig()) {
  const endpoint = config.otelExporterOtlpTracesEndpoint ?? (
    config.otelExporterOtlpEndpoint ? appendTracePath(config.otelExporterOtlpEndpoint) : undefined
  );

  return {
    enabled: Boolean(endpoint),
    endpoint,
    serviceName: config.otelServiceName,
    headers: { ...config.otelExporterOtlpHeaders },
  };
}

export function createOtlpTracePayload(
  run: TraceRun,
  config: RuntimeConfig = getRuntimeConfig(),
): OtlpJsonTracePayload {
  const traceId = stableHexId(run.id, 32);

  return {
    resourceSpans: [
      {
        resource: {
          attributes: [
            { key: "service.name", value: { stringValue: config.otelServiceName } },
            { key: "deployment.environment", value: { stringValue: config.mode } },
            { key: "opsdesk.ticket_id", value: { stringValue: run.ticketId } },
            { key: "opsdesk.ai_run_id", value: { stringValue: run.aiRunId ?? "unlinked" } },
            { key: "opsdesk.trace_mode", value: { stringValue: run.mode } },
          ],
        },
        scopeSpans: [
          {
            scope: { name: "opsdesk-ai/watchtower", version: "1.0.0" },
            spans: run.spans.map((span) => ({
              traceId,
              spanId: stableHexId(`${run.id}:${span.id}`, 16),
              parentSpanId: span.parentSpanId ? stableHexId(`${run.id}:${span.parentSpanId}`, 16) : undefined,
              name: span.name,
              kind: spanKindMap[span.kind],
              startTimeUnixNano: toUnixNano(run.startedAt, span.startMs),
              endTimeUnixNano: toUnixNano(run.startedAt, span.startMs + span.durationMs),
              attributes: [
                { key: "service.name", value: { stringValue: span.serviceName } },
                { key: "opsdesk.ticket_id", value: { stringValue: run.ticketId } },
                ...(run.aiRunId ? [{ key: "opsdesk.ai_run_id", value: { stringValue: run.aiRunId } }] : []),
                ...(span.linkedEventId
                  ? [{ key: "opsdesk.event_id", value: { stringValue: span.linkedEventId } }]
                  : []),
                ...(span.linkedWebhookAttemptId
                  ? [{ key: "opsdesk.webhook_attempt_id", value: { stringValue: span.linkedWebhookAttemptId } }]
                  : []),
                ...Object.entries(span.attributes).map(([key, value]) => ({
                  key: `opsdesk.${key}`,
                  value: toOtlpValue(value),
                })),
              ],
              status: {
                code: statusCodeMap[span.status],
                message: span.status === "needs_review" ? "Queued for human review" : undefined,
              },
            })),
          },
        ],
      },
    ],
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
