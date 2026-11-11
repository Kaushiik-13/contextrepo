"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, FilePlus2, GitBranch, Save, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONTEXT_TYPES, type ContextType } from "@/lib/context";

const API_URL =
  process.env.NEXT_PUBLIC_CONTEXTOPS_API_URL ?? "http://localhost:4000/api";

const TYPE_LABELS: Record<ContextType, string> = {
  decision: "Decision",
  requirement: "Requirement",
  constraint: "Constraint",
  research: "Research",
  "rejected-approach": "Rejected approach",
  "open-question": "Open question",
  "project-state": "Project state",
};

type Draft = {
  id: string;
  projectId: string;
  title: string;
  type: ContextType;
  status: "draft";
  question: string;
  summary: string;
  rationale: string;
  tags: string[];
  constraints: string[];
  alternatives: string[];
  discussionSummary: string;
  sourceReferences: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
};

type DraftForm = Omit<
  Draft,
  | "id"
  | "projectId"
  | "status"
  | "owner"
  | "createdAt"
  | "updatedAt"
  | "tags"
  | "constraints"
  | "alternatives"
  | "sourceReferences"
> & {
  tags: string;
  constraints: string;
  alternatives: string;
  sourceReferences: string;
};

function emptyForm(): DraftForm {
  return {
    title: "",
    type: "decision",
    question: "",
    summary: "",
    rationale: "",
    tags: "",
    constraints: "",
    alternatives: "",
    discussionSummary: "",
    sourceReferences: "",
  };
}

function formFromDraft(draft: Draft): DraftForm {
  return {
    title: draft.title,
    type: draft.type,
    question: draft.question,
    summary: draft.summary,
    rationale: draft.rationale,
    tags: draft.tags.join("\n"),
    constraints: draft.constraints.join("\n"),
    alternatives: draft.alternatives.join("\n"),
    discussionSummary: draft.discussionSummary,
    sourceReferences: draft.sourceReferences.join("\n"),
  };
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  return body?.message ?? "Could not save the draft. Please try again.";
}

