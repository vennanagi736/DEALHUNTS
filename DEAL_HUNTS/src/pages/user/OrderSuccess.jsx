import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Package,
  CalendarClock,
  Store,
  Wallet,
  IndianRupee,
} from "lucide-react";

import PageShell from "../../components/user/PageShell";
import {
  initialCartItems,
  buildOrderSummary,
} from "../../data/mockData";

import "../../styles/OrderSuccess.css";

export default function OrderSuccess() {
  const navigate = useNavigate();

  /* ============================================================
     CART ITEMS
  ============================================================ */

  const items = Array.isArray(initialCartItems)
    ? initialCartItems
    : [];

  /* ============================================================
     ORDER SUMMARY
  ============================================================ */

  const { total = 0 } = buildOrderSummary(items);

  /* ============================================================
     ORDER DETAILS
  ============================================================ */

  const order = useMemo(() => {
    const today = new Date();

    const delivery = new Date(today);
    delivery.setDate(delivery.getDate() + 4);

    const formatDate = (date) => {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    return {
      id: `DH${Math.floor(100000 + Math.random() * 900000)}`,

      date: formatDate(today),

      vendor:
        items.length > 0 && items[0]?.vendor
          ? items[0].vendor
          : "Multiple Vendors",

      payment: "UPI",

      total: Number(total) || 0,

      eta: formatDate(delivery),
    };
  }, [items, total]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <PageShell active="Cart">

      <div className="order-success">

        {/* ======================================================
            SUCCESS ANIMATION
        ====================================================== */}

        <div
          className="order-success__animation"
          aria-hidden="true"
        >

          <span
            className="
              order-success__ring
              order-success__ring--outer
            "
          />

          <span
            className="
              order-success__ring
              order-success__ring--mid
            "
          />

          <span className="order-success__circle">

            <Check
              size={34}
              strokeWidth={3}
              className="order-success__check"
            />

          </span>

          <span className="order-success__particle p1" />
          <span className="order-success__particle p2" />
          <span className="order-success__particle p3" />
          <span className="order-success__particle p4" />
          <span className="order-success__particle p5" />
          <span className="order-success__particle p6" />

        </div>


        {/* ======================================================
            SUCCESS MESSAGE
        ====================================================== */}

        <h1>
          Order Placed Successfully!
        </h1>

        <p className="order-success__subtitle">
          Your order has been confirmed and is being prepared by
          the seller.
        </p>


        {/* ======================================================
            ORDER DETAILS
        ====================================================== */}

        <div className="order-success__details">

          <h2>
            Order Details
          </h2>


          <div className="order-success__grid">

            {/* ORDER ID */}

            <div className="order-success__detail">

              <span className="order-success__detail-icon">
                <Package
                  size={16}
                  strokeWidth={1.8}
                />
              </span>

              <div>

                <span className="label">
                  Order ID
                </span>

                <span className="value">
                  {order.id}
                </span>

              </div>

            </div>


            {/* ORDER DATE */}

            <div className="order-success__detail">

              <span className="order-success__detail-icon">
                <CalendarClock
                  size={16}
                  strokeWidth={1.8}
                />
              </span>

              <div>

                <span className="label">
                  Order Date
                </span>

                <span className="value">
                  {order.date}
                </span>

              </div>

            </div>


            {/* VENDOR */}

            <div className="order-success__detail">

              <span className="order-success__detail-icon">
                <Store
                  size={16}
                  strokeWidth={1.8}
                />
              </span>

              <div>

                <span className="label">
                  Vendor
                </span>

                <span className="value">
                  {order.vendor}
                </span>

              </div>

            </div>


            {/* PAYMENT */}

            <div className="order-success__detail">

              <span className="order-success__detail-icon">
                <Wallet
                  size={16}
                  strokeWidth={1.8}
                />
              </span>

              <div>

                <span className="label">
                  Payment Method
                </span>

                <span className="value">
                  {order.payment}
                </span>

              </div>

            </div>


            {/* TOTAL */}

            <div className="order-success__detail">

              <span className="order-success__detail-icon">
                <IndianRupee
                  size={16}
                  strokeWidth={1.8}
                />
              </span>

              <div>

                <span className="label">
                  Total Amount
                </span>

                <span className="value">
                  ₹{order.total.toLocaleString("en-IN")}
                </span>

              </div>

            </div>


            {/* DELIVERY */}

            <div className="order-success__detail">

              <span className="order-success__detail-icon">
                <CalendarClock
                  size={16}
                  strokeWidth={1.8}
                />
              </span>

              <div>

                <span className="label">
                  Estimated Delivery
                </span>

                <span className="value">
                  {order.eta}
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* ======================================================
            ACTION BUTTONS
        ====================================================== */}

        <div className="order-success__actions">

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/orders")}
          >
            View Order
          </button>


          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>

        </div>

      </div>

    </PageShell>
  );
}