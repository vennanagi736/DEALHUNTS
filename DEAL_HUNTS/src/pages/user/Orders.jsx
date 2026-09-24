import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  Package,
  CalendarClock,
  Store,
  Wallet,
  MapPin,
  CreditCard,
  CircleCheck,
  Truck,
  Receipt,
  IndianRupee,
} from "lucide-react";

import "../../styles/Orders.css";


/* ============================================================
   API
============================================================ */

const API_BASE = "http://localhost:8080";


/* ============================================================
   HELPERS
============================================================ */

const formatPrice = (amount) => {

  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "0";
  }

  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};


const formatDate = (dateValue) => {

  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};


const formatDateTime = (dateValue) => {

  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};


/* ============================================================
   GET IMAGE
============================================================ */

const getItemImage = (item) => {

  return (
    item?.image ||
    item?.productImage ||
    item?.imageUrl ||
    item?.product?.image ||
    item?.product?.imageUrl ||
    item?.product?.images?.[0] ||
    item?.images?.[0] ||
    ""
  );
};


/* ============================================================
   GET PRODUCT NAME
============================================================ */

const getItemName = (item) => {

  return (
    item?.productName ||
    item?.name ||
    item?.product?.name ||
    "Product"
  );
};


/* ============================================================
   GET BRAND
============================================================ */

const getItemBrand = (item) => {

  return (
    item?.brand ||
    item?.brandName ||
    item?.product?.brand ||
    item?.product?.brandName ||
    ""
  );
};


/* ============================================================
   GET VENDOR
============================================================ */

const getItemVendor = (item) => {

  return (
    item?.vendorName ||
    item?.shopName ||
    item?.vendor?.shopName ||
    item?.vendor?.name ||
    item?.vendor?.vendorName ||
    "Vendor"
  );
};


/* ============================================================
   GET QUANTITY
============================================================ */

const getItemQuantity = (item) => {

  const quantity = Number(
    item?.quantity
  );

  return Number.isFinite(quantity) && quantity > 0
    ? quantity
    : 1;
};


/* ============================================================
   GET ITEM PRICE
============================================================ */

const getItemPrice = (item) => {

  const price = Number(
    item?.price ??
    item?.unitPrice ??
    item?.sellingPrice ??
    item?.productPrice ??
    item?.colorPrice ??
    0
  );

  return Number.isFinite(price)
    ? price
    : 0;
};


/* ============================================================
   GET ITEM TOTAL
============================================================ */

const getItemTotal = (item) => {

  const directTotal = Number(
    item?.total ??
    item?.itemTotal ??
    item?.totalAmount
  );

  if (
    Number.isFinite(directTotal) &&
    directTotal >= 0
  ) {
    return directTotal;
  }

  return (
    getItemPrice(item) *
    getItemQuantity(item)
  );
};


/* ============================================================
   NORMALIZE ORDER
============================================================ */

const normalizeOrder = (rawOrder) => {

  if (!rawOrder) {
    return null;
  }

  return {
    ...rawOrder,

    items:
      Array.isArray(rawOrder.items)
        ? rawOrder.items
        : [],

    subtotal:
      Number(rawOrder.subtotal || 0),

    discount:
      Number(rawOrder.discount || 0),

    deliveryCharge:
      Number(rawOrder.deliveryCharge || 0),

    total:
      Number(
        rawOrder.total ??
        rawOrder.totalAmount ??
        rawOrder.total_amount ??
        0
      ),
  };
};


/* ============================================================
   STATUS CLASS
============================================================ */

const getStatusClass = (status) => {

  const value =
    String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

  if (
    value === "delivered" ||
    value === "confirmed" ||
    value === "placed"
  ) {
    return "orders-status orders-status--success";
  }

  if (
    value === "cancelled" ||
    value === "failed"
  ) {
    return "orders-status orders-status--danger";
  }

  return "orders-status orders-status--pending";
};


/* ============================================================
   ORDERS
============================================================ */

