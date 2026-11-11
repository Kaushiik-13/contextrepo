import { Suspense } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { SectionPage } from "@/components/workspace-shell";
import { ProposalDrafts } from "@/components/proposal-drafts";

export default function ProposalsPage() {
  return (
    <Suspense fallback={<LoadingScreen variant="workspace" />}>
      <SectionPage
        activePage="proposals"
        eyebrow="TEAM REVIEW"
        title="Proposals"
        description="Capture a project decision and its reasoning. Save it as a draft and refine it later."
      >
        <ProposalDrafts />
      </SectionPage>
    </Suspense>
  );
}
