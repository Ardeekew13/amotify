import { gql } from "@apollo/client";

export const GET_EXPENSES = gql`
	query GetExpenses($filter: String) {
		getExpenses(filter: $filter) {
			success
			message
			expenses {
				_id
				title
				amount
				description
				receiptUrl
				receiptPublicId

				split {
					user {
						_id
						firstName
						lastName
					}
					status
					amount
					splitPercentage
				}
				status
				paidBy
				paidByUser {
					_id
					firstName
					lastName
				}
				createdAt
				updatedAt
			}
		}
	}
`;

export const GET_EXPENSE_BY_ID = gql`
	query GetExpenseById($id: ID!) {
		getExpenseById(id: $id) {
			success
			message
			expense {
				_id
				title
				amount
				description
				receiptUrl
				receiptPublicId
				split {
					user {
						_id
						firstName
						lastName
					}
					status
					amount
					splitPercentage
				}
				paidBy
				paidByUser {
					_id
					firstName
					lastName
				}
				status
				createdAt
				updatedAt
			}
		}
	}
`;

export const CREATE_EXPENSE = gql`
	mutation CreateExpense($input: CreateExpenseInput!) {
		createExpense(input: $input) {
			success
			message
			expense {
				_id
				title
				amount
				description
				receiptUrl
				receiptPublicId
				split {
					userId
					amount
					splitPercentage
					status
				}
				paidBy
				createdAt
				updatedAt
			}
		}
	}
`;

export const MARK_AS_PAID = gql`
	mutation markSplitAsPaid($input: MarkAsPaidInput!) {
		markSplitAsPaid(input: $input) {
			success
			message
			expense {
				_id
				title
				amount
				description
				receiptUrl
				receiptPublicId
				split {
					userId
					amount
					splitPercentage
					status
				}
				paidBy
				createdAt
				updatedAt
			}
		}
	}
`;

export const CONFIRM_PAYMENT_RECEIVED = gql`
	mutation markReceivedPayment($expenseId: ID!, $memberId: ID!) {
		markReceivedPayment(expenseId: $expenseId, memberId: $memberId) {
			success
			message
			expense {
				_id
				title
				amount
				description
				receiptUrl
				receiptPublicId
				split {
					userId
					amount
					splitPercentage
					status
				}
				paidBy
				createdAt
				updatedAt
			}
		}
	}
`;
