import { clsx } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import type { TicketPriority, TicketStatus } from "~/features/tickets/domain/types";

export function PageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {kicker ? <span className="eyebrow">{kicker}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

export function Button({
  children,
  tone = "secondary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <button className={clsx("button", `button-${tone}`, className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  tone = "secondary",
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  tone?: "primary" | "secondary" | "ghost";
}) {
  return (
    <a className={clsx("button", `button-${tone}`, className)} {...props}>
      {children}
    </a>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={clsx("badge", `priority-${priority}`)}>{priority}</span>;
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={clsx("badge", `status-${status}`)}>{status.replaceAll("_", " ")}</span>;
}

export function Metric({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}

export function RelativeTime({ value }: { value: string }) {
  return <time dateTime={value}>{formatDistanceToNowStrict(new Date(value), { addSuffix: true })}</time>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}
