import { z } from "zod";

const customFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  value: z.union([z.string(), z.number(), z.null()]).optional(),
  required: z.boolean(),
});

// Simplified schemas - validate body directly (flexible category for custom categories)
export const createLiabilitySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  category: z.string().min(1, "Category is required"), // Accept any string for flexibility
  balance: z.number().positive("Balance must be positive"),
  interestRate: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional(),
  institution: z.string().max(100).optional(),
  owner: z.string().min(1, "Owner is required"),
  notes: z.string().max(500).optional(),
  customFields: z.array(customFieldSchema).optional(),
  customCategoryName: z.string().optional(),
});

export const updateLiabilitySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).optional(), // Accept any string for flexibility
  balance: z.number().positive().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional(),
  institution: z.string().max(100).optional(),
  owner: z.string().min(1).optional(),
  notes: z.string().max(500).optional(),
  customFields: z.array(customFieldSchema).optional(),
  customCategoryName: z.string().optional(),
});

// For params validation - create separate middleware or handle in controller
export const liabilityIdSchema = z.object({
  id: z.string().min(1, "Liability ID is required"),
});

