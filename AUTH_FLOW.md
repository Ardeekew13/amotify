# Authentication Flow Documentation

## Overview
Complete authentication system with JWT tokens, route protection, and automatic redirects.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Visits App                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │   middleware.ts      │
           │  Checks auth_token   │
           │     in cookies       │
           └──────────┬───────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
    ┌─────▼─────┐          ┌─────▼─────┐
    │  No Token │          │Has Token  │
    └─────┬─────┘          └─────┬─────┘
          │                      │
          ▼                      ▼
    ┌──────────┐          ┌──────────┐
    │ /login   │          │/dashboard│
    └──────────┘          └──────────┘
```

## Components

### 1. Server-Side Protection (middleware.ts)
- **Location**: `/middleware.ts`
- **Purpose**: Protect routes at the server level
- **Checks**: Cookie-based authentication (`auth_token`)
- **Actions**:
  - Redirects `/` to `/login` or `/dashboard` based on auth
  - Blocks access to `/dashboard` and `/expense` without token
  - Prevents logged-in users from accessing `/login` or `/signup`

### 2. Client-Side Protection (ProtectedRoute)
- **Location**: `/components/auth/ProtectedRoute.tsx`
- **Purpose**: Double-layer protection on client side
- **Checks**: Authentication state from `useAuth` hook
- **Actions**:
  - Shows loading spinner while checking auth
  - Redirects to `/login` if not authenticated
  - Renders children if authenticated

### 3. Authentication Hook (useAuth)
- **Location**: `/hooks/useAuth.tsx`
- **Purpose**: Manage authentication state
- **Functions**:
  - `login(userName, password)` - Login and store token
  - `signup(...)` - Register and store token
  - `logout()` - Clear token and state
- **Storage**: Both `localStorage` and `cookies`

### 4. Auth Context (AuthProvider)
- **Location**: `/components/auth/AuthProvider.tsx`
- **Purpose**: Provide auth state to entire app
- **Usage**: Wrap in root layout

## Routes

### Public Routes (No Auth Required)
- `/login` - Login page
- `/signup` - Registration page

### Protected Routes (Auth Required)
- `/dashboard` - Main dashboard
- `/expense/*` - All expense pages

### Special Routes
- `/` - Auto-redirects based on auth status

## Token Storage

### Dual Storage Strategy
Tokens are stored in **both** localStorage and cookies:

1. **Cookies** (`auth_token`)
   - Used by server-side middleware
   - HTTPOnly: No (needs client access)
   - SameSite: Lax
   - Expires: 7 days

2. **LocalStorage** (`auth_token`)
   - Used by Apollo Client
   - Accessible via JavaScript
   - Persists across page refreshes

## Authentication Flow

### Login Flow
```
1. User submits login form
   ↓
2. GraphQL mutation to /api/graphql
   ↓
3. Backend validates credentials
   ↓
4. Returns JWT token + user data
   ↓
5. Token stored in localStorage + cookies
   ↓
6. User redirected to /dashboard (or original destination)
```

### Signup Flow
```
1. User submits signup form
   ↓
2. GraphQL mutation to /api/graphql
   ↓
3. Backend creates user + hashes password
   ↓
4. Returns JWT token + user data
   ↓
5. Token stored in localStorage + cookies
   ↓
6. User redirected to /dashboard
```

### Logout Flow
```
1. User clicks logout
   ↓
2. Token removed from localStorage + cookies
   ↓
3. Auth state cleared
   ↓
4. User redirected to /login
```

### Page Access Flow
```
1. User navigates to protected page
   ↓
2. Middleware checks cookie token
   ├─ No token → Redirect to /login
   └─ Has token → Allow access
   ↓
3. ProtectedRoute component checks auth state
   ├─ Not authenticated → Redirect to /login
   └─ Authenticated → Render page
```

## Code Examples

### Protecting a Page
```tsx
// app/my-protected-page/page.tsx
"use client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

### Using Auth Context
```tsx
"use client";
import { useAuthContext } from "@/components/auth/AuthProvider";

export function MyComponent() {
  const { user, logout, isAuthenticated } = useAuthContext();
  
  return (
    <div>
      {isAuthenticated && (
        <>
          <p>Welcome, {user?.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </div>
  );
}
```

### Manual Login
```tsx
const { login } = useAuthContext();

const handleLogin = async () => {
  try {
    const result = await login("username", "password");
    if (result.success) {
      // Redirect handled automatically
    }
  } catch (error) {
    console.error("Login failed", error);
  }
};
```

## Security Features

✅ **Dual-layer protection** (server + client)
✅ **Cookie + localStorage** token storage
✅ **Automatic token injection** in GraphQL requests
✅ **Password hashing** with bcrypt
✅ **JWT expiration** (7 days default)
✅ **Redirect preservation** (return to original page after login)
✅ **Protected layouts** (entire dashboard wrapped)

## Configuration

### Environment Variables
```bash
# .env.local
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### Middleware Configuration
Edit `/middleware.ts` to customize:
- `publicRoutes` - Routes accessible without auth
- `protectedRoutes` - Routes requiring auth

### Token Expiration
Modify in `/lib/cookies.ts`:
```typescript
setCookie("auth_token", token, 7); // 7 days
```

## Troubleshooting

### "Redirecting to login even when logged in"
- Check if cookie is set: Open DevTools → Application → Cookies
- Verify token hasn't expired
- Clear cookies and login again

### "Can still access protected routes without login"
- Ensure middleware is running (check `middleware.ts`)
- Verify route patterns in `config.matcher`
- Check if token is in cookies (not just localStorage)

### "Infinite redirect loop"
- Check if middleware and ProtectedRoute aren't conflicting
- Verify redirect logic in root page (`/`)
- Clear all cookies and localStorage, then try again

### "Token not being sent to GraphQL"
- Verify Apollo Client setup in `/lib/apollo-provider.tsx`
- Check authLink is properly concatenated
- Inspect Network tab for Authorization header

## Testing the Flow

1. **Test Unauthenticated Access**:
   - Clear all cookies and localStorage
   - Navigate to `/`
   - Should redirect to `/login`
   - Try accessing `/dashboard` directly
   - Should redirect to `/login`

2. **Test Login**:
   - Fill in login form
   - Should redirect to `/dashboard`
   - Verify cookie is set
   - Verify token in localStorage

3. **Test Protected Routes**:
   - Navigate to `/dashboard`
   - Should see dashboard
   - Navigate to `/expense`
   - Should work without redirect

4. **Test Logout**:
   - Click logout
   - Should redirect to `/login`
   - Cookie should be removed
   - Try accessing `/dashboard`
   - Should redirect to `/login`

5. **Test Signup**:
   - Fill in signup form
   - Should create account and redirect to `/dashboard`
   - Should be fully logged in
