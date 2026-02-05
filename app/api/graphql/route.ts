import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/backend/graphql/typeDefs";
import { resolvers } from "@/backend/graphql/resolvers";
import connectDB from "@/lib/mongodb";
import { getUserIdFromRequest } from "@/lib/auth";
import User from "@/backend/models/User";

// Create Apollo Server instance
const server = new ApolloServer({
	typeDefs,
	resolvers,
});

// Connect to MongoDB before handling requests
const handler = startServerAndCreateNextHandler(server, {
	context: async (req, res) => {
		// Ensure MongoDB is connected
		await connectDB();

		// Extract user ID from JWT token in headers
		const userId = getUserIdFromRequest(req);
		let user = null;
		if (userId) {
			// Fetch the user document if userId exists
			user = await User.findById(userId).lean(); // Use .lean() for a plain JS object
		}

		// Return a context object that includes the user document and the userId
		return { req, res, user, userId };
	},
});

export async function GET(request: Request) {
	return handler(request);
}

export async function POST(request: Request) {
	return handler(request);
}
