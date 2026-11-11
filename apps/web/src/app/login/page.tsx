import { Suspense } from "react";
import { AuthEntry } from "@/components/auth-entry";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-stone-100" />}>
      <AuthEntry mode="login" />
    </Suspense>
  );
}
