import { z } from 'zod';

// Load .env file in development
if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('dotenv').config();
  } catch {
    // dotenv not installed; skip
  }
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  JWT_SECRET: z.string().default('super-secret-key-change-me-in-production'),
  PORT: z.preprocess((val) => {
    if (val === undefined || val === '') return undefined;
    const parsed = Number(val);
    return Number.isNaN(parsed) ? val : parsed;
  }, z.number().default(4000)),
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(
  processEnv: Record<string, string | undefined> = process.env,
): Env {
  const parsed = envSchema.safeParse(processEnv);

  if (!parsed.success) {
    console.error('Environment validation failed:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  const env = parsed.data;
  cachedEnv = env;
  return env;
}

export function getEnv(): Env {
  if (!cachedEnv) {
    return validateEnv(process.env);
  }
  return cachedEnv;
}
