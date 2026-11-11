import { Suspense } from "react";
import { GitBranch } from "lucide-react";
import { LoadingScreen } from "@/components/loading-screen";
import { SectionPage } from "@/components/workspace-shell";

export default function ProposalsPage() {
  return (
    <Suspense fallback={<LoadingScreen variant="workspace" />}>
      <SectionPage
        activePage="proposals"
        eyebrow="TEAM REVIEW"
        title="Proposals"
        description="Review and approve context changes before they become trusted project knowledge."
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700">
            <GitBranch className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-medium text-stone-900">
              Proposal review comes in the next phase
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-stone-500">
              This Phase 2A screen is a working navigation destination. Creating
              proposals, opening pull requests, and approval are not implemented
              yet.
            </p>
          </div>
        </div>
      </SectionPage>
    </Suspense>
  );
}
