import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/backend/models/User";
import Expense from "@/backend/models/Expense/Expense";

export async function POST(req: NextRequest) {
	try {
		// Security: Check admin secret
		const adminSecret = req.headers.get("x-admin-secret");
		if (!adminSecret || adminSecret !== process.env.ADMIN_MIGRATION_SECRET) {
			return NextResponse.json(
				{ error: "Unauthorized - Invalid admin secret" },
				{ status: 401 }
			);
		}

		// Connect to MongoDB
		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(process.env.MONGODB_URI!);
		}

		const results = {
			users: { updated: 0, total: 0 },
			expenses: { updated: 0, total: 0 },
		};

		// 1. Migrate User QR Code fields
		const userResult = await User.updateMany(
			{
				$or: [
					{ qrCodeUrl: { $exists: false } },
					{ qrCodePublicId: { $exists: false } },
				],
			},
			{
				$set: {
					qrCodeUrl: null,
					qrCodePublicId: null,
				},
			}
		);

		results.users.updated = userResult.modifiedCount;
		results.users.total = await User.countDocuments();

		// 2. Migrate Expense addOns and deductions
		const expenses = await Expense.find({});
		results.expenses.total = expenses.length;

		for (const expense of expenses) {
			let needsUpdate = false;

			const updatedSplits = expense.split.map((split: any) => {
				if (!split.addOns || !Array.isArray(split.addOns)) {
					split.addOns = [];
					needsUpdate = true;
				}
				if (!split.deductions || !Array.isArray(split.deductions)) {
					split.deductions = [];
					needsUpdate = true;
				}
				return split;
			});

			if (needsUpdate) {
				await Expense.updateOne(
					{ _id: expense._id },
					{ $set: { split: updatedSplits } }
				);
				results.expenses.updated++;
			}
		}

		return NextResponse.json({
			success: true,
			message: "Migration completed successfully",
			results,
		});
	} catch (error: any) {
		console.error("Migration error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error.message,
			},
			{ status: 500 }
		);
	}
}
