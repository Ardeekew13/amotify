"use client";

import { useQuery, useApolloClient } from "@apollo/client";
import { useEffect, useState, useCallback } from "react";
import { ME_QUERY } from "@/app/api/graphql/user";
import { getCookie, deleteCookie } from "@/lib/cookies";
import { User } from "@/interface/userInterface";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const useAuth = () => {
	const [status, setStatus] = useState<AuthStatus>("loading");
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(() => getCookie("token"));
	const client = useApolloClient();

	const { loading, error, data } = useQuery(ME_QUERY, {
		skip: !token,
		fetchPolicy: "network-only",
	});

	// Set authentication state
	const setAuth = useCallback(
		async (newUser: User, newToken: string) => {
			// Clear old cache first
			await client.clearStore();

			// Set new auth state
			setToken(newToken);
			setUser(newUser);
			setStatus("authenticated");
		},
		[client],
	);

	// Clear authentication state
	const clearAuth = useCallback(async () => {
		// Clear user state
		setUser(null);
		setToken(null);

		// Clear cookie
		deleteCookie("token");

		// Clear any legacy localStorage token
		if (typeof window !== "undefined") {
			localStorage.removeItem("auth_token");
		}

		// Set status to unauthenticated
		setStatus("unauthenticated");

		// Reset Apollo Client store to clear all cached data
		await client.resetStore();
	}, [client]);

	// Validate token and load user data
	useEffect(() => {
		const currentToken = getCookie("token");
		if (!currentToken) {
			setStatus("unauthenticated");
			return;
		}

		if (token !== currentToken) {
			setToken(currentToken);
		}

		if (loading) {
			setStatus("loading");
			return;
		}

		if (error || !data?.me?.success) {
			setStatus("unauthenticated");
			setUser(null);
		} else if (data?.me?.success && data?.me?.user) {
			setStatus("authenticated");
			setUser(data.me.user);
		}
	}, [token, loading, data, error]);

	// Handle inactivity timeout
	useEffect(() => {
		let inactivityTimer: NodeJS.Timeout;
		const resetInactivityTimer = () => {
			clearTimeout(inactivityTimer);
			inactivityTimer = setTimeout(clearAuth, INACTIVITY_TIMEOUT);
		};
		if (status === "authenticated") {
			const activityEvents = [
				"mousemove",
				"keydown",
				"click",
				"scroll",
				"touchstart",
			];
			activityEvents.forEach((event) => {
				window.addEventListener(event, resetInactivityTimer);
			});
			resetInactivityTimer();
		}
		return () => {
			clearTimeout(inactivityTimer);
			if (status === "authenticated") {
				const activityEvents = [
					"mousemove",
					"keydown",
					"click",
					"scroll",
					"touchstart",
				];
				activityEvents.forEach((event) => {
					window.removeEventListener(event, resetInactivityTimer);
				});
			}
		};
	}, [status, clearAuth]);

	return {
		user,
		token,
		status,
		isAuthenticated: status === "authenticated",
		isLoading: status === "loading",
		setAuth,
		clearAuth,
	};
};
