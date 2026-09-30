import "server-only";

import { classifyDevice, classifyUserAgent } from "./browser.js";
import { ALLOWED_EVENTS, ALLOWED_SOCIAL_IDS } from "./eventNames.js";
import { getStore } from "./store/index.js";

const MAX_EVENTS = 2000;

function sanitizeShort(value, max = 64) {
  if (typeof value !== "string") return "";
  return value.replace(/[^\w.-]/g, "").slice(0, max);
}

export function buildAnalyticsEvent({
  event,
  source,
  campaign,
  blockId,
  socialId,
  userAgent,
}) {
  if (!ALLOWED_EVENTS.has(event)) return null;

  const { browserCategory } = classifyUserAgent(userAgent);
  const deviceCategory = classifyDevice(userAgent);

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    source: sanitizeShort(source, 40),
    campaign: sanitizeShort(campaign, 40),
    blockId: blockId === "exclusive" ? "exclusive" : "",
    browserCategory,
    deviceCategory,
  };

  if (event === "social_click") {
    if (!ALLOWED_SOCIAL_IDS.has(socialId)) return null;
    payload.socialId = socialId;
  }

  return payload;
}

export async function trackEvent(input) {
  const payload = buildAnalyticsEvent(input);
  if (!payload) return { ok: false };

  await getStore().appendAnalytics("analytics:events", payload, MAX_EVENTS);

  const webhook = process.env.ANALYTICS_WEBHOOK_URL;
  if (webhook) {
    fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }

  return { ok: true };
}
