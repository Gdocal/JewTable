/**
 * Validation utilities
 */

import { z } from 'zod';
import { VALIDATION } from './constants';

/**
 * Common Zod schemas for reuse
 */
export const commonSchemas = {
  // Text
  text: z.string(),
  textRequired: z.string().min(1, 'This field is required'),
  textWithMaxLength: (maxLength: number = VALIDATION.MAX_TEXT_LENGTH) =>
    z.string().max(maxLength, `Maximum ${maxLength} characters allowed`),

  // Email
  email: z.string().email('Invalid email address'),

  // Number
  number: z.number(),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().nonnegative('Must be zero or positive'),
  integerNumber: z.number().int('Must be an integer'),

  // Date
  date: z.date(),
  dateString: z.string().datetime(),
  futureDate: z.date().refine((date) => date > new Date(), {
    message: 'Date must be in the future',
  }),
  pastDate: z.date().refine((date) => date < new Date(), {
    message: 'Date must be in the past',
  }),

  // Boolean
  boolean: z.boolean(),

  // URL
  url: z.string().url('Invalid URL'),

  // Phone
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number'),
};

/**
 * Date range validation
 */
export function createDateRangeSchema(message?: string) {
  return z
    .object({
      startDate: z.date(),
      endDate: z.date(),
    })
    .refine((data) => data.endDate >= data.startDate, {
      message: message || 'End date must be after or equal to start date',
      path: ['endDate'],
    });
}

/**
 * Number range validation
 */
export function createNumberRangeSchema(min?: number, max?: number) {
  let schema = z.number();

  if (min !== undefined) {
    schema = schema.min(min, `Must be at least ${min}`);
  }

  if (max !== undefined) {
    schema = schema.max(max, `Must be at most ${max}`);
  }

  return schema;
}

/**
 * Validate a value against a Zod schema
 */
export function validateValue<T>(
  value: unknown,
  schema: z.ZodType<T>
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(value);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Validation failed',
    };
  }
}

/**
 * Extract error message from Zod error
 */
export function getZodErrorMessage(error: z.ZodError): string {
  return error.errors[0]?.message || 'Validation failed';
}

/**
 * Check if a value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Sanitize text input (remove HTML, trim)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
}
