/**
 * Environment Variable Validator
 *
 * Validates required environment variables at startup
 * Prevents runtime errors from missing configuration
 */

import { createLogger } from './logger';

const log = createLogger('EnvValidator');

interface EnvConfig {
  name: string;
  required: boolean;
  validator?: (value: string) => boolean;
  defaultValue?: string;
  sensitive?: boolean; // Don't log the value
}

const ENV_CONFIG: EnvConfig[] = [
  // Database
  {
    name: 'SUPABASE_URL',
    required: true,
    validator: (v) => v.startsWith('https://'),
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    sensitive: true,
  },
  {
    name: 'SUPABASE_ANON_KEY',
    required: false,
    sensitive: true,
  },

  // AI Providers (at least one required)
  {
    name: 'ANTHROPIC_API_KEY',
    required: false, // Will be checked separately
    sensitive: true,
  },
  {
    name: 'OPENAI_API_KEY',
    required: false, // Will be checked separately
    sensitive: true,
  },

  // Auth
  {
    name: 'JWT_SECRET',
    required: true,
    sensitive: true,
    validator: (v) => v.length >= 32,
  },

  // Server
  {
    name: 'PORT',
    required: false,
    defaultValue: '3000',
    validator: (v) => !isNaN(parseInt(v)) && parseInt(v) > 0 && parseInt(v) < 65536,
  },
  {
    name: 'NODE_ENV',
    required: false,
    defaultValue: 'development',
    validator: (v) => ['development', 'production', 'test'].includes(v),
  },

  // Optional features
  {
    name: 'ENABLE_CHATBOT_EMBEDDINGS',
    required: false,
    defaultValue: 'false',
    validator: (v) => ['true', 'false'].includes(v),
  },
  {
    name: 'LOG_LEVEL',
    required: false,
    defaultValue: 'info',
    validator: (v) => ['debug', 'info', 'warn', 'error'].includes(v),
  },
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  loadedVars: string[];
}

/**
 * Validate all environment variables
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const loadedVars: string[] = [];

  for (const config of ENV_CONFIG) {
    const value = process.env[config.name];

    if (!value) {
      if (config.required) {
        errors.push(`Missing required env var: ${config.name}`);
      } else if (config.defaultValue) {
        process.env[config.name] = config.defaultValue;
        loadedVars.push(`${config.name} (default: ${config.defaultValue})`);
      }
      continue;
    }

    // Validate format
    if (config.validator && !config.validator(value)) {
      errors.push(`Invalid format for ${config.name}`);
      continue;
    }

    loadedVars.push(config.name);
  }

  // Special check: at least one AI provider must be configured
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    errors.push('At least one AI provider key required: ANTHROPIC_API_KEY or OPENAI_API_KEY');
  }

  // Warnings for recommended but not required
  if (!process.env.SUPABASE_ANON_KEY) {
    warnings.push('SUPABASE_ANON_KEY not set - some features may not work');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    loadedVars,
  };
}

/**
 * Validate and log results, exit if critical errors
 */
export function validateEnvOrExit(): void {
  const result = validateEnv();

  // Log loaded vars (debug level)
  log.debug('Environment variables loaded', { vars: result.loadedVars });

  // Log warnings
  for (const warning of result.warnings) {
    log.warn(warning);
  }

  // Log and exit on errors
  if (!result.valid) {
    for (const error of result.errors) {
      log.error(error);
    }
    log.error('Environment validation failed, exiting');
    process.exit(1);
  }

  log.info('Environment validation passed', {
    loaded: result.loadedVars.length,
    warnings: result.warnings.length
  });
}

/**
 * Get a validated env var (throws if not set and required)
 */
export function getEnv(name: string, required: true): string;
export function getEnv(name: string, required?: false): string | undefined;
export function getEnv(name: string, required = false): string | undefined {
  const value = process.env[name];
  if (!value && required) {
    throw new Error(`Required environment variable not set: ${name}`);
  }
  return value;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export default validateEnvOrExit;
