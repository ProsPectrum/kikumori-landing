"use client";

import { useCallback, useState } from "react";

import { getClientBrowserInfo } from "@/lib/browser";
import InAppBrowserModal from "./InAppBrowserModal";
import { sendEvent } from "./trackClientEvent";
import TurnstileModal from "./TurnstileModal";

export default function ExclusiveButton({
  blockId,
  siteKey,
  imageSrc,
  imageAlt,
  caption,
}) {
  const [inAppOpen, setInAppOpen] = useState(false);
  const [turnstileOpen, setTurnstileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onToken = useCallback(
    async (token, failure) => {
      if (!token) {
        sendEvent("turnstile_failed", { blockId });
        setError(failure === "expired" ? "Check expired. Try again." : "Check failed.");
        return;
      }

      setBusy(true);
      setError("");
      sendEvent("turnstile_success", { blockId });

      try {
        const response = await fetch("/api/verify-human", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ token, blockId }),
        });
        const data = await response.json().catch(() => ({}));
        const path = data.redirectPath;
        if (
          response.ok &&
          typeof path === "string" &&
          /^\/r\/[A-Za-z0-9_-]+$/.test(path)
        ) {
          window.location.assign(path);
          return;
        }
        sendEvent("turnstile_failed", { blockId });
        setError("Verification could not be completed.");
        setBusy(false);
      } catch {
        sendEvent("turnstile_failed", { blockId });
        setError("Network error. Try again.");
        setBusy(false);
      }
    },
    [blockId],
  );

  function handleClick() {
    setError("");
    sendEvent("exclusive_click", { blockId });
    if (!siteKey) {
      setError("Human check is not configured.");
      return;
    }
    const info = getClientBrowserInfo();
    if (info.inAppBrowser) {
      setInAppOpen(true);
      return;
    }
    sendEvent("turnstile_started", { blockId });
    setTurnstileOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-label="Exclusive Content 18+"
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] text-left ring-1 ring-white/10 transition active:scale-[0.99]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <span
          className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full text-lg text-white shadow-md ring-2 ring-white/25"
          style={{ backgroundColor: "#00AFF0" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[1em] w-[1em]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <span className="absolute inset-x-0 bottom-0 pb-4 text-center text-xl font-bold tracking-tight drop-shadow">
          {caption}
        </span>
      </button>
      {error ? (
        <p className="mt-2 text-center text-xs text-[#e8b4b8]" role="status">
          {error}
        </p>
      ) : null}
      <InAppBrowserModal
        open={inAppOpen}
        onClose={() => setInAppOpen(false)}
        pageUrl={typeof window === "undefined" ? "" : window.location.href}
      />
      <TurnstileModal
        open={turnstileOpen}
        siteKey={siteKey}
        onToken={onToken}
        onCancel={() => setTurnstileOpen(false)}
      />
    </>
  );
}
