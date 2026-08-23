import React, { useMemo, useState } from "react";

/* =========================================================================
   ATopCategoriesChart.jsx
   "Top Categories by Sales" — donut chart + legend, deliberately different
   from the Top Products bar chart so the two sit well side by side.
   Placeholder data: [{ name, value }].
   ========================================================================= */

const SLICE_COLORS = ["#D4AF37", "#111111", "#B8932B", "#9AA2AF", "#E8D9A0"];

function buildDonutSlices(data, radius, thickness) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return data.map((d, i) => {
    const fraction = d.value / total;
    const dash = fraction * circumference;
    const slice = {
      ...d,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      dasharray: `${dash} ${circumference - dash}`,
      dashoffset: -offset,
      pct: Math.round(fraction * 100),
    };
    offset += dash;
    return slice;
  });
}

function TopCategoriesChart({ data = [] }) {
  const [activeIdx, setActiveIdx] = useState(null);
  const radius = 58;
  const thickness = 20;
  const size = (radius + thickness) * 2;

  const slices = useMemo(() => buildDonutSlices(data, radius, thickness), [data]);
  const active = activeIdx !== null ? slices[activeIdx] : null;

  return (
    <section className="db-card">
      <h2 className="db-card-title">Top Categories by Sales</h2>
      <p className="db-card-subtitle">Share of total sales by category</p>

      <div className="db-donut-row">
        <svg
          className="db-donut-svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
            <circle r={radius} fill="none" stroke="#F0F0F0" strokeWidth={thickness} />
            {slices.map((s, i) => (
              <circle
                key={s.name}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={s.dasharray}
                strokeDashoffset={s.dashoffset}
                strokeLinecap="butt"
                className="db-donut-slice"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              />
            ))}
          </g>
          <text x="50%" y="48%" textAnchor="middle" className="db-donut-center-value">
            {active ? `${active.pct}%` : `${data.length}`}
          </text>
          <text x="50%" y="60%" textAnchor="middle" className="db-donut-center-label">
            {active ? active.name : "Categories"}
          </text>
        </svg>

        <ul className="db-donut-legend">
          {slices.map((s, i) => (
            <li
              key={s.name}
              className={`db-donut-legend-row${activeIdx === i ? " db-donut-legend-active" : ""}`}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
            >
              <span className="db-donut-dot" style={{ background: s.color }} />
              <span className="db-donut-legend-name">{s.name}</span>
              <span className="db-donut-legend-pct">{s.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TopCategoriesChart;
