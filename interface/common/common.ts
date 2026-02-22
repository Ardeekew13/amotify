import { User } from "../userInterface";

export enum MemberExpenseStatus {
	PENDING = "PENDING",
	PAID = "PAID",
	AWAITING_CONFIRMATION = "AWAITING_CONFIRMATION",
}

export enum ExpenseStatus {
	COMPLETED = "COMPLETED",
	AWAITING_PAYMENT = "AWAITING_PAYMENT",
}

export interface OptionsValue {
	label: string | null;
	value: string | number | null;
}

export type MemberExpense = {
	amount: number;
	user: User;
	splitPercentage?: number;
	status: MemberExpenseStatus;
	_id: string;
	addOns?: number[];
	deductions?: number[];
};

export type Expense = {
	_id: string;
	title: string;
	amount: number;
	description?: string;
	receiptUrl?: string[];
	receiptPublicId?: string[];
	paidBy: string;
	paidByUser: User;
	status: ExpenseStatus;
	split: MemberExpense[];
	createdAt: string;
	updatedAt: string;
};

export type GetUsersExcludeSelf = {
	getUsersExcludeSelf: {
		success: boolean;
		message: string;
		users: {
			_id: string;
			firstName: string;
			lastName: string;
			userName: string;
			email: string;
		}[];
	};
};

export type GetExpenses = {
	getExpenses: {
		success: boolean;
		message: string;
		expenses: Expense[];
	};
};

export type GetExpenseById = {
	getExpenseById: {
		success: boolean;
		message: string;
		expense: Expense;
	};
};

export type CreateExpense = {
	createExpense: {
		success: boolean;
		message: string;
		expense: Expense;
	};
};

export type DashboardSummary = {
	youOwe: number;
	youAreOwed: number;
	activeExpenses: number;
};

export type GetDashboardSummary = {
	getDashboardSummary: {
		success: boolean;
		message: string;
		data: DashboardSummary;
	};
};

export type GetDashboardActionItems = {
	getDashboardActionItems: {
		success: boolean;
		message: string;
		data: Expense[];
	};
};

export type GetDashboardRecentExpenses = {
	getDashboardRecentExpenses: {
		success: boolean;
		message: string;
		data: Expense[];
	};
};

// Unified Dashboard Types
export type DashboardData = {
	summary: DashboardSummary;
	actionItems: Expense[];
	recentExpenses: Expense[];
};

export type GetDashboard = {
	getDashboard: {
		success: boolean;
		message: string;
		data: DashboardData | null;
	};
};