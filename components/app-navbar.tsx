"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
	LayoutDashboard,
	Receipt,
	LogOut,
} from "lucide-react";
import { Button, Avatar, Dropdown, Typography } from "antd";
import type { MenuProps } from "antd";
import { useAuthContext } from "@/components/auth/AuthProvider";

const { Text } = Typography;

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

	const dropdownItems: MenuProps['items'] = [
		{
			key: 'logout',
			label: (
				<span onClick={handleLogout}>
					<LogOut style={{ marginRight: 8, width: 16, height: 16, display: 'inline' }} />
					Log out
				</span>
			),
		},
	];

	return (
		<header style={{
			position: 'sticky',
			top: 0,
			zIndex: 50,
			display: 'flex',
			height: 64,
			alignItems: 'center',
			justifyContent: 'space-between',
			width: '100%',
			gap: 16,
			backgroundColor: '#fff',
			padding: '0 24px',
			borderBottom: '1px solid #f0f0f0'
		}}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
				<Text
					strong
					style={{ cursor: 'pointer', fontSize: 18 }}
					onClick={() => router.push("/dashboard")}
				>
					Amotify
				</Text>

				<nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname.startsWith(item.url);

						return (
							<Button
								key={item.title}
								type={isActive ? "primary" : "text"}
								size="small"
								icon={<Icon style={{ width: 16, height: 16 }} />}
								onClick={() => router.push(item.url)}
							>
								{item.title}
							</Button>
						);
					})}
				</nav>
			</div>

			{user && (
				<Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
					<Button
						type="text"
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							height: 32,
							width: 160,
							justifyContent: 'flex-end'
						}}
					>
						<Avatar size={36} style={{ backgroundColor: '#22c55e' }}>
							{user?.firstName?.[0]}{user?.lastName?.[0]}
						</Avatar>
						<Text>{user.firstName} {user.lastName}</Text>
					</Button>
				</Dropdown>
			)}
		</header>
	);
}
