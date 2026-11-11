import { AlertCircle, GitBranch, Search, Sparkles } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { ContextRecordTable } from "@/components/context-record-table";
import { LoadingScreen } from "@/components/loading-screen";
import { SectionCards } from "@/components/section-cards";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContextRecord, ContextType } from "@/lib/context";
import { requireWorkspace } from "@/lib/server-workspace";

const API_URL = process.env.CONTEXTOPS_API_URL ?? "http://localhost:4000/api";
const TYPES: ContextType[] = [
  "decision",
  "requirement",
  "constraint",
  "research",
  "rejected-approach",
  "open-question",
  "project-state",
];
const TYPE_LABELS: Record<ContextType, string> = {
  decision: "Decision",
  requirement: "Requirement",
  constraint: "Constraint",
  research: "Research",
  "rejected-approach": "Rejected approach",
  "open-question": "Open question",
  "project-state": "Project state",
};
const TYPE_FILTER_COLORS: Record<ContextType, string> = {
  decision:
    "text-violet-700 hover:bg-violet-50 data-[active=true]:bg-violet-100 data-[active=true]:text-violet-900 dark:text-violet-300 dark:hover:bg-violet-950/50 dark:data-[active=true]:bg-violet-950",
  requirement:
    "text-blue-700 hover:bg-blue-50 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/50 dark:data-[active=true]:bg-blue-950",
  constraint:
    "text-orange-700 hover:bg-orange-50 data-[active=true]:bg-orange-100 data-[active=true]:text-orange-900 dark:text-orange-300 dark:hover:bg-orange-950/50 dark:data-[active=true]:bg-orange-950",
  research:
    "text-cyan-700 hover:bg-cyan-50 data-[active=true]:bg-cyan-100 data-[active=true]:text-cyan-900 dark:text-cyan-300 dark:hover:bg-cyan-950/50 dark:data-[active=true]:bg-cyan-950",
  "rejected-approach":
    "text-rose-700 hover:bg-rose-50 data-[active=true]:bg-rose-100 data-[active=true]:text-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/50 dark:data-[active=true]:bg-rose-950",
  "open-question":
    "text-amber-700 hover:bg-amber-50 data-[active=true]:bg-amber-100 data-[active=true]:text-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/50 dark:data-[active=true]:bg-amber-950",
  "project-state":
    "text-slate-600 hover:bg-slate-100 data-[active=true]:bg-slate-200 data-[active=true]:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:data-[active=true]:bg-slate-800",
};

type SearchParams = Promise<{ q?: string; type?: string }>;

async function getContext(search: string, type: string) {
  const url = new URL(`${API_URL}/context`);
  if (search) url.searchParams.set("q", search);
  if (type) url.searchParams.set("type", type);
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return { items: [] as ContextRecord[], error: true };
    const result = (await response.json()) as { items: ContextRecord[] };
    return { items: result.items, error: false };
  } catch {
    return { items: [] as ContextRecord[], error: true };
  }
}

function filterHref(search: string, type: string) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (type) params.set("type", type);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function FilterLink({
  label,
  active,
  href,
  color,
}: {
  label: string;
  active: boolean;
  href: string;
  color?: string;
}) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      data-active={active}
      className={`shrink-0 rounded-md px-3 py-1.5 text-xs transition-colors ${color ?? (active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")} ${active ? "font-medium" : ""}`}
    >
      {label}
    </a>
  );
}

function LoadingShell() {
  return <LoadingScreen variant="workspace" />;
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<LoadingShell />}>
      <ContextDashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function ContextDashboard({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const workspace = await requireWorkspace();
  const project = workspace.project!;
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const activeType = params.type ?? "";
  const result = await getContext(search, activeType);

  return (
    <WorkspaceShell activePage="library" workspace={workspace}>
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col justify-between gap-3 px-4 lg:flex-row lg:items-end lg:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-violet-700">
              {project.fullName} · your project
            </p>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] text-stone-950">
              Shared context
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-600">
              Team decisions, their reasoning, and project knowledge shared
              across AI assistants.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`w-fit gap-1.5 ${project.connectionStatus === "connected" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : project.connectionStatus === "verification_unavailable" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-rose-200 bg-rose-50 text-rose-800"}`}
            >
              <GitBranch className="size-3.5" aria-hidden="true" />
              {project.connectionStatus === "connected"
                ? "GitHub connected"
                : project.connectionStatus === "verification_unavailable"
                  ? "Connection check unavailable"
                  : "GitHub access needs attention"}
            </Badge>
            <Badge
              variant="outline"
              className="w-fit gap-1.5 border-stone-200 bg-white font-normal text-stone-600"
            >
              Sample records
            </Badge>
          </div>
        </div>

        {project.connectionStatus !== "connected" && (
          <div
            role="alert"
            className={`mx-4 flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between lg:mx-6 ${project.connectionStatus === "verification_unavailable" ? "border-amber-200 bg-amber-50 text-amber-950" : "border-rose-200 bg-rose-50 text-rose-950"}`}
          >
            <div>
              <p className="font-medium">
                {project.connectionStatus === "verification_unavailable"
                  ? "GitHub access could not be checked"
                  : "GitHub repository access needs attention"}
              </p>
              <p className="mt-1 text-xs leading-5 opacity-80">
                Your saved project is still here. Reconnect access in GitHub to
                restore repository operations.
              </p>
            </div>
            <a
              href={`${API_URL}/auth/github/reconnect`}
              className={buttonVariants({
                variant: "outline",
                className:
                  "h-8 shrink-0 border-current bg-white/80 px-3 text-xs",
              })}
            >
              Reconnect GitHub
            </a>
          </div>
        )}

        {result.error && (
          <div
            role="alert"
            className="mx-4 flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-950 lg:mx-6"
          >
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">The context service isn’t running.</p>
              <p className="mt-1 text-xs">
                Start the NestJS API, then refresh the page.
              </p>
            </div>
          </div>
        )}

        <SectionCards records={result.items} />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive records={result.items} />
        </div>

        <section
          aria-labelledby="context-records-heading"
          className="space-y-4 px-4 lg:px-6"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3
                id="context-records-heading"
                className="text-lg font-semibold tracking-tight"
              >
                Context records
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.items.length}{" "}
                {result.items.length === 1 ? "record" : "records"} · Select a
                row to see its reasoning.
              </p>
            </div>
            <Button disabled variant="outline" className="w-fit">
              <Sparkles className="mr-2 size-4" aria-hidden="true" />
              Propose context · coming later
            </Button>
          </div>

          <form action="/" method="get" className="flex gap-2">
            {activeType && (
              <input type="hidden" name="type" value={activeType} />
            )}
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Search decisions, reasoning, constraints…"
                aria-label="Search context records"
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          <nav
            aria-label="Filter by context type"
            className="flex gap-1 overflow-x-auto border-b pb-2"
          >
            <FilterLink
              label="All types"
              active={!activeType}
              href={filterHref(search, "")}
            />
            {TYPES.map((type) => (
              <FilterLink
                key={type}
                label={TYPE_LABELS[type]}
                active={activeType === type}
                href={filterHref(search, type)}
                color={TYPE_FILTER_COLORS[type]}
              />
            ))}
          </nav>
          <ContextRecordTable records={result.items} />
          <p className="text-xs text-muted-foreground">
            Demo records only. The database decision shown in an example record
            is not a ContextOps database choice.
          </p>
        </section>
      </div>
    </WorkspaceShell>
  );
}
