import React from "react";
import { useNavigate } from "react-router-dom";

const ACTIONS = [
  { icon: "📦", label: "Manage Products", to: "/vendor/products" },
  { icon: "📊", label: "Manage Inventory", to: "/vendor/inventory" },
  { icon: "🛒", label: "View Orders", to: "/vendor/orders" },
  { icon: "🎁", label: "Manage Promotions", to: "/vendor/promotions" },
];

function VendorQuickActions() {
  const navigate = useNavigate();

  return (
    <section className="vd-card">
      <div className="vd-section-title" style={{ fontSize: 15.5 }}>
        Quick Actions
      </div>

      <div className="vd-quick-actions">
        {ACTIONS.map((a) => (
          <button
            key={a.to}
            className="vd-quick-btn"
            onClick={() => navigate(a.to)}
          >
            <span className="vd-quick-btn-label">
              <span>{a.icon}</span>
              <span>{a.label}</span>
            </span>
            <span className="vd-quick-btn-arrow">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default VendorQuickActions;
