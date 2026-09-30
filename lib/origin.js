import "server-only";

import { allowedOrigins, getSiteUrl } from "./config.js";

function originFromUrl(value) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function requestOrigin(request) {
  const origin = request.headers.get("origin");
  if (origin) return originFromUrl(origin);

  const referer = request.headers.get("referer");
  if (referer) return originFromUrl(referer);

  return null;
}

export function isTrustedMutation(request) {
  // Same-origin POST browsers send Origin. Rejecting missing Origin blocks CSRF from opaque sources.
  const origin = requestOrigin(request);
  if (!origin) return false;

  if (allowedOrigins().has(origin)) return true;

  const host = request.headers.get("host");
  if (!host) return false;

  const proto =
    request.headers.get("x-forwarded-proto") ||
    (getSiteUrl().startsWith("https:") ? "https" : "http");
  const derived = `${proto}://${host}`.replace(/\/$/, "");
  return origin === derived;
}
