import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/signup"];

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/expense"];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	
	// Get token from cookies (we'll also check localStorage on client side)
	const token = request.cookies.get("auth_token")?.value;
	
	// Check if the current path is public
	const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
	
	// Check if the current path is protected
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
	
	// If trying to access protected route without token, redirect to login
	if (isProtectedRoute && !token) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}
	
	// If trying to access login/signup with token, redirect to dashboard
	if (isPublicRoute && token && pathname !== "/") {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}
	
	// If accessing root path, redirect based on authentication
	if (pathname === "/") {
		if (token) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		} else {
			return NextResponse.redirect(new URL("/login", request.url));
		}
	}
	
	return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
