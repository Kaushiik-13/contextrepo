"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-12">
      <section
        role="alert"
        className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-8 shadow-[0_18px_55px_-40px_rgba(28,25,23,0.42)] sm:p-10"
      >
        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <AlertCircle className="size-5" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-stone-950">
          ContextOps couldn’t load your workspace
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          The dashboard couldn’t reach or verify the NestJS API. Make sure it
          is running on port 4000, then try again.
        </p>
        <Button onClick={reset} className="mt-6">
          <RefreshCw className="mr-2 size-4" aria-hidden="true" />
          Retry
        </Button>
      </section>
    </main>
  );
}
