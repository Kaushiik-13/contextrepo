import {
  ArrowDownUp,
  ArrowUpRight,
  Check,
  CircleHelp,
  Clock3,
  Database,
  FileCheck2,
  FlaskConical,
  GitBranch,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ContextRecord, ContextType } from "@/lib/context";
import { WorkspaceShell } from "@/components/workspace-shell";

const API_URL = process.env.CONTEXTOPS_API_URL ?? "http://localhost:4000/api";

const TYPE_META: Record<
  ContextType,
  { label: string; icon: typeof Database; color: string }
> = {
  decision: {
    label: "Decision",
    icon: Database,
    color: "border-violet-200 bg-violet-50 text-violet-700",
  },
  requirement: {
    label: "Requirement",
    icon: FileCheck2,
    color: "border-sky-200 bg-sky-50 text-sky-700",
  },
  constraint: {
    label: "Constraint",
    icon: ShieldCheck,
    color: "border-amber-200 bg-amber-50 text-amber-800",
  },
  research: {
    label: "Research",
    icon: FlaskConical,
    color: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  "rejected-approach": {
    label: "Rejected approach",
    icon: XCircle,
    color: "border-rose-200 bg-rose-50 text-rose-700",
  },
  "open-question": {
    label: "Open question",
    icon: CircleHelp,
    color: "border-orange-200 bg-orange-50 text-orange-800",
  },
  "project-state": {
    label: "Project state",
    icon: Clock3,
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
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
    <Badge variant="outline" className={`gap-1.5 rounded-md px-2 py-1 font-medium ${meta.color}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

function ContextTable({
  items,
  selectedId,
  search,
  type,
}: {
  items: ContextRecord[];
  selectedId?: string;
  search: string;
  type: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 py-16 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-stone-100 text-stone-500">
          <Search className="size-4" aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-medium text-stone-800">No matching context</p>
        <p className="mt-1 text-xs text-stone-500">Try another search or context type.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50/80 text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-400">
            <th scope="col" className="px-4 py-3 font-semibold">Context</th>
            <th scope="col" className="px-4 py-3 font-semibold">Type</th>
            <th scope="col" className="px-4 py-3 font-semibold">Tags</th>
            <th scope="col" className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-1"><ArrowDownUp className="size-3" aria-hidden="true" /> Updated</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((record) => {
            const selected = selectedId === record.id;
            return (
              <tr key={record.id} className={`border-b border-stone-100 last:border-0 ${selected ? "bg-violet-50/60" : "hover:bg-stone-50/70"}`}>
                <td className="max-w-[420px] px-4 py-3.5">
                  <a href={queryHref(search, type, record.id)} aria-current={selected ? "true" : undefined} className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                    <span className="block truncate text-[13px] font-medium text-stone-900">{record.title}</span>
                    <span className="mt-1 block line-clamp-1 text-xs text-stone-500">{record.summary}</span>
                  </a>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5"><TypeBadge type={record.type} /></td>
                <td className="max-w-[180px] px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {record.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded bg-stone-100 px-1.5 py-1 text-[10px] text-stone-500">{tag}</span>)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-stone-500">{formatDate(record.updatedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ContextDetails({ record }: { record: ContextRecord }) {
  return (
    <Card className="overflow-hidden rounded-lg border-stone-200 bg-white py-0 shadow-none">
      <div className="border-b border-stone-200 px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">Decision trail</span>
          <Badge variant="outline" className="gap-1 rounded-md border-emerald-200 bg-emerald-50 text-emerald-700">
            <Check className="size-3" aria-hidden="true" /> Approved
          </Badge>
        </div>
        <h2 className="mt-3 text-base font-semibold leading-6 tracking-tight text-stone-900">{record.title}</h2>
        <div className="mt-2"><TypeBadge type={record.type} /></div>
      </div>
      <CardContent className="space-y-5 px-4 py-4">
        <DetailSection label="Question"><p>{record.question}</p></DetailSection>
        <DetailSection label="Outcome"><p className="font-medium text-stone-800">{record.summary}</p></DetailSection>
        <DetailSection label="Why the team chose it"><p>{record.rationale}</p></DetailSection>
        {record.constraints.length > 0 && <DetailSection label="Constraints"><ul className="list-disc space-y-1 pl-4">{record.constraints.map((item) => <li key={item}>{item}</li>)}</ul></DetailSection>}
        {record.alternatives.length > 0 && <DetailSection label="Alternatives discussed"><ul className="list-disc space-y-1 pl-4">{record.alternatives.map((item) => <li key={item}>{item}</li>)}</ul></DetailSection>}
        <div className="rounded-md bg-violet-50/80 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700"><Sparkles className="size-3.5" aria-hidden="true" /> Discussion trail</p>
          <p className="mt-2 text-xs leading-5 text-stone-700">{record.discussionSummary}</p>
        </div>
        <div className="border-t border-stone-100 pt-4">
          <DetailSection label="Source notes"><ul className="space-y-1.5">{record.sourceReferences.map((source) => <li key={source} className="flex items-start gap-1.5"><ArrowUpRight className="mt-0.5 size-3 shrink-0" aria-hidden="true" />{source}</li>)}</ul></DetailSection>
          <p className="mt-3 text-[10px] text-stone-400">Added by {record.owner} · {formatDate(record.updatedAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">{label}</h3>
      <div className="mt-1.5 text-xs leading-5 text-stone-600">{children}</div>
    </section>
  );
}

function LoadingShell() {
  return <main className="min-h-screen bg-stone-50 px-6 py-12 text-center text-sm text-stone-500">Loading shared context…</main>;
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return <Suspense fallback={<LoadingShell />}><ContextWorkspace searchParams={searchParams} /></Suspense>;
}

async function ContextWorkspace({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const activeType = params.type ?? "";
  const result = await getContext(search, activeType);
  const selected = result.items.find((item) => item.id === params.selected) ?? result.items[0];

  return (
    <WorkspaceShell activePage="library">
          <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-medium text-violet-700">TEAM KNOWLEDGE</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">Shared context</h1>
              <p className="mt-1.5 max-w-2xl text-sm text-stone-500">Decisions and the reasoning behind them, available to everyone on the project.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <GitBranch className="size-3.5" aria-hidden="true" /> Sample Markdown repository
              <span className="size-1.5 rounded-full bg-amber-400" aria-label="Local demo source" />
            </div>
          </div>

          {result.error && (
            <div role="alert" className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              <p className="font-medium">The context service isn’t running.</p>
              <p className="mt-1">Start the NestJS API, then refresh this page.</p>
            </div>
          )}

          <div className="mt-6 grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_370px]">
            <section aria-labelledby="library-heading" className="min-w-0 overflow-hidden rounded-lg border border-stone-200 bg-white">
              <div className="border-b border-stone-200 p-4 md:px-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 id="library-heading" className="text-sm font-semibold text-stone-900">Context records</h2>
                    <p className="mt-1 text-xs text-stone-500">{result.items.length} {result.items.length === 1 ? "record" : "records"} · select one to inspect its reasoning</p>
                  </div>
                  <Button disabled variant="outline" className="h-8 w-fit rounded-md border-stone-200 px-3 text-xs text-stone-400">
                    <Sparkles className="mr-1.5 size-3.5" aria-hidden="true" /> Propose context <span className="ml-1 text-[10px]">Coming later</span>
                  </Button>
                </div>
                <form action="/" method="get" className="mt-4 flex gap-2">
                  {activeType && <input type="hidden" name="type" value={activeType} />}
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-400" aria-hidden="true" />
                    <Input type="search" name="q" defaultValue={search} placeholder="Search titles, reasons, alternatives…" aria-label="Search context records" className="h-9 rounded-md border-stone-200 pl-9 text-xs shadow-none placeholder:text-stone-400" />
                  </div>
                  <Button type="submit" className="h-9 rounded-md bg-stone-900 px-3.5 text-xs text-white hover:bg-stone-700">Search</Button>
                </form>
                <nav aria-label="Filter by context type" className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
                  <FilterLink label="All types" active={!activeType} href={queryHref(search, "")} />
                  {TYPES.map((type) => <FilterLink key={type} label={TYPE_META[type].label} active={activeType === type} href={queryHref(search, type)} />)}
                </nav>
              </div>
              <ContextTable items={result.items} selectedId={selected?.id} search={search} type={activeType} />
            </section>

            <aside aria-label="Selected context details" className="min-w-0 2xl:sticky 2xl:top-[4.5rem] 2xl:max-h-[calc(100dvh-5.5rem)] 2xl:overflow-y-auto 2xl:overscroll-contain">
              {selected ? <ContextDetails record={selected} /> : (
                <Card className="rounded-lg border-stone-200 py-0 shadow-none">
                  <CardContent className="px-5 py-8 text-center text-xs text-stone-500">Select a context record to see the decision and its discussion trail.</CardContent>
                </Card>
              )}
              <p className="mt-2 px-1 text-[10px] leading-4 text-stone-400">Demo records only. The database example is illustrative, not a finalized project decision.</p>
            </aside>
          </div>
    </WorkspaceShell>
  );
}

function FilterLink({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <a href={href} aria-current={active ? "page" : undefined} className={`shrink-0 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${active ? "border-stone-300 bg-stone-100 text-stone-900" : "border-transparent text-stone-500 hover:border-stone-200 hover:bg-stone-50 hover:text-stone-800"}`}>
      {label}
    </a>
  );
}
