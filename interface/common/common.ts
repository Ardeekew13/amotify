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

