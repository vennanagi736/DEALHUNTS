import React from "react";

/* =========================================================================
   ATopProductsChart.jsx
   "Top Products by Sales" — horizontal bar chart, gold fill.
   Placeholder data lives in AdminDashboard.jsx and is structured as
   [{ name, value }] so it can be swapped for a real API response later.
   ========================================================================= */

function TopProductsChart({ data = [] }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <section className="db-card">
      <h2 className="db-card-title">Top Products by Sales</h2>
      <p className="db-card-subtitle">Best-performing products this period</p>

      <div className="db-hbar-list">
        {data.map((item) => {
          const pct = Math.round((item.value / maxVal) * 100);
          return (
            <div className="db-hbar-row" key={item.name}>
              <span className="db-hbar-label">{item.name}</span>
              <div className="db-hbar-track">
                <div className="db-hbar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="db-hbar-value">{item.value.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TopProductsChart;
