"use client";

import { AppNavbar } from "@/components/app-navbar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProtectedRoute>
			<div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
				<AppNavbar />
				<main style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
					{children}
				</main>
			</div>
		</ProtectedRoute>
	);
}
