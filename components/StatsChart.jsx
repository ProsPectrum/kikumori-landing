"use client";

import { useMemo, useState } from "react";

function formatDayLabel(day) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function StatsChart({ points, color = "#fafafa" }) {
  const [active, setActive] = useState(null);
  const width = 640;
  const height = 240;
  const pad = { left: 40, right: 16, top: 20, bottom: 32 };

  const layout = useMemo(() => {
    const maxValue = Math.max(1, ...points.map((point) => point.value));
    const innerWidth = width - pad.left - pad.right;
    const innerHeight = height - pad.top - pad.bottom;
    const coords = points.map((point, index) => {
      const x =
        points.length === 1
          ? pad.left + innerWidth / 2
          : pad.left + (index / (points.length - 1)) * innerWidth;
      const y = pad.top + innerHeight - (point.value / maxValue) * innerHeight;
      return { ...point, x, y };
    });
    const line = coords
      .map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x} ${coord.y}`)
      .join(" ");
    const area = coords.length
      ? `${line} L${coords[coords.length - 1].x} ${pad.top + innerHeight} L${coords[0].x} ${pad.top + innerHeight} Z`
      : "";
    const yTicks = [...new Set([0, Math.round(maxValue / 2), maxValue])];
    const labelEvery = points.length > 14 ? Math.ceil(points.length / 6) : 1;
    return { coords, line, area, maxValue, innerHeight, yTicks, labelEvery };
  }, [points]);

  if (!points.length) {
    return (
      <p className="flex h-60 items-center justify-center text-sm text-white/40">
        No data in this period.
      </p>
    );
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-60 w-full"
        role="img"
        aria-label="Traffic chart"
        onMouseLeave={() => setActive(null)}
      >
        {layout.yTicks.map((tick) => {
          const y =
            pad.top + layout.innerHeight - (tick / layout.maxValue) * layout.innerHeight;
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-white/35"
                fontSize="10"
              >
                {tick}
              </text>
            </g>
          );
        })}
        <path d={layout.area} fill={color} opacity="0.12" />
        <path d={layout.line} fill="none" stroke={color} strokeWidth="2.5" />
        {layout.coords.map((coord, index) =>
          index % layout.labelEvery === 0 || index === layout.coords.length - 1 ? (
            <text
              key={coord.day}
              x={coord.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-white/35"
              fontSize="10"
            >
              {formatDayLabel(coord.day)}
            </text>
          ) : null,
        )}
        {layout.coords.map((coord, index) => (
          <circle
            key={`${coord.day}-dot`}
            cx={coord.x}
            cy={coord.y}
            r={active === index ? 5 : 3}
            fill={color}
            onMouseEnter={() => setActive(index)}
          />
        ))}
        {layout.coords.map((coord, index) => (
          <rect
            key={`${coord.day}-hit`}
            x={coord.x - 8}
            y={pad.top}
            width="16"
            height={layout.innerHeight}
            fill="transparent"
            onMouseEnter={() => setActive(index)}
          />
        ))}
      </svg>
      {active != null && layout.coords[active] ? (
        <p className="absolute right-3 top-2 rounded-lg bg-black/70 px-3 py-1 text-xs text-white">
          {formatDayLabel(layout.coords[active].day)} · {layout.coords[active].value}
        </p>
      ) : null}
    </div>
  );
}
