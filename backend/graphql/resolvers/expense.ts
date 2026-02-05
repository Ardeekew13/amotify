import Expense from "@/backend/models/Expense/Expense";
import { ExpenseStatus, MemberExpense, MemberExpenseStatus } from "@/interface/common/common";
import connectDB from "@/lib/mongodb";
import { normalizeReceiptUrls, validateReceiptUrls } from "@/lib/receiptUtils";
import { split } from "postcss/lib/list";

export const expenseResolvers = {
	Query: {
		getExpenses: async (
			_: unknown,
			{ search, filter }: { search?: string; filter?: string },
			context: any,
		) => {
			await connectDB();
			try {
				if (!context.user) {
					return {
						success: false,
						message: "Authentication required",
						expenses: [],
					};
				}

				const { _id: userId } = context.user;
				let query: any = {};

				// Base query: user must be involved in the expense
				query.$or = [{ paidBy: userId }, { "split.userId": userId }];

				// Filter for "My Expenses" - only those paid by the user
				if (filter === "my") {
					query = { paidBy: userId };
				}

				// Add search functionality
				if (search) {
					query.$and = [
						{
							$or: [
								{ title: { $regex: search, $options: "i" } },
								{ description: { $regex: search, $options: "i" } },
							],
						},
					];
				}

				const expenses = await Expense.find(query)
					.populate({
						path: "paidBy",
						model: "User",
					})
					.populate({
						path: "split.userId",
						model: "User",
					})
					.sort({ createdAt: -1 });

				return {
					success: true,
					message: "Expenses fetched successfully",
					expenses,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to fetch expenses",
					expenses: [],
				};
			}
		},

		getExpenseById: async (_: unknown, { id }: { id: string }) => {
			await connectDB();
			try {
				const expense = await Expense.findById(id)
					.populate("paidBy")
					.populate("split.userId");

				if (!expense) {
					return {
						success: false,
						message: "Expense not found",
						expense: null,
					};
				}

				return {
					success: true,
					message: "Expense fetched successfully",
					expense,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to fetch expense",
					expense: null,
				};
			}
		},

		getExpensesByUser: async (_: unknown, { userId }: { userId: string }) => {
			await connectDB();
			try {
				const expenses = await Expense.find({
					$or: [{ paidBy: userId }, { "split.userId": userId }],
				})
					.populate("paidBy")
					.populate("split.userId")
					.sort({ createdAt: -1 });

				return {
					success: true,
					message: "Expenses fetched successfully",
					expenses,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to fetch expenses",
					expenses: [],
				};
			}
		},
	},

	Expense: {
		paidByUser: (parent: any) => {
			return parent.paidBy;
		},

		paidBy: (parent: any) => {
			return parent.paidBy?._id || parent.paidBy;
		},

		// Normalize receiptUrl to always return array (backward compatibility)
		receiptUrl: (parent: any) => {
			return normalizeReceiptUrls(parent.receiptUrl);
		},

		// Normalize receiptPublicId to always return array (backward compatibility)
		receiptPublicId: (parent: any) => {
			return normalizeReceiptUrls(parent.receiptPublicId);
		},
	},

	SplitMember: {
		user: (parent: any) => {
			return parent.userId;
		},
		userId: (parent: any) => {
			return parent.userId?._id || parent.userId;
		},
	},

	Mutation: {
		createExpense: async (
			_: unknown,
			{ input }: { input: any },
		): Promise<any> => {
			await connectDB();

			try {
				// Normalize receipt URLs with backward compatibility
				const normalizedReceiptUrls = normalizeReceiptUrls(input.receiptUrl);
				const normalizedPublicIds = normalizeReceiptUrls(input.receiptPublicId);

				// Ensure arrays match in length before deduplication
				if (normalizedReceiptUrls.length !== normalizedPublicIds.length) {
					return {
						success: false,
						message: "Receipt URLs and Public IDs must have matching lengths",
						expense: null,
					};
				}

				// Deduplicate while keeping arrays in sync
				const receiptMap = new Map<string, string>();
				normalizedReceiptUrls.forEach((url, index) => {
					if (!receiptMap.has(url)) {
						receiptMap.set(url, normalizedPublicIds[index]);
					}
				});

				const deduplicatedUrls = Array.from(receiptMap.keys());
				const deduplicatedPublicIds = Array.from(receiptMap.values());

				// Validate URLs (only if there are any)
				if (deduplicatedUrls.length > 0) {
					const validation = validateReceiptUrls(deduplicatedUrls);
					if (!validation.valid) {
						return {
							success: false,
							message: validation.message,
							expense: null,
						};
					}
				}

				// Check if updating existing expense
				const existingExpense = input.id
					? await Expense.findById(input.id)
					: null;

				if (existingExpense) {
					// Create a map of existing statuses
					const existingStatusMap = new Map<string, MemberExpenseStatus>();
					existingExpense.split.forEach((member) => {
						existingStatusMap.set(
							member.userId.toString(),
							member.status || MemberExpenseStatus.PENDING,
						);
					});

					// Merge new split data with existing statuses
					const updatedSplit = input.split.map((member: any) => ({
						...member,
						status:
							existingStatusMap.get(member.userId.toString()) ||
							MemberExpenseStatus.PENDING,
					}));

					// Determine the overall expense status based on the new split
					const allPaid = updatedSplit.every(
						(member:MemberExpense) => member.status === MemberExpenseStatus.PAID,
					);
					const newStatus = allPaid
						? ExpenseStatus.COMPLETED
						: ExpenseStatus.AWAITING_PAYMENT;

					// Update existing expense using save() for proper validation
					existingExpense.title = input.title;
					existingExpense.amount = input.amount;
					existingExpense.description = input.description;
					existingExpense.paidBy = input.paidBy;
					existingExpense.split = updatedSplit;
					existingExpense.status = newStatus; // Set the recalculated status
					existingExpense.receiptUrl = deduplicatedUrls;
					existingExpense.receiptPublicId = deduplicatedPublicIds;
					existingExpense.updatedAt = new Date().toISOString();

					await existingExpense.save();

					await existingExpense.populate("paidBy");
					await existingExpense.populate("split.userId");

					return {
						success: true,
						message: "Expense updated successfully",
						expense: existingExpense,
					};
				}

				// Create new expense
				const splitWithDefaults = input.split.map((member: any) => ({
					...member,
					status:
						member.userId === input.paidBy
							? MemberExpenseStatus.PAID
							: member.status || MemberExpenseStatus.PENDING,
				}));

				const expense = await Expense.create({
					title: input.title,
					amount: input.amount,
					description: input.description,
					paidBy: input.paidBy,
					split: splitWithDefaults,
					receiptUrl: deduplicatedUrls,
					receiptPublicId: deduplicatedPublicIds,
					status: ExpenseStatus.AWAITING_PAYMENT,
				});

				await expense.populate("paidBy");
				await expense.populate("split.userId");

				return {
					success: true,
					message: "Expense created successfully",
					expense,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to create expense",
					expense: null,
				};
			}
		},

		deleteExpense: async (_: unknown, { id }: { id: string }): Promise<any> => {
			await connectDB();
			try {
				const expense = await Expense.findByIdAndDelete(id);

				if (!expense) {
					return {
						success: false,
						message: "Expense not found",
						expense: null,
					};
				}

				return {
					success: true,
					message: "Expense deleted successfully",
					expense: null,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to delete expense",
					expense: null,
				};
			}
		},
		markSplitAsPaid: async (
			_: unknown,
			{
				input,
			}: { input: { expenseId: string; memberId: string; type: string } },
			context: any,
		): Promise<any> => {
			await connectDB();

			if (!context.user) {
				return { success: false, message: "Not authenticated", expense: null };
			}

			try {
				const expense = await Expense.findById(input.expenseId);
				if (!expense) {
					return {
						success: false,
						message: "Expense not found",
						expense: null,
					};
				}

				const splitMember = expense.split.find(
					(member) => member?.userId.toString() === input.memberId,
				);

				if (!splitMember) {
					return {
						success: false,
						message: "You are not a part of this expense split.",
						expense: null,
					};
				}

				if (input.type === "PAID") {
					if (
						splitMember.status === MemberExpenseStatus.PENDING ||
						splitMember.status === MemberExpenseStatus.AWAITING_CONFIRMATION
					) {
						splitMember.status =
							splitMember.status === MemberExpenseStatus.PENDING
								? MemberExpenseStatus.AWAITING_CONFIRMATION
								: MemberExpenseStatus.PENDING;
					}
				} else {
					if (
						splitMember.status === MemberExpenseStatus.AWAITING_CONFIRMATION
					) {
						splitMember.status = MemberExpenseStatus.PAID;
					}
				}
				const allPaid = expense.split.every(
					(member) => member.status === MemberExpenseStatus.PAID,
				);

				expense.status = allPaid
					? ExpenseStatus.COMPLETED
					: ExpenseStatus.AWAITING_PAYMENT;
				await expense.save();
				await expense.populate("paidBy");
				await expense.populate("split.userId");

				return {
					success: true,
					message:
						"Marked as paid successfully, awaiting confirmation from receiver",
					expense,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to update split status",
					expense: null,
				};
			}
		},
		markReceivedPayment: async (
			_: unknown,
			{ expenseId, memberId }: { expenseId: string; memberId: string },
			context: any,
		): Promise<any> => {
			await connectDB();
			if (!context.user) {
				return {
					success: false,
					message: "Not authenticated",
					expense: null,
				};
			}

			try {
				const expense = await Expense.findById(expenseId);

				if (!expense) {
					return {
						success: false,
						message: "Expense not found",
						expense: null,
					};
				}

				// Authorization: Only the person who paid can mark payments as received
				if (expense.paidBy.toString() !== context.user._id.toString()) {
					return {
						success: false,
						message: "Only the payer can confirm payments.",
						expense: null,
					};
				}

				const splitMember = expense.split.find(
					(member) => member.userId.toString() === memberId,
				);

				if (!splitMember) {
					return {
						success: false,
						message:
							"Split member not found or invalid status for this action.",
						expense: null,
					};
				}

				let message: string;

				// Toggle status between PAID and AWAITING_CONFIRMATION
				if (splitMember.status === MemberExpenseStatus.AWAITING_CONFIRMATION) {
					splitMember.status = MemberExpenseStatus.PAID;
					message = "Payment marked as received.";
				} else if (splitMember.status === MemberExpenseStatus.PAID) {
					splitMember.status = MemberExpenseStatus.AWAITING_CONFIRMATION;
					message = "Payment status reverted to awaiting confirmation.";
				} else {
					return {
						success: false,
						message: `Cannot change status. Current status is: ${splitMember.status}`,
						expense: null,
					};
				}

				// Check if all members have paid to update the overall expense status
				const allPaid = expense.split.every(
					(member) => member.status === MemberExpenseStatus.PAID,
				);
				expense.status = allPaid
					? ExpenseStatus.COMPLETED
					: ExpenseStatus.AWAITING_PAYMENT;

				await expense.save();
				await expense.populate("paidBy");
				await expense.populate("split.userId");

				return {
					success: true,
					message,
					expense,
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message || "Failed to update payment status",
					expense: null,
				};
			}
		},
	},
};
