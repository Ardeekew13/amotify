import Image from "next/image";
import { GalleryVerticalEnd } from "lucide-react";
import Logo from "@/assets/amotify.png";

interface AuthLayoutProps {
	children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div
			style={{
				display: "grid",
				minHeight: "100vh",
				gridTemplateColumns: "1fr",
			}}
			className="lg:grid-cols-2"
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "1rem",
					padding: "1.5rem",
				}}
			>
				<div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }} className="md:justify-start">
					<a
						href="/"
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
							fontWeight: 500,
							textDecoration: "none",
							color: "inherit",
						}}
					>
						<div
							style={{
								backgroundColor: "#22c55e",
								color: "white",
								display: "flex",
								width: "1.5rem",
								height: "1.5rem",
								alignItems: "center",
								justifyContent: "center",
								borderRadius: "0.375rem",
							}}
						>
							<GalleryVerticalEnd style={{ width: "1rem", height: "1rem" }} />
						</div>
						Amotify
					</a>
				</div>
				<div
					style={{
						display: "flex",
						flex: 1,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<div style={{ width: "100%", maxWidth: "28rem" }}>{children}</div>
				</div>
			</div>
			<div
				style={{
					backgroundColor: "#f9fafb",
					position: "relative",
					display: "none",
					alignItems: "center",
					justifyContent: "center",
					padding: "3rem",
				}}
				className="lg:flex"
			>
				<div style={{ position: "relative", width: "75%", height: "75%" }}>
					<Image
						src={Logo}
						alt="Amotify"
						fill
						style={{ objectFit: "contain" }}
						priority
					/>
				</div>
			</div>
		</div>
	);
}
