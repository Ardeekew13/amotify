"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return <LoginForm callbackUrl={callbackUrl} />;
}

export default function LoginPage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    );
  }

  return null;
}
