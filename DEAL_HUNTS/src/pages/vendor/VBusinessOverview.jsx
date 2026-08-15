import React from "react";
import { businessOverview } from "../../data/vendorDashboardMockData";

function formatINR(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function formatCompact(value) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return formatINR(value);
}

function VendorBusinessOverview() {
  const {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalSales,
    todaysSales,
    totalCustomers,
  } = businessOverview;

  return (
    <section className="vd-card">
      <div className="vd-section-title" style={{ fontSize: 15.5 }}>
        Business Overview
      </div>

      <div className="vd-biz-group">
        <div className="vd-biz-group-title">Orders</div>
        <div className="vd-biz-row">
          <span className="vd-biz-row-label">📦 Total Orders</span>
          <span className="vd-biz-row-value">{totalOrders}</span>
        </div>
        <div className="vd-biz-row">
          <span className="vd-biz-row-label">⏳ Pending Orders</span>
          <span className="vd-biz-row-value">{pendingOrders}</span>
        </div>
        <div className="vd-biz-row">
          <span className="vd-biz-row-label">✅ Completed Orders</span>
          <span className="vd-biz-row-value">{completedOrders}</span>
        </div>
      </div>

      <div className="vd-biz-group">
        <div className="vd-biz-group-title">Sales</div>
        <div className="vd-biz-row">
          <span className="vd-biz-row-label">💰 Total Sales</span>
          <span className="vd-biz-row-value">{formatCompact(totalSales)}</span>
        </div>
        <div className="vd-biz-row">
          <span className="vd-biz-row-label">📈 Today's Sales</span>
          <span className="vd-biz-row-value">{formatCompact(todaysSales)}</span>
        </div>
      </div>

      <div className="vd-biz-group">
        <div className="vd-biz-group-title">Customers</div>
        <div className="vd-biz-row">
          <span className="vd-biz-row-label">👥 Total Customers</span>
          <span className="vd-biz-row-value">{totalCustomers}</span>
        </div>
      </div>
    </section>
  );
}

export default VendorBusinessOverview;
