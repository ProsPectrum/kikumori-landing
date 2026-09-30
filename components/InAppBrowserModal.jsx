"use client";

import { useEffect, useState } from "react";

export default function InAppBrowserModal({ open, onClose, pageUrl }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!open) return null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="in-app-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#16141c] p-6 text-left shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#e8b4b8]">
          Continue in browser
        </p>
        <h2 id="in-app-title" className="mt-2 text-2xl font-semibold text-[#f7f3ea]">
          Open in your browser
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#cfc6b8]">
          For the best experience, open this page in Safari or Chrome.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[#f7f3ea]">
          <li>• Tap the ••• menu</li>
          <li>• Choose &quot;Open in browser&quot;</li>
        </ul>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-full bg-[#f7f3ea] px-5 py-3 text-sm font-semibold text-[#16141c]"
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-5 py-3 text-sm text-[#cfc6b8]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
