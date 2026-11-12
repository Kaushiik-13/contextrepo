"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActivityIcon,
  BookOpenTextIcon,
  GitBranchIcon,
  ArrowUpRightIcon,
  Settings2Icon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { WorkspaceProject, WorkspaceUser } from "@/lib/server-workspace";
import { ContextOpsMark } from "@/components/contextops-mark";

const primaryNavigation = [
  { title: "Context library", url: "/", icon: <BookOpenTextIcon /> },
  { title: "Proposals", url: "/proposals", icon: <GitBranchIcon /> },
  { title: "Activity", url: "/activity", icon: <ActivityIcon /> },
];

export function AppSidebar({
  user,
  project,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: WorkspaceUser;
  project: WorkspaceProject;
}) {
  const pathname = usePathname();
  const items = primaryNavigation.map((item) => ({
    ...item,
    isActive:
      item.url === "/" ? pathname === "/" : pathname.startsWith(item.url),
  }));

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <ContextOpsMark className="size-5" />
              </span>
              <span className="group-data-[collapsible=icon]:hidden grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">
                  ContextOps
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {project.fullName}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
        <div className="group-data-[collapsible=icon]:hidden mx-3 mt-5 rounded-xl border border-stone-200/80 bg-white/75 p-3.5 shadow-[0_4px_16px_-14px_rgba(28,25,23,0.4)]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Connected project
            </p>
            <span
              className={`size-1.5 rounded-full ${project.connectionStatus === "connected" ? "bg-emerald-500" : "bg-amber-500"}`}
              aria-label={
                project.connectionStatus === "connected"
                  ? "Connected"
                  : "Needs attention"
              }
            />
          </div>
          <p
            className="mt-2 truncate text-sm font-medium text-stone-900"
            title={project.fullName}
          >
            {project.fullName}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-stone-500">
            <span className="flex min-w-0 items-center gap-1.5 truncate">
              <GitBranchIcon className="size-3 shrink-0" aria-hidden="true" />
              {project.defaultBranch}
            </span>
            <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-stone-600">
              {project.contextStatus === "ready"
                ? "Context ready"
                : "Setup needed"}
            </span>
          </div>
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 transition-colors hover:text-violet-800"
          >
            Open repository{" "}
            <ArrowUpRightIcon className="size-3" aria-hidden="true" />
          </a>
        </div>
      </SidebarContent>
      <SidebarFooter className="flex-row items-center gap-1.5">
        <SidebarMenu className="min-w-0 flex-1 gap-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Account settings"
              aria-label={`${user.login} account settings`}
              render={<Link href="/settings" />}
              className="h-10 gap-1.5 px-1.5 hover:bg-slate-200/70 hover:text-foreground dark:hover:bg-slate-800"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
                {user.login.slice(0, 1).toUpperCase()}
              </span>
              <span className="group-data-[collapsible=icon]:hidden grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-xs font-medium">
                  {user.login}
                </span>
                <span className="truncate text-[10px] text-sidebar-foreground/60">
                  GitHub connected
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu className="group-data-[collapsible=icon]:hidden w-9 shrink-0 p-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              aria-label="Settings"
              render={<Link href="/settings" />}
              className="justify-center px-0 hover:bg-slate-200/70 hover:text-foreground dark:hover:bg-slate-800"
            >
              <Settings2Icon />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
