# What To Eat?

A web application that helps users discover restaurants near them based on their preferences and location. Built with Next.js, TypeScript, and Google Maps Platform.

## Features

- 🗺️ Interactive map interface using Google Maps
- 📍 Automatic location detection
- 🔍 Search for restaurants nearby
- 🏷️ Filter restaurants by:
  - Cuisine type
  - Price range
- 🔐 User authentication with Google
- 💫 Modern, responsive UI with Tailwind CSS
- 🔄 Persistent user sessions
- 🌐 Production-ready with PostgreSQL

## Tech Stack

- **Frontend Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Maps & Location**: Google Maps JavaScript API, Places API
- **Authentication**: NextAuth.js with Google provider
- **Database**: 
  - Development: Prisma with SQLite
  - Production: Prisma with PostgreSQL (Neon)
- **State Management**: Zustand
- **UI Components**: Headless UI
- **Hosting**: Vercel

## Prerequisites

Before you begin, ensure you have:
- Node.js 20.11.1 or later
- A Google Cloud Platform account with:
  - Maps JavaScript API enabled
  - Places API enabled
  - OAuth 2.0 credentials configured
- A Neon account for PostgreSQL hosting (production only)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/UnsavedArtist/WhatToEat.git
   cd WhatToEat
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the frontend directory with:
   ```
   # Authentication
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Database
   DATABASE_URL="file:./dev.db"  # For local development
   # DATABASE_URL="postgresql://..."  # For production (Neon)

   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Initialize the database:
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Create database and tables
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Configuration

The project uses a dual-database setup:
- **Development**: SQLite for local development
- **Production**: PostgreSQL hosted on Neon

### Development Database
- Located at `frontend/prisma/dev.db`
- Automatically created when running migrations
- Perfect for local development and testing

### Production Database
1. Create a Neon account and database
2. Get your connection string
3. Add it to your Vercel environment variables
4. Migrations will be automatically applied during deployment

### Database Queries and User Management

You can inspect and manage the database using several methods:

#### 1. Prisma Studio (Recommended for Development)
```bash
npx prisma studio
```
This opens a GUI at http://localhost:5555 where you can:
- Browse all tables
- View and edit records
- Filter and sort data
- Add new records

#### 2. Using the Provided Query Files

The repository includes two query files in the `frontend` directory:

1. **SQL Query** (`query.sql`):
   ```bash
   # Run the SQL query to view all tables
   npx prisma db execute --file query.sql --schema ./prisma/schema.prisma
   ```
   This will show the contents of all tables (User, Account, Session, VerificationToken).

2. **TypeScript Query** (`query.ts`):
   ```bash
   # Run the TypeScript query to view formatted database contents
   npx tsx query.ts
   ```
   This will display a formatted JSON output of all database tables and their relationships.

Both files are already set up to query the database properly, whether you're using the development (SQLite) or production (PostgreSQL) database. The connection is automatically handled through your environment variables.

#### Common Database Tasks

1. **Find a specific user**:
```typescript
// By email
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});

// By ID
const user = await prisma.user.findUnique({
  where: { id: 'user_id' }
});
```

2. **Get user with linked accounts**:
```typescript
const userWithAccounts = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { accounts: true }
});
```

3. **Delete a user**:
```typescript
const deletedUser = await prisma.user.delete({
  where: { email: 'user@example.com' }
});
```

4. **Clear all sessions**:
```typescript
const deletedSessions = await prisma.session.deleteMany({});
```

## Project Structure

```
WhatToEat/
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   │   ├── auth/             # Authentication pages
│   │   │   ├── components/       # Reusable React components
│   │   │   ├── store/           # Zustand state management
│   │   │   └── types/           # TypeScript type definitions
│   │   ├── prisma/              # Database schema and migrations
│   │   ├── public/              # Static assets
│   │   └── package.json         # Project dependencies
│   ├── .env                 # Environment variables
│   ├── .gitignore
│   └── README.md
```

## Deployment

This application is deployed on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard:
   ```
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-domain.com
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   DATABASE_URL=your_neon_postgresql_url
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```
4. Deploy!

### Post-Deployment Checklist
- [ ] Verify Google OAuth callback URLs are configured correctly
- [ ] Ensure database migrations are applied
- [ ] Test authentication flow
- [ ] Verify map functionality
- [ ] Check mobile responsiveness

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 