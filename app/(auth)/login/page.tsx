"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import { Spin } from "antd";

function LoginContent() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

	return <LoginForm callbackUrl={callbackUrl} />;
}

function LoginPageInternal() {
	const { status } = useAuthContext();
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (status === "authenticated") {
			const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
			router.replace(callbackUrl);
		}
	}, [status, router, searchParams]);

	if (status === "loading") {
		return (
			<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
				<Spin size="large" />
			</div>
		);
	}

	if (status === "unauthenticated") {
		return <LoginContent />;
	}

	return null;
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
					<Spin size="large" />
				</div>
			}
		>
			<LoginPageInternal />
		</Suspense>
	);
}
