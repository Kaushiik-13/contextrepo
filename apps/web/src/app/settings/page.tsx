import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Clock3,
  FolderCheck,
  GitBranch,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { LoadingScreen } from "@/components/loading-screen";
import { SectionPage } from "@/components/workspace-shell";
import { buttonVariants } from "@/components/ui/button";
import { requireWorkspace } from "@/lib/server-workspace";

const statusCopy = {
  connected: {
    label: "Connected",
    tone: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  revoked: {
    label: "Access revoked",
    tone: "bg-rose-50 text-rose-800 ring-rose-200",
  },
  suspended: {
    label: "App suspended",
    tone: "bg-rose-50 text-rose-800 ring-rose-200",
  },
  repository_access_removed: {
    label: "Repository access removed",
    tone: "bg-amber-50 text-amber-900 ring-amber-200",
  },
  verification_unavailable: {
    label: "Could not verify",
    tone: "bg-amber-50 text-amber-900 ring-amber-200",
  },
} as const;

const API_URL =
  process.env.NEXT_PUBLIC_CONTEXTOPS_API_URL ?? "http://localhost:4000/api";

function dateLabel(value: string | null | undefined) {
  if (!value) return "Not checked yet";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingScreen variant="workspace" />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const workspace = await requireWorkspace();
  const project = workspace.project!;
  const status = statusCopy[project.connectionStatus];

  return (
    <SectionPage
      activePage="settings"
      eyebrow="PERSONAL PROJECT"
      title="GitHub connection"
      description="Your connected project stays saved when you sign out. Review or update the repository access here."
      workspace={workspace}
    >
      <div className="space-y-7">
        <section aria-labelledby="connected-repository-heading">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex min-w-0 items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-800 ring-1 ring-violet-100">
                <GitBranch className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-700">
                  Connected repository
                </p>
                <h2
                  id="connected-repository-heading"
                  className="mt-1 truncate text-lg font-semibold tracking-tight text-stone-950"
                >
                  {project.fullName}
                </h2>
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-violet-800"
                >
                  View repository{" "}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
            <span
              className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${status.tone}`}
            >
              {project.connectionStatus === "connected" ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-3.5" aria-hidden="true" />
              )}
              {status.label}
            </span>
          </div>

          <dl className="mt-6 grid gap-x-8 gap-y-5 border-t border-stone-200 pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-stone-500">GitHub account</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-stone-900">
                <UserRound
                  className="size-4 text-stone-500"
                  aria-hidden="true"
                />
                @{workspace.user.login}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">Installed for</dt>
              <dd className="mt-1 text-sm font-medium text-stone-900">
                {project.accountLogin
                  ? `@${project.accountLogin}`
                  : "GitHub account"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">Repository visibility</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-stone-900">
                <LockKeyhole
                  className="size-4 text-stone-500"
                  aria-hidden="true"
                />
                {project.isPrivate ? "Private" : "Public"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">Default branch</dt>
              <dd className="mt-1 text-sm font-medium text-stone-900">
                {project.defaultBranch}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">Context folder</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-stone-900">
                <FolderCheck
                  className="size-4 text-stone-500"
                  aria-hidden="true"
                />
                {project.contextStatus === "ready"
                  ? "context/ is set up"
                  : "Needs setup"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">Connection checked</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-stone-900">
                <Clock3 className="size-4 text-stone-500" aria-hidden="true" />
                {dateLabel(project.lastVerifiedAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="access-heading"
          className="border-t border-stone-200 pt-6"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
              <ShieldCheck className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h3
                id="access-heading"
                className="text-sm font-semibold text-stone-950"
              >
                Access and privacy
              </h3>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-600">
                ContextOps is installed only on repositories you selected. It
                uses GitHub’s app access to check the repository and prepare its
                context folder. Signing out only ends your ContextOps session;
                it does not revoke GitHub access.
              </p>
              <a
                href="https://github.com/settings/installations"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-violet-800 hover:text-violet-950"
              >
                Manage or revoke app access on GitHub{" "}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          aria-label="Connection actions"
          className="flex flex-col gap-4 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium text-stone-900">
              Update your project connection
            </p>
            <p className="mt-1 text-xs text-stone-500">
              You can replace the connected repository. Each user has one
              project for now.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/setup/repositories"
              className={buttonVariants({
                variant: "outline",
                className:
                  "h-9 border-stone-300 bg-white px-3 text-xs text-stone-800 hover:bg-stone-50",
              })}
            >
              Change repository
            </Link>
            {project.connectionStatus !== "connected" && (
              <a
                href={`${API_URL}/auth/github/reconnect`}
                className={buttonVariants({
                  className:
                    "h-9 bg-stone-950 px-3 text-xs text-white hover:bg-stone-800",
                })}
              >
                Reconnect GitHub
              </a>
            )}
          </div>
        </section>

        <section
          aria-label="Sign out"
          className="flex flex-col gap-4 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium text-stone-900">
              Sign out of ContextOps
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Your GitHub account and repository connection remain saved for
              your next sign-in.
            </p>
          </div>
          <LogoutButton />
        </section>
      </div>
    </SectionPage>
  );
}
