import { expect, test } from "@playwright/test";

test("homepage renders product title and navigates to dashboard", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /customer requests become reviewed desk work/i })).toBeVisible();
  await page.getByRole("link", { name: /open the desk/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /ai-assisted service desk/i })).toBeVisible();
});

test("dashboard shows seeded tickets and opens a ticket", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByText("CCTV quote request for warehouse expansion")).toBeVisible();
  await page.getByRole("link", { name: /CCTV quote request for warehouse expansion/i }).click();
  await expect(page).toHaveURL(/\/tickets\/tkt-cctv$/);
  await expect(page.getByRole("heading", { name: /CCTV quote request for warehouse expansion/i })).toBeVisible();
  await expect(page.getByText(/Auto response allowed/i)).toBeVisible();
});

test("enquiry form submits and redirects to the created ticket", async ({ page }) => {
  await page.goto("/enquiry");

  await page.getByRole("button", { name: /submit and run ai triage/i }).click();

  await expect(page).toHaveURL(/\/tickets\/tkt-/);
  await expect(page.getByRole("heading", { name: /Need quote for CCTV and access control/i })).toBeVisible();
  await expect(page.locator(".eyebrow", { hasText: /Oakline Fitness/i })).toBeVisible();
});

test("watchtower shows AI run metrics", async ({ page }) => {
  await page.goto("/watchtower");

  await expect(page.getByRole("heading", { name: /every ai action is visible/i })).toBeVisible();
  await expect(page.getByLabel("AI run metrics")).toContainText("AI runs");
  await expect(page.getByLabel("Demo trace view")).toContainText("CCTV quote auto-response");
  await expect(page.getByText(/OpenTelemetry exporter path/i)).toBeVisible();
  await expect(page.getByRole("table")).toContainText("document.extract");
});

test("agent delivery and architecture routes render", async ({ page }) => {
  await page.goto("/agent-delivery");
  await expect(page.getByRole("heading", { name: /client challenge to production ai agent/i })).toBeVisible();

  await page.goto("/architecture");
  await expect(page.getByRole("heading", { name: /follow one wi-fi incident through the stack/i })).toBeVisible();
  await expect(page.getByText("Worker contract")).toBeVisible();
});

test("case study shows media, architecture, and audit story", async ({ page }) => {
  await page.goto("/case-study");

  await expect(page.getByRole("heading", { name: /^opsdesk ai$/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /if you only have a few minutes/i })).toBeVisible();
  await expect(page.getByLabel("Solution, role, and tradeoffs")).toContainText("My role");
  await expect(page.getByText("Screenshots and GIF")).toBeVisible();
  await expect(page.getByLabel("OpsDesk AI architecture diagram")).toContainText("Watchtower");
  await expect(page.getByText("AI can prepare work. Humans own risk.")).toBeVisible();
});

test("platform route renders production path and contract map", async ({ page }) => {
  await page.goto("/platform");

  await expect(page.getByRole("heading", { name: /hosted demo today, production path tomorrow/i })).toBeVisible();
  await expect(page.getByText("Serverless AWS path")).toBeVisible();
  await expect(page.getByText("ticket.lifecycle.v2")).toBeVisible();
});

test("events route filters contract simulator topics", async ({ page }) => {
  await page.goto("/events");

  await expect(page.getByRole("heading", { name: /kafka-shaped contracts without kafka/i })).toBeVisible();
  await expect(page.getByLabel("Event metrics")).toContainText("Events shown");
  await expect(page.getByText("document.quantity_mismatch.detected")).toBeVisible();
});

test("webhooks route shows signing and replay controls", async ({ page }) => {
  await page.goto("/webhooks");

  await expect(page.getByRole("heading", { name: /signed webhooks with replayable delivery/i })).toBeVisible();
  await expect(page.getByLabel("Webhook delivery metrics")).toContainText("Delivered");
  await page.getByRole("button", { name: /^Replay$/ }).first().click();
  await expect(page.getByText(/Replayed whd-/)).toBeVisible();
});

test("knowledge route searches documents and graph relationships", async ({ page }) => {
  await page.goto("/knowledge?q=invoice&risk=high&owner=Morgan&category=document");

  await expect(page.getByRole("heading", { name: /operational knowledge with citations/i })).toBeVisible();
  await expect(page.getByText("Invoice and delivery note mismatch")).toBeVisible();
  await expect(page.getByText("Supplier issue affecting open invoices")).toBeVisible();
});
