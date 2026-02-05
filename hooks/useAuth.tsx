"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";

// GraphQL Queries and Mutations
const LOGIN_MUTATION = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			success
			message
			user {
				_id
				firstName
				lastName
				userName
			}
			token
		}
	}
`;

const CREATE_USER_MUTATION = gql`
	mutation CreateUser($input: CreateUserInput!) {
		createUser(input: $input) {
			success
			message
			user {
				_id
				firstName
				lastName
				userName
			}
			token
		}
	}
`;

const ME_QUERY = gql`
	query Me {
		me {
			success
			message
			user {
				_id
				firstName
				lastName
				userName
			}
		}
	}
`;

// Types
interface User {
	_id: string;
	firstName: string;
	lastName: string;
	userName: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const TOKEN_KEY = "auth_token";

export function useAuth() {
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		token: null,
		isAuthenticated: false,
		isLoading: true,
	});

	// Login mutation
	const [loginMutation, { loading: loginLoading }] = useMutation(
		LOGIN_MUTATION,
		{
			onCompleted: (data: any) => {
				if (data.login.success && data.login.token) {
					const token = data.login.token;
					// Store in both localStorage and cookies
					localStorage.setItem(TOKEN_KEY, token);
					setCookie(TOKEN_KEY, token, 7);
					setAuthState({
						user: data.login.user,
						token,
						isAuthenticated: true,
						isLoading: false,
					});
				}
			},
		},
	);

	// Signup mutation
	const [signupMutation, { loading: signupLoading }] = useMutation(
		CREATE_USER_MUTATION,
		{
			onCompleted: (data: any) => {
				if (data.createUser.success && data.createUser.token) {
					const token = data.createUser.token;
					// Store in both localStorage and cookies
					localStorage.setItem(TOKEN_KEY, token);
					setCookie(TOKEN_KEY, token, 7);
					setAuthState({
						user: data.createUser.user,
						token,
						isAuthenticated: true,
						isLoading: false,
					});
				}
			},
		},
	);

	// Me query (to restore session)
	const { refetch: fetchMe } = useQuery(ME_QUERY, {
		skip: true,
	});

	// Handle me query result
	useEffect(() => {
		const handleMeQuery = async () => {
			const token = localStorage.getItem(TOKEN_KEY);
			if (token) {
				setAuthState((prev) => ({ ...prev, token, isLoading: true }));
				try {
					const result = await fetchMe();
					const data = result.data as any;
					if (data?.me?.success && data?.me?.user) {
						setAuthState((prev) => ({
							...prev,
							user: data.me.user,
							isAuthenticated: true,
							isLoading: false,
						}));
					} else {
						setAuthState((prev) => ({
							...prev,
							isLoading: false,
						}));
					}
				} catch {
					setAuthState({
						user: null,
						token: null,
						isAuthenticated: false,
						isLoading: false,
					});
				}
			} else {
				setAuthState((prev) => ({ ...prev, isLoading: false }));
			}
		};
		
		handleMeQuery();
	}, [fetchMe]);

	// Login function
	const login = useCallback(
		async (userName: string, password: string) => {
			try {
				const result = await loginMutation({
					variables: {
						input: { userName, password },
					},
				});
				return (result.data as any)?.login;
			} catch (error: any) {
				throw new Error(error.message || "Login failed");
			}
		},
		[loginMutation],
	);

	// Signup function
	const signup = useCallback(
		async (
			firstName: string,
			lastName: string,
			userName: string,
			password: string,
		) => {
			try {
				const result = await signupMutation({
					variables: {
						input: { firstName, lastName, userName, password },
					},
				});
				return (result.data as any)?.createUser;
			} catch (error: any) {
				throw new Error(error.message || "Signup failed");
			}
		},
		[signupMutation],
	);

	// Logout function
	const logout = useCallback(() => {
		localStorage.removeItem(TOKEN_KEY);
		deleteCookie(TOKEN_KEY);
		setAuthState({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,
		});
	}, []);

	// Get token for API requests
	const getToken = useCallback(() => {
		return authState.token || localStorage.getItem(TOKEN_KEY);
	}, [authState.token]);

	return {
		...authState,
		login,
		signup,
		logout,
		getToken,
		isLoading: authState.isLoading || loginLoading || signupLoading,
	};
}
