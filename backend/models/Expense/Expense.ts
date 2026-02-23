import mongoose, { Schema, Document, Model } from "mongoose";
import {
	ExpenseStatus,
	MemberExpenseStatus,
} from "../../../interface/common/common";
import { isValidImageUrl } from "../../../lib/receiptUtils";

interface IMemberExpense {
	userId: mongoose.Types.ObjectId;
	amount: number;
	splitPercentage: number;
	status: MemberExpenseStatus;
	addOns?: number[];
	deductions?: number[];
	balance?: number;
}

export interface IExpense extends Document {
	title: string;
	amount: number;
	split: IMemberExpense[];
	description?: string;
	receiptUrl?: string[];
	receiptPublicId?: string[];
	paidBy: mongoose.Types.ObjectId;
	status: ExpenseStatus;
	createdAt: string;
	updatedAt: string;
}

const MemberExpenseSchema = new Schema<IMemberExpense>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		amount: {
			type: Number,
			required: true,
			min: [0, "Split amount must be positive"],
		},
		splitPercentage: {
			type: Number,
			required: true,
			min: [0, "Split percentage must be positive"],
			max: [100, "Split percentage cannot exceed 100"],
		},
		status: {
			type: String,
			enum: Object.values(MemberExpenseStatus),
			required: true,
		},
		addOns: {
			type: [Number],
			default: [],
		},
		deductions: {
			type: [Number],
			default: [],
		},
		balance: {
			type: Number,
		},
	},
	{ _id: false },
);

const ExpenseSchema = new Schema<IExpense>(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
		},
		amount: {
			type: Number,
			required: [true, "Amount is required"],
			min: [0, "Amount must be positive"],
		},
		split: {
			type: [MemberExpenseSchema],
			required: [true, "Split information is required"],
			validate: {
				validator: function (this: any, split: IMemberExpense[]) {
					const totalSplit = split.reduce(
						(sum, member) => sum + member.amount,
						0,
					);
					// Round both values to 2 decimal places before comparison
					const roundedSplit = Math.round(totalSplit * 100) / 100;
					const roundedAmount = Math.round(this.amount * 100) / 100;
					return Math.abs(roundedSplit - roundedAmount) < 0.01;
				},
				message: "Split amounts must add up to total expense amount",
			},
		},
		paidBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Payer is required"],
		},
		description: {
			type: String,
			trim: true,
		},
		receiptUrl: {
			type: [String],
			default: [],
		},
		receiptPublicId: {
			type: [String],
			default: [],
		},
		status: {
			type: String,
			enum: Object.values(ExpenseStatus),
			default: ExpenseStatus.AWAITING_PAYMENT,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

ExpenseSchema.virtual("paidByUser", {
	ref: "User",
	localField: "paidBy",
	foreignField: "_id",
	justOne: true,
});

// Pre-save middleware to update status
ExpenseSchema.pre<IExpense>("save", function (next) {
	const allPaid = this.split.every(
		(member) => member.status === MemberExpenseStatus.PAID,
	);
	this.status = allPaid
		? ExpenseStatus.COMPLETED
		: ExpenseStatus.AWAITING_PAYMENT;
	next();
});

// Document-level validation for receipts (runs after all fields are set)
ExpenseSchema.pre("validate", function (next) {
	const receiptUrls = this.receiptUrl || [];
	const receiptPublicIds = this.receiptPublicId || [];

	// Validate receipt URLs
	if (receiptUrls.length > 5) {
		this.invalidate("receiptUrl", "Maximum 5 receipt URLs allowed");
		return next();
	}

	// Validate array lengths match
	if (receiptUrls.length !== receiptPublicIds.length) {
		this.invalidate(
			"receiptPublicId",
			`Receipt public IDs (${receiptPublicIds.length}) must match receipt URLs (${receiptUrls.length})`,
		);
		return next();
	}

	// Validate all URLs are valid image URLs
	if (receiptUrls.length > 0) {
		const invalidUrls = receiptUrls.filter(
			(url: string) => !isValidImageUrl(url),
		);
		if (invalidUrls.length > 0) {
			this.invalidate(
				"receiptUrl",
				`Invalid image URLs: ${invalidUrls.join(", ")}`,
			);
			return next();
		}
	}

	next();
});

// Pre-save middleware to update updatedAt on save
ExpenseSchema.pre("save", function (next) {
	if (this.isNew) {
		// For new documents, createdAt is already set by default
		this.updatedAt = new Date().toISOString();
	} else {
		// For existing documents, update updatedAt
		this.updatedAt = new Date().toISOString();
	}
	next();
});

// Prevent model recompilation in development
const Expense: Model<IExpense> =
	mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
