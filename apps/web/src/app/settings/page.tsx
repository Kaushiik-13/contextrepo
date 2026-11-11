import { Database, FileText, GitBranch } from "lucide-react";
import { SectionPage } from "@/components/workspace-shell";

const settings = [
  {
    label: "Workspace",
    value: "ContextOps Demo",
    description: "The sample workspace currently shown in this demo.",
    icon: GitBranch,
  },
  {
    label: "Context source",
    value: "Local Markdown and YAML files",
    description: "Demo records are loaded from the project’s examples folder.",
    icon: FileText,
  },
  {
    label: "Database",
    value: "Not connected",
    description: "The current Phase 2A demo does not use a database.",
    icon: Database,
  },
];

export default function SettingsPage() {
  return (
    <SectionPage
      activePage="settings"
      eyebrow="WORKSPACE"
      title="Settings"
      description="View the current demo workspace configuration."
    >
      <div className="divide-y divide-stone-100">
        {settings.map(({ label, value, description, icon: Icon }) => (
          <div key={label} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-600">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-medium text-stone-900">{label}</h2>
              <p className="mt-1 text-sm text-stone-700">{value}</p>
              <p className="mt-1 text-xs text-stone-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-stone-100 pt-4 text-xs text-stone-400">Settings are view-only in this demo.</p>
    </SectionPage>
  );
}
