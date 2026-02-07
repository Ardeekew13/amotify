"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Spinner } from "@/components/ui/spinner";
import Loading from "@/components/common/Loading";

export default function HomePage() {
	const { status } = useAuthContext();
	const router = useRouter();

	useEffect(() => {
		if (status === "authenticated") {
			router.replace("/dashboard");
		} else if (status === "unauthenticated") {
			router.replace("/login");
		}
	}, [status, router]);

	return (
		<div className="flex h-screen items-center justify-center">
			<Loading />
		</div>
	);
}
