"use client";

import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useEffect, useState, useCallback } from "react";
import { ME_QUERY, LOGIN_MUTATION, SIGNUP_MUTATION } from "@/app/api/graphql/user";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";
import { User } from "@/interface/userInterface";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const useAuth = () => {
	const [status, setStatus] = useState<AuthStatus>("loading");
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(() => getCookie("token"));
	const client = useApolloClient();

	const { loading, error, data, refetch } = useQuery(ME_QUERY, {
		skip: !token,
		fetchPolicy: "network-only",
	});

	const [loginMutation] = useMutation(LOGIN_MUTATION);
	const [signupMutation] = useMutation(SIGNUP_MUTATION);

	const logout = useCallback(async () => {
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

	const getToken = useCallback(() => {
		return getCookie("token");
	}, []);

	useEffect(() => {
		const currentToken = getToken();
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
	}, [token, loading, data, error, getToken]);

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
			const newToken = response.data.login.token;
			const newUser = response.data.login.user;
			
			// Clear old cache first
			await client.clearStore();
			
			// Set new auth state
			setCookie("token", newToken);
			setToken(newToken);
			setUser(newUser);
			setStatus("authenticated");
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
			const newToken = response.data.signup.token;
			const newUser = response.data.signup.user;
			
			// Clear old cache first
			await client.clearStore();
			
			// Set new auth state
			setCookie("token", newToken);
			setToken(newToken);
			setUser(newUser);
			setStatus("authenticated");
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
