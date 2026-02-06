# Amotify

A modern full-stack Next.js template with **shadcn/ui**, **GraphQL**, and **MongoDB** integration.

## 🚀 Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **shadcn/ui** - Beautiful UI components built with Radix UI and Tailwind CSS
- **GraphQL** - Apollo Server for type-safe API
- **MongoDB** - NoSQL database for data persistence
- **Tailwind CSS** - Utility-first CSS framework

## 📦 Features

- ✅ Modern Next.js 14 App Router setup
- ✅ Fully configured shadcn/ui components
- ✅ GraphQL API with Apollo Server integration
- ✅ MongoDB database connection and models
- ✅ Example CRUD operations (Users)
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Responsive design

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or remote)

### Installation

1. **Clone or use this template**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your MongoDB connection**
   
   Edit `.env` and update the `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/amotify
   ```

   For MongoDB Atlas or other remote instances, use your connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amotify
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
amotify/
├── app/                      # Next.js App Router
│   ├── api/
│   │   └── graphql/
│   │       └── route.ts      # GraphQL API endpoint
│   ├── users/
│   │   └── page.tsx          # Users example page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # shadcn/ui components
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── graphql/
│   │   ├── schema.ts         # GraphQL schema
│   │   └── resolvers.ts      # GraphQL resolvers
│   ├── mongodb.ts            # MongoDB connection
│   └── utils.ts              # Utility functions
├── .env.example              # Environment variables template
├── components.json           # shadcn/ui configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json
```

## 🎨 Adding shadcn/ui Components

To add more shadcn/ui components:

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

## 🗄️ Database

This template uses MongoDB. Make sure you have MongoDB running locally or use a cloud service like MongoDB Atlas.

### Local MongoDB Setup

1. Install MongoDB locally
2. Start MongoDB service
3. Use the default connection string: `mongodb://localhost:27017/amotify`

### MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `.env` with your connection string

## 🛠️ Development Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/amotify

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This Next.js app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- AWS
- Google Cloud

Make sure to:
1. Set up environment variables
2. Configure MongoDB connection
3. Build the project: `npm run build`

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this template for your projects!

## 🙏 Acknowledgments

- [shadcn](https://twitter.com/shadcn) for the amazing UI components
- [Vercel](https://vercel.com) for Next.js
- The open-source community

---

**Happy coding! 🎉**
