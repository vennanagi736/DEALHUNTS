import React, { useState } from "react";
import AnalyticsChart from "../../components/admin/AAnalyticsChart";

const METRICS = ["Sales", "Revenue", "Orders", "Products"];
const PERIODS = ["Monthly", "Weekly", "Daily"];

/* Formats a raw data value into a display string for the active metric. */
const UNIT_FORMATTERS = {
  Sales: (v) => `${v} units`,
  Revenue: (v) => `₹${v.toFixed(1)}Cr`,
  Orders: (v) => `${v} orders`,
  Products: (v) => `${v} products`,
};

export default function BusinessAnalytics({ data }) {
  const [metric, setMetric] = useState("Sales");
  const [period, setPeriod] = useState("Monthly");

  return (
    <div className="db-card db-analytics-card">
      <div className="db-analytics-header">
        <div>
          <h2 className="db-card-title">Business Analytics</h2>
          <p className="db-card-subtitle">{metric} Overview</p>
        </div>

        <div className="db-period-control">
          {PERIODS.map((p) => (
            <button
              key={p}
              className={`db-period-btn ${period === p ? "db-period-btn-active" : ""}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="db-metric-switcher">
        {METRICS.map((m) => (
          <button
            key={m}
            className={`db-metric-btn ${metric === m ? "db-metric-btn-active" : ""}`}
            onClick={() => setMetric(m)}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="db-chart-area">
        <AnalyticsChart data={data[metric]} metric={metric} unit={UNIT_FORMATTERS[metric]} />
      </div>
    </div>
  );
}