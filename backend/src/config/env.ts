import { config as loadEnv } from "dotenv";

loadEnv();

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric environment variable value: ${value}`);
  }

  return parsed;
}

function parseSameSite(value: string | undefined): "lax" | "strict" | "none" {
  const normalized = value?.toLowerCase() ?? "lax";

  if (normalized === "lax" || normalized === "strict" || normalized === "none") {
    return normalized;
  }

  throw new Error(`Invalid REFRESH_COOKIE_SAME_SITE value: ${value}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseNumber(process.env.PORT, 4000),
  appOrigin: requireEnv("APP_ORIGIN", "http://localhost:3000"),
  apiBasePath: requireEnv("API_BASE_PATH", "/api"),
  db: {
    host: requireEnv("DB_HOST", "localhost"),
    port: parseNumber(process.env.DB_PORT, 3306),
    name: requireEnv("DB_NAME", "lms"),
    user: requireEnv("DB_USER", "root"),
    password: requireEnv("DB_PASSWORD", "change_me"),
    ssl: parseBoolean(process.env.DB_SSL, false),
    caCertPath: process.env.DB_CA_CERT_PATH
  },
  youtubeApiKey: requireEnv("YOUTUBE_API_KEY", ""),
  auth: {
    accessSecret: requireEnv("JWT_ACCESS_SECRET", "dev-access-secret"),
    refreshSecret: requireEnv("JWT_REFRESH_SECRET", "dev-refresh-secret"),
    accessExpiresIn: requireEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
    refreshExpiresIn: requireEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
    refreshCookieName: requireEnv("REFRESH_COOKIE_NAME", "lms_refresh_token"),
    refreshCookieSecure: parseBoolean(process.env.REFRESH_COOKIE_SECURE, false),
    refreshCookieSameSite: parseSameSite(process.env.REFRESH_COOKIE_SAME_SITE),
    bcryptSaltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 12)
  }
} as const;
