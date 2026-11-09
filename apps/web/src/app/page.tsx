import {
  AlertCircle,
  ArrowUpRight,
  BookOpenText,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Database,
  FileCheck2,
  FlaskConical,
  GitBranch,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ContextRecord, ContextType } from "@/lib/context";

const API_URL = process.env.CONTEXTOPS_API_URL ?? "http://localhost:4000/api";

const TYPE_META: Record<
  ContextType,
  { label: string; icon: typeof Database; color: string }
> = {
  decision: {
    label: "Decision",
    icon: Database,
    color: "text-indigo-700 bg-indigo-50 border-indigo-100",
  },
  requirement: {
    label: "Requirement",
    icon: FileCheck2,
    color: "text-blue-700 bg-blue-50 border-blue-100",
  },
  constraint: {
    label: "Constraint",
    icon: ShieldCheck,
    color: "text-amber-700 bg-amber-50 border-amber-100",
  },
  research: {
    label: "Research",
    icon: FlaskConical,
    color: "text-violet-700 bg-violet-50 border-violet-100",
  },
  "rejected-approach": {
    label: "Rejected approach",
    icon: XCircle,
    color: "text-rose-700 bg-rose-50 border-rose-100",
  },
  "open-question": {
    label: "Open question",
    icon: CircleHelp,
    color: "text-orange-700 bg-orange-50 border-orange-100",
  },
  "project-state": {
    label: "Project state",
    icon: Clock3,
    color: "text-emerald-700 bg-emerald-50 border-emerald-100",
  },
};

const TYPES = Object.keys(TYPE_META) as ContextType[];

type SearchParams = Promise<{
  q?: string;
  type?: string;
  selected?: string;
}>;

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

function queryHref(search: string, type: string, selected?: string) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (type) params.set("type", type);
  if (selected) params.set("selected", selected);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function formatDate(value: string) {
  if (!value) return "Recently updated";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function TypeBadge({ type }: { type: ContextType }) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-full px-2.5 py-1 font-medium ${meta.color}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-slate-200/80 bg-white px-4 py-5 lg:flex lg:flex-col">
      <a className="mb-9 flex items-center gap-3 px-2" href="/" aria-label="ContextOps home">
        <span className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
          <Layers3 className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-[15px] font-semibold tracking-tight text-slate-900">
            ContextOps
          </span>
          <span className="block text-[11px] text-slate-500">Team context</span>
        </span>
      </a>

      <div className="mb-7 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Workspace
        </p>
        <div className="mt-2 flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left">
          <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-semibold text-indigo-700">
            C
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-slate-800">
              ContextOps demo
            </span>
            <span className="block text-[10px] text-slate-500">Sample project</span>
          </span>
          <ChevronDown className="size-3.5 text-slate-400" aria-hidden="true" />
        </div>
      </div>

      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Project
      </p>
      <nav aria-label="Main navigation" className="space-y-1">
        <a
          href="/"
          aria-current="page"
          className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2.5 text-sm font-medium text-indigo-700"
        >
          <BookOpenText className="size-4" aria-hidden="true" />
          Shared context
          <span className="ml-auto size-1.5 rounded-full bg-indigo-600" />
        </a>
        <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400">
          <GitBranch className="size-4" aria-hidden="true" />
          Proposals
          <span className="ml-auto text-[10px]">Later phase</span>
        </span>
        <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400">
          <Clock3 className="size-4" aria-hidden="true" />
          Releases
          <span className="ml-auto text-[10px]">Later phase</span>
        </span>
      </nav>

      <div className="mt-auto rounded-xl bg-slate-950 p-4 text-white">
        <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-white/10">
          <Sparkles className="size-4 text-indigo-200" aria-hidden="true" />
        </div>
        <p className="text-xs font-semibold">Why was this decided?</p>
        <p className="mt-1.5 text-[11px] leading-5 text-slate-300">
          ContextOps keeps the reasoning, so the next AI doesn’t start from zero.
        </p>
      </div>
    </aside>
  );
}

