export interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

const REQUIRED_KEYS: { key: string; description: string; productionOnly: boolean }[] = [
  { key: 'GOOGLE_GENAI_API_KEY', description: 'Google AI (Gemini) API key', productionOnly: false },
  { key: 'FRONTEND_URL', description: 'Frontend base URL', productionOnly: false },
  { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', description: 'Firebase project ID', productionOnly: false },
];

const PRODUCTION_REQUIRED_KEYS: { key: string; description: string }[] = [
  { key: 'ENCRYPTION_KEY', description: 'AES-256-GCM encryption key (32-byte hex)' },
  { key: 'SENTRY_AUTH_TOKEN', description: 'Sentry auth token for source maps' },
  { key: 'SENTRY_DSN', description: 'Sentry DSN for error tracking' },
];

export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  const isProd = process.env.NODE_ENV === 'production';

  for (const req of REQUIRED_KEYS) {
    if (!process.env[req.key]) {
      missing.push(req.key);
    }
  }

  if (isProd) {
    for (const req of PRODUCTION_REQUIRED_KEYS) {
      if (!process.env[req.key]) {
        missing.push(req.key);
      }
    }
  } else {
    for (const req of PRODUCTION_REQUIRED_KEYS) {
      if (!process.env[req.key] && req.key === 'ENCRYPTION_KEY') {
        warnings.push(`${req.key} is not set — using dev fallback key. Set a 32-byte hex key in production.`);
      }
    }
  }

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (encryptionKey && encryptionKey.length !== 64 && encryptionKey.length !== 32) {
    warnings.push(`ENCRYPTION_KEY should be 32 bytes (64 hex chars) or exactly 32 bytes. Current length: ${encryptionKey.length}`);
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function logEnvWarnings(): void {
  const result = validateEnvironment();
  if (result.warnings.length > 0) {
    for (const w of result.warnings) {
      console.warn(`[EnvValidator] ${w}`);
    }
  }
  if (result.missing.length > 0) {
    for (const m of result.missing) {
      console.error(`[EnvValidator] Missing required key: ${m}`);
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${result.missing.join(', ')}`);
    }
  }
}
