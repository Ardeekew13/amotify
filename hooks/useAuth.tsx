"use client";

import { useQuery, useApolloClient } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ME_QUERY } from "@/app/api/graphql/user";
import { deleteCookie } from "@/lib/cookies";
import { User } from "@/interface/userInterface";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const useAuth = () => {
	const { data, loading, error } = useQuery(ME_QUERY);
	const client = useApolloClient();
	const router = useRouter();
	const [status, setStatus] = useState<AuthStatus>("loading");
	const [user, setUser] = useState<User | null>(null);

	const logout = useCallback(async () => {
		deleteCookie("token");
		await client.resetStore();
		router.replace("/login");
	}, [client, router]);

	useEffect(() => {
		if (loading) {
			setStatus("loading");
			return;
		}

		if (error || !data?.me?.user) {
			setStatus("unauthenticated");
			setUser(null);
		} else if (data.me.success && data.me.user) {
			setStatus("authenticated");
			setUser(data.me.user);
		} else {
			setStatus("unauthenticated");
			setUser(null);
		}
	}, [data, loading, error]);

	useEffect(() => {
		let inactivityTimer: NodeJS.Timeout;

		const resetInactivityTimer = () => {
			clearTimeout(inactivityTimer);
			inactivityTimer = setTimeout(logout, INACTIVITY_TIMEOUT);
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
			resetInactivityTimer(); // Initial timer start
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
	}, [status, logout]);

	return { status, user, logout };
};
