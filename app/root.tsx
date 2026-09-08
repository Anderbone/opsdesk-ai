import type { LinksFunction, MetaFunction } from "react-router";
import { useState } from "react";
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
  Github,
  Home,
  Inbox,
  Mail,
  MoreHorizontal,
  Network,
  MonitorCheck,
  Plus,
  RadioTower,
  Search,
  ServerCog,
  X,
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isMobileNavOpen ? "open" : ""}`} aria-label="Main menu">
        <NavLink to="/" className="brand-lockup">
          <span className="brand-mark">
            <Bot size={20} />
          </span>
          <span>
            <strong>OpsDesk AI</strong>
            <small>DragonTech Facilities</small>
          </span>
        </NavLink>

        <button
          className="sidebar-close"
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <X size={18} />
        </button>

        <nav id="main-navigation" className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
              onClick={() => setIsMobileNavOpen(false)}
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

        <a
          className="sidebar-source"
          href="https://github.com/Anderbone/opsdesk-ai"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={16} />
          <span>View source</span>
        </a>
      </aside>
      <button
        className={`nav-backdrop ${isMobileNavOpen ? "open" : ""}`}
        type="button"
        aria-label="Close menu"
        onClick={() => setIsMobileNavOpen(false)}
      />

      <div className="main-region">
        <header className="topbar">
          <button
            className="mobile-nav-toggle"
            type="button"
            aria-label="Open menu"
            aria-expanded={isMobileNavOpen}
            aria-controls="main-navigation"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <MoreHorizontal size={22} />
          </button>
          <div className="topbar-title">
            <span className="eyebrow">AI service desk demo</span>
            <strong>Live operations workspace</strong>
          </div>
          <div className="topbar-right">
            <a className="topbar-mail" href="mailto:yn.jiyu@gmail.com" aria-label="Email Jiyu">
              <Mail size={15} />
              <span>Contact</span>
            </a>
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
