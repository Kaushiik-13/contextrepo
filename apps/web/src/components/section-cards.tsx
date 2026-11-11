import {
  BookOpenTextIcon,
  CircleHelpIcon,
  DatabaseIcon,
  Layers3Icon,
} from "lucide-react";

import type { ContextRecord } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionCards({ records }: { records: ContextRecord[] }) {
  const cards = [
    {
      label: "Context records",
      value: records.length,
      note: "Across this project",
      icon: BookOpenTextIcon,
      color:
        "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
    },
    {
      label: "Decisions",
      value: records.filter((record) => record.type === "decision").length,
      note: "Team choices with rationale",
      icon: DatabaseIcon,
      color:
        "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    },
    {
      label: "Open questions",
      value: records.filter((record) => record.type === "open-question").length,
      note: "Need a team answer",
      icon: CircleHelpIcon,
      color:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      label: "Context types",
      value: new Set(records.map((record) => record.type)).size,
      note: "Kinds of project knowledge",
      icon: Layers3Icon,
      color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4">
      {cards.map(({ label, value, note, icon: Icon, color }) => (
        <Card
          key={label}
          className="border-stone-200 bg-white shadow-[0_14px_38px_-34px_rgba(28,25,23,0.38)]"
        >
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {value}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{note}</span>
            <span
              className={`flex size-8 items-center justify-center rounded-lg ${color}`}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
