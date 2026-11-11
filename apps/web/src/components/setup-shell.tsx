import type { ReactNode } from 'react';
import Link from 'next/link';
import { Layers3, ShieldCheck } from 'lucide-react';

const steps = [
  { label: 'Connect GitHub', number: 1 },
  { label: 'Choose repository', number: 2 },
  { label: 'Prepare context', number: 3 },
];

export function SetupShell({
  activeStep,
  children,
}: {
  activeStep: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f5f5f4] px-4 py-8 text-stone-950 sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/setup" className="inline-flex items-center gap-3" aria-label="ContextOps setup home">
            <span className="flex size-10 items-center justify-center rounded-xl bg-stone-950 text-white shadow-sm">
              <Layers3 className="size-5" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight">ContextOps</span>
              <span className="block pt-0.5 text-xs text-stone-500">Project setup</span>
            </span>
          </Link>
          <div className="hidden items-center gap-2 text-xs text-stone-500 sm:flex">
            <ShieldCheck className="size-4 text-emerald-700" aria-hidden="true" />
            <span>Your repository access stays under your control</span>
          </div>
        </header>

        <nav aria-label="Setup progress" className="mx-auto mt-12 flex w-full max-w-2xl items-center sm:mt-16">
          {steps.map((step, index) => {
            const complete = step.number < activeStep;
            const active = step.number === activeStep;
            return (
              <div className="flex min-w-0 flex-1 items-center last:flex-none" key={step.number}>
                <div className="flex items-center gap-2.5">
                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${complete ? 'bg-emerald-700 text-white' : active ? 'bg-stone-950 text-white' : 'border border-stone-300 bg-white text-stone-500'}`}>
                    {complete ? '✓' : step.number}
                  </span>
                  <span className={`hidden whitespace-nowrap text-xs sm:block ${active ? 'font-semibold text-stone-900' : 'text-stone-500'}`}>{step.label}</span>
                </div>
                {index < steps.length - 1 && <span className={`mx-3 h-px min-w-4 flex-1 ${complete ? 'bg-emerald-700/50' : 'bg-stone-300'}`} />}
              </div>
            );
          })}
        </nav>

        <div className="mx-auto mt-8 w-full max-w-2xl sm:mt-10">{children}</div>
        <footer className="mt-10 text-center text-xs text-stone-500">
          ContextOps keeps approved project context in your GitHub repository.
        </footer>
      </div>
    </main>
  );
}
