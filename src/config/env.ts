import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),
  PORT: z.string().default("3000"),
  
  // MongoDB Database
  MONGODB_URI: z.string().min(1),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("24h"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  
  // CORS
  CORS_ORIGIN: z.string().default("*"),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100"),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (err: unknown) {
  if (err instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const zodError = err as z.ZodError;
    for (const error of zodError.errors) {
      console.error(`  ${error.path.join(".")}: ${error.message}`);
    }
    process.exit(1);
  }
  throw err as Error;
}

export default env;
