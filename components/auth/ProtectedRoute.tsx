"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { status } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.replace("/login");
		}
	}, [status, router]);

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

export default ProtectedRoute;
