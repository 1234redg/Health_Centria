import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET is required (min 16 chars) — generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().default('E-Kalinga <onboarding@resend.dev>'),
});

export const env = envSchema.parse(process.env);
