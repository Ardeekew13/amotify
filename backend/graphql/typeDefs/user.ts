import { gql } from "graphql-tag";

export const userTypeDefs = gql`
	type User {
		_id: ID!
		firstName: String!
		lastName: String!
		userName: String!
		qrCodeUrl: String
		qrCodePublicId: String
		createdAt: String!
		updatedAt: String!
	}

	type UserResponse {
		success: Boolean!
		message: String!
		user: User
	}

	type UsersResponse {
		success: Boolean!
		message: String!
		users: [User!]
	}

	type AuthResponse {
		success: Boolean!
		message: String!
		user: User
		token: String
	}

	input CreateUserInput {
		firstName: String!
		lastName: String!
		userName: String!
		password: String!
	}

	input LoginInput {
		userName: String!
		password: String!
	}

	input UpdateProfileInput {
		firstName: String
		lastName: String
		qrCodeUrl: String
		qrCodePublicId: String
	}

	extend type Query {
		getUsersExcludeSelf(search: String, _id: ID!): UsersResponse!
		getOneUser(_id: ID!): UserResponse!
		me: UserResponse!
	}

	extend type Mutation {
		createUser(input: CreateUserInput!): AuthResponse!
		login(input: LoginInput!): AuthResponse!
		deleteUser(_id: ID!): UserResponse!
		updateProfile(input: UpdateProfileInput!): UserResponse!
		deleteQRCode: UserResponse!
	}
`;
