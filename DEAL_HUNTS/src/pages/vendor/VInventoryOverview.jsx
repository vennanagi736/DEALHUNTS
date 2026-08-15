import React from "react";
import { inventoryOverview } from "../../data/vendorDashboardMockData";

function VendorInventoryOverview() {
  const { totalProducts, lowStock, availableStock,outOfStock } = inventoryOverview;

  return (
    <section className="vd-card">
      <div className="vd-section-title" style={{ fontSize: 15.5 }}>
        Inventory Overview
      </div>

      <div className="vd-inv-grid">
        <div className="vd-inv-card">
          <div>
            <div className="vd-inv-label">Total Products</div>
            <div className="vd-inv-sub">Products listed</div>
          </div>
          <div className="vd-inv-value">{totalProducts}</div>
        </div>

        <div className="vd-inv-card warning">
          <div>
            <div className="vd-inv-label">Low Stock</div>
            <div className="vd-inv-sub warn">Needs attention ⚠</div>
          </div>
          <div className="vd-inv-value">{lowStock}</div>
        </div>

        <div className="vd-inv-card">
          <div>
            <div className="vd-inv-label">Available Stock</div>
            <div className="vd-inv-sub">Units available</div>
          </div>
          <div className="vd-inv-value">{availableStock}</div>
        </div>
      <div className="vd-inv-card">
  <div>
    <div className="vd-inv-label">Out of Stock</div>
    <div className="vd-inv-sub">Products unavailable</div>
  </div>

  <div className="vd-inv-value">{outOfStock}</div>
</div>
        </div>
    </section>
  );
}

export default VendorInventoryOverview;
