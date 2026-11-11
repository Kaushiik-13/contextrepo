import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.CONTEXTOPS_API_URL ?? "http://localhost:4000/api";

export type WorkspaceUser = {
  id: string;
  login: string;
  avatarUrl: string | null;
};

export type WorkspaceProject = {
  id: string;
  repositoryId: number;
  fullName: string;
  owner: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  defaultBranch: string;
  contextStatus: "unchecked" | "missing" | "ready";
  connectionStatus:
    | "connected"
    | "revoked"
    | "suspended"
    | "repository_access_removed"
    | "verification_unavailable";
  accountLogin: string | null;
  connectedAt: string;
  lastVerifiedAt: string | null;
  repositoryUrl: string;
};

export type WorkspaceState = {
  user: WorkspaceUser;
  project: WorkspaceProject | null;
};

export async function getWorkspaceState(): Promise<WorkspaceState | null> {
  const session = (await cookies()).get("contextops_session")?.value;
  if (!session) return null;
  const headers = {
    Cookie: `contextops_session=${encodeURIComponent(session)}`,
  };
  const userResponse = await fetch(`${API_URL}/auth/github/me`, {
    headers,
    cache: "no-store",
  });
  if (userResponse.status === 401) return null;
  if (!userResponse.ok)
    throw new Error("Could not verify the ContextOps session.");
  const { user } = (await userResponse.json()) as { user: WorkspaceUser };
  const projectResponse = await fetch(`${API_URL}/projects/current`, {
    headers,
    cache: "no-store",
  });
  if (projectResponse.status === 401) return null;
  if (!projectResponse.ok)
    throw new Error("Could not load the connected project.");
  const result = (await projectResponse.json()) as {
    project: WorkspaceProject | null;
  };
  return { user, project: result.project };
}

export async function requireWorkspace(): Promise<WorkspaceState> {
  const state = await getWorkspaceState();
  if (!state) redirect("/setup");
  if (!state.project) redirect("/setup/repositories");
  return state;
}
