import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Smartphone,
  CreditCard,
  Landmark,
  ShieldCheck,
} from "lucide-react";

import PageShell from "../../components/user/PageShell";

import {
  initialCartItems,
  savedAddresses,
  paymentMethods,
  buildOrderSummary,
} from "../../data/mockData";

import "../../styles/PlaceOrder.css";


/* ============================================================
   PAYMENT ICONS
============================================================ */

const PAYMENT_ICONS = {
  cod: Wallet,
  upi: Smartphone,
  card: CreditCard,
  netbanking: Landmark,
};


/* ============================================================
   PLACE ORDER
============================================================ */

export default function PlaceOrder() {

  const navigate = useNavigate();


  /* ==========================================================
     CART DATA
  ========================================================== */

  const items = Array.isArray(initialCartItems)
    ? initialCartItems
    : [];


  /* ==========================================================
     ADDRESS
  ========================================================== */

  const [address] = useState(
    savedAddresses?.[0] || {
      name: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    }
  );


  /* ==========================================================
     PAYMENT
  ========================================================== */

  const [selectedPayment, setSelectedPayment] =
    useState("upi");


  /* ==========================================================
     ORDER STATE
  ========================================================== */

  const [placing, setPlacing] =
    useState(false);


  /* ==========================================================
     ORDER SUMMARY
  ========================================================== */

  const {
    subtotal = 0,
    discount = 0,
    delivery = 0,
    total = 0,
  } = buildOrderSummary(items);


  /* ==========================================================
     CART COUNT
  ========================================================== */

  const cartCount = items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0),
    0
  );


  /* ==========================================================
     FORMAT PRICE
  ========================================================== */

  const formatPrice = (amount) => {

    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  };


  /* ==========================================================
     PLACE ORDER
  ========================================================== */

  const handlePlaceOrder = () => {

    if (placing) {
      return;
    }


    setPlacing(true);


    /*
     * Currently this is only simulating
     * order confirmation.
     *
     * Later you can replace this with:
     *
     * axios.post("/orders/create", ...)
     */

    setTimeout(() => {

      navigate("/order-success");

    }, 500);

  };


  /* ==========================================================
     UI
  ========================================================== */

  return (

    <PageShell
      active="Cart"
      cartCount={cartCount}
    >

      <div className="place-order-page">


        {/* ==================================================
            PAGE HEADING
        ================================================== */}

        <div className="place-order-page__heading">

          <h1>
            Place Your Order
          </h1>

          <p>
            Review your order and confirm your
            delivery details.
          </p>

        </div>


        {/* ==================================================
            MAIN LAYOUT
        ================================================== */}

        <div className="place-order-layout">


          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="place-order-left">


            {/* ==================================================
                DELIVERY ADDRESS
            ================================================== */}

            <section className="po-card">


              <div className="po-card__header">

                <h2>
                  Delivery Address
                </h2>


                <div className="po-card__header-actions">

                  <button
                    type="button"
                    className="btn-ghost"
                  >
                    Add New Address
                  </button>


                  <button
                    type="button"
                    className="btn-ghost"
                  >
                    Edit Address
                  </button>

                </div>

              </div>


              {/* ADDRESS FORM */}

              <form
                className="po-address-form"
                onSubmit={(event) =>
                  event.preventDefault()
                }
              >


                {/* FULL NAME */}

                <label>

                  Full Name

                  <input
                    type="text"
                    defaultValue={
                      address.name || ""
                    }
                  />

                </label>


                {/* PHONE */}

                <label>

                  Phone Number

                  <input
                    type="tel"
                    defaultValue={
                      address.phone || ""
                    }
                  />

                </label>


                {/* HOUSE */}

                <label className="po-address-form__full">

                  House / Flat / Building

                  <input
                    type="text"
                    defaultValue={
                      address.line1 || ""
                    }
                  />

                </label>


                {/* STREET */}

                <label className="po-address-form__full">

                  Street / Area

                  <input
                    type="text"
                    defaultValue={
                      address.line2 || ""
                    }
                  />

                </label>


                {/* CITY */}

                <label>

                  City

                  <input
                    type="text"
                    defaultValue={
                      address.city || ""
                    }
                  />

                </label>


                {/* STATE */}

                <label>

                  State

                  <input
                    type="text"
                    defaultValue={
                      address.state || ""
                    }
                  />

                </label>


                {/* PIN */}

                <label>

                  PIN Code

                  <input
                    type="text"
                    defaultValue={
                      address.pincode || ""
                    }
                  />

                </label>

              </form>

            </section>


            {/* ==================================================
                PAYMENT METHOD
            ================================================== */}

            <section className="po-card">


              <div className="po-card__header">

                <h2>
                  Payment Method
                </h2>

              </div>


              <div className="po-payment-grid">

                {paymentMethods.map(
                  (method) => {

                    const Icon =
                      PAYMENT_ICONS[
                        method.id
                      ] || Wallet;


                    const isSelected =
                      selectedPayment ===
                      method.id;


                    return (

                      <button
                        type="button"
                        key={method.id}
                        className={`po-payment-option ${
                          isSelected
                            ? "po-payment-option--selected"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedPayment(
                            method.id
                          )
                        }
                      >


                        {/* ICON */}

                        <span className="po-payment-option__icon">

                          <Icon
                            size={18}
                            strokeWidth={1.8}
                          />

                        </span>


                        {/* TEXT */}

                        <span className="po-payment-option__text">

                          <strong>
                            {method.label}
                          </strong>

                          <span>
                            {method.helper}
                          </span>

                        </span>

                      </button>

                    );

                  }
                )}

              </div>

            </section>

          </div>


          {/* ==================================================
              ORDER SUMMARY
          ================================================== */}

          <aside className="po-summary">


            <h2>
              Order Summary
            </h2>


            {/* ==================================================
                ITEMS
            ================================================== */}

            <div className="po-summary__items">

              {items.length > 0 ? (

                items.map(
                  (item) => (

                    <div
                      className="po-summary__item"
                      key={item.id}
                    >


                      {/* IMAGE */}

                      <img
                        src={item.image}
                        alt={
                          item.name ||
                          "Product"
                        }
                      />


                      {/* INFO */}

                      <div className="po-summary__item-info">

                        <span className="po-summary__item-name">

                          {item.name ||
                            "Product"}

                        </span>


                        <span className="po-summary__item-meta">

                          {item.vendor ||
                            "Vendor"}

                          {" · "}

                          Qty{" "}

                          {Number(
                            item.quantity
                          ) || 0}

                        </span>

                      </div>


                      {/* PRICE */}

                      <span className="po-summary__item-price">

                        {formatPrice(
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
                        )}

                      </span>

                    </div>

                  )
                )

              ) : (

                <div className="po-summary__empty">

                  Your cart is empty.

                </div>

              )}

            </div>


            {/* ==================================================
                DIVIDER
            ================================================== */}

            <div className="po-summary__divider" />


            {/* ==================================================
                SUBTOTAL
            ================================================== */}

            <div className="po-summary__row">

              <span>
                Subtotal
              </span>

              <span>
                {formatPrice(subtotal)}
              </span>

            </div>


            {/* ==================================================
                DISCOUNT
            ================================================== */}

            <div className="po-summary__row po-summary__row--discount">

              <span>
                Discount
              </span>

              <span>
                −{formatPrice(discount)}
              </span>

            </div>


            {/* ==================================================
                DELIVERY
            ================================================== */}

            <div className="po-summary__row">

              <span>
                Delivery
              </span>

              <span>

                {delivery === 0
                  ? "Free"
                  : formatPrice(delivery)}

              </span>

            </div>


            {/* ==================================================
                DIVIDER
            ================================================== */}

            <div className="po-summary__divider" />


            {/* ==================================================
                TOTAL
            ================================================== */}

            <div className="po-summary__row po-summary__row--total">

              <span>
                Total
              </span>

              <span>
                {formatPrice(total)}
              </span>

            </div>


            {/* ==================================================
                PLACE ORDER
            ================================================== */}

            <button
              type="button"
              className="btn-primary po-summary__cta"
              onClick={handlePlaceOrder}
              disabled={
                placing ||
                items.length === 0
              }
            >

              {placing
                ? "Placing Order..."
                : "Place Order"}

            </button>


            {/* ==================================================
                SECURITY MESSAGE
            ================================================== */}

            <div className="po-summary__secure">

              <ShieldCheck
                size={14}
                strokeWidth={1.8}
              />

              <span>
                Your payment information is
                securely processed.
              </span>

            </div>

          </aside>

        </div>

      </div>

    </PageShell>

  );

}