/**
 * Migration Script: Convert single receipt URLs to arrays
 * 
 * This script migrates legacy expense documents that have receiptUrl
 * as a single string to the new array format.
 * 
 * Usage: 
 * 1. Set MONGODB_URI in .env.local
 * 2. Run: npx tsx scripts/migrate-receipts.ts
 */

import mongoose from "mongoose";

interface LegacyExpense {
	_id: mongoose.Types.ObjectId;
	receiptUrl?: string | string[];
	receiptPublicId?: string | string[];
}

async function migrateReceipts() {
	try {
		// Get MongoDB URI from environment
		const mongoUri = process.env.MONGODB_URI;
		if (!mongoUri) {
			console.error("✗ MONGODB_URI not found in environment variables");
			console.log("\nPlease set MONGODB_URI in your .env.local file");
			process.exit(1);
		}

		console.log("Connecting to MongoDB...");
		await mongoose.connect(mongoUri);
		console.log("✓ Connected to MongoDB");

		// Get the Expense collection
		const db = mongoose.connection.db;
		if (!db) {
			throw new Error("Database connection not established");
		}

		const expenseCollection = db.collection("expenses");

		// Find all expenses with string receiptUrl (legacy format)
		console.log("\nSearching for legacy expenses...");
		const legacyExpenses = await expenseCollection
			.find({
				$or: [
					{ receiptUrl: { $type: "string" } },
					{ receiptPublicId: { $type: "string" } },
				],
			})
			.toArray();

		console.log(`Found ${legacyExpenses.length} legacy expense(s) to migrate`);

		if (legacyExpenses.length === 0) {
			console.log("✓ No migration needed. All expenses are already using arrays.");
			await mongoose.disconnect();
			return;
		}

		// Migrate each expense
		let successCount = 0;
		let errorCount = 0;

		for (const expense of legacyExpenses) {
			try {
				const updates: any = {};

				// Convert receiptUrl to array if it's a string
				if (
					expense.receiptUrl &&
					typeof expense.receiptUrl === "string"
				) {
					updates.receiptUrl = [expense.receiptUrl];
				}

				// Convert receiptPublicId to array if it's a string
				if (
					expense.receiptPublicId &&
					typeof expense.receiptPublicId === "string"
				) {
					updates.receiptPublicId = [expense.receiptPublicId];
				}

				// Update the document
				await expenseCollection.updateOne(
					{ _id: expense._id },
					{ $set: updates }
				);

				successCount++;
				console.log(`✓ Migrated expense ${expense._id}`);
			} catch (error) {
				errorCount++;
				console.error(`✗ Failed to migrate expense ${expense._id}:`, error);
			}
		}

		// Summary
		console.log("\n" + "=".repeat(50));
		console.log("Migration Summary:");
		console.log(`Total expenses found: ${legacyExpenses.length}`);
		console.log(`Successfully migrated: ${successCount}`);
		console.log(`Failed: ${errorCount}`);
		console.log("=".repeat(50));

		// Disconnect
		await mongoose.disconnect();
		console.log("\n✓ Disconnected from MongoDB");
		console.log("✓ Migration complete!");
	} catch (error) {
		console.error("\n✗ Migration failed:", error);
		await mongoose.disconnect();
		process.exit(1);
	}
}

// Run migration
migrateReceipts();
