import { PrismaClient } from '@prisma/client';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();
const databaseUrl = serverRuntimeConfig.DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

export { prisma as db }; 