import "server-only";

export const EXCLUSIVE_BLOCK_ID = "exclusive";

export function getSiteUrl() {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function getRedirectTtlSeconds() {
  const raw = Number(process.env.REDIRECT_TOKEN_TTL_SECONDS || 60);
  if (!Number.isFinite(raw)) return 60;
  return Math.min(120, Math.max(30, Math.floor(raw)));
}

export function allowedOrigins() {
  const extras = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set([getSiteUrl(), ...extras]);
}
