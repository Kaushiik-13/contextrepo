import { Layers3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingScreen({ variant }: { variant: "auth" | "workspace" }) {
  return variant === "auth" ? (
    <AuthLoadingScreen />
  ) : (
    <WorkspaceLoadingScreen />
  );
}

function AuthLoadingScreen() {
  return (
    <main
      className="min-h-screen bg-[#f5f5f4] px-4 py-8 text-stone-950 sm:px-6 sm:py-12"
      aria-busy="true"
      aria-label="Loading sign in"
    >
      <span className="sr-only" role="status">
        Loading sign-in page…
      </span>
      <div className="mx-auto flex max-w-5xl flex-col">
        <header className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-stone-950 text-white">
            <Layers3 className="size-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">
              ContextOps
            </span>
            <span className="block pt-0.5 text-xs text-stone-500">
              Your project workspace
            </span>
          </span>
        </header>

        <div className="mx-auto mt-12 w-full max-w-lg sm:mt-16">
          <section
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_16px_50px_-36px_rgba(28,25,23,0.35)]"
            aria-hidden="true"
          >
            <div className="space-y-4 border-b border-stone-100 px-6 py-8 sm:px-9 sm:py-9">
              <Skeleton className="h-8 w-32 rounded-full bg-violet-100/80" />
              <Skeleton className="h-9 w-4/5 bg-stone-200/80" />
              <Skeleton className="h-4 w-full bg-stone-100" />
              <Skeleton className="h-4 w-3/4 bg-stone-100" />
            </div>
            <div className="space-y-5 px-6 py-7 sm:px-9 sm:py-8">
              <Skeleton className="h-12 w-full rounded-xl bg-stone-200/80" />
              <Skeleton className="h-4 w-4/5 bg-stone-100" />
              <div className="border-t border-stone-100 pt-5">
                <Skeleton className="mx-auto h-4 w-48 bg-stone-100" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function WorkspaceLoadingScreen() {
  return (
    <main
      className="flex min-h-screen bg-stone-50/80 text-stone-950"
      aria-busy="true"
      aria-label="Loading workspace"
    >
      <span className="sr-only" role="status">
        Loading your project workspace…
      </span>
      <aside
        className="relative hidden w-64 shrink-0 border-r border-stone-200 bg-stone-100/80 p-4 lg:block"
        aria-hidden="true"
      >
        <div className="flex items-center gap-3 px-2 py-1">
          <span className="flex size-9 items-center justify-center rounded-xl bg-stone-950 text-white">
            <Layers3 className="size-4" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 bg-stone-300/70" />
            <Skeleton className="h-3 w-32 bg-stone-200" />
          </div>
        </div>
        <div className="mt-10 space-y-2">
          {["w-36", "w-28", "w-32"].map((width, index) => (
            <div
              key={index}
              className="flex h-10 items-center gap-3 rounded-lg px-3"
            >
              <Skeleton className="size-4 rounded bg-stone-300/70" />
              <Skeleton className={`h-3 ${width} bg-stone-200`} />
            </div>
          ))}
        </div>
        <div className="absolute bottom-5 left-4 flex items-center gap-3">
          <Skeleton className="size-9 rounded-full bg-stone-200" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24 bg-stone-200" />
            <Skeleton className="h-3 w-20 bg-stone-100" />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header
          className="flex h-12 items-center border-b border-stone-200 px-5"
          aria-hidden="true"
        >
          <Skeleton className="size-4 bg-stone-200" />
          <Skeleton className="ml-4 h-4 w-28 bg-stone-200" />
        </header>
        <div className="mx-auto w-full max-w-[1600px] space-y-7 px-4 py-6 lg:px-7 lg:py-8">
          <div className="space-y-2" aria-hidden="true">
            <Skeleton className="h-3 w-48 bg-violet-100" />
            <Skeleton className="h-7 w-56 bg-stone-200/80" />
            <Skeleton className="h-4 w-80 max-w-full bg-stone-100" />
          </div>
          <div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-hidden="true"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5"
              >
                <Skeleton className="h-3.5 w-28 bg-stone-100" />
                <Skeleton className="h-8 w-12 bg-stone-200/80" />
                <Skeleton className="h-3 w-36 bg-stone-100" />
              </div>
            ))}
          </div>
          <div
            className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-40 bg-stone-200/80" />
              <Skeleton className="h-8 w-28 rounded-lg bg-stone-100" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg bg-stone-100" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border-t border-stone-100 py-3"
                >
                  <Skeleton className="h-4 w-2/5 bg-stone-200/70" />
                  <Skeleton className="h-5 w-20 rounded-full bg-violet-100/80" />
                  <Skeleton className="ml-auto h-3 w-16 bg-stone-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
