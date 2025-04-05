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

## Tech Stack

- **Frontend Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Maps & Location**: Google Maps JavaScript API, Places API
- **Authentication**: NextAuth.js with Google provider
- **Database**: Prisma with SQLite
- **State Management**: Zustand
- **UI Components**: Headless UI

## Prerequisites

Before you begin, ensure you have:
- Node.js 20.11.1 or later
- A Google Cloud Platform account with:
  - Maps JavaScript API enabled
  - Places API enabled
  - OAuth 2.0 credentials configured

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
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
WhatToEat/
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   │   ├── components/       # Reusable React components
│   │   │   ├── store/           # Zustand state management
│   │   │   └── types/           # TypeScript type definitions
│   │   ├── prisma/              # Database schema and migrations
│   │   ├── public/              # Static assets
│   │   └── package.json         # Project dependencies
│   ├── .gitignore
│   └── README.md
```

## Deployment

This application is designed to be deployed on Vercel:
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 