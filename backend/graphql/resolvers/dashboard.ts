import { ExpenseStatus, MemberExpenseStatus } from "@/interface/common/common";
import Expense from "@/backend/models/Expense/Expense";
import { Types } from "mongoose";

export const dashboardResolvers = {
  Query: {
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
