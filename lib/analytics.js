import "server-only";

import { classifyDevice, classifyUserAgent } from "./browser.js";
import { ALLOWED_EVENTS, ALLOWED_SOCIAL_IDS } from "./eventNames.js";
import { recordClick } from "./stats.js";
import { getStore } from "./store/index.js";
import { isKnownSourceId } from "./trafficSources.js";

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
  const safeSource = isKnownSourceId(source) ? source : "";

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    source: safeSource,
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

  if (payload.event === "social_click") {
    await recordClick(payload.source, payload.socialId);
  }

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
