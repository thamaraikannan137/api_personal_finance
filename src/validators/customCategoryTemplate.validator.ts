import { z } from "zod";

const customFieldSchema = z.object({
  id: z.string().min(1, "Field id is required"),
  name: z.string().min(1, "Field name is required").max(100, "Field name must be less than 100 characters"),
  type: z.string().min(1, "Field type is required").max(50, "Field type must be less than 50 characters"),
  required: z.boolean(),
  placeholder: z.string().optional(),
});

export const createCustomCategoryTemplateSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Category name must be less than 100 characters"),
  categoryType: z.enum(["asset", "liability"], {
    errorMap: () => ({ message: "Category type must be 'asset' or 'liability'" }),
  }),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  icon: z.string().max(100, "Icon must be less than 100 characters").optional(),
  fields: z.array(customFieldSchema).min(1, "At least one custom field is required"),
});

export const updateCustomCategoryTemplateSchema = createCustomCategoryTemplateSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided to update the custom category" }
  )
  .refine(
    (data) => !data.fields || data.fields.length > 0,
    { message: "At least one custom field is required" }
  );


