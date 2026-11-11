"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActivityIcon,
  BookOpenTextIcon,
  GitBranchIcon,
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
              <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <ContextOpsMark className="size-5" />
              </span>
              <span className="grid flex-1 text-left leading-tight">
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
      </SidebarContent>
      <SidebarFooter className="flex-row items-center gap-1.5">
        <SidebarMenu className="min-w-0 flex-1 gap-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-10 cursor-default gap-1.5 px-1.5 hover:bg-transparent active:bg-transparent"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
                {user.login.slice(0, 1).toUpperCase()}
              </span>
              <span className="grid min-w-0 flex-1 text-left leading-tight">
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
        <SidebarMenu className="w-9 shrink-0 p-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              aria-label="Settings"
              isActive={pathname.startsWith("/settings")}
              render={<Link href="/settings" />}
              className="justify-center px-0 hover:bg-slate-200/70 hover:text-foreground data-active:bg-white data-active:text-violet-900 data-active:shadow-sm data-active:ring-1 data-active:ring-violet-200 data-active:hover:bg-white dark:hover:bg-slate-800 dark:data-active:bg-slate-900 dark:data-active:text-violet-200 dark:data-active:ring-violet-900"
            >
              <Settings2Icon />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
