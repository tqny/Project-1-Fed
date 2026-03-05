import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import { enterpriseICPProfile } from "@/config/icpProfile";

type ConsolePageKey =
  | "overview"
  | "policy"
  | "problem"
  | "architecture"
  | "agent-workflow"
  | "github-evidence";

type ConsoleShellProps = {
  activePage: ConsolePageKey;
  title: string;
  description: string;
  badge?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const navSections: Array<{
  label: string;
  links: Array<{ id: ConsolePageKey; href: Route; label: string }>;
}> = [
  {
    label: "Dashboard",
    links: [{ id: "overview", href: "/opportunities", label: "Overview" }]
  },
  {
    label: "Scoring",
    links: [{ id: "policy", href: "/opportunities/policy", label: "Policy & Guardrails" }]
  },
  {
    label: "Project Story",
    links: [
      { id: "problem", href: "/opportunities/problem", label: "Problem" },
      { id: "architecture", href: "/opportunities/architecture", label: "System Architecture" }
    ]
  },
  {
    label: "Operations",
    links: [
      { id: "agent-workflow", href: "/opportunities/agent-workflow", label: "Agent Workflow" },
      { id: "github-evidence", href: "/opportunities/github-evidence", label: "GitHub + Evidence" }
    ]
  }
];

export function LeadConsoleShell({ activePage, title, description, badge, actions, children }: ConsoleShellProps) {
  return (
    <div className="ops-shell">
      <aside className="ops-sidebar card">
        <h2 className="ops-sidebar-title">Lead Ops Console</h2>
        {navSections.map((section) => (
          <div className="ops-nav-group" key={section.label}>
            <p className="meta">{section.label}</p>
            {section.links.map((link) => (
              <Link href={link.href} className={activePage === link.id ? "ops-nav active" : "ops-nav"} key={link.id}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}

        <div className="ops-nav-group">
          <p className="meta">Active Product Context</p>
          <p className="ops-sidebar-text">{enterpriseICPProfile.pretendCompany}</p>
          <p className="meta">{enterpriseICPProfile.pretendOffering}</p>
        </div>
      </aside>

      <section className="ops-main stack">
        <header className="card stack">
          <div className="row row-between">
            <div className="stack">
              <h1>{title}</h1>
              <p className="meta">{description}</p>
            </div>
            {badge ? <span className="badge">{badge}</span> : null}
          </div>
          {actions ? <div className="stack">{actions}</div> : null}
        </header>
        {children}
      </section>
    </div>
  );
}
