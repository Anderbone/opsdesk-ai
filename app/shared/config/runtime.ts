export type OpsDeskMode = "demo" | "local" | "prod";

export type RuntimeConfig = {
  mode: OpsDeskMode;
  aiModel: string;
  sessionSecret: string;
  databaseUrl?: string;
  redpandaBrokers?: string;
  opensearchUrl?: string;
  neo4jUri?: string;
  neo4jUser?: string;
  neo4jPassword?: string;
  webhookOutboundEnabled: boolean;
  missingDependencies: string[];
};

const validModes = new Set<OpsDeskMode>(["demo", "local", "prod"]);
const demoSessionSecret = "opsdesk-ai-demo-session-secret";

function readMode(value: string | undefined): OpsDeskMode {
  if (!value) return "demo";
  if (validModes.has(value as OpsDeskMode)) return value as OpsDeskMode;
  throw new Error(`Invalid OPS_DESK_MODE "${value}". Expected demo, local, or prod.`);
}

function requiredDependencies(mode: OpsDeskMode, env: NodeJS.ProcessEnv) {
  if (mode === "demo") return [];

  const missing: string[] = [];
  if (!env.DATABASE_URL) missing.push("DATABASE_URL");
  if (mode === "prod" && (!env.SESSION_SECRET || env.SESSION_SECRET === demoSessionSecret)) {
    missing.push("SESSION_SECRET");
  }
  return missing;
}

export function getRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const mode = readMode(env.OPS_DESK_MODE);

  return {
    mode,
    aiModel: env.AI_MODEL ?? "demo-local-ai",
    sessionSecret: env.SESSION_SECRET ?? demoSessionSecret,
    databaseUrl: env.DATABASE_URL,
    redpandaBrokers: env.REDPANDA_BROKERS,
    opensearchUrl: env.OPENSEARCH_URL,
    neo4jUri: env.NEO4J_URI,
    neo4jUser: env.NEO4J_USER,
    neo4jPassword: env.NEO4J_PASSWORD,
    webhookOutboundEnabled: env.WEBHOOK_DELIVERY_ENABLED === "true" || env.WEBHOOK_OUTBOUND_ENABLED === "true",
    missingDependencies: requiredDependencies(mode, env),
  };
}

export function assertRuntimeReady(config: RuntimeConfig = getRuntimeConfig()) {
  if (config.missingDependencies.length > 0) {
    throw new Error(
      `OPS_DESK_MODE=${config.mode} is missing required configuration: ${config.missingDependencies.join(", ")}`,
    );
  }
}

export const runtimeConfig = getRuntimeConfig();
