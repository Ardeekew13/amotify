"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookies";

export default function HomePage() {
	const router = useRouter();

	useEffect(() => {
		// Check if user is authenticated
		const token = getCookie("auth_token");
		
		if (token) {
			router.replace("/dashboard");
		} else {
			router.replace("/login");
		}
	}, [router]);

	// Show loading state while redirecting
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
		</div>
	);
}
