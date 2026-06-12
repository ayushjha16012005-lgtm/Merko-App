import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  PORT: z.preprocess((val) => {
    if (val === undefined || val === '') return undefined;
    const parsed = Number(val);
    return isNaN(parsed) ? val : parsed;
  }, z.number().default(4000)),
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function validateEnv(processEnv: Record<string, string | undefined> = process.env): Env {
  const parsed = envSchema.safeParse(processEnv);
  
  if (!parsed.success) {
    console.error('❌ Environment validation failed:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Environment validation failed. Missing required variables.');
  }
  
  _env = parsed.data;
  return parsed.data;
}

export function getEnv(): Env {
  if (!_env) {
    return validateEnv(process.env);
  }
  return _env;
}

export const CONSTANTS = {
  APP_NAME: 'Merko',
  API_VERSION: 'v1',
  DEFAULT_PORT: 4000,
};
