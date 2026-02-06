export const dashboardTypeDefs = `#graphql
  type DashboardSummary {
    youOwe: Float!
    youAreOwed: Float!
    activeExpenses: Int!
  }

  type DashboardData {
    summary: DashboardSummary!
    actionItems: [Expense!]!
    recentExpenses: [Expense!]!
  }

  type GetDashboardResponse {
    success: Boolean!
    message: String!
    data: DashboardData
  }

  type Query {
    getDashboard: GetDashboardResponse!
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
