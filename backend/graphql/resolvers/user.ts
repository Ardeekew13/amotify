import User from "../../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { GraphQLContext } from "../types";

export const userResolvers = {
	Query: {
		getUsersExcludeSelf: async (
			_: any,
			{ search, _id }: { search?: string; _id?: string },
		) => {
			try {
				const query = search
					? {
							$or: [
								{ firstName: { $regex: search, $options: "i" } },
								{ lastName: { $regex: search, $options: "i" } },
							],
							_id: { $ne: _id },
						}
					: {};

				const users = await User.find(query)
					.select("-password")
					.sort({ createdAt: -1 });

				return {
					success: true,
					message: `Found ${users.length} user(s)`,
					users,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to fetch users",
					users: [],
				};
			}
		},

		getOneUser: async (_: any, { _id }: { _id: string }) => {
			try {
				const user = await User.findById(_id).select("-password");

				if (!user) {
					return {
						success: false,
						message: "User not found",
						user: null,
					};
				}

				return {
					success: true,
					message: "User found",
					user,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to fetch user",
					user: null,
				};
			}
		},

		me: async (_: any, __: any, context: GraphQLContext) => {
			try {
				// Get user from context (set by auth middleware)
				const userId = context.userId;

				if (!userId) {
					return {
						success: false,
						message: "Not authenticated",
						user: null,
					};
				}

				const user = await User.findById(userId).select("-password");

				if (!user) {
					return {
						success: false,
						message: "User not found",
						user: null,
					};
				}

				return {
					success: true,
					message: "User found",
					user,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to fetch user",
					user: null,
				};
			}
		},
	},

	Mutation: {
		createUser: async (
			_: any,
			{
				input,
			}: {
				input: {
					firstName: string;
					lastName: string;
					userName: string;
					password: string;
				};
			},
		) => {
			try {
				// Check if user already exists
				const existingUser = await User.findOne({ userName: input.userName });

				if (existingUser) {
					return {
						success: false,
						message: "User with this username already exists",
						user: null,
						token: null,
					};
				}

				// Hash password
				const hashedPassword = await bcrypt.hash(input.password, 10);

				// Create user
				const user = await User.create({
					...input,
					password: hashedPassword,
				});

				// Generate JWT token
				const token = generateToken(user._id.toString());

				// Return user without password
				const { password: _, ...userWithoutPassword } = user.toObject();

				return {
					success: true,
					message: "User created successfully",
					user: userWithoutPassword,
					token,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to create user",
					user: null,
					token: null,
				};
			}
		},

		login: async (
			_: any,
			{ input }: { input: { userName: string; password: string } },
		) => {
			try {
				// Find user by username
				const user = await User.findOne({ userName: input.userName });
				if (!user) {
					return {
						success: false,
						message: "Invalid username or password",
						user: null,
						token: null,
					};
				}

				// Check password
				const isPasswordValid = await bcrypt.compare(
					input.password,
					user.password,
				);

				if (!isPasswordValid) {
					return {
						success: false,
						message: "Invalid username or password",
						user: null,
						token: null,
					};
				}

				// Generate JWT token
				const token = generateToken(user._id.toString());

				// Return user without password
				const { password: _, ...userWithoutPassword } = user.toObject();

				return {
					success: true,
					message: "Login successful",
					user: userWithoutPassword,
					token,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to login",
					user: null,
					token: null,
				};
			}
		},

		deleteUser: async (_: any, { id }: { id: string }) => {
			try {
				const user = await User.findByIdAndDelete(id);

				if (!user) {
					return {
						success: false,
						message: "User not found",
						user: null,
					};
				}

				return {
					success: true,
					message: "User deleted successfully",
					user: null,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to delete user",
					user: null,
				};
			}
		},

		deleteQRCode: async (_: any, __: any, context: GraphQLContext) => {
			try {
				const userId = context.userId;

				if (!userId) {
					return {
						success: false,
						message: "Not authenticated",
						user: null,
					};
				}

				const user = await User.findByIdAndUpdate(
					userId,
					{
						qrCodeUrl: null,
						qrCodePublicId: null,
					},
					{ new: true },
				).select("-password");

				if (!user) {
					return {
						success: false,
						message: "User not found",
						user: null,
					};
				}

				return {
					success: true,
					message: "QR code deleted successfully",
					user,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to delete QR code",
					user: null,
				};
			}
		},

		updateProfile: async (
			_: any,
			{
				input,
			}: {
				input: {
					firstName?: string;
					lastName?: string;
					qrCodeUrl?: string;
					qrCodePublicId?: string;
				};
			},
			context: GraphQLContext,
		) => {
			try {
				const userId = context.userId;

				if (!userId) {
					return {
						success: false,
						message: "Not authenticated",
						user: null,
					};
				}

				// Build update object with only provided fields
				const updateData: any = {};
				if (input.firstName !== undefined)
					updateData.firstName = input.firstName;
				if (input.lastName !== undefined) updateData.lastName = input.lastName;
				if (input.qrCodeUrl !== undefined)
					updateData.qrCodeUrl = input.qrCodeUrl;
				if (input.qrCodePublicId !== undefined)
					updateData.qrCodePublicId = input.qrCodePublicId;

				const user = await User.findByIdAndUpdate(
					userId,
					{ $set: updateData },
					{ new: true, runValidators: true },
				).select("-password");

				// Verify the update by fetching again
				const verifyUser = await User.findById(userId).select("-password");

				if (!user) {
					return {
						success: false,
						message: "User not found",
						user: null,
					};
				}

				return {
					success: true,
					message: "Profile updated successfully",
					user,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to update profile",
					user: null,
				};
			}
		},
	},
};
