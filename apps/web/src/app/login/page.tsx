import { Suspense } from "react";
import { AuthEntry } from "@/components/auth-entry";
import { LoadingScreen } from "@/components/loading-screen";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen variant="auth" />}>
      <AuthEntry mode="login" />
    </Suspense>
  );
}
