/**
 * Database Configuration
 * Prisma Client setup with connection pooling and logging
 */

import { PrismaClient } from '@prisma/client';
import { env, isDevelopment } from './env';

// Create Prisma Client with logging configuration
export const prisma = new PrismaClient({
  log: isDevelopment
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
  errorFormat: isDevelopment ? 'pretty' : 'minimal',
});

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n📦 Disconnecting from database...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Test database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};
