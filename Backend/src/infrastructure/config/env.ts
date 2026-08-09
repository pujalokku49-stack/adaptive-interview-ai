import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'production' | 'test';

interface EnvConfig {
  NODE_ENV: NodeEnv;
  PORT: number;
  LOG_LEVEL: string;
  API_VERSION: string;
  LLM_PROVIDER: 'anthropic' | 'openai' | 'gemini';
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
  FRONTEND_URL: string;
}

function readEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseNodeEnv(raw: string): NodeEnv {
  if (raw === 'development' || raw === 'production' || raw === 'test') {
    return raw;
  }
  throw new Error(`Invalid NODE_ENV value: "${raw}". Expected development|production|test.`);
}

function parseLlmProvider(raw: string): 'anthropic' | 'openai' | 'gemini' {
  if (raw === 'anthropic' || raw === 'openai' || raw === 'gemini') {
    return raw;
  }
  return 'anthropic';
}

export const env: EnvConfig = {
  NODE_ENV: parseNodeEnv(readEnv('NODE_ENV', 'development')),
  PORT: Number(readEnv('PORT', '4000')),
  LOG_LEVEL: readEnv('LOG_LEVEL', 'info'),
  API_VERSION: readEnv('API_VERSION', 'v1'),
  LLM_PROVIDER: parseLlmProvider(readEnv('LLM_PROVIDER', 'anthropic')),
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: readEnv('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20240620'),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: readEnv('OPENAI_MODEL', 'gpt-4o'),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: readEnv('GEMINI_MODEL', 'gemini-1.5-pro'),
  FRONTEND_URL: readEnv('FRONTEND_URL', 'http://localhost:5173'),
};
