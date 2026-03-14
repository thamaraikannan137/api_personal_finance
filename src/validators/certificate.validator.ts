import { z } from "zod";

export const createCertificateSchema = z.object({
  clientId: z.string().min(1, "clientId is required"),
  financialYear: z
    .string()
    .regex(/^FY \d{4}-\d{2}$/, "financialYear must be in format FY YYYY-YY"),
  asOnDate: z.string().min(1, "asOnDate is required"),
});

export const updateNetWorthWordsSchema = z.object({
  netWorthInWords: z.string().optional(),
});
