import { gql } from "@apollo/client";

export const GET_DASHBOARD_DATA = gql`
	query GetDashboardData {
		getDashboardData {
			stats {
				balance {
					youOwe
					youAreOwed
					netBalance
				}
				sharedExpenses
				outstandingSettlements
			}
			recentActivity {
				_id
				title
				amount
				updatedAt
				status
			}
		}
	}
`;
