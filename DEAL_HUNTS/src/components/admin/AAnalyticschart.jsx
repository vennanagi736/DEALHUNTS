import React, { useState, useRef } from "react";

/* -------------------------------------------------------------------------
   AnalyticsChart
   Self-contained, dependency-free SVG line chart for the Business
   Analytics card. Renders a smooth gold line + gold points on a light
   grid, and shows a floating tooltip that tracks whichever point the
   user is hovering, with a value/unit formatted for the active metric.

   Props:
     data   -> [{ label: "Mar", value: 320 }, ...]
     metric -> "Sales" | "Revenue" | "Orders" | "Products"
     unit   -> fn(value) => string, e.g. v => `${v} units`
------------------------------------------------------------------------- */
function buildSmoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function AnalyticsChart({ data, metric, unit }) {
  const [activeIndex, setActiveIndex] = useState(data.length - 1);
  const svgRef = useRef(null);

  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 20 };

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i * innerW) / (data.length - 1);
    const y = padding.top + innerH - ((d.value - min) / range) * innerH;
    return { x, y, ...d };
  });

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - padding.bottom
  } L ${points[0].x} ${height - padding.bottom} Z`;

  const handleMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

  const active = points[activeIndex];
  const tooltipLeftPct = (active.x / width) * 100;
  const tooltipFlip = tooltipLeftPct > 78;

  return (
    <div className="db-chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="db-chart-svg"
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setActiveIndex(data.length - 1)}
      >
        <defs>
          <linearGradient id="dbAreaGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + f * innerH}
            y2={padding.top + f * innerH}
            className="db-chart-gridline"
          />
        ))}

        <path d={areaPath} fill="url(#dbAreaGold)" stroke="none" />
        <path d={linePath} fill="none" className="db-chart-line" />

        {/* hover guide line */}
        <line
          x1={active.x}
          x2={active.x}
          y1={padding.top}
          y2={height - padding.bottom}
          className="db-chart-guide"
        />

        {points.map((p, i) => (
          <g key={p.label}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i === activeIndex ? 6 : 3.5}
              className={
                i === activeIndex ? "db-chart-dot db-chart-dot-active" : "db-chart-dot"
              }
              onMouseEnter={() => setActiveIndex(i)}
            />
            <text x={p.x} y={height - 8} textAnchor="middle" className="db-chart-axis-label">
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      <div
        className={`db-chart-tooltip ${tooltipFlip ? "db-chart-tooltip-flip" : ""}`}
        style={{
          left: `${tooltipLeftPct}%`,
          top: `${(active.y / height) * 100}%`,
        }}
      >
        <span className="db-tooltip-month">{active.label}</span>
        <span className="db-tooltip-metric">{metric}</span>
        <span className="db-tooltip-value">{unit(active.value)}</span>
      </div>
    </div>
  );
}