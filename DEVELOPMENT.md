# Development Notes

## Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## Testing the Template

### 1. Test the Home Page
- Navigate to http://localhost:3000
- Should see welcome page with tech stack cards

### 2. Test GraphQL API
- Navigate to http://localhost:3000/api/graphql
- Browser should show "Query your GraphQL server" message

### 3. Test MongoDB Integration
- Navigate to http://localhost:3000/users
- Click "Create Sample User"
- Should create and display a user from MongoDB

## GraphQL Playground

Since this template uses Apollo Server 4, you can test queries via POST requests:

```bash
# Create a user
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createUser(name: \"Test\", email: \"test@example.com\") { id name email } }"}'

# Get all users
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ users { id name email createdAt } }"}'
```

## Adding Features

### Add a New GraphQL Type

1. **Update Schema** (`lib/graphql/schema.ts`):
```typescript
export const typeDefs = `#graphql
  type Post {
    id: ID!
    title: String!
    content: String!
    authorId: ID!
    createdAt: String!
  }
  
  type Query {
    posts: [Post!]!
  }
`;
```

2. **Add Resolvers** (`lib/graphql/resolvers.ts`):
```typescript
Query: {
  posts: async () => {
    const db = await getDatabase();
    return db.collection("posts").find().toArray();
  }
}
```

### Add a New Page

Create `app/posts/page.tsx`:
```typescript
export default function PostsPage() {
  return <div>Posts Page</div>
}
```

### Add More shadcn/ui Components

```bash
# Available components
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
```

## Environment Variables

Current variables in `.env`:
- `MONGODB_URI` - MongoDB connection string
- `NEXT_PUBLIC_API_URL` - API URL (for client-side)

Add new variables as needed for:
- Authentication (e.g., `NEXTAUTH_SECRET`)
- External APIs
- Feature flags

## MongoDB Collections

Current collections:
- `users` - Example user collection with CRUD operations

Add indexes for better performance:
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
```

## Deployment Checklist

- [ ] Update environment variables for production
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure CORS if needed
- [ ] Test build: `npm run build`
- [ ] Test production mode: `npm start`
- [ ] Set up monitoring/logging
- [ ] Configure domain and SSL

## Tips

1. **Hot Reload**: Changes to code auto-reload in dev mode
2. **Type Safety**: Use TypeScript for all new files
3. **Component Reuse**: Extract common patterns to components
4. **GraphQL Schema**: Keep schema and resolvers in sync
5. **Database**: Use indexes for frequently queried fields

## Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [MongoDB Node Driver](https://mongodb.github.io/node-mongodb-native/)
- [Tailwind CSS](https://tailwindcss.com/docs)
