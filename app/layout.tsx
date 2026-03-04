import type { Metadata } from "next";

import "@/app/globals.css";
import { getActiveThemeClass } from "@/lib/design-system";

export const metadata: Metadata = {
  title: "Federal Opportunity Intelligence",
  description: "Evidence-first federal opportunity intelligence for AI compliance GTM workflows"
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeThemeClass = await getActiveThemeClass();

  return (
    <html lang="en" className={activeThemeClass}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
