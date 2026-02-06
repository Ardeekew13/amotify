"use client";

import { useAuthContext } from "@/components/auth/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner";

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
			<div className="flex h-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (status === "authenticated") {
		return <>{children}</>;
	}

	return null;
};
