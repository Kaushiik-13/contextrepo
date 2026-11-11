import Link from "next/link";
import {
  Activity,
  BookOpenText,
  GitBranch,
  Layers3,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";

export type WorkspacePage = "library" | "proposals" | "activity" | "settings";

const navigation = [
  { id: "library", label: "Context library", href: "/", icon: BookOpenText },
  { id: "proposals", label: "Proposals", href: "/proposals", icon: GitBranch },
  { id: "activity", label: "Activity", href: "/activity", icon: Activity },
] as const;

function navClass(active: boolean) {
  return `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs transition-colors ${
    active
      ? "bg-stone-200/70 font-medium text-stone-900"
      : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
  }`;
}

function Sidebar({ activePage }: { activePage: WorkspacePage }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[230px] shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-stone-200 bg-stone-50/80 px-3 py-5 lg:flex">
      <Link href="/" aria-label="ContextOps home" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-stone-900 text-white">
          <Layers3 className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold tracking-tight text-stone-900">ContextOps</span>
      </Link>

      <div className="mb-7 rounded-lg border border-stone-200 bg-white px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Workspace</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-stone-100 text-xs font-semibold text-stone-700">C</span>
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-stone-800">ContextOps Demo</span>
        </div>
      </div>

      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">Project</p>
      <nav aria-label="Project navigation" className="space-y-1">
        {navigation.map(({ id, label, href, icon: Icon }) => (
          <Link key={id} href={href} aria-current={activePage === id ? "page" : undefined} className={navClass(activePage === id)}>
            <Icon className="size-4" aria-hidden="true" />{label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-stone-200 pt-3">
        <Link href="/settings" aria-current={activePage === "settings" ? "page" : undefined} className={navClass(activePage === "settings")}>
          <Settings className="size-4" aria-hidden="true" />Settings
        </Link>
      </div>
    </aside>
  );
}

function MobileNavigation({ activePage }: { activePage: WorkspacePage }) {
  return (
    <nav aria-label="Project navigation" className="sticky top-14 z-20 flex gap-1 overflow-x-auto border-b border-stone-200 bg-white px-3 py-2 lg:hidden">
      {[...navigation, { id: "settings" as const, label: "Settings", href: "/settings", icon: Settings }].map(({ id, label, href, icon: Icon }) => (
        <Link key={id} href={href} aria-current={activePage === id ? "page" : undefined} className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs transition-colors ${activePage === id ? "bg-stone-100 font-medium text-stone-900" : "text-stone-500 hover:bg-stone-50"}`}>
          <Icon className="size-3.5" aria-hidden="true" />{label}
        </Link>
      ))}
    </nav>
  );
}

export function WorkspaceShell({ activePage, children }: { activePage: WorkspacePage; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900">
      <Sidebar activePage={activePage} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 md:px-7">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-medium text-stone-700">ContextOps Demo</span><span className="text-stone-300">/</span>
            <span>{navigation.find((item) => item.id === activePage)?.label ?? "Settings"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] text-stone-500 sm:inline">LOCAL DEMO</span>
            <span className="flex size-7 items-center justify-center rounded-full bg-stone-900 text-[10px] font-semibold text-white" aria-label="ContextOps demo user">C</span>
          </div>
        </header>
        <MobileNavigation activePage={activePage} />
        <main className="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-[1600px] px-4 py-6 md:px-7 md:py-8">{children}</main>
      </div>
    </div>
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
      <div className="border-b border-stone-200 pb-5">
        <p className="text-[11px] font-medium text-violet-700">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-stone-500">{description}</p>
      </div>
      <section className="mt-6 rounded-lg border border-stone-200 bg-white p-5 md:p-6">
        {children}
      </section>
    </WorkspaceShell>
  );
}
