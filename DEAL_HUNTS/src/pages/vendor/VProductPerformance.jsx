import React from "react";
import { Link } from "react-router-dom";
import {
  productPerformance,
  topSellingProducts,
} from "../../data/vendorDashboardMockData";

function formatINR(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function formatLakh(value) {
  return `₹${(value / 100000).toFixed(2)}L`;
}

function badgeClass(label) {
  if (label === "Excellent") return "excellent";
  if (label === "Low Stock") return "low-stock";
  return "good";
}

function VendorProductPerformance() {
  return (
    <section className="vd-card">
      <div className="vd-section-head">
        <div>
          <div className="vd-section-title">Product Performance</div>
          <div className="vd-section-sub">
            How your catalog is performing this period
          </div>
        </div>
        <Link to="/vendorProductPage" className="vd-link-btn">
          View All Products →
        </Link>
      </div>

      <div className="vd-table-scroll">
        <table className="vd-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Sales</th>
              <th>Orders</th>
              <th>Revenue</th>
              <th>Stock</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {productPerformance.map((p) => (
              <tr key={p.id}>
                <td className="vd-product-name">{p.name}</td>
                <td>{p.sales}</td>
                <td>{p.orders}</td>
                <td>{formatINR(p.revenue)}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={`vd-badge ${badgeClass(p.performance)}`}>
                    {p.performance}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 22, borderTop: "1px solid #efece5", paddingTop: 16 }}>
        <div className="vd-section-title" style={{ fontSize: 15.5 }}>
          Top Selling Products
        </div>
        <div className="vd-top-list">
          {topSellingProducts.map((p, i) => (
            <div className="vd-top-item" key={p.id}>
              <div className="vd-top-rank">{String(i + 1).padStart(2, "0")}</div>
              <div className="vd-top-info">
                <div className="vd-top-name">{p.name}</div>
                <div className="vd-top-orders">{p.orders} orders</div>
              </div>
              <div className="vd-top-revenue">{formatLakh(p.revenue)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VendorProductPerformance;
