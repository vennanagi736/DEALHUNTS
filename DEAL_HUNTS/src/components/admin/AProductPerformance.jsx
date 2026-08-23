import React from "react";
import { RankBadge } from "../../components/admin/AIcons";

export default function ProductPerformance({ products, onShowAll }) {
  return (
    <div className="db-card db-performance-card">
      <div className="db-analytics-header">
        <div>
          <h2 className="db-card-title">Product Performance</h2>
          <p className="db-card-subtitle">Top Performing Products</p>
        </div>
        <button className="db-show-all-btn" onClick={onShowAll} type="button">
          Show All Products <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="db-table-wrap">
        <table className="db-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th>Category</th>
              <th>Sales</th>
              <th>Revenue</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.rank} className={p.rank <= 3 ? "db-row-top" : ""}>
                <td>
                  <RankBadge rank={p.rank} />
                </td>
                <td className="db-table-product">{p.name}</td>
                <td className="db-table-secondary">{p.category}</td>
                <td>{p.sales}</td>
                <td className="db-table-gold">{p.revenue}</td>
                <td>
                  <span
                    className={`db-stock-pill ${
                      p.stock === "Low Stock" ? "db-stock-low" : "db-stock-ok"
                    }`}
                  >
                    {p.stock}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}