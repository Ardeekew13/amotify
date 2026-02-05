# Amotify - Full-Stack Template

A production-ready Next.js template with shadcn/ui, GraphQL, and MongoDB integration using Mongoose ODM.

## Tech Stack
- Next.js 14+ with App Router
- TypeScript
- shadcn/ui for UI components
- GraphQL with Apollo Server
- MongoDB with Mongoose ODM
- Tailwind CSS for styling

## Project Status
- [x] Project scaffolded and built successfully
- [x] shadcn/ui components configured
- [x] GraphQL API with Apollo Server
- [x] MongoDB + Mongoose integration
- [x] Example Sitio model with CRUD operations
- [x] Dependencies installed
- [x] Documentation complete

## Quick Commands
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
```

## Key Files
- `app/api/graphql/route.ts` - GraphQL API endpoint
- `app/sitios/page.tsx` - Example CRUD implementation
- `lib/graphql/schema.ts` - GraphQL type definitions
- `lib/graphql/resolvers.ts` - GraphQL resolvers
- `lib/mongodb.ts` - Mongoose database connection
- `models/Sitio.ts` - Mongoose model example
- `components/ui/*` - shadcn/ui components

## Development Guidelines
- All new features should use TypeScript
- Use shadcn/ui components for UI consistency
- Follow GraphQL schema-first approach
- Use Mongoose models for database operations
- Keep models in the `models/` directory
- Use Tailwind CSS for styling
