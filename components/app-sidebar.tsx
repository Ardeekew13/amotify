import * as React from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Logo from "@/assets/black-white.png";
import { NavUser } from "./nav-user";
import { useAuthContext } from "./auth/AuthProvider";

// Amotify navigation data
const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/",
		},
		{
			title: "Expense",
			url: "/expense",
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user, logout } = useAuthContext();

	return (
		<Sidebar variant="floating" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href="#">
								<div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Image src={Logo} alt="Amotify" className="object-contain" />
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-semibold">Amotify</span>
									<span className="">Split bills. Settle easily.</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu className="gap-2">
						{data.navMain.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild>
									<a href={item.url} className="font-medium">
										{item.title}
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				{user && <NavUser user={user} />}
			</SidebarFooter>
		</Sidebar>
	);
}
