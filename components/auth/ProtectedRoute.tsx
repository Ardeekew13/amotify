"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
	children: React.ReactNode;
	redirectTo?: string;
}

/**
 * Protected Route Component
 * Wraps components that require authentication
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({
	children,
	redirectTo = "/login",
}: ProtectedRouteProps) {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push(redirectTo);
		}
	}, [isAuthenticated, isLoading, router, redirectTo]);

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	// Don't render children if not authenticated
	if (!isAuthenticated) {
		return null;
	}

	return <>{children}</>;
}
