import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export type WorkspacePage = "library" | "proposals" | "activity" | "settings";

const pageTitles: Record<WorkspacePage, string> = {
  library: "Shared context",
  proposals: "Proposals",
  activity: "Activity",
  settings: "Settings",
};

export function WorkspaceShell({
  activePage,
  children,
}: {
  activePage: WorkspacePage;
  children: ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title={pageTitles[activePage]} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function SectionPage({
  activePage,
  eyebrow,
  title,
  description,
  children,
}: {
  activePage: WorkspacePage;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <WorkspaceShell activePage={activePage}>
      <div className="px-4 lg:px-6">
        <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <section className="mx-4 rounded-xl border bg-card p-5 text-card-foreground lg:mx-6 md:p-6">
        {children}
      </section>
    </WorkspaceShell>
  );
}
