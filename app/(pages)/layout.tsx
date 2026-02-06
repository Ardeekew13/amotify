"use client";

import { AppNavbar } from "@/components/app-navbar";
import { AppSidebar } from "@/components/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	const shouldShowHeader = ["/expense/manage", "/expense/manage/[id]"].some(
		(p) => pathname.startsWith(p.replace("[id]", "")),
	);

	return (
		<ProtectedRoute>
			<SidebarProvider>
				<div className="flex h-screen w-full">
					{!shouldShowHeader && <AppSidebar />}
					<div className="flex-1 flex flex-col min-w-0">
						{shouldShowHeader && (
							<header className="flex items-center  p-4 border-b">
								<AppNavbar />
							</header>
						)}
						<main className="flex-1 overflow-y-auto">
							<SidebarInset className="p-8">{children}</SidebarInset>
						</main>
					</div>
				</div>
			</SidebarProvider>
		</ProtectedRoute>
	);
}
