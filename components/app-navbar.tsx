"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
	LayoutDashboard,
	Receipt,
	Settings2,
	Users,
	LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth/AuthProvider";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Expenses",
		url: "/expense",
		icon: Receipt,
	},
];

export function AppNavbar() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuthContext();

	const handleLogout = () => {
		logout();
		router.push("/login");
	};

	return (
		<header className="sticky top-0 z-50 flex h-16 items-center justify-between w-full gap-4 bg-background px-6">
			<div className="flex items-center gap-6">
				<h1
					className="cursor-pointer text-lg font-semibold"
					onClick={() => router.push("/dashboard")}
				>
					Amotify
				</h1>

				<nav className="flex items-center gap-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname.startsWith(item.url);

						return (
							<Button
								key={item.title}
								variant="ghost"
								size="sm"
								className={cn(
									"gap-2",
									isActive && "bg-accent text-accent-foreground",
								)}
								onClick={() => router.push(item.url)}
							>
								<Icon className="h-4 w-4" />
								{item.title}
							</Button>
						);
					})}
				</nav>
			</div>

			{user && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="relative justify-end h-8 w-40 ">
							<Avatar className="h-8 w-8">
								<AvatarImage
									src="/avatars/01.png"
									alt={`${user?.firstName} ${user?.lastName}`}
								/>
								<AvatarFallback>
									{user?.firstName?.[0]}
									{user.lastName?.[0]}
								</AvatarFallback>
							</Avatar>
							<h1>
								{user.firstName} {user.lastName}
							</h1>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56" align="end" forceMount>
						<DropdownMenuItem onClick={handleLogout}>
							<LogOut className="mr-2 h-4 w-4" />
							<span>Log out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</header>
	);
}
