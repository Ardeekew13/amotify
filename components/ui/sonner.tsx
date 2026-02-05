"use client";

import {
	CheckCircle2,
	Info,
	Loader2,
	XCircle,
	AlertTriangle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			position="top-right" // Default position
			duration={3000} // Default duration (5 seconds)
			closeButton={false} // Show close button on all toasts
			richColors={false} // Use default white/black colors
			expand={true} // Expand on hover
			visibleToasts={3} // Max visible toasts at once
			icons={{
				success: <CheckCircle2 className="h-4 w-4" />,
				info: <Info className="h-4 w-4" />,
				warning: <AlertTriangle className="h-4 w-4" />,
				error: <XCircle className="h-4 w-4" />,
				loading: <Loader2 className="h-4 w-4 animate-spin" />,
			}}
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
					title: "!text-gray-900 dark:!text-gray-100 !font-semibold",
					description: "!text-gray-900 dark:!text-gray-100",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
