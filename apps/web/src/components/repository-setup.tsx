"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  GitBranch,
  LockKeyhole,
  Search,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SetupShell } from "@/components/setup-shell";

const API_URL =
  process.env.NEXT_PUBLIC_CONTEXTOPS_API_URL ?? "http://localhost:4000/api";

type Repository = {
  id: number;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  defaultBranch: string;
};

type Project = {
  id: string;
  repositoryId: number;
  fullName: string;
  contextStatus: "missing" | "ready" | "unchecked";
};

export function RepositorySetup() {
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [account, setAccount] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`${API_URL}/auth/github/me`, {
        credentials: "include",
        cache: "no-store",
      }),
      fetch(`${API_URL}/github/repositories`, {
        credentials: "include",
        cache: "no-store",
      }),
      fetch(`${API_URL}/projects/current`, {
        credentials: "include",
        cache: "no-store",
      }),
    ])
      .then(async ([meResponse, repoResponse, currentResponse]) => {
        if (
          meResponse.status === 401 ||
          repoResponse.status === 401 ||
          currentResponse.status === 401
        ) {
          router.replace("/setup");
          return;
        }
        if (!repoResponse.ok || !currentResponse.ok)
          throw new Error(
            "We couldn’t load the repositories approved for ContextOps. Try reconnecting GitHub.",
          );
        const [me, repos, current] = await Promise.all([
          meResponse.json(),
          repoResponse.json(),
          currentResponse.json(),
        ]);
        if (!active) return;
        setAccount(me.user.login);
        setRepositories(repos.items ?? []);
        if (current.project) setSelected(current.project.repositoryId);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load repositories.",
          );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [router]);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    return repositories.filter((repo) =>
      repo.fullName.toLowerCase().includes(value),
    );
  }, [repositories, search]);

  async function connectRepository() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/projects/connect`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryId: selected }),
      });
      const project = (await response.json()) as Project & { message?: string };
      if (!response.ok)
        throw new Error(
          project.message ?? "Could not connect that repository.",
        );
      if (project.contextStatus === "ready") router.push("/");
      else router.push("/setup/context");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not connect that repository.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SetupShell activeStep={2}>
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_16px_50px_-36px_rgba(28,25,23,0.35)]">
        <div className="border-b border-stone-100 px-6 py-6 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-700">
            Connect a project
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-stone-950">
            Choose a repository
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Select the existing code repository where ContextOps should keep
            this project’s approved context.
          </p>
        </div>
        <div className="px-6 py-5 sm:px-8 sm:py-6">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-stone-50 px-3.5 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-medium text-stone-700 ring-1 ring-stone-200">
                {account.slice(0, 1).toUpperCase() || "G"}
              </span>
              <span className="truncate text-sm text-stone-700">
                Connected as{" "}
                <strong className="font-medium text-stone-950">
                  {account || "GitHub user"}
                </strong>
              </span>
            </div>
            <a
              href={`${API_URL}/auth/github/reconnect`}
              className="shrink-0 text-xs font-medium text-violet-800 hover:text-violet-950"
            >
              Change access
            </a>
          </div>

          <label className="sr-only" htmlFor="repository-search">
            Search repositories
          </label>
          <div className="relative mb-3">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
              aria-hidden="true"
            />
            <Input
              id="repository-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your repositories"
              className="h-10 rounded-lg border-stone-200 pl-9"
            />
          </div>

          <div className="max-h-[340px] overflow-y-auto rounded-xl border border-stone-200">
            {loading ? (
              <div className="space-y-3 p-4" aria-label="Loading repositories">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[62px] animate-pulse rounded-lg bg-stone-100"
                  />
                ))}
              </div>
            ) : error && !repositories.length ? (
              <div className="p-6 text-center">
                <AlertCircle
                  className="mx-auto size-5 text-amber-700"
                  aria-hidden="true"
                />
                <p className="mt-2 text-sm font-medium text-stone-900">
                  Repository list unavailable
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-stone-500">
                  {error}
                </p>
                <a
                  href={`${API_URL}/auth/github/reconnect`}
                  className={buttonVariants({
                    variant: "outline",
                    className: "mt-4",
                  })}
                >
                  Reconnect GitHub
                </a>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-stone-500">
                No matching repositories. Try another search.
              </div>
            ) : (
              <ul
                aria-label="Repositories available to ContextOps"
                className="divide-y divide-stone-100"
              >
                {filtered.map((repo) => {
                  const active = selected === repo.id;
                  return (
                    <li key={repo.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(repo.id);
                          setError("");
                        }}
                        aria-pressed={active}
                        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${active ? "bg-violet-50/80" : "bg-white hover:bg-stone-50"}`}
                      >
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-violet-100 text-violet-800" : "bg-stone-100 text-stone-600"}`}
                        >
                          {active ? (
                            <Check className="size-4" aria-hidden="true" />
                          ) : (
                            <GitBranch className="size-4" aria-hidden="true" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="truncate text-sm font-medium text-stone-900">
                              {repo.fullName}
                            </span>
                            {repo.isPrivate ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                                <LockKeyhole
                                  className="size-2.5"
                                  aria-hidden="true"
                                />
                                Private
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                                Public
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block truncate text-xs text-stone-500">
                            {repo.description ||
                              `Default branch: ${repo.defaultBranch}`}
                          </span>
                        </span>
                        <ChevronDown
                          className={`size-4 shrink-0 -rotate-90 text-stone-300 ${active ? "text-violet-700" : ""}`}
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {error && repositories.length > 0 && (
            <p
              role="alert"
              className="mt-3 flex items-center gap-2 text-xs text-rose-700"
            >
              <AlertCircle className="size-3.5" aria-hidden="true" />
              {error}
            </p>
          )}
          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-stone-500">
              Only repositories granted to the ContextOps GitHub App appear
              here.
            </p>
            <Button
              disabled={!selected || saving || loading}
              onClick={connectRepository}
              className="h-10 shrink-0 gap-2 rounded-lg bg-stone-950 px-4 text-white hover:bg-stone-800"
            >
              {saving ? "Checking repository…" : "Use this repository"}
              {!saving && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </section>
    </SetupShell>
  );
}
