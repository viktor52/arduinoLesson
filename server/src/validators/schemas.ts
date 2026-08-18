import { z } from 'zod';
import { TOPICS } from '@arduino/shared';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  displayName: z.string().max(50).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const generateAssignmentSchema = z.object({
  difficulty: z.number().int().min(0).max(10),
  topic: z.enum(TOPICS as unknown as [string, ...string[]]).optional(),
});

export const submissionSchema = z.object({
  assignmentId: z.string().min(1),
  code: z.string().min(1, 'Code cannot be empty'),
});

export const reviewSchema = z.object({
  assignmentId: z.string().min(1),
  code: z.string().min(1, 'Code cannot be empty'),
});

export const hintSchema = z.object({
  assignmentId: z.string().min(1),
  code: z.string(),
  hintLevel: z.number().int().min(1).max(3).optional(),
});

export const saveCodeSchema = z.object({
  code: z.string(),
});

export const historyQuerySchema = z.object({
  search: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.coerce.number().int().min(0).max(10).optional(),
  sortBy: z.enum(['createdAt', 'score', 'difficulty', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  passed: z.enum(['true', 'false']).optional(),
});

export const noteSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  assignmentId: z.string().optional(),
});
