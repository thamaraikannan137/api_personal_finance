import { z } from "zod";

const customFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  value: z.union([z.string(), z.number(), z.null()]).optional(),
  required: z.boolean(),
});

// Simplified schemas - validate body directly (flexible category for custom categories)
export const createAssetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  category: z.string().min(1, "Category is required"), // Accept any string for flexibility
  value: z.number().positive("Value must be positive"),
  purchaseDate: z.string().optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  owner: z.string().min(1, "Owner is required"),
  documents: z.array(z.string()).optional(),
  documentUrl: z.string().url().optional().or(z.literal('')),
  customFields: z.array(customFieldSchema).optional(),
  customCategoryName: z.string().optional(),
});

export const updateAssetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).optional(), // Accept any string for flexibility
  value: z.number().positive().optional(),
  purchaseDate: z.string().optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  owner: z.string().min(1).optional(),
  documents: z.array(z.string()).optional(),
  documentUrl: z.string().url().optional().or(z.literal('')),
  customFields: z.array(customFieldSchema).optional(),
  customCategoryName: z.string().optional(),
});

// For params validation - create separate middleware or handle in controller
export const assetIdSchema = z.object({
  id: z.string().min(1, "Asset ID is required"),
});

