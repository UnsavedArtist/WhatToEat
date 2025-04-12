import { PrismaClient } from '@prisma/client';

// For development, you can log the DATABASE_URL to debug
if (process.env.NODE_ENV !== 'production') {
  console.log('Database URL status:', !!process.env.DATABASE_URL);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
} 