"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAuth as useAuthHook } from "@/hooks/useAuth";

interface User {
	_id: string;
	firstName: string;
	lastName: string;
	userName: string;
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (userName: string, password: string) => Promise<any>;
	signup: (
		firstName: string,
		lastName: string,
		userName: string,
		password: string,
	) => Promise<any>;
	logout: () => void;
	getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const auth = useAuthHook();

	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
}
