"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SetupShell } from "@/components/setup-shell";

const API_URL =
  process.env.NEXT_PUBLIC_CONTEXTOPS_API_URL ?? "http://localhost:4000/api";

function GitHubMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-[18px] fill-current"
    >
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.24.92.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.24-5.07-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.06 1.15a10.64 10.64 0 0 1 5.57 0c2.12-1.45 3.05-1.15 3.05-1.15.61 1.53.23 2.67.11 2.95.72.78 1.15 1.78 1.15 3 0 4.29-2.6 5.24-5.08 5.51.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.76.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  );
}

export function GithubSignIn({ mode }: { mode: "login" | "signup" }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorMessages: Record<string, string> = {
    account_not_found:
      "We could not find a ContextOps account for this GitHub account. Sign up first.",
    account_exists:
      "This GitHub account already has ContextOps. Sign in instead.",
    github_signin_failed:
      "GitHub sign-in could not be completed. Please try again.",
    github_install_failed:
      "GitHub setup could not be completed. Please try again.",
  };
  const error = errorCode
    ? (errorMessages[errorCode] ??
      "GitHub sign-in could not be completed. Please try again.")
    : null;
  const isSignup = mode === "signup";

  useEffect(() => {
    fetch(`${API_URL}/auth/github/config`, { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { configured?: boolean }) =>
        setConfigured(result.configured === true),
      )
      .catch(() => setConfigured(false));
  }, []);

  return (
    <SetupShell activeStep={1} showProgress={isSignup} contentWidth="compact">
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_16px_50px_-36px_rgba(28,25,23,0.35)]">
        <div className="border-b border-stone-100 px-6 py-7 sm:px-9 sm:py-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-800">
            <span className="size-1.5 rounded-full bg-violet-600" />
            {isSignup ? "Get started with your project" : "Welcome back"}
          </div>
          <h1 className="max-w-lg text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-[2.15rem]">
            {isSignup
              ? "Create your ContextOps account."
              : "Sign in to your ContextOps workspace."}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-[15px]">
            {isSignup
              ? "Use your GitHub account to get started. Then choose the repository where your team keeps its project context."
              : "Continue with the GitHub account linked to your saved project. Your repository connection will be restored after sign-in."}
          </p>
        </div>

        <div className="px-6 py-6 sm:px-9 sm:py-8">
          {error && (
            <div
              role="alert"
              className="mb-5 flex gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}

          {configured === false && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            >
              <p className="font-medium">GitHub App settings need attention.</p>
              <p className="mt-1 leading-5 text-amber-900/80">
                Check the GitHub App values and PEM private key in{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">
                  apps/api/.env
                </code>
                , then restart the API.
              </p>
            </div>
          )}

          <a
            href={
              configured === true
                ? `${API_URL}/auth/github/start?intent=${mode}`
                : undefined
            }
            aria-disabled={configured !== true}
            className={buttonVariants({
              className: `h-12 w-full justify-center gap-3 rounded-xl bg-stone-950 text-sm text-white shadow-sm hover:bg-stone-800 ${configured !== true ? "pointer-events-none opacity-50" : ""}`,
            })}
          >
            <GitHubMark />
            {isSignup ? "Sign up with GitHub" : "Sign in with GitHub"}
            <ArrowRight
              className="ml-auto size-4 opacity-70"
              aria-hidden="true"
            />
          </a>

          <div className="mt-5 flex items-start gap-2.5 text-xs leading-5 text-stone-500">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-emerald-700"
              aria-hidden="true"
            />
            <p>
              {isSignup
                ? "You choose which repositories the ContextOps app can access."
                : "Your saved repository and project settings stay connected when you sign out."}
            </p>
          </div>
          <p className="mt-6 border-t border-stone-100 pt-5 text-center text-sm text-stone-600">
            {isSignup ? "Already have an account?" : "New to ContextOps?"}{" "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="font-medium text-violet-800 underline-offset-4 hover:text-violet-950 hover:underline"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </Link>
          </p>
          <div className="mt-4 text-center text-xs text-stone-500">
            {isSignup
              ? "GitHub verifies your identity. No separate password is needed."
              : "Sign in securely with the GitHub account you used to create ContextOps."}
          </div>
        </div>
      </section>
    </SetupShell>
  );
}
