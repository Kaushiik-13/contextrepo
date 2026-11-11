"use client"

import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="gap-1.5">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={item.isActive}
                render={<Link href={item.url} />}
                className="hover:bg-slate-200/70 hover:text-foreground data-active:bg-white data-active:text-violet-900 data-active:shadow-sm data-active:ring-1 data-active:ring-violet-200 data-active:hover:bg-white data-active:hover:text-violet-900 dark:hover:bg-slate-800 dark:data-active:bg-slate-900 dark:data-active:text-violet-200 dark:data-active:ring-violet-900"
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
