import React from "react";
import { salesSummary } from "../../data/vendorDashboardMockData";

function VendorSalesGrowth() {
  const { growthPercent } = salesSummary;

  const isPositive = growthPercent >= 0;

  return (
    <section className="vd-mini-card">
      <div className="vd-mini-title">📈 Sales Growth</div>

      <div className={`vd-growth-value ${isPositive ? "positive" : "negative"}`}>
        {isPositive ? "↑" : "↓"} {Math.abs(growthPercent)}%
      </div>

      <div className="vd-mini-sub">
        vs previous period
      </div>
    </section>
  );
}

export default VendorSalesGrowth;