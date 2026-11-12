"use client";

import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
  }[];
}) {
  return (
    <SidebarGroup className="px-2 pt-3">
      <SidebarGroupContent className="flex flex-col gap-2">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400 group-data-[collapsible=icon]:hidden">
          Workspace
        </p>
        <SidebarMenu className="gap-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className="relative">
              <SidebarMenuButton
                tooltip={item.title}
                isActive={item.isActive}
                render={
                  <Link
                    href={item.url}
                    aria-current={item.isActive ? "page" : undefined}
                  />
                }
                className="group/nav h-11 rounded-xl px-3 text-[13px] font-medium text-stone-600 transition-[background,color,transform] duration-150 hover:translate-x-0.5 hover:bg-white/80 hover:text-stone-950 data-active:bg-white data-active:text-violet-950 data-active:shadow-[0_3px_12px_-9px_rgba(28,25,23,0.5)] data-active:ring-1 data-active:ring-stone-200/80 data-active:hover:translate-x-0"
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors ${item.isActive ? "bg-violet-100 text-violet-800" : "text-stone-500 group-hover/nav:bg-stone-100 group-hover/nav:text-stone-800"}`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.title}</span>
                {item.isActive && (
                  <span
                    className="mr-1 size-1.5 rounded-full bg-violet-600 group-data-[collapsible=icon]:hidden"
                    aria-hidden="true"
                  />
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
