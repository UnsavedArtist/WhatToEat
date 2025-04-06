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
│       └── package.json     # Project dependencies
│
├── prisma/                  # Root prisma directory for database
└── configuration files      # Root configuration files
    ├── .gitignore          # Git ignore rules
    └── README.md           # Project documentation

```

## Key Components

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
   - Global state management
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
  - `.env.development`: Development variables

- **Build & Development**
  - `next.config.mjs`: Next.js configuration
  - `tailwind.config.js`: Tailwind CSS settings
  - `postcss.config.js`: PostCSS configuration
  - `tsconfig.json`: TypeScript settings

### Database Management
- `query.sql`: SQL queries for database operations
- `query.ts`: TypeScript database queries
- `switch-db.js`: Database switching utility

## Development Tools
- ESLint for code linting
- PostCSS for CSS processing
- TypeScript for type safety
- Tailwind CSS for styling
- Next.js for frontend framework
- Prisma for database ORM

This structure follows modern Next.js best practices with a clear separation of concerns and modular organization. The project is set up for scalability and maintainability with proper typing and component isolation. 