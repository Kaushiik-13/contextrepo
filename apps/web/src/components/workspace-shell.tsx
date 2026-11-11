import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireWorkspace, type WorkspaceState } from "@/lib/server-workspace";

export type WorkspacePage = "library" | "proposals" | "activity" | "settings";

const pageTitles: Record<WorkspacePage, string> = {
  library: "Shared context",
  proposals: "Proposals",
  activity: "Activity",
  settings: "Settings",
};

export async function WorkspaceShell({
  activePage,
  children,
  workspace: providedWorkspace,
}: {
  activePage: WorkspacePage;
  children: ReactNode;
  workspace?: WorkspaceState;
}) {
  const workspace = providedWorkspace ?? (await requireWorkspace());
  const project = workspace.project;
  if (!project) return null;
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={workspace.user} project={project} />
      <SidebarInset>
        <SiteHeader title={pageTitles[activePage]} />
        <div className="flex flex-1 flex-col bg-stone-50/80">
          <div className="@container/main mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-5 py-5 md:gap-7 md:py-7">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export async function SectionPage({
  activePage,
  eyebrow,
  title,
  description,
  children,
  workspace: providedWorkspace,
}: {
  activePage: WorkspacePage;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  workspace?: WorkspaceState;
}) {
  const workspace = providedWorkspace ?? (await requireWorkspace());
  return (
    <WorkspaceShell activePage={activePage} workspace={workspace}>
      <div className="px-4 lg:px-7">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-violet-700">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] text-stone-950">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-600">
          {description}
        </p>
      </div>
      <section className="mx-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-[0_16px_50px_-42px_rgba(28,25,23,0.42)] lg:mx-7 md:p-7">
        {children}
      </section>
    </WorkspaceShell>
  );
}
