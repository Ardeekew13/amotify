"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
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
		<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
			<Loading />
		</div>
	);
}
