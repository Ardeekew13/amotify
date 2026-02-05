'use client'

import { AppNavbar } from "@/components/app-navbar";
import { AppSidebar } from "@/components/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	const shouldHideSidebar = ["/expense/manage", "expense/manage/[id]"];
	const shouldUseNavbar = shouldHideSidebar.some((path) =>
		pathname.includes(path),
	);
	
	return (
		<ProtectedRoute>
			{shouldUseNavbar ? (
				<div className="min-h-screen">
					<AppNavbar />
					<main className="flex flex-1 flex-col p-8">{children}</main>
				</div>
			) : (
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 mb-6">
							<SidebarTrigger className="-ml-1" />
							<div className="flex flex-1 items-center gap-2 px-3">
								<h1 className="text-lg font-semibold">Amotify Dashboard</h1>
							</div>
						</header>
						<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
					</SidebarInset>
				</SidebarProvider>
			)}
		</ProtectedRoute>
	);
}
