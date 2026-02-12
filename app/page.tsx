"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Spin } from "antd";

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
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
			<Spin size="large" />
		</div>
	);
}
