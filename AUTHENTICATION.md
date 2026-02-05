# JWT Authentication System

## Overview
This project uses GraphQL-based authentication with JWT (JSON Web Tokens) for secure user authentication and session management.

## Architecture

### Backend Components

#### 1. JWT Utilities (`/lib/auth.ts`)
- `generateToken(userId)` - Creates JWT tokens
- `verifyToken(token)` - Validates and decodes JWT tokens
- `extractTokenFromHeader(header)` - Extracts token from Authorization header
- `getUserIdFromRequest(request)` - Gets authenticated user ID from request

#### 2. GraphQL Context (`/app/api/graphql/route.ts`)
- Automatically extracts JWT from Authorization header
- Injects `userId` into GraphQL context for all resolvers
- Available in all resolvers as `context.userId`

#### 3. User Resolvers (`/backend/graphql/resolvers/user.ts`)
- **Mutations:**
  - `createUser` - Register new user with password hashing
  - `login` - Authenticate user and return JWT token
  - `deleteUser` - Remove user account
  
- **Queries:**
  - `getUsers` - Fetch all users (with optional search)
  - `getOneUser` - Get single user by ID
  - `me` - Get currently authenticated user (requires auth)

### Frontend Components

#### 1. Apollo Client Setup (`/lib/apollo-provider.tsx`)
- Automatically adds JWT token to all GraphQL requests
- Reads token from localStorage (`auth_token` key)
- Adds `Authorization: Bearer <token>` header

#### 2. Authentication Hook (`/hooks/useAuth.tsx`)
- `login(userName, password)` - Login user
- `signup(firstName, lastName, userName, password)` - Register user
- `logout()` - Clear authentication state
- `getToken()` - Get current JWT token
- State: `user`, `token`, `isAuthenticated`, `isLoading`

#### 3. Auth Context (`/components/auth/AuthProvider.tsx`)
- Provides authentication state to entire app
- Wraps app in context provider

#### 4. Protected Route Component (`/components/auth/ProtectedRoute.tsx`)
- Wraps pages that require authentication
- Auto-redirects to login if not authenticated
- Shows loading state during auth check

## Usage Guide

### Setup Environment Variables

```bash
# .env.local
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/amotify
```

### 1. Wrap App with Providers

```tsx
// app/layout.tsx
import { ApolloWrapper } from "@/lib/apollo-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ApolloWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
```

### 2. Login Page Example

```tsx
"use client";

import { useAuthContext } from "@/components/auth/AuthProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, isLoading } = useAuthContext();
  const router = useRouter();
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(formData.userName, formData.password);
      if (result.success) {
        router.push("/dashboard");
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.userName}
        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
        placeholder="Username"
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : "Login"}
      </button>
    </form>
  );
}
```

### 3. Protected Page Example

```tsx
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthContext } from "@/components/auth/AuthProvider";

export default function DashboardPage() {
  const { user, logout } = useAuthContext();

  return (
    <ProtectedRoute>
      <div>
        <h1>Welcome, {user?.firstName}!</h1>
        <button onClick={logout}>Logout</button>
      </div>
    </ProtectedRoute>
  );
}
```

### 4. Using Auth in GraphQL Resolvers

```typescript
// Any resolver can access the authenticated user
export const expenseResolvers = {
  Mutation: {
    createExpense: async (_: any, { input }: any, context: GraphQLContext) => {
      // Check if user is authenticated
      if (!context.userId) {
        throw new Error("Not authenticated");
      }

      // Use the authenticated user ID
      const expense = await Expense.create({
        ...input,
        createdBy: context.userId,
      });

      return expense;
    },
  },
};
```

### 5. Making Authenticated API Calls

The Apollo Client automatically includes the JWT token in all requests, so you don't need to manually add it:

```tsx
"use client";

import { useQuery, gql } from "@apollo/client/react";

const GET_MY_EXPENSES = gql`
  query GetMyExpenses {
    myExpenses {
      _id
      title
      amount
    }
  }
`;

export function MyExpenses() {
  const { data, loading } = useQuery(GET_MY_EXPENSES);
  
  // Token is automatically included in request headers!
  
  return <div>{/* Render expenses */}</div>;
}
```

## Security Features

✅ **Password Hashing** - Passwords are hashed with bcrypt (salt rounds: 10)
✅ **JWT Tokens** - Secure token-based authentication
✅ **Token Expiration** - Configurable token lifetime (default: 7 days)
✅ **Automatic Header Injection** - Tokens automatically added to all GraphQL requests
✅ **Protected Routes** - Easy-to-use component for route protection
✅ **Session Persistence** - Tokens stored in localStorage for persistent sessions

## Token Flow

1. **Registration/Login:**
   - User submits credentials
   - Backend validates and creates JWT token
   - Token returned to client
   - Client stores token in localStorage
   - Client updates authentication state

2. **Subsequent Requests:**
   - Apollo Client reads token from localStorage
   - Token added to Authorization header: `Bearer <token>`
   - GraphQL route extracts and verifies token
   - User ID injected into resolver context
   - Resolver uses `context.userId` for authorization

3. **Logout:**
   - Token removed from localStorage
   - Authentication state cleared
   - User redirected to login

## Best Practices

1. **Always use environment variables** for JWT_SECRET in production
2. **Use HTTPS** in production to prevent token interception
3. **Implement token refresh** for long-lived sessions (optional enhancement)
4. **Add rate limiting** to prevent brute force attacks (optional enhancement)
5. **Validate user permissions** in resolvers, not just authentication
6. **Use Protected Route wrapper** for all authenticated pages
7. **Clear tokens on logout** to prevent unauthorized access

## Troubleshooting

### "Not authenticated" errors
- Check if token exists in localStorage
- Verify token hasn't expired
- Ensure Apollo Client is properly configured with authLink
- Check JWT_SECRET matches between frontend and backend

### Token not being sent
- Verify Apollo Client setup in apollo-provider.tsx
- Check Authorization header in Network tab
- Ensure localStorage has 'auth_token' key

### "Invalid token" errors
- Token may be expired or corrupted
- JWT_SECRET may have changed
- Try logging out and logging back in
