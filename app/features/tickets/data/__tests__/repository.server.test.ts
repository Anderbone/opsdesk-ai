import { describe, expect, it } from "vitest";
import {
  createTicketFromEnquiry,
  getState,
  resetDemoState,
} from "~/features/tickets/data/repository.server";

function requestWithCookie(cookie?: string) {
  return new Request("http://localhost/dashboard", {
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

function cookieFrom(headers: Headers | Record<string, string>) {
  const setCookie = headers instanceof Headers ? headers.get("Set-Cookie") : headers["Set-Cookie"];
  if (!setCookie) throw new Error("Expected Set-Cookie header");
  return setCookie.split(";")[0];
}

function enquiry(overrides: Partial<Parameters<typeof createTicketFromEnquiry>[1]> = {}) {
  return {
    name: "Elliot Hughes",
    company: "Oakline Fitness",
    email: "elliot@oakline.example",
    preferredContactMethod: "message",
    title: "Urgent Wi-Fi outage in reception",
    message: "Our Wi-Fi and internet are offline in reception. Please treat this as urgent.",
    ...overrides,
  };
}

describe("demo repository state", () => {
  it("returns seeded tickets, AI runs, documents, and follow-ups", async () => {
    const state = await getState();

    expect(state.tickets.map((ticket) => ticket.id)).toEqual(
      expect.arrayContaining(["tkt-cctv", "tkt-wifi", "tkt-invoice", "tkt-complaint"]),
    );
    expect(state.aiRuns.length).toBeGreaterThan(0);
    expect(state.documents.length).toBeGreaterThan(0);
    expect(state.followUps.length).toBeGreaterThan(0);
  });

  it("replays created enquiries into session-backed state", async () => {
    const { ticket, headers } = await createTicketFromEnquiry(requestWithCookie(), enquiry());

    const state = await getState(requestWithCookie(cookieFrom(headers)));

    expect(ticket).toMatchObject({
      customerCompany: "Oakline Fitness",
      category: "incident",
      priority: "urgent",
      assignedTo: "Priya",
    });
    expect(state.tickets[0]).toMatchObject({
      id: ticket?.id,
      customerCompany: "Oakline Fitness",
      status: "awaiting_approval",
    });
    expect(state.aiRuns.filter((run) => run.ticketId === ticket?.id)).toHaveLength(2);
    expect(state.followUps[0]).toMatchObject({
      ticketId: ticket?.id,
      owner: "Priya",
    });
  });

  it("reset clears session events through the repository boundary", async () => {
    const created = await createTicketFromEnquiry(requestWithCookie(), enquiry({
      title: "Need CCTV quote",
      message: "We need a quote for CCTV in a small warehouse.",
    }));
    const createdCookie = cookieFrom(created.headers);

    const resetHeaders = await resetDemoState(requestWithCookie(createdCookie));
    const resetState = await getState(requestWithCookie(cookieFrom(resetHeaders)));

    expect(resetState.tickets.some((ticket) => ticket.id === created.ticket?.id)).toBe(false);
    expect(resetState.tickets[0].id).toBe("tkt-cctv");
  });
});
