
import React, { useState, useRef, useEffect, useMemo } from "react";

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

export default function AnalyticsChart({ data = [], metric = "Sales", unit = (v) => v, period }) {
  const svgRef = useRef(null);
  const safeData = useMemo(
    () =>
      (Array.isArray(data) ? data : []).filter(
        (item) =>
          item &&
          item.label != null &&
          Number.isFinite(Number(item.value))
      ).map((item) => ({ ...item, value: Number(item.value) })),
    [data]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(Math.max(0, safeData.length - 1));
  }, [safeData.length, metric, period]);

  if (safeData.length === 0) {
    return (
      <div className="db-chart-wrap" role="status">
        <p className="db-card-subtitle">
          No {metric.toLowerCase()} data available for this period.
        </p>
      </div>
    );
  }

  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 20 };

  const values = safeData.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const points = safeData.map((d, i) => ({
    ...d,
    x:
      padding.left +
      (safeData.length === 1 ? innerW / 2 : (i * innerW) / (safeData.length - 1)),
    y: padding.top + innerH - ((d.value - min) / range) * innerH,
  }));

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${
          height - padding.bottom
        } L ${points[0].x} ${height - padding.bottom} Z`
      : "";

  const safeActiveIndex = Math.min(activeIndex, points.length - 1);
  const active = points[safeActiveIndex];

  const handleMove = (e) => {
    if (!svgRef.current || points.length < 2) return;

    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width) return;

    const relX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = 0;
    let closestDist = Infinity;

    points.forEach((point, i) => {
      const dist = Math.abs(point.x - relX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });

    setActiveIndex(closest);
  };

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
        onMouseLeave={() => setActiveIndex(points.length - 1)}
        role="img"
        aria-label={`${metric} ${period || ""} analytics chart`}
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

        {points.length > 1 && (
          <>
            <path d={areaPath} fill="url(#dbAreaGold)" stroke="none" />
            <path d={linePath} fill="none" className="db-chart-line" />
          </>
        )}

        <line
          x1={active.x}
          x2={active.x}
          y1={padding.top}
          y2={height - padding.bottom}
          className="db-chart-guide"
        />

        {points.map((point, i) => (
          <g key={`${point.label}-${i}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={i === safeActiveIndex ? 6 : 3.5}
              className={
                i === safeActiveIndex
                  ? "db-chart-dot db-chart-dot-active"
                  : "db-chart-dot"
              }
              onMouseEnter={() => setActiveIndex(i)}
            />
            <text
              x={point.x}
              y={height - 8}
              textAnchor="middle"
              className="db-chart-axis-label"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>

      <div
        className={`db-chart-tooltip ${
          tooltipFlip ? "db-chart-tooltip-flip" : ""
        }`}
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
