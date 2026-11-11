import { Suspense } from "react";
import { redirect } from "next/navigation";
import { GithubSignIn } from "@/components/github-sign-in";
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
  if (workspace?.project) redirect("/");
  if (workspace?.user) redirect("/setup/repositories");
  return (
    <Suspense fallback={<main className="min-h-screen bg-stone-100" />}>
      <GithubSignIn />
    </Suspense>
  );
}
