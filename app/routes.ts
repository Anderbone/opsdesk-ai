import {
  index,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  index("features/home/route.tsx"),
  route("favicon.ico", "routes/favicon.ts"),
  route("dashboard", "features/tickets/routes/dashboard.route.tsx"),
  route("tickets/:ticketId", "features/tickets/routes/ticket-detail.route.tsx"),
  route("enquiry", "features/tickets/routes/enquiry.route.tsx"),
  route("watchtower", "features/watchtower/routes/watchtower.route.tsx"),
  route("agent-delivery", "features/agent-delivery/routes/agent-delivery.route.tsx"),
  route("platform", "routes/platform.tsx"),
  route("events", "routes/events.tsx"),
  route("webhooks", "routes/webhooks.tsx"),
  route("knowledge", "routes/knowledge.tsx"),
  route("case-study", "features/case-study/routes/case-study.route.tsx"),
  route("architecture", "features/architecture/routes/architecture.route.tsx"),
] satisfies RouteConfig;
