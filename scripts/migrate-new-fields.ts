import mongoose from "mongoose";
import User from "../backend/models/User";
import Expense from "../backend/models/Expense/Expense";
import dotenv from "dotenv";

dotenv.config();

async function migrateNewFields() {
	try {
		// Connect to MongoDB
		const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/amotify";
		await mongoose.connect(mongoUri);
		console.log("✅ Connected to MongoDB");

		// ==========================================
		// 1. Add QR Code fields to User model
		// ==========================================
		console.log("\n📋 Migrating User QR Code fields...");
		
		const userResult = await User.updateMany(
			{
				$or: [
					{ qrCodeUrl: { $exists: false } },
					{ qrCodePublicId: { $exists: false } }
				]
			},
			{
				$set: {
					qrCodeUrl: null,
					qrCodePublicId: null
				}
			}
		);

		console.log(`✅ Updated ${userResult.modifiedCount} users with QR code fields`);

		// Verify User migration
		const usersWithQRFields = await User.countDocuments({
			qrCodeUrl: { $exists: true },
			qrCodePublicId: { $exists: true }
		});
		console.log(`✅ ${usersWithQRFields} users now have QR code fields`);

		// ==========================================
		// 2. Add addOns and deductions to Expense splits
		// ==========================================
		console.log("\n📋 Migrating Expense addOns and deductions fields...");

		// Find all expenses
		const expenses = await Expense.find({});
		console.log(`Found ${expenses.length} expenses to check`);

		let expenseUpdateCount = 0;

		for (const expense of expenses) {
			let needsUpdate = false;

			// Check if any split is missing addOns or deductions
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
					{
						$set: {
							split: updatedSplits
						}
					}
				);
				expenseUpdateCount++;
			}
		}

		console.log(`✅ Updated ${expenseUpdateCount} expenses with addOns and deductions fields`);

		// ==========================================
		// 3. Summary and Verification
		// ==========================================
		console.log("\n📊 Migration Summary:");
		console.log("====================");
		console.log(`Users with QR fields: ${usersWithQRFields}`);
		console.log(`Expenses updated: ${expenseUpdateCount}`);

		// Sample data verification
		console.log("\n🔍 Sample User:");
		const sampleUser = await User.findOne().select("firstName lastName qrCodeUrl qrCodePublicId");
		if (sampleUser) {
			console.log(`- ${sampleUser.firstName} ${sampleUser.lastName}`);
			console.log(`  qrCodeUrl: ${sampleUser.qrCodeUrl}`);
			console.log(`  qrCodePublicId: ${sampleUser.qrCodePublicId}`);
		}

		console.log("\n🔍 Sample Expense:");
		const sampleExpense = await Expense.findOne().populate("split.user", "firstName lastName");
		if (sampleExpense) {
			console.log(`- ${sampleExpense.title}`);
			sampleExpense.split.forEach((split: any) => {
				console.log(`  ${split.user?.firstName || 'Unknown'}: addOns=${split.addOns?.length || 0}, deductions=${split.deductions?.length || 0}`);
			});
		}

		console.log("\n✅ Migration completed successfully!");

	} catch (error) {
		console.error("❌ Migration failed:", error);
	} finally {
		await mongoose.disconnect();
		console.log("\n✅ Disconnected from MongoDB");
	}
}

migrateNewFields();
