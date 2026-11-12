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
    return `$secure = Read-Host "Paste your ContextOps MCP key" -AsSecureString\n$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)\ntry {\n  $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)\n  [Environment]::SetEnvironmentVariable("CONTEXTOPS_MCP_TOKEN", $token, "User")\n} finally {\n  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)\n  Remove-Variable token, secure, ptr -ErrorAction SilentlyContinue\n}`;
  }

  const snippets: Record<Agent, string> = {
    Codex: `${environmentSetup()}\n\ncodex mcp add contextops --url ${MCP_URL} --bearer-token-env-var CONTEXTOPS_MCP_TOKEN`,
    "Claude Code": `${environmentSetup()}\n\nclaude mcp add-json contextops '{"type":"http","url":"${MCP_URL}","headers":{"Authorization":"Bearer \${CONTEXTOPS_MCP_TOKEN}"}}'`,
    Cursor: `${environmentSetup()}\n\nAdd this server in Cursor MCP settings (or .cursor/mcp.json):\n{\n  "mcpServers": {\n    "contextops": {\n      "type": "http",\n      "url": "${MCP_URL}",\n      "headers": { "Authorization": "Bearer \${CONTEXTOPS_MCP_TOKEN}" }\n    }\n  }\n}`,
    "Other MCP apps": `Server URL: ${MCP_URL}\nTransport: Streamable HTTP\nAuthentication header: Authorization: Bearer <your ContextOps MCP key>\n\nThe ContextOps API must be running on this computer.`,
    ChatGPT:
      "ChatGPT in a browser cannot connect to localhost. ContextOps needs a public HTTPS address and a cloud-compatible sign-in setup before ChatGPT can connect.",
  };

  async function copyInstructions() {
    await navigator.clipboard.writeText(snippets[agent]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
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
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Copy MCP key"
                  onClick={() => navigator.clipboard.writeText(fresh)}
                >
                  <Copy className="size-4" aria-hidden="true" />
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
                Setup instructions
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
            <div role="tabpanel" className="p-4">
              {agent === "ChatGPT" ? (
                <div className="rounded-lg bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-950">
                  {snippets[agent]}
                </div>
              ) : (
                <>
                  <ol className="mb-3 list-decimal space-y-1.5 pl-4 text-xs leading-5 text-stone-600">
                    <li>
                      Make sure the ContextOps API is running on this computer.
                    </li>
                    <li>
                      Create a key above, then run the setup below. It saves the
                      key as a private Windows user variable and registers this
                      agent.
                    </li>
                    <li>
                      Restart the agent, then ask it to search approved context
                      or submit a proposal draft.
                    </li>
                  </ol>
                  <div className="relative">
                    <pre className="max-h-52 overflow-auto rounded-lg bg-stone-950 p-3 pr-20 text-[11px] leading-5 text-stone-100">
                      <code>{snippets[agent]}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute right-2 top-2 h-7 gap-1.5 text-xs"
                      onClick={copyInstructions}
                    >
                      {copied ? (
                        <Check className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Copy className="size-3.5" aria-hidden="true" />
                      )}
                      {copied ? "Copied" : "Copy setup"}
                    </Button>
                  </div>
                  <p className="mt-2 text-[11px] leading-4 text-stone-500">
                    The same computer can use{" "}
                    <code className="rounded bg-stone-100 px-1">{MCP_URL}</code>
                    . Keep the access key private. Each user needs their own
                    key.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
