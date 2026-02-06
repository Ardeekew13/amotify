export const dashboardTypeDefs = `#graphql
  type DashboardSummary {
    youOwe: Float!
    youAreOwed: Float!
    activeExpenses: Int!
  }

  type Query {
    getDashboardSummary: GetDashboardSummaryResponse
    getDashboardActionItems: GetDashboardActionItemsResponse
    getDashboardRecentExpenses: GetDashboardRecentExpensesResponse
  }

  type GetDashboardSummaryResponse {
    success: Boolean!
    message: String!
    data: DashboardSummary
  }

  type GetDashboardActionItemsResponse {
    success: Boolean!
    message: String!
    data: [Expense!]
  }

  type GetDashboardRecentExpensesResponse {
    success: Boolean!
    message: String!
    data: [Expense!]
  }
`;
