# Quick Start Guide

## What's Included

This template includes a fully configured Next.js application with:

✅ **shadcn/ui** - Beautiful, accessible UI components
✅ **GraphQL API** - Type-safe API with Apollo Server
✅ **MongoDB** - Database integration with example CRUD operations
✅ **TypeScript** - Full type safety
✅ **Tailwind CSS** - Modern styling

## Quick Start (2 minutes)

### 1. Set up MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running locally
# Connection string: mongodb://localhost:27017/amotify
```

**Option B: MongoDB Atlas (Free)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Update `.env` file

### 2. Update Environment Variables

The `.env` file is already created. Update it if needed:
```env
MONGODB_URI=mongodb://localhost:27017/amotify
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Try It Out

1. **Home Page** - http://localhost:3000
   - See the welcome page with quick start guide

2. **Users Page** - http://localhost:3000/users
   - Click "Create Sample User" to add users
   - Test CRUD operations with GraphQL

3. **GraphQL API** - http://localhost:3000/api/graphql
   - Try queries and mutations directly

## Example GraphQL Operations

### Create a User
```graphql
mutation {
  createUser(name: "Alice", email: "alice@example.com") {
    id
    name
    email
  }
}
```

### Get All Users
```graphql
query {
  users {
    id
    name
    email
    createdAt
  }
}
```

## Project Structure Highlights

```
app/
├── api/graphql/route.ts    # GraphQL API endpoint
├── users/page.tsx          # Example CRUD page
└── page.tsx                # Home page

components/ui/              # shadcn/ui components
├── button.tsx
└── card.tsx

lib/
├── graphql/
│   ├── schema.ts           # GraphQL types
│   └── resolvers.ts        # API logic
└── mongodb.ts              # Database connection
```

## Next Steps

1. **Add more UI components:**
   ```bash
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add form
   ```

2. **Extend GraphQL schema:**
   - Edit `lib/graphql/schema.ts`
   - Add resolvers in `lib/graphql/resolvers.ts`

3. **Create new pages:**
   - Add files in `app/` directory
   - Use App Router features

## Common Issues

### MongoDB Connection Error
- Make sure MongoDB is running
- Check connection string in `.env`
- For Atlas: whitelist your IP address

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)

## Need Help?

Check the full README.md for detailed documentation.

---

**You're all set! Start building your app! 🚀**
