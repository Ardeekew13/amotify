"use client";

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { ReactNode } from "react";
import { getCookie } from "@/lib/cookies";

// Auth middleware to add JWT token to headers
// This runs on EVERY request, so it always gets the current token
const authLink = new ApolloLink((operation, forward) => {
	// Get token from cookie dynamically on each request
	const token = typeof window !== 'undefined' ? getCookie('token') : null;
	
	// Add authorization header if token exists
	operation.setContext({
		headers: {
			authorization: token ? `Bearer ${token}` : "",
		}
	});
	
	return forward(operation);
});

const httpLink = new HttpLink({
	uri: "/api/graphql",
});

const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
});

export function ApolloWrapper({ children }: { children: ReactNode }) {
	return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
