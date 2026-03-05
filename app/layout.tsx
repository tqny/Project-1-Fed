import type { Metadata } from "next";

import "@/app/globals.css";
import { getActiveThemeClass } from "@/lib/design-system";

export const metadata: Metadata = {
  title: "Federal Opportunity Intelligence",
  description: "Evidence-first federal opportunity intelligence for AI compliance GTM workflows"
};

export const dynamic = "force-dynamic";

const criticalFallbackCss = `
  :where(html), :where(body) { margin: 0; padding: 0; min-height: 100%; background: #12151c; color: #f3f5fa; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
  :where(a) { color: inherit; text-decoration: none; }
  :where(main) { max-width: 1180px; margin: 0 auto; padding: 24px 16px 32px; }
  :where(.ops-shell) { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 12px; }
  :where(.ops-main), :where(.stack) { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
  :where(.row) { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  :where(.row-between) { justify-content: space-between; }
  :where(.card) { background: #171b24; border: 1px solid #2e3444; border-radius: 10px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
  :where(.ops-nav-group) { display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid #2e3444; }
  :where(.ops-nav) { display: inline-flex; align-items: center; padding: 8px 10px; border: 1px solid transparent; border-radius: 6px; color: #a0a7b9; }
  :where(.ops-nav.active) { color: #f3f5fa; border-color: #2e3444; background: #1c212d; }
  :where(.meta) { color: #a0a7b9; font-size: 14px; }
  :where(.badge), :where(.pill), :where(.status) { display: inline-block; padding: 3px 8px; border-radius: 999px; border: 1px solid #2e3444; background: #232938; color: #d7ff2f; font-size: 12px; font-weight: 600; }
  :where(.ops-kpi-grid) { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  :where(.ops-analysis-grid) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  :where(table) { width: 100%; border-collapse: collapse; font-size: 14px; }
  :where(th), :where(td) { border-bottom: 1px solid #2e3444; text-align: left; padding: 12px; vertical-align: top; }
  :where(th) { background: #1c212d; text-transform: uppercase; letter-spacing: 0.03em; font-size: 12px; }
  :where(.flow-x) { overflow-x: auto; }
  @media (max-width: 860px) { :where(.ops-shell) { grid-template-columns: 1fr; } :where(.ops-kpi-grid), :where(.ops-analysis-grid) { grid-template-columns: 1fr; } }
`;

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeThemeClass = await getActiveThemeClass();

  return (
    <html lang="en" className={activeThemeClass}>
      <body className={activeThemeClass}>
        <style>{criticalFallbackCss}</style>
        <main>{children}</main>
      </body>
    </html>
  );
}
