import { expenseResolvers } from "./expense";
import { userResolvers } from "./user";

export const resolvers = {
	Query: {
		...userResolvers.Query,
		...expenseResolvers.Query,
	},
	Mutation: {
		...userResolvers.Mutation,
		...expenseResolvers.Mutation,
	},
	// Type-level resolvers (THE KEY PART!)
	Expense: expenseResolvers.Expense,
	SplitMember: expenseResolvers.SplitMember,
};
