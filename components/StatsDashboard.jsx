"use client";

import { useMemo, useState } from "react";

import StatsChart from "./StatsChart";
import StatsSelect from "./StatsSelect";
import { CHART_METRICS, CLICK_TARGETS } from "@/lib/trafficSources";
import { formatConversion, ofConversionRate, shiftUtcDay } from "@/lib/statsMath";

function metricValue(row, metricId) {
  if (metricId === "views") return row.views || 0;
  return row.clicks?.[metricId] || 0;
}

function sumSeries(points, metricId) {
  return points.reduce((total, row) => total + metricValue(row, metricId), 0);
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10">
      <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

const selectClass =
  "rounded-2xl bg-white/[0.05] px-3 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none [color-scheme:dark]";

export default function StatsDashboard({ data }) {
  const [sourceId, setSourceId] = useState(data.sources[0]?.id || "");
  const [metricId, setMetricId] = useState("views");
  const [range, setRange] = useState("7");
  const [customFrom, setCustomFrom] = useState(shiftUtcDay(data.today, -6));
  const [customTo, setCustomTo] = useState(data.today);

  const source = data.sources.find((row) => row.id === sourceId) || data.sources[0];
  const metric = CHART_METRICS.find((row) => row.id === metricId) || CHART_METRICS[0];

  const periodSeries = useMemo(() => {
    if (!source) return [];
    if (range === "custom") {
      const from = customFrom < customTo ? customFrom : customTo;
      const to = customFrom < customTo ? customTo : customFrom;
      return source.series.filter((row) => row.day >= from && row.day <= to);
    }
    const count = range === "30" ? 30 : 7;
    return source.series.slice(-count);
  }, [source, range, customFrom, customTo]);

  const chartPoints = periodSeries.map((row) => ({
    day: row.day,
    value: metricValue(row, metric.id),
  }));

  const periodViews = sumSeries(periodSeries, "views");
  const periodExclusive = sumSeries(periodSeries, "exclusive");

  if (!source) return null;

  return (
    <div className="mt-6 space-y-6">
      <StatsSelect
        label="Account"
        value={source.id}
        onChange={setSourceId}
        options={data.sources.map((row) => ({
          value: row.id,
          label: `${row.networkLabel} · ${row.handle}`,
        }))}
      />
      <p className="text-xs text-white/35">{source.path}</p>

      <section className="rounded-[24px] bg-white/[0.03] p-4 ring-1 ring-white/10 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <StatsSelect
            className="w-full sm:min-w-48"
            label="Show"
            value={metric.id}
            onChange={setMetricId}
            options={CHART_METRICS.map((row) => ({
              value: row.id,
              label: row.label,
            }))}
          />
          <div className="flex flex-wrap gap-2">
            {[
              ["7", "7 days"],
              ["30", "30 days"],
              ["custom", "Custom"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={range === id}
                onClick={() => setRange(id)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  range === id
                    ? "bg-white text-neutral-950"
                    : "bg-white/[0.05] text-white/70 ring-1 ring-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {range === "custom" ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-xs text-white/40">
              From
              <input
                type="date"
                min={data.earliest}
                max={data.today}
                value={customFrom}
                onChange={(event) => setCustomFrom(event.target.value)}
                className={`${selectClass} mt-1 w-full`}
              />
            </label>
            <label className="text-xs text-white/40">
              To
              <input
                type="date"
                min={data.earliest}
                max={data.today}
                value={customTo}
                onChange={(event) => setCustomTo(event.target.value)}
                className={`${selectClass} mt-1 w-full`}
              />
            </label>
          </div>
        ) : null}

        <div className="mt-4">
          <StatsChart points={chartPoints} color={metric.color} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-white/70">Period totals</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Metric label="Page views" value={periodViews} />
          {CLICK_TARGETS.map((target) => (
            <Metric
              key={target.id}
              label={target.label}
              value={sumSeries(periodSeries, target.id)}
            />
          ))}
          <Metric
            label="OF conversion"
            value={formatConversion(ofConversionRate(periodViews, periodExclusive))}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-white/70">All-time & today</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Metric label="Page views (all)" value={source.all.views} />
          <Metric label="Page views (today)" value={source.today.views} />
          {CLICK_TARGETS.map((target) => (
            <Metric
              key={target.id}
              label={target.label}
              value={source.all.clicks[target.id] || 0}
            />
          ))}
          <Metric
            label="OF conversion (all)"
            value={formatConversion(
              ofConversionRate(source.all.views, source.all.clicks.exclusive),
            )}
          />
        </div>
      </section>
    </div>
  );
}
