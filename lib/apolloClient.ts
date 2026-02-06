import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { getCookie } from "@/lib/cookies";

const httpLink = new HttpLink({
  uri: "/api/graphql", // Your Next.js GraphQL endpoint
});

// Auth middleware to add JWT token to headers
const authLink = new ApolloLink((operation, forward) => {
  // Get token from cookie (consistent with useAuth)
  const token = typeof window !== 'undefined' ? getCookie('token') : null;
  
  // Add authorization header if token exists
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    }
  });
  
  return forward(operation);
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export default client;
