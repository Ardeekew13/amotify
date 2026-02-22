import { gql } from "graphql-tag";

export const expenseTypeDefs = gql`
	enum ExpenseStatus {
		COMPLETED
		AWAITING_PAYMENT
	}

	enum MemberExpenseStatus {
		PENDING
		PAID
		AWAITING_CONFIRMATION
	}

	type Expense {
		_id: ID!
		title: String!
		amount: Float!
		description: String
		receiptUrl: [String]
		receiptPublicId: [String]
		status: ExpenseStatus!
		paidBy: ID!
		paidByUser: User!
		split: [SplitMember!]!
		createdAt: String!
		updatedAt: String!
	}
	input SplitMemberInput {
		userId: ID!
		amount: Float!
		splitPercentage: Float!
		status: MemberExpenseStatus
		addOns: [Float]
		deductions: [Float]
	}

	input CreateExpenseInput {
		id: ID
		title: String!
		amount: Float!
		description: String
		receiptUrl: [String]
		receiptPublicId: [String]
		paidBy: ID!
		split: [SplitMemberInput!]!
	}

	type CreateExpenseResponse {
		success: Boolean!
		message: String!
		expense: Expense
	}

	type ExpensesResponse {
		success: Boolean!
		message: String!
		expenses: [Expense!]!
	}

	input MarkAsPaidInput {
		expenseId: ID!
		memberId: ID!
		type: String!
	}

	extend type Query {
		getExpenses(search: String, filter: String): ExpensesResponse!
		getExpenseById(id: ID!): CreateExpenseResponse!
		getExpensesByUser(userId: ID!): ExpensesResponse!
	}

	extend type Mutation {
		createExpense(input: CreateExpenseInput!): CreateExpenseResponse!
		deleteExpense(id: ID!): CreateExpenseResponse!
		markSplitAsPaid(input: MarkAsPaidInput!): CreateExpenseResponse!
		markReceivedPayment(expenseId: ID!, memberId: ID!): CreateExpenseResponse!
	}
`;
