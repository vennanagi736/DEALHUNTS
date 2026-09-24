import React from "react";
import { Link } from "react-router-dom";


/* ============================================================
   FORMAT INR
============================================================ */

function formatINR(value) {

  const amount = Number(value) || 0;

  return `₹${amount.toLocaleString("en-IN")}`;

}


/* ============================================================
   FORMAT COMPACT REVENUE
============================================================ */

function formatCompactRevenue(value) {

  const amount = Number(value) || 0;


  if (amount >= 10000000) {

    return `₹${(
      amount / 10000000
    ).toFixed(2)}Cr`;

  }


  if (amount >= 100000) {

    return `₹${(
      amount / 100000
    ).toFixed(2)}L`;

  }


  if (amount >= 1000) {

    return `₹${(
      amount / 1000
    ).toFixed(1)}K`;

  }


  return formatINR(amount);

}


/* ============================================================
   PERFORMANCE BADGE
============================================================ */

function badgeClass(label) {

  const value =
    String(label || "").toLowerCase();


  if (value === "excellent") {
    return "excellent";
  }


  if (
    value === "low stock" ||
    value === "low_stock"
  ) {
    return "low-stock";
  }


  return "good";

}


/* ============================================================
   VENDOR PRODUCT PERFORMANCE
============================================================ */

function VendorProductPerformance({

  productPerformance = [],

  topSellingProducts = [],

}) {


  /* ==========================================================
     NORMALIZE ARRAYS
  ========================================================== */

  const performanceData =
    Array.isArray(productPerformance)
      ? productPerformance
      : [];


  const topProducts =
    Array.isArray(topSellingProducts)
      ? topSellingProducts
      : [];


  return (

    <section className="vd-card">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="vd-section-head">

        <div>

          <div className="vd-section-title">
            Product Performance
          </div>

          <div className="vd-section-sub">
            How your catalog is performing this period
          </div>

        </div>


        <Link
          to="/vendorProductPage"
          className="vd-link-btn"
        >
          View All Products →
        </Link>

      </div>


      {/* ======================================================
          PRODUCT PERFORMANCE TABLE
      ====================================================== */}

      <div className="vd-table-scroll">

        <table className="vd-table">

          <thead>

            <tr>

              <th>
                Product
              </th>

              <th>
                Sales
              </th>

              <th>
                Orders
              </th>

              <th>
                Revenue
              </th>

              <th>
                Stock
              </th>

              <th>
                Performance
              </th>

            </tr>

          </thead>


          <tbody>

            {performanceData.length > 0 ? (

              performanceData.map(
                (product, index) => {

                  const productId =
                    product.id ??
                    product.productId ??
                    index;


                  const productName =
                    product.name ??
                    product.productName ??
                    "Product";


                  const sales =
                    Number(
                      product.sales ??
                      product.unitsSold ??
                      product.quantitySold ??
                      0
                    );


                  const orders =
                    Number(
                      product.orders ??
                      product.orderCount ??
                      0
                    );


                  const revenue =
                    Number(
                      product.revenue ??
                      product.totalRevenue ??
                      0
                    );


                  const stock =
                    Number(
                      product.stock ??
                      product.availableStock ??
                      product.stockQuantity ??
                      0
                    );


                  const performance =
                    product.performance ??
                    product.performanceStatus ??
                    "Good";


                  return (

                    <tr
                      key={productId}
                    >

                      <td className="vd-product-name">

                        {productName}

                      </td>


                      <td>

                        {sales.toLocaleString(
                          "en-IN"
                        )}

                      </td>


                      <td>

                        {orders.toLocaleString(
                          "en-IN"
                        )}

                      </td>


                      <td>

                        {formatINR(
                          revenue
                        )}

                      </td>


                      <td>

                        {stock.toLocaleString(
                          "en-IN"
                        )}

                      </td>


                      <td>

                        <span
                          className={`vd-badge ${badgeClass(
                            performance
                          )}`}
                        >

                          {performance}

                        </span>

                      </td>

                    </tr>

                  );

                }
              )

            ) : (

              <tr>

                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "24px",
                  }}
                >
                  No product performance data available.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* ======================================================
          TOP SELLING PRODUCTS
      ====================================================== */}

      <div
        style={{
          marginTop: 22,
          borderTop: "1px solid #efece5",
          paddingTop: 16,
        }}
      >

        <div
          className="vd-section-title"
          style={{
            fontSize: 15.5,
          }}
        >
          Top Selling Products
        </div>


        <div className="vd-top-list">

          {topProducts.length > 0 ? (

            topProducts.map(
              (product, index) => {

                const productId =
                  product.id ??
                  product.productId ??
                  index;


                const productName =
                  product.name ??
                  product.productName ??
                  "Product";


                const orders =
                  Number(
                    product.orders ??
                    product.orderCount ??
                    0
                  );


                const revenue =
                  Number(
                    product.revenue ??
                    product.totalRevenue ??
                    0
                  );


                return (

                  <div
                    className="vd-top-item"
                    key={productId}
                  >

                    <div className="vd-top-rank">

                      {String(
                        index + 1
                      ).padStart(2, "0")}

                    </div>


                    <div className="vd-top-info">

                      <div className="vd-top-name">

                        {productName}

                      </div>


                      <div className="vd-top-orders">

                        {orders.toLocaleString(
                          "en-IN"
                        )}{" "}

                        {orders === 1
                          ? "order"
                          : "orders"}

                      </div>

                    </div>


                    <div className="vd-top-revenue">

                      {formatCompactRevenue(
                        revenue
                      )}

                    </div>

                  </div>

                );

              }

            )

          ) : (

            <div className="vd-top-item">

              <div className="vd-top-info">

                <div className="vd-top-name">

                  No sales data available

                </div>

                <div className="vd-top-orders">

                  No completed orders yet

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </section>

  );

}


export default VendorProductPerformance;