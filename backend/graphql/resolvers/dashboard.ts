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
              $or: [{ paidBy: userId }, { "split.user": userId }],
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
                        { $eq: ["$split.user", userId] },
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
                        { $ne: ["$split.user", userId] },
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
          $or: [{ paidBy: userId }, { "split.user": userId }],
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
              "split.user": userId,
              "split.status": MemberExpenseStatus.PENDING,
            },
            {
              paidBy: userId,
              "split.status": MemberExpenseStatus.AWAITING_CONFIRMATION,
            },
          ],
        })
          .populate("paidByUser")
          .populate("split.user")
          .sort({ updatedAt: -1 });

        return {
          success: true,
          message: "Action items fetched successfully.",
          data: actionItems,
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
          $or: [{ paidBy: userId }, { "split.user": userId }],
        })
          .populate("paidByUser")
          .sort({ updatedAt: -1 })
          .limit(5);

        return {
          success: true,
          message: "Recent expenses fetched successfully.",
          data: recentExpenses,
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
