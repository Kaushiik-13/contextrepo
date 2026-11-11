import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getWorkspaceState } from "@/lib/server-workspace";

export default function SetupPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-stone-100" />}>
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
