import PgBoss from "pg-boss";
import { loadLocalEnv } from "./lib/local-env";

loadLocalEnv();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "DATABASE_URL is required to run the pg-boss worker. Start Postgres with `docker compose --profile postgres up -d` and copy .env.example to .env.",
  );
  process.exit(1);
}

const boss = new PgBoss({ connectionString });

try {
  await boss.start();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Could not start the pg-boss worker against DATABASE_URL: ${message}`);
  console.error("Verify Postgres is healthy, then run `pnpm db:push` before starting the worker.");
  process.exit(1);
}

const jobs = [
  "triage.ticket",
  "response.template_select",
  "extract.document",
  "suggest.followup",
  "knowledge.ingest",
  "retrieve.context",
  "agent.evaluate",
  "webhook.deliver",
  "audit.event.project",
];

for (const jobName of jobs) {
  await boss.work(jobName, async ([job]) => {
    console.log(jobName, job.data);
  });
}

console.log(`OpsDesk pg-boss worker running. Registered jobs: ${jobs.join(", ")}.`);

process.on("SIGINT", async () => {
  await boss.stop();
  process.exit(0);
});
