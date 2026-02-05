import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JWTPayload {
	userId: string;
	iat?: number;
	exp?: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: string): string {
	// @ts-ignore - TypeScript issue with jsonwebtoken types
	return jwt.sign({ userId }, JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN,
	});
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
		return decoded;
	} catch (error) {
		return null;
	}
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(
	authorizationHeader?: string | null,
): string | null {
	if (!authorizationHeader) {
		return null;
	}

	// Support both "Bearer <token>" and just "<token>"
	const parts = authorizationHeader.split(" ");
	if (parts.length === 2 && parts[0] === "Bearer") {
		return parts[1];
	}

	// If it's just the token without "Bearer"
	if (parts.length === 1) {
		return parts[0];
	}

	return null;
}

/**
 * Get user ID from request headers
 */
export function getUserIdFromRequest(
	request: any,
): string | null {
	const authHeader = request.headers?.get?.("authorization") || request.headers?.authorization;
	const token = extractTokenFromHeader(authHeader);

	if (!token) {
		return null;
	}

	const payload = verifyToken(token);
	return payload?.userId || null;
}
