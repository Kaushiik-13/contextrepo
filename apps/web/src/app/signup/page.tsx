import { Suspense } from "react";
import { AuthEntry } from "@/components/auth-entry";

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-stone-100" />}>
      <AuthEntry mode="signup" />
    </Suspense>
  );
}
