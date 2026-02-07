import { useMemo } from "react";
import {
	ExpenseStatus,
	GetExpenseById,
	MemberExpenseStatus,
} from "@/interface/common/common";
import { useAuthContext } from "@/components/auth/AuthProvider";

export const useExpensePermissions = (
	data?: GetExpenseById,
	isUploading?: boolean,
	upsertLoading?: boolean
) => {
	const { user } = useAuthContext();

	return useMemo(() => {
		const expense = data?.getExpenseById?.expense;
		
		const isCurrentUserPaid = expense?.split?.find(
			(member) =>
				member?.user?._id === user?._id &&
				member?.status === MemberExpenseStatus.AWAITING_CONFIRMATION,
		);

		const someoneAlreadyPaid = expense?.split?.some(
			(member) =>
				member?.user?._id !== user?._id &&
				member?.status === MemberExpenseStatus.AWAITING_CONFIRMATION,
		);

		const isNewExpense = !expense?._id;
		const isPaidByCurrentUser = expense?.paidBy === user?._id;
		const isCompleted = expense?.status === ExpenseStatus.COMPLETED;

		const canEdit = (isNewExpense || isPaidByCurrentUser) && !someoneAlreadyPaid && !isCompleted;
		const canMarkAsPaid = expense?._id && !isPaidByCurrentUser && !isCompleted;

		const isLoading = isUploading || upsertLoading;

		return {
			// Status flags
			isNewExpense,
			isPaidByCurrentUser,
			isCompleted,
			someoneAlreadyPaid,
			isCurrentUserPaid,

			// Permission flags
			canEdit,
			canMarkAsPaid,

			// Loading state
			isLoading,

			// Button text helpers
			getSubmitButtonText: () => isNewExpense ? "Add Expense" : "Update Expense",
			getLoadingText: () => isNewExpense ? "Creating" : "Updating",
			getMarkAsPaidText: () => isCurrentUserPaid ? "Mark as Unpaid" : "Mark as Paid",

			// Badge helpers
			getBadgeVariant: () => expense?.status === ExpenseStatus.AWAITING_PAYMENT ? "info" : "success",
			getBadgeText: () => expense?.status === ExpenseStatus.COMPLETED ? "Paid" : "Awaiting Payment",
		};
	}, [data, user, isUploading, upsertLoading]);
};