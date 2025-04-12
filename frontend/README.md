# WhatToEat

WhatToEat is a web application that helps users discover restaurants based on their preferences and location. Built with Next.js and modern web technologies.

## Features

- Restaurant discovery based on user preferences
- Location-based search using Google Maps integration
- User authentication and profile management
- Responsive and modern UI with Tailwind CSS
- Database persistence with PostgreSQL and Prisma

## Tech Stack

- **Frontend Framework**: Next.js 14.1.3
- **UI & Styling**: Tailwind CSS, HeadlessUI, React Icons
- **State Management**: Zustand
- **Forms**: Formik with Yup validation
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Maps**: Google Maps API
- **Language**: TypeScript

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

1. Create a `.env.local` file in the root directory
2. Add the required environment variables (see `.env.example` if available)
3. Make sure your PostgreSQL database is running
4. Run Prisma migrations if needed: `npx prisma migrate dev`

## Database Utilities
The project includes two utility scripts for database inspection:

### query.sql
SQL queries for checking database status:

### query.ts
TypeScript utility to inspect database contents.
To use these utilities:
1. For SQL queries: Run them directly in your PostgreSQL client
2. For TypeScript utility: Run `npx ts-node query.ts`

These tools are helpful for debugging authentication and user data during development.

## Project Structure

```
WhatToEat/
├── src/                    # Source code
│   ├── app/               # Next.js app router pages
│   ├── components/        # Reusable components
│   ├── services/         # External services
│   ├── store/            # State management
│   ├── types/            # TypeScript types
│   └── lib/              # Utilities
├── public/               # Static assets
├── prisma/               # Database schema
└── config files         # Various configs
```

## Available Scripts

- `npm run dev` - Start development server with local database
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run postinstall` - Setup database and generate Prisma client

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Prisma Documentation](https://www.prisma.io/docs) - Database ORM
- [NextAuth.js](https://next-auth.js.org) - Authentication for Next.js
- [Zustand](https://github.com/pmndrs/zustand) - State management

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
