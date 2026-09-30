"use client";

import { getClientBrowserInfo } from "@/lib/browser";

export function sendEvent(event, extra = {}) {
  const info = getClientBrowserInfo();
  const params = new URLSearchParams(window.location.search);
  fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      event,
      blockId: extra.blockId,
      socialId: extra.socialId,
      source: params.get("source") || params.get("utm_source") || "",
      campaign: params.get("campaign") || params.get("utm_campaign") || "",
      browserCategory: info.browserCategory,
      deviceCategory: info.deviceCategory,
    }),
  }).catch(() => undefined);
}
