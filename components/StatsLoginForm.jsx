"use client";

import { useState } from "react";

export default function StatsLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/stats-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError("Wrong password.");
        setBusy(false);
        return;
      }
      window.location.assign("/stats");
    } catch {
      setError("Network error.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-sm text-white/55">
        Password
        <input
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl bg-white/[0.05] px-4 py-3 text-white ring-1 ring-white/10 outline-none"
          autoComplete="current-password"
          required
        />
      </label>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950"
      >
        Open dashboard
      </button>
    </form>
  );
}
