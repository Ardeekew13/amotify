"use client";

interface FloatingButtonProps {
	children: React.ReactNode;
}

const FloatingButton = ({ children }: FloatingButtonProps) => {
	return (
		<div className="fixed bottom-0 left-0 right-0 w-full h-16 bg-[#2b2c2b]">
			<div className="flex items-center  h-full px-6">{children}</div>
		</div>
	);
};

export default FloatingButton;
