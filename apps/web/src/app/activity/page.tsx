import { Suspense } from "react";
import { Activity } from "lucide-react";
import { SectionPage } from "@/components/workspace-shell";

export default function ActivityPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen bg-stone-50"
          aria-label="Loading activity"
        />
      }
    >
      <SectionPage
        activePage="activity"
        eyebrow="PROJECT HISTORY"
        title="Activity"
        description="Follow context proposals, reviews, and published decisions in one place."
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-600">
            <Activity className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-medium text-stone-900">
              No activity to show yet
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-stone-500">
              Activity tracking will appear when the proposal and publishing
              workflow is implemented.
            </p>
          </div>
        </div>
      </SectionPage>
    </Suspense>
  );
}