export default function Orders() {

  const navigate = useNavigate();


  /* ==========================================================
     STATE
  ========================================================== */

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");


  /* ==========================================================
     LOAD ORDER
  ========================================================== */

  useEffect(() => {

    const loadOrder = async () => {

      try {

        setLoading(true);
        setErrorMessage("");


        /* ------------------------------------------------------
           AUTH
        ------------------------------------------------------ */

        const token =
          localStorage.getItem(
            "userJwtToken"
          );


        if (!token) {

          throw new Error(
            "Your login session has expired. Please login again."
          );
        }


        /* ------------------------------------------------------
           FIRST: LAST ORDER FROM LOCAL STORAGE
        ------------------------------------------------------ */

        const savedOrder =
          localStorage.getItem(
            "dealhuntsLastOrder"
          );


        if (savedOrder) {

          try {

            const parsedOrder =
              JSON.parse(savedOrder);


            if (
              parsedOrder &&
              parsedOrder.orderId
            ) {

              setOrder(
                normalizeOrder(
                  parsedOrder
                )
              );

              setLoading(false);

              /*
               * We already have the real backend
               * response saved after successful order.
               */
              return;
            }

          } catch (storageError) {

            console.error(
              "Invalid saved order:",
              storageError
            );

          }
        }


        /* ------------------------------------------------------
           FALLBACK: GET USER ORDERS
        ------------------------------------------------------ */

        const response =
          await axios.get(
            `${API_BASE}/order/my`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        let ordersData =
          response?.data;


        /*
         * Support both:
         *
         * [
         *   {...}
         * ]
         *
         * and:
         *
         * {
         *   orders: [...]
         * }
         */

        if (
          !Array.isArray(
            ordersData
          )
        ) {

          ordersData =
            ordersData?.orders ||
            ordersData?.content ||
            [];

        }


        if (
          !Array.isArray(
            ordersData
          ) ||
          ordersData.length === 0
        ) {

          throw new Error(
            "No orders found."
          );
        }


        /*
         * Show the latest order.
         */

        const latestOrder =
          [...ordersData].sort(
            (a, b) =>
              new Date(
                b.createdAt || 0
              ) -
              new Date(
                a.createdAt || 0
              )
          )[0];


        const normalizedOrder =
          normalizeOrder(
            latestOrder
          );


        setOrder(
          normalizedOrder
        );


        localStorage.setItem(
          "dealhuntsLastOrder",
          JSON.stringify(
            normalizedOrder
          )
        );

      } catch (error) {

        console.error(
          "Failed to load orders:",
          error
        );


        const backendMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error;


        setErrorMessage(
          backendMessage ||
          error?.message ||
          "Unable to load your order."
        );

      } finally {

        setLoading(false);

      }

    };


    loadOrder();

  }, []);


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {

    return (

      <div className="orders-page">

        <div className="orders-content">

          {/* KEEP YOUR EXISTING ORDERS UI HERE */}

        </div>

      </div>

    );

  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    !order ||
    errorMessage
  ) {

    return (

      <div className="orders-page">

        <div className="orders-empty">

          <div className="orders-empty__icon">

            <Package
              size={34}
              strokeWidth={1.8}
            />

          </div>

          <h1>
            No Order Found
          </h1>

          <p>
            {errorMessage ||
              "We could not find your order details."}
          </p>

          <button
            type="button"
            className="orders-btn orders-btn--primary"
            onClick={() =>
              navigate("/products")
            }
          >
            Continue Shopping
          </button>

        </div>

      </div>

    );

  }


  /* ==========================================================
     ORDER DATA
  ========================================================== */

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];


  const paymentMethod =
    order.paymentMethod
      ? String(
          order.paymentMethod
        ).toUpperCase()
      : "—";


  const paymentStatus =
    order.paymentStatus ||
    "PENDING";


  const orderStatus =
    order.orderStatus ||
    "PLACED";


  const deliveryCharge =
    Number(
      order.deliveryCharge || 0
    );


  const discount =
    Number(
      order.discount || 0
    );


  const subtotal =
    Number(
      order.subtotal || 0
    );


  const total =
    Number(
      order.total || 0
    );


  /* ==========================================================
     DELIVERY ADDRESS
  ========================================================== */

  const deliveryAddress =
    [
      order.deliveryAddress,
      order.city,
      order.state,
      order.pincode,
    ]
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          String(value).trim() !== ""
      )
      .join(", ");


  /* ==========================================================
     VENDOR
  ========================================================== */

  const vendors = [
    ...new Set(
      items
        .map(
          (item) =>
            getItemVendor(item)
        )
        .filter(Boolean)
    ),
  ];


  const vendorText =
    vendors.length === 0
      ? "Vendor"
      : vendors.length === 1
        ? vendors[0]
        : "Multiple Vendors";


  /* ==========================================================
     UI
  ========================================================== */

  return (

    <div className="orders-page">


      {/* ====================================================
          ORDER HEADER
      ==================================================== */}

      <div className="orders-header">

        <button
          type="button"
          className="orders-back"
          onClick={() =>
            navigate("/products")
          }
        >

          <ArrowLeft
            size={18}
          />

          <span>
            Continue Shopping
          </span>

        </button>


        <div className="orders-header__title">

          <div className="orders-header__icon">

            <Receipt
              size={22}
              strokeWidth={2}
            />

          </div>

          <div>

            <h1>
              Your Order
            </h1>

            <p>
              Order details and bill
            </p>

          </div>

        </div>

      </div>


      {/* ====================================================
          ORDER TOP CARD
      ==================================================== */}

      <section className="orders-card orders-overview">

        <div className="orders-overview__left">

          <div className="orders-overview__success">

            <CircleCheck
              size={20}
              strokeWidth={2}
            />

          </div>

          <div>

            <span className="orders-label">
              Order ID
            </span>

            <strong className="orders-order-id">
              #{order.orderId}
            </strong>

          </div>

        </div>


        <div className="orders-overview__details">

          <div className="orders-overview__item">

            <CalendarClock
              size={17}
            />

            <div>

              <span className="orders-label">
                Order Date
              </span>

              <strong>
                {formatDate(
                  order.createdAt
                )}
              </strong>

            </div>

          </div>


          <div className="orders-overview__item">

            <Store
              size={17}
            />

            <div>

              <span className="orders-label">
                Vendor
              </span>

              <strong>
                {vendorText}
              </strong>

            </div>

          </div>


          <div className="orders-overview__item">

            <Package
              size={17}
            />

            <div>

              <span className="orders-label">
                Status
              </span>

              <span
                className={getStatusClass(
                  orderStatus
                )}
              >
                {String(
                  orderStatus
                ).replace(
                  /_/g,
                  " "
                )}
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ====================================================
          MAIN GRID
      ==================================================== */}

      <div className="orders-layout">


        {/* ==================================================
            LEFT
        ================================================== */}

        <div className="orders-main">


          {/* ==================================================
              ORDERED PRODUCTS
          ================================================== */}

          <section className="orders-card">

            <div className="orders-section-header">

              <div>

                <h2>
                  Ordered Products
                </h2>

                <p>
                  {items.length}{" "}
                  {items.length === 1
                    ? "product"
                    : "products"}{" "}
                  in this order
                </p>

              </div>

            </div>


            {items.length === 0 ? (

              <div className="orders-no-items">

                <Package
                  size={28}
                />

                <p>
                  Product information is not
                  available for this order.
                </p>

              </div>

            ) : (

              <div className="orders-products">

                {items.map(
                  (item, index) => {

                    const image =
                      getItemImage(
                        item
                      );

                    const name =
                      getItemName(
                        item
                      );

                    const brand =
                      getItemBrand(
                        item
                      );

                    const vendor =
                      getItemVendor(
                        item
                      );

                    const quantity =
                      getItemQuantity(
                        item
                      );

                    const unitPrice =
                      getItemPrice(
                        item
                      );

                    const itemTotal =
                      getItemTotal(
                        item
                      );


                    return (

                      <div
                        className="orders-product"
                        key={
                          item?.id ||
                          item?.orderItemId ||
                          item?.inventoryId ||
                          index
                        }
                      >


                        {/* PRODUCT IMAGE */}

                        <div className="orders-product__image">

                          {image ? (

                            <img
                              src={image}
                              alt={name}
                              onError={(event) => {

                                event.currentTarget.style.display =
                                  "none";

                                event.currentTarget.nextElementSibling.style.display =
                                  "flex";

                              }}
                            />

                          ) : null}


                          <div
                            className="orders-product__image-placeholder"
                            style={{
                              display: image
                                ? "none"
                                : "flex",
                            }}
                          >

                            <Package
                              size={32}
                              strokeWidth={1.5}
                            />

                          </div>

                        </div>


                        {/* PRODUCT DETAILS */}

                        <div className="orders-product__details">

                          <h3>
                            {name}
                          </h3>


                          {brand && (

                            <span className="orders-product__brand">

                              {brand}

                            </span>

                          )}


                          <div className="orders-product__meta">

                            <span>

                              <Store
                                size={14}
                              />

                              {vendor}

                            </span>


                            <span>

                              Qty:{" "}

                              <strong>
                                {quantity}
                              </strong>

                            </span>

                          </div>

                        </div>


                        {/* PRICE */}

                        <div className="orders-product__price">

                          <span>
                            ₹
                            {formatPrice(
                              unitPrice
                            )}
                            {" "}×{" "}
                            {quantity}
                          </span>

                          <strong>
                            ₹
                            {formatPrice(
                              itemTotal
                            )}
                          </strong>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </section>


          {/* ==================================================
              DELIVERY ADDRESS
          ================================================== */}

          <section className="orders-card">

            <div className="orders-section-header">

              <div>

                <h2>
                  Delivery Address
                </h2>

                <p>
                  Address used for this order
                </p>

              </div>

            </div>


            <div className="orders-address">

              <div className="orders-address__icon">

                <MapPin
                  size={21}
                />

              </div>


              <div className="orders-address__content">

                {order.deliveryAddress && (

                  <strong>
                    {order.deliveryAddress}
                  </strong>

                )}


                <p>

                  {[
                    order.city,
                    order.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}

                  {order.pincode && (
                    <>
                      {" - "}
                      {order.pincode}
                    </>
                  )}

                </p>

              </div>

            </div>

          </section>


          {/* ==================================================
              PAYMENT
          ================================================== */}

          <section className="orders-card">

            <div className="orders-section-header">

              <div>

                <h2>
                  Payment Details
                </h2>

                <p>
                  Payment information for this order
                </p>

              </div>

            </div>


            <div className="orders-payment">

              <div className="orders-payment__icon">

                {paymentMethod === "COD" ? (

                  <Wallet
                    size={21}
                  />

                ) : (

                  <CreditCard
                    size={21}
                  />

                )}

              </div>


              <div className="orders-payment__content">

                <span className="orders-label">
                  Payment Method
                </span>

                <strong>
                  {paymentMethod}
                </strong>

              </div>


              <div className="orders-payment__status">

                <span className="orders-label">
                  Payment Status
                </span>

                <span
                  className={getStatusClass(
                    paymentStatus
                  )}
                >
                  {String(
                    paymentStatus
                  ).replace(
                    /_/g,
                    " "
                  )}
                </span>

              </div>

            </div>

          </section>

        </div>


        {/* ==================================================
            RIGHT — BILL
        ================================================== */}

        <aside className="orders-sidebar">


          <section className="orders-card orders-bill">

            <div className="orders-bill__header">

              <div className="orders-bill__icon">

                <IndianRupee
                  size={19}
                />

              </div>

              <div>

                <h2>
                  Order Bill
                </h2>

                <p>
                  Complete payment summary
                </p>

              </div>

            </div>


            <div className="orders-bill__rows">


              {/* SUBTOTAL */}

              <div className="orders-bill__row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {formatPrice(
                    subtotal
                  )}
                </strong>

              </div>


              {/* DISCOUNT */}

              <div className="orders-bill__row orders-bill__row--discount">

                <span>
                  Discount
                </span>

                <strong>
                  − ₹
                  {formatPrice(
                    discount
                  )}
                </strong>

              </div>


              {/* DELIVERY */}

              <div className="orders-bill__row">

                <span>
                  Delivery
                </span>

                <strong>

                  {deliveryCharge > 0
                    ? `₹${formatPrice(
                        deliveryCharge
                      )}`
                    : "Free"}

                </strong>

              </div>

            </div>


            <div className="orders-bill__divider" />


            {/* TOTAL */}

            <div className="orders-bill__total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {formatPrice(
                  total
                )}
              </strong>

            </div>


            <div className="orders-bill__time">

              <CalendarClock
                size={15}
              />

              <span>
                Ordered on{" "}
                {formatDateTime(
                  order.createdAt
                )}
              </span>

            </div>

          </section>


          {/* ==================================================
              ORDER STATUS
          ================================================== */}

          <section className="orders-card orders-status-card">

            <div className="orders-status-card__icon">

              <Truck
                size={20}
              />

            </div>

            <div>

              <span className="orders-label">
                Order Status
              </span>

              <strong>
                {String(
                  orderStatus
                ).replace(
                  /_/g,
                  " "
                )}
              </strong>

              <p>
                Your order is being processed
                by the seller.
              </p>

            </div>

          </section>


          {/* ==================================================
              BACK BUTTON
          ================================================== */}

          <button
            type="button"
            className="orders-btn orders-btn--primary orders-btn--full"
            onClick={() =>
              navigate("/products")
            }
          >
            Continue Shopping
          </button>

        </aside>

      </div>

    </div>

  );
}