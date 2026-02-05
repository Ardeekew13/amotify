import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
	firstName: string;
	lastName: string;
	userName: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
	{
		firstName: {
			type: String,
			required: [true, "First name is required"],
			trim: true,
		},
		lastName: {
			type: String,
			required: [true, "Last name is required"],
			trim: true,
		},
		userName: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			lowercase: true,
			trim: true,
			minlength: [3, "Username must be at least 3 characters"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters"],
		},
	},
	{
		timestamps: true,
	}
);

// Prevent model recompilation in development
const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
