import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import StatsLoginForm from "@/components/StatsLoginForm";
import { CLICK_TARGETS } from "@/lib/trafficSources";
import { getDashboardStats } from "@/lib/stats";
import { STATS_COOKIE, isValidStatsCookie, statsPasswordConfigured } from "@/lib/statsAuth";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Stats",
  robots: { index: false, follow: false },
};

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10">
      <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

export default async function StatsPage() {
  if (!statsPasswordConfigured()) notFound();

  const jar = await cookies();
  if (!isValidStatsCookie(jar.get(STATS_COOKIE)?.value)) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-md px-4 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Kiku Rae</p>
        <h1 className="mt-2 text-3xl font-extrabold">Stats</h1>
        <p className="mt-3 text-sm text-white/55">Private dashboard. Sign in to continue.</p>
        <StatsLoginForm />
      </main>
    );
  }

  const data = await getDashboardStats({ days: 7 });

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 py-10">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">Kiku Rae</p>
      <h1 className="mt-2 text-3xl font-extrabold">Traffic</h1>
      <p className="mt-2 text-sm text-white/55">
        UTC today {data.today}. Window is last {data.days} days.
      </p>
      <form action="/api/stats-logout" method="post" className="mt-4">
        <button type="submit" className="text-sm text-white/40 underline">
          Sign out
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {data.sources.map((source) => (
          <section
            key={source.id}
            className="rounded-[24px] bg-white/[0.03] p-5 ring-1 ring-white/10"
          >
            <h2 className="text-lg font-bold">
              {source.networkLabel}
              <span className="ml-2 text-sm font-medium text-white/45">
                {source.handle}
              </span>
            </h2>
            <p className="mt-1 text-xs text-white/35">{source.path}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Page views (all)" value={source.all.views} />
              <Metric label="Page views (today)" value={source.today.views} />
              <Metric label="Page views (7d)" value={source.window.views} />
              {CLICK_TARGETS.map((target) => (
                <Metric
                  key={target.id}
                  label={target.label}
                  value={source.all.clicks[target.id] || 0}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
