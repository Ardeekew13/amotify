"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import Loading from "@/components/common/Loading";

function LoginContent() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

	return <LoginForm callbackUrl={callbackUrl} />;
}

export default function LoginClientPage() {
	return (
		<Suspense fallback={<Loading />}>
			<LoginContent />
		</Suspense>
	);
}
