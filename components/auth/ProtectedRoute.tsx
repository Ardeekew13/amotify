"use client";

import { useAuthContext } from "@/components/auth/AuthProvider";
import { Spin } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { status } = useAuthContext();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (status === "unauthenticated") {
			const callbackUrl = encodeURIComponent(pathname);
			router.replace(`/login`);
		}
	}, [status, router, pathname]);

	if (status === "loading") {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
				<Spin size="large" />
			</div>
		);
	}

	if (status === "authenticated") {
		return <>{children}</>;
	}

	return null;
};
