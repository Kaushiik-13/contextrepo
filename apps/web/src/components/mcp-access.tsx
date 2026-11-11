"use client";

import { useEffect, useState } from "react";
import { Copy, KeyRound, RotateCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_CONTEXTOPS_API_URL ?? "http://localhost:4000/api";
type Info = { token_prefix: string; created_at: string } | null;

export function McpAccess() {
  const [info, setInfo] = useState<Info>(null);
  const [fresh, setFresh] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { fetch(`${API}/proposals/mcp-token`, { credentials:"include",cache:"no-store" }).then(r=>r.ok?r.json():null).then(x=>x&&setInfo(x.token)).catch(()=>setError("Could not load MCP access status.")); },[]);
  async function change(path:string) {
    setBusy(true);setError("");setFresh("");
    try { const response=await fetch(`${API}/proposals/mcp-token${path}`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"}}); const body=await response.json(); if(!response.ok)throw new Error(body.message??"Could not update MCP access."); if(path==="") {setInfo(body);setFresh(body.token);} else setInfo(null); }
    catch(e){setError(e instanceof Error?e.message:"Could not update MCP access.");} finally{setBusy(false);}
  }
  async function copy() { await navigator.clipboard.writeText(fresh); }
  return <section className="border-t border-stone-200 pt-6">
    <div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-800"><KeyRound className="size-4"/></span><div className="min-w-0 flex-1">
      <h3 className="text-sm font-semibold text-stone-950">Connect an AI assistant (MCP)</h3>
      <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-600">Create a private access key for an AI tool to submit proposals as drafts. It cannot approve or publish context. Keep the key secret; you can replace or revoke it here.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-600">{info ? <><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800"><ShieldCheck className="size-3.5"/> Connected · {info.token_prefix}…</span><Button size="sm" variant="outline" disabled={busy} onClick={()=>change("/revoke")}>Revoke</Button><Button size="sm" disabled={busy} onClick={()=>change("")}><RotateCw className="mr-1 size-3.5"/>Replace key</Button></> : <Button size="sm" disabled={busy} onClick={()=>change("")}>{busy?"Creating…":"Create MCP access key"}</Button>}</div>
      {fresh&&<div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-xs font-medium text-amber-950">Copy this key now. ContextOps will not show it again.</p><div className="mt-2 flex gap-2"><code className="min-w-0 flex-1 break-all rounded bg-white px-2 py-1.5 text-xs">{fresh}</code><Button size="icon" variant="outline" aria-label="Copy access key" onClick={copy}><Copy className="size-4"/></Button></div><p className="mt-2 text-xs text-amber-900">MCP endpoint: <code>http://localhost:4000/api/mcp</code></p></div>}
      {error&&<p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}
    </div></div>
  </section>;
}
