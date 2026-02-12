"use client";

interface FloatingButtonProps {
	children: React.ReactNode;
}

const FloatingButton = ({ children }: FloatingButtonProps) => {
	return (
		<div
			style={{
				position: "fixed",
				bottom: 0,
				left: 0,
				right: 0,
				width: "100%",
				height: 64,
				zIndex: 10,
				backgroundColor: "#2b2c2b",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					height: "100%",
					padding: "0 24px",
				}}
			>
				{children}
			</div>
		</div>
	);
};

export default FloatingButton;
