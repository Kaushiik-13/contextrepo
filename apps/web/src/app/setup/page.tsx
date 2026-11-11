import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getWorkspaceState } from "@/lib/server-workspace";
import { LoadingScreen } from "@/components/loading-screen";

export default function SetupPage() {
  return (
    <Suspense fallback={<LoadingScreen variant="auth" />}>
      <SetupRedirector />
    </Suspense>
  );
}

async function SetupRedirector() {
  const workspace = await getWorkspaceState();
  if (workspace?.project) return redirect("/");
  if (workspace?.user) return redirect("/setup/repositories");
  return redirect("/login");
}
