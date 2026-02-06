import { ExpenseStatus, MemberExpenseStatus } from "@/interface/common/common";
import Expense from "@/backend/models/Expense/Expense";
import { Types } from "mongoose";

// Helper function to create safe user object
const createSafeUser = (user: any) => {
  if (user && typeof user.firstName === "string" && user.firstName.length > 0) {
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName || "User",
    };
  }
  return { _id: "unknown", firstName: "Unknown", lastName: "User" };
};

export const dashboardResolvers = {
  Query: {
    // Unified dashboard query - runs all queries in parallel
    getDashboard: async (_: unknown, __: unknown, context: any) => {
      if (!context.user) {
        return {
          success: false,
          message: "Authentication required.",
          data: null,
        };
      }

      const userId = new Types.ObjectId(context.user._id);

      try {
        // Run all queries in parallel for better performance
        const [summaryResult, actionItemsResult, recentExpensesResult] =
          await Promise.all([
            // Summary aggregation
            Expense.aggregate([
              {
                $match: {
                  $or: [{ paidBy: userId }, { "split.userId": userId }],
                },
              },
              { $unwind: "$split" },
              {
                $group: {
                  _id: null,
                  youOwe: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$split.userId", userId] },
                            { $ne: ["$paidBy", userId] },
                            { $ne: ["$split.status", MemberExpenseStatus.PAID] },
                          ],
                        },
                        "$split.amount",
                        0,
                      ],
                    },
                  },
                  youAreOwed: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$paidBy", userId] },
                            { $ne: ["$split.userId", userId] },
                            { $ne: ["$split.status", MemberExpenseStatus.PAID] },
                          ],
                        },
                        "$split.amount",
                        0,
                      ],
                    },
                  },
                },
              },
            ]),

            // Action items query
            Expense.find({
              status: ExpenseStatus.AWAITING_PAYMENT,
              $or: [
                {
                  "split.userId": userId,
                  "split.status": MemberExpenseStatus.PENDING,
                },
                {
                  paidBy: userId,
                  "split.status": MemberExpenseStatus.AWAITING_CONFIRMATION,
                },
              ],
            })
              .populate({ path: "paidBy", select: "firstName lastName" })
              .populate({ path: "split.userId", select: "firstName lastName" })
              .sort({ updatedAt: -1 })
              .limit(10)
              .lean(),

            // Recent expenses query
            Expense.find({
              $or: [{ paidBy: userId }, { "split.userId": userId }],
            })
              .populate({ path: "paidBy", select: "firstName lastName" })
              .sort({ updatedAt: -1 })
              .limit(5)
              .lean(),

            // Active expenses count
            Expense.countDocuments({
              status: ExpenseStatus.AWAITING_PAYMENT,
              $or: [{ paidBy: userId }, { "split.userId": userId }],
            }),
          ]);

        // Process summary
        const summary = {
          youOwe: summaryResult[0]?.youOwe || 0,
          youAreOwed: summaryResult[0]?.youAreOwed || 0,
          activeExpenses: await Expense.countDocuments({
            status: ExpenseStatus.AWAITING_PAYMENT,
            $or: [{ paidBy: userId }, { "split.userId": userId }],
          }),
        };

        // Process action items with safe user mapping
        const actionItems = actionItemsResult.map((expense: any) => ({
          ...expense,
          paidByUser: createSafeUser(expense.paidBy),
        }));

        // Process recent expenses with safe user mapping
        const recentExpenses = recentExpensesResult.map((expense: any) => ({
          ...expense,
          paidByUser: createSafeUser(expense.paidBy),
        }));

        return {
          success: true,
          message: "Dashboard data fetched successfully.",
          data: {
            summary,
            actionItems,
            recentExpenses,
          },
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },

    getDashboardSummary: async (_: unknown, __: unknown, context: any) => {
      if (!context.user) {
        return {
          success: false,
          message: "Authentication required.",
          data: null,
        };
      }

      const userId = new Types.ObjectId(context.user._id);

      try {
        const summary = await Expense.aggregate([
          {
            $match: {
              $or: [{ paidBy: userId }, { "split.userId": userId }],
            },
          },
          { $unwind: "$split" },
          {
            $group: {
              _id: null,
              youOwe: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$split.userId", userId] },
                        { $ne: ["$paidBy", userId] },
                        { $ne: ["$split.status", MemberExpenseStatus.PAID] },
                      ],
                    },
                    "$split.amount",
                    0,
                  ],
                },
              },
              youAreOwed: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$paidBy", userId] },
                        { $ne: ["$split.userId", userId] },
                        { $ne: ["$split.status", MemberExpenseStatus.PAID] },
                      ],
                    },
                    "$split.amount",
                    0,
                  ],
                },
              },
            },
          },
        ]);

        const activeExpenses = await Expense.countDocuments({
          status: ExpenseStatus.AWAITING_PAYMENT,
          $or: [{ paidBy: userId }, { "split.userId": userId }],
        });

        const result = {
          youOwe: summary[0]?.youOwe || 0,
          youAreOwed: summary[0]?.youAreOwed || 0,
          activeExpenses,
        };

        return {
          success: true,
          message: "Dashboard summary fetched successfully.",
          data: result,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },

    getDashboardActionItems: async (_: unknown, __: unknown, context: any) => {
      if (!context.user) {
        return {
          success: false,
          message: "Authentication required.",
          data: null,
        };
      }
      const userId = new Types.ObjectId(context.user._id);

      try {
        const actionItems = await Expense.find({
          status: ExpenseStatus.AWAITING_PAYMENT,
          $or: [
            {
              "split.userId": userId,
              "split.status": MemberExpenseStatus.PENDING,
            },
            {
              paidBy: userId,
              "split.status": MemberExpenseStatus.AWAITING_CONFIRMATION,
            },
          ],
        })
          .populate("paidBy")
          .populate("split.userId")
          .sort({ updatedAt: -1 });

        // Map the results to include paidByUser for GraphQL
        const mappedActionItems = actionItems.map((expense: any) => {
          const expenseObj = expense.toObject();
          return {
            ...expenseObj,
            paidByUser: expenseObj.paidBy && expenseObj.paidBy.firstName
              ? {
                  _id: expenseObj.paidBy._id,
                  firstName: expenseObj.paidBy.firstName,
                  lastName: expenseObj.paidBy.lastName || "User",
                }
              : {
                  _id: "unknown",
                  firstName: "Unknown",
                  lastName: "User",
                },
          };
        });

        return {
          success: true,
          message: "Action items fetched successfully.",
          data: mappedActionItems,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },

    getDashboardRecentExpenses: async (
      _: unknown,
      __: unknown,
      context: any
    ) => {
      if (!context.user) {
        return {
          success: false,
          message: "Authentication required.",
          data: null,
        };
      }
      const userId = new Types.ObjectId(context.user._id);

      try {
        const recentExpenses = await Expense.find({
          $or: [{ paidBy: userId }, { "split.userId": userId }],
        })
          .populate({
            path: "paidBy",
            select: "firstName lastName",
          })
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean();

        const processedExpenses = recentExpenses.map((expense: any) => {
          const payer = expense.paidBy;

          return {
            ...expense,
            paidByUser: payer && payer.firstName
              ? {
                  _id: payer._id,
                  firstName: payer.firstName,
                  lastName: payer.lastName || "User",
                }
              : {
                  _id: "unknown",
                  firstName: "Unknown",
                  lastName: "User",
                },
          };
        });

        return {
          success: true,
          message: "Recent expenses fetched successfully.",
          data: processedExpenses,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },
  },
};
