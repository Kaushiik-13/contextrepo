"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ActivityIcon,
  BookOpenTextIcon,
  GitBranchIcon,
  Layers3Icon,
  Settings2Icon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const primaryNavigation = [
  { title: "Context library", url: "/", icon: <BookOpenTextIcon /> },
  { title: "Proposals", url: "/proposals", icon: <GitBranchIcon /> },
  { title: "Activity", url: "/activity", icon: <ActivityIcon /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const items = primaryNavigation.map((item) => ({
    ...item,
    isActive: item.url === "/" ? pathname === "/" : pathname.startsWith(item.url),
  }))

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Layers3Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">ContextOps</span>
                <span className="truncate text-xs text-sidebar-foreground/60">Team workspace</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary
          items={[{ title: "Settings", url: "/settings", icon: <Settings2Icon />, isActive: pathname.startsWith("/settings") }]}
        />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default">
              <span className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">C</span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">ContextOps Demo</span>
                <span className="truncate text-xs text-sidebar-foreground/60">Local workspace</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
