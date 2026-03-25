import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
});

export const env = envSchema.parse(process.env);
