import { PrismaClient } from '@prisma/client';

// For development, you can log the DATABASE_URL to debug
if (process.env.NODE_ENV !== 'production') {
  console.log('Database URL status:', !!process.env.DATABASE_URL);
}

// In production, we want to reuse connections
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

export { prisma as db }; 