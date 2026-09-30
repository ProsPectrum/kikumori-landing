const IN_APP_CATEGORIES = new Set([
  "instagram",
  "facebook",
  "tiktok",
  "snapchat",
]);

export function classifyUserAgent(userAgent = "") {
  const ua = userAgent || "";

  if (/Instagram/i.test(ua)) {
    return { browserCategory: "instagram", inAppBrowser: true };
  }
  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS/i.test(ua)) {
    return { browserCategory: "facebook", inAppBrowser: true };
  }
  if (/BytedanceWebview|TikTok|musical_ly/i.test(ua)) {
    return { browserCategory: "tiktok", inAppBrowser: true };
  }
  if (/Snapchat|SnapchatWebView/i.test(ua)) {
    return { browserCategory: "snapchat", inAppBrowser: true };
  }

  return { browserCategory: "browser", inAppBrowser: false };
}

export function classifyDevice(userAgent = "") {
  const ua = userAgent || "";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android.+Mobile/i.test(ua)) return "mobile";
  return "desktop";
}

export function isInAppBrowserCategory(category) {
  return IN_APP_CATEGORIES.has(category);
}

export function getClientBrowserInfo() {
  if (typeof navigator === "undefined") {
    return {
      browserCategory: "browser",
      deviceCategory: "unknown",
      inAppBrowser: false,
    };
  }

  const { browserCategory, inAppBrowser } = classifyUserAgent(
    navigator.userAgent,
  );
  return {
    browserCategory,
    deviceCategory: classifyDevice(navigator.userAgent),
    inAppBrowser,
  };
}