export function ProposalDrafts() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [form, setForm] = useState<DraftForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/proposals`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/login");
          return null;
        }
        if (!response.ok) {
          throw new Error(await readError(response));
        }
        return (await response.json()) as { items: Draft[] };
      })
      .then((result) => {
        if (active && result) setDrafts(result.items ?? []);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load your drafts. Please retry.",
          );
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [router]);

  function startNewDraft() {
    setDraftId(null);
    setForm(emptyForm());
    setError("");
    setNotice("");
  }

  function editDraft(draft: Draft) {
    setDraftId(draft.id);
    setForm(formFromDraft(draft));
    setError("");
    setNotice("");
  }

  function updateField<K extends keyof DraftForm>(key: K, value: DraftForm[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function saveDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    setNotice("");
    const isEditing = Boolean(draftId);
    try {
      const response = await fetch(
        `${API_URL}/proposals${draftId ? `/${draftId}` : ""}`,
        {
          method: draftId ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            tags: lines(form.tags),
            constraints: lines(form.constraints),
            alternatives: lines(form.alternatives),
            sourceReferences: lines(form.sourceReferences),
          }),
        },
      );
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error(await readError(response));
      const result = (await response.json()) as { proposal: Draft };
      const savedDraft = result.proposal;
      setDrafts((current) =>
        [
          savedDraft,
          ...current.filter((item) => item.id !== savedDraft.id),
        ].sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() -
            new Date(left.updatedAt).getTime(),
        ),
      );
      setDraftId(savedDraft.id);
      setForm(formFromDraft(savedDraft));
      setNotice(isEditing ? "Draft updated." : "Draft saved.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not save the draft. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 border-b border-stone-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-stone-950">
              Your proposal drafts
            </h2>
            <Badge variant="secondary" className="font-normal">
              {drafts.length}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Drafts stay separate from approved GitHub context.
          </p>
        </div>
        <Button
          onClick={startNewDraft}
          className="h-9 gap-2 rounded-lg bg-stone-950 px-3.5 text-white hover:bg-stone-800"
        >
          <FilePlus2 className="size-4" aria-hidden="true" />
          New draft
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-900"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.8fr)]">
        <aside aria-label="Saved drafts" className="min-w-0">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            Saved drafts
          </h3>
          {loading ? (
            <div className="space-y-2" aria-label="Loading drafts">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[68px] animate-pulse rounded-lg bg-stone-100"
                />
              ))}
            </div>
          ) : drafts.length === 0 ? (
            <div className="rounded-lg bg-stone-50 px-3.5 py-4">
              <p className="text-sm font-medium text-stone-800">
                No drafts yet
              </p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                Start with a question or decision you want to capture.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {drafts.map((draft) => (
                <li key={draft.id}>
                  <button
                    type="button"
                    onClick={() => editDraft(draft)}
                    aria-current={draftId === draft.id ? "true" : undefined}
                    className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${draftId === draft.id ? "bg-violet-50 text-violet-950" : "text-stone-800 hover:bg-stone-50"}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {draft.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-stone-500">
                        {displayDate(draft.updatedAt)}
                      </span>
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                      <GitBranch className="size-3" aria-hidden="true" />
                      {TYPE_LABELS[draft.type]} · Draft
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="min-w-0 border-t border-stone-100 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          {!form ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <GitBranch className="size-4" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-medium text-stone-900">
                Choose a draft to edit
              </h3>
              <p className="mt-1 max-w-xs text-xs leading-5 text-stone-500">
                Or create a new draft to capture a project decision and the
                reasons behind it.
              </p>
            </div>
          ) : (
            <form onSubmit={saveDraft} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-stone-950">
                    {draftId ? "Edit draft" : "New draft"}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    Capture the outcome and enough reasoning for a teammate to
                    understand it later.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close draft editor"
                  onClick={() => {
                    setForm(null);
                    setDraftId(null);
                    setNotice("");
                  }}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
                <Field label="Title" required>
                  <Input
                    value={form.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    maxLength={180}
                    placeholder="e.g. Choose a database for the application"
                    required
                  />
                </Field>
                <Field label="Context type">
                  <select
                    value={form.type}
                    onChange={(event) =>
                      updateField("type", event.target.value as ContextType)
                    }
                    className="h-9 w-full rounded-lg border border-input bg-white px-3 text-sm text-stone-800 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {CONTEXT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Question or problem">
                <TextArea
                  value={form.question}
                  onChange={(value) => updateField("question", value)}
                  placeholder="What did the team need to decide or understand?"
                  rows={2}
                />
              </Field>
              <Field label="Outcome or summary">
                <TextArea
                  value={form.summary}
                  onChange={(value) => updateField("summary", value)}
                  placeholder="What is the proposed answer or current conclusion?"
                  rows={2}
                />
              </Field>
              <Field label="Why?">
                <TextArea
                  value={form.rationale}
                  onChange={(value) => updateField("rationale", value)}
                  placeholder="What reasons led to this outcome?"
                  rows={3}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Constraints" hint="One item per line">
                  <TextArea
                    value={form.constraints}
                    onChange={(value) => updateField("constraints", value)}
                    placeholder="Limits or requirements to keep in mind"
                    rows={3}
                  />
                </Field>
                <Field label="Alternatives considered" hint="One item per line">
                  <TextArea
                    value={form.alternatives}
                    onChange={(value) => updateField("alternatives", value)}
                    placeholder="Other options and tradeoffs"
                    rows={3}
                  />
                </Field>
              </div>

              <Field label="Discussion notes">
                <TextArea
                  value={form.discussionSummary}
                  onChange={(value) => updateField("discussionSummary", value)}
                  placeholder="Useful context from the conversation"
                  rows={3}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tags" hint="One item per line">
                  <TextArea
                    value={form.tags}
                    onChange={(value) => updateField("tags", value)}
                    placeholder="database\narchitecture"
                    rows={2}
                  />
                </Field>
                <Field label="Sources or references" hint="One item per line">
                  <TextArea
                    value={form.sourceReferences}
                    onChange={(value) => updateField("sourceReferences", value)}
                    placeholder="Links, files, or documents"
                    rows={2}
                  />
                </Field>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div aria-live="polite" className="text-xs text-emerald-700">
                  {notice || "Draft only · not in the approved context library"}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm(null);
                      setDraftId(null);
                      setNotice("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || !form.title.trim()}
                    className="gap-2 bg-stone-950 text-white hover:bg-stone-800"
                  >
                    <Save className="size-4" aria-hidden="true" />
                    {saving
                      ? "Saving…"
                      : draftId
                        ? "Save changes"
                        : "Save draft"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="flex items-center justify-between gap-2 text-xs font-medium text-stone-700">
        <span>
          {label}
          {required ? <span className="text-violet-700"> *</span> : null}
        </span>
        {hint ? (
          <span className="font-normal text-stone-400">{hint}</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-y rounded-lg border border-input bg-white px-3 py-2 text-sm leading-5 text-stone-800 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  );
}
