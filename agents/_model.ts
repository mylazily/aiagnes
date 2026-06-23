/**
 * Agnes AI API configuration.
 *
 * Uses OpenAI-compatible API protocol.
 * Base URL: https://apihub.agnes-ai.com/v1
 * Model: agnes-2.0-flash
 */

const DEFAULT_MODEL = process.env.AGNES_MODEL || 'agnes-2.0-flash';
const DEFAULT_BASE_URL = process.env.AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1';
const DEFAULT_API_KEY = process.env.AGNES_API_KEY || '';

export function resolveModelName(env: Record<string, string | undefined>): string {
  return env.AGNES_MODEL || DEFAULT_MODEL;
}

export function resolveBaseUrl(env: Record<string, string | undefined>): string {
  return env.AGNES_BASE_URL || DEFAULT_BASE_URL;
}

export function resolveApiKey(env: Record<string, string | undefined>): string {
  return env.AGNES_API_KEY || DEFAULT_API_KEY;
}

export function resolveSmallModel(env: Record<string, string | undefined>): string {
  return env.AGNES_SMALL_MODEL || resolveModelName(env);
}
