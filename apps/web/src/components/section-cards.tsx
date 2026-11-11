import {
  BookOpenTextIcon,
  CircleHelpIcon,
  DatabaseIcon,
  Layers3Icon,
} from "lucide-react"

import type { ContextRecord } from "@/lib/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SectionCards({ records }: { records: ContextRecord[] }) {
  const cards = [
    { label: "Context records", value: records.length, note: "Across this project", icon: BookOpenTextIcon },
    { label: "Decisions", value: records.filter((record) => record.type === "decision").length, note: "Team choices with rationale", icon: DatabaseIcon },
    { label: "Open questions", value: records.filter((record) => record.type === "open-question").length, note: "Need a team answer", icon: CircleHelpIcon },
    { label: "Context types", value: new Set(records.map((record) => record.type)).size, note: "Kinds of project knowledge", icon: Layers3Icon },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map(({ label, value, note, icon: Icon }) => (
        <Card key={label}>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{note}</span>
            <Icon className="size-4" aria-hidden="true" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
