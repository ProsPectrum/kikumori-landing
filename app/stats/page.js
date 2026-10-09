import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import StatsDashboard from "@/components/StatsDashboard";
import StatsLoginForm from "@/components/StatsLoginForm";
import { getDashboardStats } from "@/lib/stats";
import { STATS_COOKIE, isValidStatsCookie, statsPasswordConfigured } from "@/lib/statsAuth";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Stats",
  robots: { index: false, follow: false },
};

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

  const data = await getDashboardStats();

  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Kiku Rae</p>
          <h1 className="mt-2 text-3xl font-extrabold">Traffic</h1>
          <p className="mt-2 text-sm text-white/55">UTC today {data.today}.</p>
        </div>
        <form action="/api/stats-logout" method="post">
          <button type="submit" className="text-sm text-white/40 underline">
            Sign out
          </button>
        </form>
      </div>
      <StatsDashboard data={data} />
    </main>
  );
}
