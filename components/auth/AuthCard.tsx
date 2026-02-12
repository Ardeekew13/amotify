"use client";

import { Card } from "antd";
import { ReactNode } from "react";

interface AuthCardProps {
	children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
	return (
		<Card
			style={{
				width: "100%",
				maxWidth: 400,
				boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
			}}
		>
			{children}
		</Card>
	);
}
