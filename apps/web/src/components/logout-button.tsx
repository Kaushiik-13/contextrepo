"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL =
  process.env.NEXT_PUBLIC_CONTEXTOPS_API_URL ?? "http://localhost:4000/api";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/github/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok)
        throw new Error("Could not sign out. Please try again.");
      router.replace("/login");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not sign out.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="outline"
        onClick={signOut}
        disabled={busy}
        className="h-9 gap-2 border-stone-300 bg-white px-3 text-sm text-stone-800 hover:bg-stone-50"
      >
        <LogOut className="size-4" aria-hidden="true" />
        {busy ? "Signing out…" : "Sign out"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
