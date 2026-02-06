"use client";

import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ME_QUERY, LOGIN_MUTATION, SIGNUP_MUTATION } from "@/app/api/graphql/user";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";
import { User } from "@/interface/userInterface";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const useAuth = () => {
	const [token, setToken] = useState<string | null>(null);
	const { data, loading, error, refetch } = useQuery(ME_QUERY, {
		skip: !token,
	});
	const client = useApolloClient();
	const router = useRouter();
	const [status, setStatus] = useState<AuthStatus>("loading");
	const [user, setUser] = useState<User | null>(null);

	const [loginMutation] = useMutation(LOGIN_MUTATION);
	const [signupMutation] = useMutation(SIGNUP_MUTATION);

	const logout = useCallback(async () => {
		deleteCookie("token");
		setToken(null);
		await client.resetStore();
		router.replace("/login");
	}, [client, router]);

	const getToken = useCallback(() => {
		return getCookie("token");
	}, []);

	useEffect(() => {
		const storedToken = getToken();
		if (storedToken) {
			setToken(storedToken);
		} else {
			setStatus("unauthenticated");
		}
	}, [getToken]);

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
	}, [status, logout]);

	const login = async (userName: string, password: string) => {
		const response = await loginMutation({ variables: { userName, password } });
		if (response.data.login.success) {
			setCookie("token", response.data.login.token);
			setToken(response.data.login.token);
			await refetch();
		}
		return response;
	};

	const signup = async (
		firstName: string,
		lastName: string,
		userName: string,
		password: string,
	) => {
		const response = await signupMutation({
			variables: { firstName, lastName, userName, password },
		});
		if (response.data.signup.success) {
			setCookie("token", response.data.signup.token);
			setToken(response.data.signup.token);
			await refetch();
		}
		return response;
	};

	return {
		status,
		user,
		logout,
		token,
		isAuthenticated: status === "authenticated",
		isLoading: status === "loading",
		login,
		signup,
		getToken,
	};
};
