'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Check, FolderPlus, GitCommitHorizontal, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SetupShell } from '@/components/setup-shell';

const API_URL = process.env.NEXT_PUBLIC_CONTEXTOPS_API_URL ?? 'http://localhost:4000/api';

type Project = { id: string; fullName: string; defaultBranch: string; contextStatus: 'missing' | 'ready' | 'unchecked' };

export function ContextFolderSetup() {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/projects/current`, { credentials: 'include', cache: 'no-store' })
      .then(async (response) => {
        if (response.status === 401) { router.replace('/setup'); return; }
        if (!response.ok) throw new Error('Could not load your selected project.');
        const result = await response.json();
        if (!result.project) { router.replace('/setup/repositories'); return; }
        setProject(result.project as Project);
        if (result.project.contextStatus === 'ready') router.replace('/');
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load your project.'))
      .finally(() => setLoading(false));
  }, [router]);

  async function createFolder() {
    if (!project) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/projects/${project.id}/initialize-context`, {
        method: 'POST', credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'GitHub could not create the context folder.');
      setCreated(true);
      setTimeout(() => router.push('/'), 850);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'GitHub could not create the context folder.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SetupShell activeStep={3}>
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_16px_50px_-36px_rgba(28,25,23,0.35)]">
        <div className="border-b border-stone-100 px-6 py-6 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-700">One small setup step</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-stone-950">Prepare the context folder</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">Your repository is connected. ContextOps needs a home for this project’s approved decisions.</p>
        </div>
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          {loading ? (
            <div className="h-20 animate-pulse rounded-xl bg-stone-100" />
          ) : project ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-stone-700 ring-1 ring-stone-200"><FolderPlus className="size-5" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-950">{project.fullName}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500"><GitCommitHorizontal className="size-3.5" aria-hidden="true" />Default branch: {project.defaultBranch}</p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-900">Folder missing</span>
              </div>

              <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-4">
                <div className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-800 ring-1 ring-violet-100"><FolderPlus className="size-4" aria-hidden="true" /></span>
                  <div>
                    <p className="text-sm font-medium text-stone-900">ContextOps will add <code className="rounded bg-white px-1.5 py-0.5 text-xs text-violet-900 ring-1 ring-violet-100">context/README.md</code></p>
                    <p className="mt-1.5 text-xs leading-5 text-stone-600">This creates the folder on the repository’s default branch. Later, proposed decisions will be sent for review before they become approved context.</p>
                  </div>
                </div>
              </div>

              {error && <p role="alert" className="mt-4 flex items-start gap-2 text-xs leading-5 text-rose-700"><AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{error}</p>}
              {created && <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-800"><Check className="size-4" aria-hidden="true" />Context folder created. Opening your workspace…</p>}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" onClick={() => router.push('/setup/repositories')} className="justify-start gap-2 text-stone-600 hover:text-stone-950"><ArrowLeft className="size-4" aria-hidden="true" />Choose another repo</Button>
                <Button onClick={createFolder} disabled={saving || created} className="h-10 gap-2 rounded-lg bg-stone-950 px-4 text-white hover:bg-stone-800">
                  {created ? 'Created' : saving ? 'Creating folder…' : 'Create context folder'}
                  {!created && <FolderPlus className="size-4" aria-hidden="true" />}
                </Button>
              </div>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-stone-500"><ShieldCheck className="size-3.5 text-emerald-700" aria-hidden="true" />Only the selected repository is changed.</p>
            </>
          ) : null}
        </div>
      </section>
    </SetupShell>
  );
}
