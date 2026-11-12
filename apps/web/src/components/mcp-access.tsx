"use client";

import { useEffect, useState } from "react";
import { Check, Copy, KeyRound, RotateCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const API =
  process.env.NEXT_PUBLIC_CONTEXTOPS_API_URL ?? "http://localhost:4000/api";
const MCP_URL = `${API}/mcp`;
const AGENTS = [
  "Codex",
  "Claude Code",
  "Cursor",
  "Other MCP apps",
  "ChatGPT",
] as const;
type Agent = (typeof AGENTS)[number];
type Info = { token_prefix: string; created_at: string } | null;

export function McpAccess() {
  const [info, setInfo] = useState<Info>(null);
  const [fresh, setFresh] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [agent, setAgent] = useState<Agent>("Codex");
  const [copied, setCopied] = useState(false);
  const [setupCopied, setSetupCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  useEffect(() => {
    fetch(`${API}/proposals/mcp-token`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => result && setInfo(result.token))
      .catch(() => setError("Could not load MCP access status."));
  }, []);

  async function change(path: string) {
    if (
      path === "" &&
      info &&
      !window.confirm(
        "Replace your current MCP key? Agents using the old key will stop connecting.",
      )
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    setFresh("");
    try {
      const response = await fetch(`${API}/proposals/mcp-token${path}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.message ?? "Could not update MCP access.");
      if (path === "") {
        setInfo(body);
        setFresh(body.token);
        setNotice(
          "New key created. Copy it now and update your agent connection.",
        );
      } else {
        setInfo(null);
        setNotice(
          "MCP key revoked. Connected agents can no longer access ContextOps.",
        );
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not update MCP access.",
      );
    } finally {
      setBusy(false);
    }
  }

  function environmentSetup() {
    return `$token = Read-Host "Paste your ContextOps MCP key"
[Environment]::SetEnvironmentVariable("CONTEXTOPS_MCP_TOKEN", $token, "User")
$env:CONTEXTOPS_MCP_TOKEN = $token`;
  }

  async function copyKey() {
    await navigator.clipboard.writeText(fresh);
    setKeyCopied(true);
    window.setTimeout(() => setKeyCopied(false), 1800);
  }

  const snippets: Record<Agent, string> = {
    Codex: `codex mcp add contextops --url ${MCP_URL} --bearer-token-env-var CONTEXTOPS_MCP_TOKEN`,
    "Claude Code": `claude mcp add-json contextops '{"type":"http","url":"${MCP_URL}","headers":{"Authorization":"Bearer \${CONTEXTOPS_MCP_TOKEN}"}}'`,
    Cursor: `{
  "mcpServers": {
    "contextops": {
      "url": "${MCP_URL}",
      "headers": {
        "Authorization": "Bearer \${env:CONTEXTOPS_MCP_TOKEN}"
      }
    }
  }
}`,
    "Other MCP apps": `Server URL: ${MCP_URL}\nTransport: Streamable HTTP\nAuthentication header: Authorization: Bearer <your ContextOps MCP key>`,
    ChatGPT:
      "ChatGPT in a browser cannot connect to localhost. ContextOps needs a public HTTPS address and a cloud-compatible sign-in setup before ChatGPT can connect.",
  };

  async function copyInstructions() {
    await navigator.clipboard.writeText(snippets[agent]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function copyEnvironmentSetup() {
    await navigator.clipboard.writeText(environmentSetup());
    setSetupCopied(true);
    window.setTimeout(() => setSetupCopied(false), 1800);
  }

  return (
    <section
      aria-labelledby="mcp-heading"
      className="border-t border-stone-200 pt-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-800">
          <KeyRound className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 id="mcp-heading" className="text-sm font-semibold text-stone-950">
            Connect an AI assistant
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-600">
            Use ContextOps from an MCP-compatible agent. It can search approved
            context and submit drafts; approval stays in ContextOps.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {info ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
                  <ShieldCheck className="size-3.5" aria-hidden="true" /> Key
                  active · {info.token_prefix}…
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => change("/revoke")}
                >
                  Revoke key
                </Button>
                <Button size="sm" disabled={busy} onClick={() => change("")}>
                  <RotateCw className="mr-1 size-3.5" aria-hidden="true" />
                  Replace key
                </Button>
              </>
            ) : (
              <Button size="sm" disabled={busy} onClick={() => change("")}>
                {busy ? "Creating…" : "Create MCP key"}
              </Button>
            )}
          </div>

          {fresh && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-950">
                Copy this key now. ContextOps won’t show it again.
              </p>
              <div className="mt-2 flex gap-2">
                <code className="min-w-0 flex-1 break-all rounded bg-white px-2 py-1.5 text-xs">
                  {fresh}
                </code>
                <Button size="sm" variant="outline" onClick={copyKey}>
                  {keyCopied ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" />
                  )}
                  {keyCopied ? "Copied" : "Copy key"}
                </Button>
              </div>
            </div>
          )}

          {notice && (
            <p role="status" className="mt-2 text-xs text-emerald-700">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-2 text-xs text-rose-700">
              {error}
            </p>
          )}

          <div className="mt-5 overflow-hidden rounded-xl border border-stone-200 bg-white">
            <div className="border-b border-stone-100 px-4 pt-3">
              <p className="text-xs font-medium text-stone-800">
                Connect your agent
              </p>
              <div
                className="mt-3 flex gap-1 overflow-x-auto"
                role="tablist"
                aria-label="Choose your AI agent"
              >
                {AGENTS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={agent === name}
                    onClick={() => {
                      setAgent(name);
                      setCopied(false);
                    }}
                    className={`shrink-0 rounded-t-lg border-b-2 px-2.5 py-2 text-xs transition-colors ${agent === name ? "border-violet-600 text-violet-800" : "border-transparent text-stone-500 hover:text-stone-900"}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div role="tabpanel" className="space-y-4 p-4">
              {agent === "ChatGPT" ? (
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
                  <p className="text-sm font-medium text-stone-900">
                    ChatGPT connection is not ready yet
                  </p>
                  <p className="mt-1 text-xs leading-5 text-stone-600">
                    This local setup uses <code>localhost</code>, which ChatGPT
                    cannot reach. It will need a public HTTPS address and a
                    sign-in method supported by ContextOps.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <Step number="1" title="Save your key on this computer">
                    <p className="text-xs leading-5 text-stone-600">
                      Do this once. Copy the setup into PowerShell and run it.
                      When asked, enter your MCP key. It is saved for your
                      Windows account.
                    </p>
                    <CodeBlock
                      value={environmentSetup()}
                      copied={setupCopied}
                      onCopy={copyEnvironmentSetup}
                      buttonLabel="Copy setup"
                    />
                  </Step>
                  <Step number="2" title={`Add ContextOps to ${agent}`}>
                    <p className="text-xs leading-5 text-stone-600">
                      {agent === "Cursor"
                        ? "Paste this JSON into Cursor’s MCP settings or your project’s .cursor/mcp.json file."
                        : agent === "Other MCP apps"
                          ? "Add a Streamable HTTP server using this address and bearer key."
                          : "Copy and run this command in PowerShell."}
                    </p>
                    <CodeBlock
                      value={snippets[agent]}
                      copied={copied}
                      onCopy={copyInstructions}
                      buttonLabel={
                        agent === "Cursor" ? "Copy config" : "Copy command"
                      }
                    />
                  </Step>
                  <Step number="3" title="Restart and check">
                    <p className="text-xs leading-5 text-stone-600">
                      Restart {agent}. Then ask it to search ContextOps for a
                      decision. Keep the ContextOps API running.
                    </p>
                    {agent === "Codex" && (
                      <code className="mt-2 inline-block rounded-md bg-stone-100 px-2 py-1 text-[11px] text-stone-700">
                        codex mcp list
                      </code>
                    )}
                    {agent === "Claude Code" && (
                      <code className="mt-2 inline-block rounded-md bg-stone-100 px-2 py-1 text-[11px] text-stone-700">
                        claude mcp list
                      </code>
                    )}
                  </Step>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3 sm:grid-cols-[28px_minmax(0,1fr)]">
      <span className="flex size-7 items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-700">
        {number}
      </span>
      <div className="min-w-0 pt-1">
        <h4 className="text-sm font-semibold text-stone-900">{title}</h4>
        <div className="mt-1.5">{children}</div>
      </div>
    </section>
  );
}

function CodeBlock({
  value,
  copied,
  onCopy,
  buttonLabel,
}: {
  value: string;
  copied: boolean;
  onCopy: () => void;
  buttonLabel: string;
}) {
  return (
    <div className="relative mt-2">
      <pre className="max-h-48 overflow-auto rounded-lg bg-stone-950 p-3 pr-28 text-[11px] leading-5 text-stone-100">
        <code>{value}</code>
      </pre>
      <Button
        size="sm"
        variant="secondary"
        className="absolute right-2 top-2 h-7 gap-1.5 text-[11px]"
        onClick={onCopy}
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
        {copied ? "Copied" : buttonLabel}
      </Button>
    </div>
  );
}
