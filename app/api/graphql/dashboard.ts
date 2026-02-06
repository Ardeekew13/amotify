import { gql } from "@apollo/client";

export const GET_DASHBOARD_SUMMARY = gql`
	query GetDashboardSummary {
		getDashboardSummary {
			success
			message
			data {
				youOwe
				youAreOwed
				activeExpenses
			}
		}
	}
`;

export const GET_DASHBOARD_ACTION_ITEMS = gql`
	query GetDashboardActionItems {
		getDashboardActionItems {
			success
			message
			data {
				_id
				title
				amount
				updatedAt
				status
				paidByUser {
					_id
					firstName
				}
				split {
					user {
						_id
						firstName
					}
					amount
					status
				}
			}
		}
	}
`;

export const GET_DASHBOARD_RECENT_EXPENSES = gql`
	query GetDashboardRecentExpenses {
		getDashboardRecentExpenses {
			success
			message
			data {
				_id
				title
				amount
				createdAt
				status
				paidByUser {
					_id
					firstName
					lastName
				}
			}
		}
	}
`;
