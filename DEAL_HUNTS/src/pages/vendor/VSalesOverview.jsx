import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { monthlySales, dailySales } from "../../data/vendorDashboardMockData";

const FILTERS = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "3m", label: "3 Months" },
  { key: "6m", label: "6 Months" },
  { key: "1y", label: "1 Year" },
];

function formatINR(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

// Builds the series for each filter from the two mock sources.
// Swap this for a real endpoint call keyed by `filter` later.
function getSeries(filter) {
  switch (filter) {
    case "7d":
      return dailySales.slice(-7).map((d) => ({ label: d.label, ...d }));
    case "30d":
      return dailySales.slice(-30).map((d) => ({ label: d.label, ...d }));
    case "3m":
      return monthlySales.slice(-3).map((d) => ({ label: d.month, ...d }));
    case "6m":
      return monthlySales.slice(-6).map((d) => ({ label: d.month, ...d }));
    case "1y":
    default:
      return monthlySales.map((d) => ({ label: d.month, ...d }));
  }
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="vd-tooltip">
      <div className="vd-tooltip-title">{label}</div>
      <div className="vd-tooltip-row">
        <span>Sales</span>
        <b>{formatINR(d.sales)}</b>
      </div>
      <div className="vd-tooltip-row">
        <span>Orders</span>
        <b>{d.orders}</b>
      </div>
      <div className="vd-tooltip-row">
        <span>Revenue</span>
        <b>{formatINR(d.revenue)}</b>
      </div>
    </div>
  );
}

function VendorSalesOverview() {
  const [filter, setFilter] = useState("1y");
  const data = useMemo(() => getSeries(filter), [filter]);

  return (
    <section className="vd-card">
      <div className="vd-section-head">
        <div>
          <div className="vd-section-title">Sales Overview</div>
          <div className="vd-section-sub">
            Track your sales performance over time
          </div>
        </div>
      </div>

      <div className="vd-filters" style={{ marginTop: 14 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`vd-filter-btn${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="vd-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="vdGoldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9a227" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#c9a227" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#efece5" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#8a8578" }}
              interval={data.length > 12 ? Math.ceil(data.length / 10) : 0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={54}
              tick={{ fontSize: 11, fill: "#8a8578" }}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#c9a227"
              strokeWidth={2.5}
              fill="url(#vdGoldFill)"
              activeDot={{ r: 5, fill: "#12100c", stroke: "#c9a227", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default VendorSalesOverview;
