import { gql } from "graphql-tag";

/**
 * CENTRALIZED GRAPHQL TYPE DEFINITIONS
 * 
 * This file contains all shared GraphQL types.
 * Import and use these types across all your typeDefs to avoid duplication.
 */

// GraphQL Context interface
export interface GraphQLContext {
	req: any;
	res: any;
	userId: string | null;
}

export const sharedTypes = gql`
	# ================================
	# USER TYPE (Shared across all modules)
	# ================================
	type User {
		_id: ID!
		firstName: String!
		lastName: String!
		email: String!
		userName: String
		qrCodeUrl: String
		qrCodePublicId: String
		createdAt: String
		updatedAt: String
	}

	type SplitMember {
		userId: ID!
		user: User!     
		amount: Float!
		splitPercentage: Float!
		status: String
		addOns: [Float]
		deductions: [Float]
		balance: Float
	}

	# ================================
	# COMMON RESPONSE TYPES
	# ================================
	type GenericResponse {
		success: Boolean!
		message: String!
	}
`;
