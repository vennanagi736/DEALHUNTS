import React from "react";
import { topSellingProducts } from "../../data/vendorDashboardMockData";

function formatLakh(value) {
  return `₹${(value / 100000).toFixed(2)}L`;
}

function VendorBestSeller() {
  const product = topSellingProducts[0];

  if (!product) return null;

  return (
    <section className="vd-mini-card">
      <div className="vd-mini-title">⭐ Best Seller</div>

      <div className="vd-mini-product">
        <div className="vd-mini-product-name">
          {product.name}
        </div>

        <div className="vd-mini-product-orders">
          {product.orders} orders
        </div>
      </div>

      <div className="vd-mini-value">
        {formatLakh(product.revenue)}
      </div>

      <div className="vd-mini-sub">
        Revenue
      </div>
    </section>
  );
}

export default VendorBestSeller;