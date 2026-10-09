import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const STATS_COOKIE = "kiku_stats";

function cookieSecret() {
  return process.env.STATS_PASSWORD || "";
}

export function statsPasswordConfigured() {
  return Boolean(process.env.STATS_PASSWORD);
}

export function statsCookieValue() {
  const secret = cookieSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update("kiku-stats-session").digest("hex");
}

export function isValidStatsPassword(password) {
  const expected = cookieSecret();
  if (!expected || typeof password !== "string") return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isValidStatsCookie(value) {
  const expected = statsCookieValue();
  if (!expected || typeof value !== "string" || value.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
