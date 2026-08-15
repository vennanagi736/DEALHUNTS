import React from "react";
import { salesSummary } from "../../data/vendorDashboardMockData";

function formatINR(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function VendorSalesSummary() {
  const { totalSales, avgMonthlySales, growthPercent } = salesSummary;
  const isUp = growthPercent >= 0;

  return (
    <section className="vd-summary-row">
      <div className="vd-summary-card">
        <div className="vd-summary-label">Total Sales</div>
        <div className="vd-summary-value">{formatINR(totalSales)}</div>
      </div>
      <div className="vd-summary-card">
        <div className="vd-summary-label">Avg. Monthly Sales</div>
        <div className="vd-summary-value">{formatINR(avgMonthlySales)}</div>
      </div>
      <div className="vd-summary-card">
        <div className="vd-summary-label">Growth</div>
        <div className={`vd-summary-delta ${isUp ? "up" : "down"}`}>
          {isUp ? "↑" : "↓"} {Math.abs(growthPercent)}%
        </div>
      </div>
    </section>
  );
}

export default VendorSalesSummary;
