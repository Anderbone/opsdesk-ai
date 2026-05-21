import type { LinksFunction, MetaFunction } from "react-router";
import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";
import {
  Activity,
  Bot,
  FileText,
  Gauge,
  Home,
  Inbox,
  Network,
  MonitorCheck,
  Plus,
  RadioTower,
  Search,
  ServerCog,
  Webhook,
  Workflow,
} from "lucide-react";
import "./styles/app.css";

export const meta: MetaFunction = () => [
  { title: "OpsDesk AI" },
  {
    name: "description",
    content: "AI service desk demo for local business operations.",
  },
];

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
  },
];

const navItems = [
  { to: "/", label: "Overview", icon: Home },
  { to: "/dashboard", label: "Desk", icon: Inbox },
  { to: "/enquiry", label: "Enquiry", icon: Plus },
  { to: "/watchtower", label: "Watchtower", icon: MonitorCheck },
  { to: "/agent-delivery", label: "Agent Delivery", icon: Workflow },
  { to: "/platform", label: "Platform", icon: ServerCog },
  { to: "/events", label: "Events", icon: Network },
  { to: "/webhooks", label: "Webhooks", icon: Webhook },
  { to: "/knowledge", label: "Knowledge", icon: Search },
  { to: "/case-study", label: "Case Study", icon: FileText },
  { to: "/architecture", label: "Architecture", icon: RadioTower },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigation = useNavigation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand-lockup">
          <span className="brand-mark">
            <Bot size={20} />
          </span>
          <span>
            <strong>OpsDesk AI</strong>
            <small>DragonTech Facilities</small>
          </span>
        </NavLink>

        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-status">
          <div className="status-orbit">
            <Gauge size={18} />
          </div>
          <div>
            <strong>Policy-gated AI</strong>
            <span>Approved templates can auto-send; risky cases queue for review.</span>
          </div>
        </div>
      </aside>

      <div className="main-region">
        <header className="topbar">
          <div>
            <span className="eyebrow">AI service desk demo</span>
            <strong>Live operations workspace</strong>
          </div>
          <div className="topbar-right">
            <span className="live-chip">
              <Activity size={14} />
              Demo data
            </span>
            {navigation.state !== "idle" ? <span className="sync-dot" aria-label="Loading" /> : null}
          </div>
        </header>
        <main className="workspace">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="error-screen">
      <h1>OpsDesk hit an error</h1>
      <p>{error.message}</p>
      <a href="/dashboard">Return to dashboard</a>
    </div>
  );
}
