/**
 * Environment Configuration
 * Validates and exports environment variables with type safety
 */

import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  API_PREFIX: z.string().default('/api'),

  // Database
  DATABASE_URL: z.string().min(1),

  // Redis (optional)
  REDIS_URL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),

  // Pagination
  DEFAULT_PAGE_SIZE: z.string().transform(Number).default('100'),
  MAX_PAGE_SIZE: z.string().transform(Number).default('1000'),

  // Cache TTL
  CACHE_TTL_SHORT: z.string().transform(Number).default('300'),
  CACHE_TTL_MEDIUM: z.string().transform(Number).default('1800'),
  CACHE_TTL_LONG: z.string().transform(Number).default('3600'),
});

type EnvConfig = z.infer<typeof envSchema>;

// Validate environment variables
const parseEnv = (): EnvConfig => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(error.errors);
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
