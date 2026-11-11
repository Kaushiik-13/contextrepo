"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Database,
  FileCheck2,
  FlaskConical,
  ShieldCheck,
  CircleHelp,
  Clock3,
  XCircle,
} from "lucide-react";

import type { ContextRecord, ContextType } from "@/lib/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const typeMeta: Record<ContextType, { label: string; icon: typeof Database }> =
  {
    decision: { label: "Decision", icon: Database },
    requirement: { label: "Requirement", icon: FileCheck2 },
    constraint: { label: "Constraint", icon: ShieldCheck },
    research: { label: "Research", icon: FlaskConical },
    "rejected-approach": { label: "Rejected approach", icon: XCircle },
    "open-question": { label: "Open question", icon: CircleHelp },
    "project-state": { label: "Project state", icon: Clock3 },
  };

const typeColors: Record<ContextType, string> = {
  decision:
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-300",
  requirement:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300",
  constraint:
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-300",
  research:
    "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-300",
  "rejected-approach":
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300",
  "open-question":
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  "project-state":
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
};

function formatDate(value: string) {
  if (!value) return "Recently updated";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function TypeBadge({ type }: { type: ContextType }) {
  const { label, icon: Icon } = typeMeta[type];
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 font-medium ${typeColors[type]}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </Badge>
  );
}

function DetailGroup({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-2 ${className}`}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
        {title}
      </h3>
      <div className="text-[15px] leading-7 text-stone-800">{children}</div>
    </section>
  );
}

export function ContextRecordTable({ records }: { records: ContextRecord[] }) {
  const [selected, setSelected] = useState<ContextRecord | null>(null);

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_14px_38px_-34px_rgba(28,25,23,0.38)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Context</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length > 0 ? (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-left font-medium text-foreground"
                        onClick={() => setSelected(record)}
                      >
                        {record.title}
                      </Button>
                      <p className="mt-1 line-clamp-1 max-w-lg text-xs text-muted-foreground">
                        {record.summary}
                      </p>
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={record.type} />
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                        <Check className="size-3.5" aria-hidden="true" />{" "}
                        Approved
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {record.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(record.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-28 text-center text-sm text-muted-foreground"
                  >
                    No context records match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        {selected && (
          <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-xl">
            <SheetHeader className="shrink-0 gap-2 border-b border-stone-200 bg-gradient-to-r from-white to-stone-50 px-5 pb-5 pt-6">
              <div className="flex items-center justify-between gap-3 pr-8">
                <TypeBadge type={selected.type} />
                <Badge
                  variant="outline"
                  className="gap-1.5 font-normal text-emerald-700"
                >
                  <Check className="size-3.5" aria-hidden="true" />
                  Approved
                </Badge>
              </div>
              <SheetTitle className="pt-1 pr-8 text-left text-2xl leading-tight tracking-tight">
                {selected.title}
              </SheetTitle>
              <SheetDescription className="text-left">
                Approved context · decision and reasoning
              </SheetDescription>
            </SheetHeader>
            <div className="context-detail-scroll min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
              <DetailGroup
                title="Question"
                className="rounded-xl border border-stone-200 bg-white p-4"
              >
                <p>{selected.question}</p>
              </DetailGroup>
              <DetailGroup
                title="Outcome"
                className="rounded-xl border border-violet-200/80 bg-violet-50/60 p-4"
              >
                <p className="font-medium text-stone-950">{selected.summary}</p>
              </DetailGroup>
              <DetailGroup title="Why the team chose it">
                <p>{selected.rationale}</p>
              </DetailGroup>
              {selected.constraints.length > 0 && (
                <DetailGroup title="Constraints">
                  <ul className="list-disc space-y-1 pl-5">
                    {selected.constraints.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </DetailGroup>
              )}
              {selected.alternatives.length > 0 && (
                <DetailGroup title="Alternatives discussed">
                  <ul className="list-disc space-y-1 pl-5">
                    {selected.alternatives.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </DetailGroup>
              )}
              {selected.discussionSummary && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
                    Discussion trail
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    {selected.discussionSummary}
                  </p>
                </div>
              )}
              {selected.sourceReferences.length > 0 && (
                <DetailGroup title="Source notes">
                  <ul className="space-y-2">
                    {selected.sourceReferences.map((source) => (
                      <li
                        key={source}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <ArrowUpRight
                          className="mt-1 size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        {source}
                      </li>
                    ))}
                  </ul>
                </DetailGroup>
              )}
              <p className="border-t border-stone-200 pt-4 text-xs text-stone-500">
                Added by {selected.owner} · {formatDate(selected.updatedAt)}
              </p>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </>
  );
}
