import { redirect } from "next/navigation";
import { GithubSignIn } from "@/components/github-sign-in";
import { getWorkspaceState } from "@/lib/server-workspace";

export async function AuthEntry({ mode }: { mode: "login" | "signup" }) {
  const workspace = await getWorkspaceState();
  if (workspace?.project) redirect("/");
  if (workspace?.user) redirect("/setup/repositories");
  return <GithubSignIn mode={mode} />;
}
