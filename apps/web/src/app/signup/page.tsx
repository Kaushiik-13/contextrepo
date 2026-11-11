import { Suspense } from "react";
import { AuthEntry } from "@/components/auth-entry";
import { LoadingScreen } from "@/components/loading-screen";

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingScreen variant="auth" />}>
      <AuthEntry mode="signup" />
    </Suspense>
  );
}
