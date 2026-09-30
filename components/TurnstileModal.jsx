"use client";

import { useEffect, useRef } from "react";

export default function TurnstileModal({
  open,
  siteKey,
  onToken,
  onCancel,
}) {
  const hostRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;

    function renderWidget() {
      if (cancelled || !hostRef.current || !window.turnstile) return;
      if (widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
      }
      hostRef.current.innerHTML = "";
      widgetIdRef.current = window.turnstile.render(hostRef.current, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        "error-callback": () => onToken(null, "error"),
        "expired-callback": () => onToken(null, "expired"),
        theme: "dark",
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const existing = document.querySelector("script[data-turnstile]");
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = "true";
        script.onload = renderWidget;
        document.head.appendChild(script);
      } else {
        existing.addEventListener("load", renderWidget);
      }
    }

    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [open, siteKey, onToken]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="turnstile-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#16141c] p-6 text-left shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#e8b4b8]">
          Age-gated link
        </p>
        <h2 id="turnstile-title" className="mt-2 text-2xl font-semibold text-[#f7f3ea]">
          Confirm you are human
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#cfc6b8]">
          Complete the check to continue to exclusive content. You must be 18
          or older.
        </p>
        <div className="mt-5 flex justify-center" ref={hostRef} />
        <button
          type="button"
          onClick={onCancel}
          className="mt-6 w-full rounded-full border border-white/15 px-5 py-3 text-sm text-[#cfc6b8]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
