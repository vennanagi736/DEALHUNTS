import React from "react";

export default function LowStockAlerts({ items }) {
  return (
    <div>
      <h3 className="db-mini-title">Low Stock Alerts</h3>
      <ul className="db-mini-list">
        {items.map((item) => (
          <li key={item.name} className="db-mini-row">
            <span>{item.name}</span>
            <span className="db-lowstock-badge">{item.left} left</span>
          </li>
        ))}
      </ul>
    </div>
  );
}