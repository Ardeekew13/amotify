import Image from "next/image";
import { GalleryVerticalEnd } from "lucide-react";
import Logo from "@/assets/amotify.png";

interface AuthLayoutProps {
	children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div style={{ width: "100%", minHeight: "100vh" }}>
			{children}
		</div>
	);
}
