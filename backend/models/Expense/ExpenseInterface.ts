import { IExpense } from "./Expense";
import { MemberExpenseStatus } from "../../../interface/common/common";

export interface MemberExpenseInput {
	userId: string;
	amount: number;
	splitPercentage: number;
	status: MemberExpenseStatus;
	addOns?: number[];
	deductions?: number[];
	balance?: number;
}

export interface CreateExpenseInput {
	title: string;
	amount: number;
	description?: string;
	receiptUrl?: string[];
	receiptPublicId?: string[];
	split: MemberExpenseInput[];
	paidBy: string;
}

export interface CreateExpenseResponse {
	success: boolean;
	message: string;
	expense: IExpense | null;
}
