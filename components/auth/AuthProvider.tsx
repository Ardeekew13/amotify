"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAuth as useAuthHook } from "@/hooks/useAuth";
import { User } from "@/interface/userInterface";

interface AuthContextType {
	user: User | null;
	token: string | null;
	status: "loading" | "authenticated" | "unauthenticated";
	isAuthenticated: boolean;
	isLoading: boolean;
	setAuth: (user: User, token: string) => Promise<void>;
	clearAuth: () => Promise<void>;
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
