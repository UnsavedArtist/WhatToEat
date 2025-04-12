# WhatToEat Project Structure

## Overview
WhatToEat is a Next.js application that helps users discover restaurants based on their preferences and location. The project uses a modern tech stack including TypeScript, Tailwind CSS, and PostgreSQL.

## Directory Structure

```
WhatToEat/
├── frontend/                   # Main application directory
│   ├── src/                   # Source code
│   │   ├── app/              # Next.js app router pages and layouts
│   │   ├── components/       # Reusable React components
│   │   ├── services/        # External service integrations
│   │   ├── store/           # State management (Zustand)
│   │   ├── types/           # TypeScript type definitions
│   │   └── lib/             # Utility functions and shared code
│   │
│   ├── public/              # Static assets
│   ├── prisma/              # Database schema and migrations
│   └── config files         # Various configuration files:
│       ├── next.config.mjs  # Next.js configuration
│       ├── tailwind.config.js # Tailwind CSS configuration
│       ├── tsconfig.json    # TypeScript configuration
│       ├── postcss.config.js # PostCSS configuration
│       ├── eslint.config.mjs # ESLint configuration
│       └── package.json     # Project dependencies
│
├── prisma/                  # Root prisma directory for database
└── configuration files      # Root configuration files
    ├── .gitignore          # Git ignore rules
    └── README.md           # Project documentation

```

## Key Components

### Dependencies
- **Core Framework**
  - Next.js 14.1.3
  - React 18
  - TypeScript 5

- **UI and Styling**
  - Tailwind CSS 3.3.0
  - @headlessui/react 1.7.18
  - react-icons 5.0.1

- **State Management & Forms**
  - Zustand 4.5.1
  - Formik 2.4.5
  - Yup 1.3.3

- **Database & Authentication**
  - @prisma/client 5.10.2
  - next-auth 4.24.7
  - @auth/prisma-adapter 1.5.0
  - @vercel/postgres 0.10.0
  - pg 8.14.1

- **Maps Integration**
  - @react-google-maps/api 2.19.3

### Database (Prisma)
- Schema defines models for:
  - User authentication
  - Session management
  - Account linking
  - Verification tokens

### Frontend Structure
1. **App Directory** (`src/app/`)
   - Page components
   - API routes
   - Layout components
   - Authentication pages

2. **Components** (`src/components/`)
   - Reusable UI components
   - Navigation elements
   - Form components
   - Map integration components

3. **Services** (`src/services/`)
   - External API integrations
   - Authentication services
   - Data fetching utilities

4. **Store** (`src/store/`)
   - Global state management using Zustand
   - User preferences
   - Application settings

5. **Types** (`src/types/`)
   - TypeScript interfaces
   - Type definitions
   - Shared types

6. **Library** (`src/lib/`)
   - Utility functions
   - Helper methods
   - Shared constants

### Configuration Files
- **Environment Files**
  - `.env.local`: Local development variables
  - `.env.production`: Production variables

- **Build & Development**
  - `next.config.mjs`: Next.js configuration
  - `tailwind.config.js`: Tailwind CSS settings
  - `postcss.config.js`: PostCSS configuration
  - `eslint.config.mjs`: ESLint configuration
  - `tsconfig.json`: TypeScript settings

### Database Management
- `query.sql`: SQL queries for database operations
- `query.ts`: TypeScript database queries
- `switch-db.js`: Database switching utility

### Scripts
- `dev`: Development server with database switching
- `build`: Production build with database setup and Prisma generation
- `start`: Start production server
- `lint`: Run ESLint
- `postinstall`: Setup database and generate Prisma client

## Development Tools
- ESLint for code linting
- PostCSS for CSS processing
- TypeScript for type safety
- Tailwind CSS for styling
- Next.js for frontend framework
- Prisma for database ORM
- Vercel for deployment

This structure follows modern Next.js best practices with a clear separation of concerns and modular organization. The project is set up for scalability and maintainability with proper typing and component isolation. 