import { expenseResolvers } from "./expense";
import { userResolvers } from "./user";
import { dashboardResolvers } from "./dashboard";

export const resolvers = {
	Query: {
		...userResolvers.Query,
		...expenseResolvers.Query,
		...dashboardResolvers.Query,
	},
	Mutation: {
		...userResolvers.Mutation,
		...expenseResolvers.Mutation,
	},
	// Type-level resolvers (THE KEY PART!)
	Expense: expenseResolvers.Expense,
	SplitMember: expenseResolvers.SplitMember,
};