function ContextListItem({
  record,
  selected,
  search,
  type,
}: {
  record: ContextRecord;
  selected: boolean;
  search: string;
  type: string;
}) {
  return (
    <a
      href={queryHref(search, type, record.id)}
      aria-current={selected ? "true" : undefined}
      className={`block rounded-xl border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        selected
          ? "border-indigo-200 bg-indigo-50/60 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={record.type} />
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
          <Check className="size-3.5" aria-hidden="true" /> Approved
        </span>
        <span className="ml-auto text-[11px] text-slate-400">
          {formatDate(record.updatedAt)}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-6 text-slate-900">
        {record.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
        {record.summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {record.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}

function ContextDetails({ record }: { record: ContextRecord }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
            Decision trail
          </CardTitle>
          <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
            <Check className="mr-1 size-3" aria-hidden="true" /> Approved
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-5 py-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Question
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-700">{record.question}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Outcome
          </p>
          <p className="mt-1.5 text-xs font-medium leading-5 text-slate-800">
            {record.summary}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Why the team chose it
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-600">{record.rationale}</p>
        </div>
        {record.constraints.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Constraints
            </p>
            <ul className="mt-2 space-y-2">
              {record.constraints.map((constraint) => (
                <li key={constraint} className="flex gap-2 text-xs leading-5 text-slate-600">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-indigo-400" />
                  {constraint}
                </li>
              ))}
            </ul>
          </div>
        )}
        {record.alternatives.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Other options discussed
            </p>
            <ul className="mt-2 space-y-2">
              {record.alternatives.map((alternative) => (
                <li key={alternative} className="flex gap-2 text-xs leading-5 text-slate-600">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-300" />
                  {alternative}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-indigo-700">
            <Sparkles className="size-3.5" aria-hidden="true" /> Discussion context
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-700">{record.discussionSummary}</p>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Source notes
          </p>
          <ul className="mt-2 space-y-1.5">
            {record.sourceReferences.map((source) => (
              <li key={source} className="flex items-start gap-2 text-[11px] leading-5 text-slate-500">
                <ArrowUpRight className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {source}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400">
            <span>Added by {record.owner}</span>
            <span>{formatDate(record.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingShell() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] px-5 py-12 text-center text-sm text-slate-500">
      Loading the team’s approved context…
    </main>
  );
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<LoadingShell />}>
      <ContextWorkspace searchParams={searchParams} />
    </Suspense>
  );
}

async function ContextWorkspace({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const activeType = params.type ?? "";
  const result = await getContext(search, activeType);
  const selected = result.items.find((item) => item.id === params.selected) ?? result.items[0];

  return (
    <div className="flex min-h-screen bg-[#f7f8fc] text-slate-900">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 md:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>ContextOps demo</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-800">Shared context</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500">
              Demo records
            </Badge>
            <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
              CO
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-7 md:px-8 md:py-9">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
                Project knowledge
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-[28px]">
                Shared context
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Decisions, the reasons behind them, and important project notes—ready for every teammate and AI assistant.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-600 shadow-sm">
              <GitBranch className="size-4 text-slate-400" aria-hidden="true" />
              <span>Sample context repository</span>
              <span className="size-1.5 rounded-full bg-amber-400" aria-label="Local demo source" />
            </div>
          </div>

          <section aria-label="Context summary" className="mt-7 grid gap-3 sm:grid-cols-3">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="flex items-center gap-3.5 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpenText className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xl font-semibold tracking-tight">{result.items.length}</span>
                  <span className="block text-xs text-slate-500">Approved records</span>
                </span>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="flex items-center gap-3.5 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Layers3 className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xl font-semibold tracking-tight">7</span>
                  <span className="block text-xs text-slate-500">Context types</span>
                </span>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="flex items-center gap-3.5 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Sparkles className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold tracking-tight">Reasoning included</span>
                  <span className="block text-xs text-slate-500">Not just the final answer</span>
                </span>
              </CardContent>
            </Card>
          </section>

          {result.error && (
            <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">The context service isn’t running.</p>
                <p className="mt-1 text-xs leading-5 text-amber-800">
                  Start the NestJS API from the repository root, then refresh this page.
                </p>
              </div>
            </div>
          )}

          <div className="mt-7 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section aria-labelledby="context-list-heading" className="min-w-0">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 id="context-list-heading" className="text-sm font-semibold text-slate-900">
                    Context library
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Search the team’s approved knowledge and decision trails.
                  </p>
                </div>
                <Button disabled variant="outline" className="w-fit gap-2 rounded-lg border-slate-200 bg-white text-xs text-slate-400">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Propose context · next phase
                </Button>
              </div>

              <form action="/" method="get" className="flex gap-2">
                {activeType && <input type="hidden" name="type" value={activeType} />}
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <Input
                    type="search"
                    name="q"
                    defaultValue={search}
                    placeholder="Search decisions, reasoning, constraints..."
                    aria-label="Search context records"
                    className="h-10 rounded-lg border-slate-200 bg-white pl-9 text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>
                <Button type="submit" className="h-10 rounded-lg bg-indigo-600 px-4 text-xs text-white hover:bg-indigo-700">
                  Search
                </Button>
              </form>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Filter by context type">
                <a href={queryHref(search, "")} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium ${!activeType ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                  All types
                </a>
                {TYPES.map((type) => (
                  <a key={type} href={queryHref(search, type)} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium ${activeType === type ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                    {TYPE_META[type].label}
                  </a>
                ))}
              </div>

              <div className="mb-3 mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>{result.items.length} {result.items.length === 1 ? "record" : "records"}</span>
                <span>Sorted by recent update</span>
              </div>

              {result.items.length > 0 ? (
                <div className="space-y-2.5">
                  {result.items.map((record) => (
                    <ContextListItem
                      key={record.id}
                      record={record}
                      selected={selected?.id === record.id}
                      search={search}
                      type={activeType}
                    />
                  ))}
                </div>
              ) : (
                <Card className="rounded-2xl border-dashed border-slate-300 bg-white/70 shadow-none">
                  <CardContent className="flex flex-col items-center px-6 py-12 text-center">
                    <span className="flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Search className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-sm font-medium text-slate-800">No matching context</p>
                    <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                      Try another phrase or select a different context type.
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>

            <aside aria-label="Selected context details" className="xl:sticky xl:top-5">
              {selected ? (
                <ContextDetails record={selected} />
              ) : (
                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardContent className="p-6 text-center text-xs text-slate-500">
                    Select a context record to see its decision trail.
                  </CardContent>
                </Card>
              )}
              <p className="mt-3 px-2 text-[10px] leading-5 text-slate-400">
                Sample content for the ContextOps demo. The database choice shown here is illustrative and is not a finalized ContextOps decision.
              </p>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
