import { sharedTypes } from "../types";
import { expenseTypeDefs } from "./expense";
import { userTypeDefs } from "./user";
import { dashboardTypeDefs } from "./dashboard";

const baseTypeDef = `#graphql
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [
	baseTypeDef,
	sharedTypes,
	userTypeDefs,
	expenseTypeDefs,
	dashboardTypeDefs,
];