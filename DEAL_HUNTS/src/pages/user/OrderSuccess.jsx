import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import {
  Package,
  CalendarClock,
  Store,
  Wallet,
  IndianRupee,
} from "lucide-react";

import "../../styles/OrderSuccess.css";


/* ============================================================
   API
============================================================ */

const API_BASE = "http://localhost:8080";


/* ============================================================
   ORDER SUCCESS
============================================================ */

export default function OrderSuccess() {

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();


  /* ==========================================================
     ORDER STATE
  ========================================================== */

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");


  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  const formatDate = (dateValue) => {

    if (!dateValue) {
      return "—";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  /* ==========================================================
     FORMAT PRICE
  ========================================================== */

  const formatPrice = (amount) => {

    const value =
      Number(amount || 0);

    if (
      !Number.isFinite(value)
    ) {
      return "0";
    }

    return value.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );
  };


  /* ==========================================================
     LOAD ORDERS
  ========================================================== */

  useEffect(() => {

    const loadOrders = async () => {

      try {

        setLoading(true);
        setErrorMessage("");


        /* ----------------------------------------------------
           GET ORDER IDS
        ---------------------------------------------------- */

        const orderIdsParam =
          searchParams.get(
            "orderIds"
          );


        /*
         * Backward compatibility:
         * also support old ?orderId=10
         */

        const oldOrderId =
          searchParams.get(
            "orderId"
          );


        let orderIds = [];


        if (orderIdsParam) {

          orderIds =
            orderIdsParam
              .split(",")
              .map(
                (id) =>
                  Number(
                    id.trim()
                  )
              )
              .filter(
                (id) =>
                  Number.isInteger(id) &&
                  id > 0
              );

        } else if (oldOrderId) {

          const parsedId =
            Number(
              oldOrderId
            );

          if (
            Number.isInteger(
              parsedId
            ) &&
            parsedId > 0
          ) {

            orderIds = [
              parsedId,
            ];

          }

        }


        /* ----------------------------------------------------
           FIRST TRY SAVED ORDERS
        ---------------------------------------------------- */

        const savedOrder =
          localStorage.getItem(
            "dealhuntsLastOrder"
          );


        if (savedOrder) {

          try {

            const parsed =
              JSON.parse(
                savedOrder
              );


            /*
             * New format:
             * [
             *   { orderId: 10 },
             *   { orderId: 11 }
             * ]
             */

            if (
              Array.isArray(
                parsed
              ) &&
              parsed.length > 0
            ) {

              const validSavedOrders =
                parsed.filter(
                  (order) =>
                    order &&
                    order.orderId
                );


              if (
                validSavedOrders.length > 0
              ) {

                /*
                 * If URL contains IDs,
                 * only use matching orders.
                 */

                if (
                  orderIds.length > 0
                ) {

                  const matchingOrders =
                    validSavedOrders.filter(
                      (order) =>
                        orderIds.includes(
                          Number(
                            order.orderId
                          )
                        )
                    );


                  if (
                    matchingOrders.length ===
                    orderIds.length
                  ) {

                    setOrders(
                      matchingOrders
                    );

                    setLoading(false);

                    return;

                  }

                } else {

                  setOrders(
                    validSavedOrders
                  );

                  setLoading(false);

                  return;

                }

              }

            }


            /*
             * Backward compatibility:
             * old format:
             * { orderId: 10 }
             */

            if (
              parsed &&
              parsed.orderId
            ) {

              if (
                orderIds.length === 0 ||
                orderIds.includes(
                  Number(
                    parsed.orderId
                  )
                )
              ) {

                setOrders([
                  parsed,
                ]);

                setLoading(false);

                return;

              }

            }

          } catch (error) {

            console.error(
              "Invalid saved order:",
              error
            );

          }

        }


        /* ----------------------------------------------------
           ORDER IDS REQUIRED
        ---------------------------------------------------- */

        if (
          orderIds.length === 0
        ) {

          throw new Error(
            "Order information is not available."
          );

        }


        /* ----------------------------------------------------
           AUTH TOKEN
        ---------------------------------------------------- */

        const token =
          localStorage.getItem(
            "userJwtToken"
          );


        if (!token) {

          throw new Error(
            "Your login session has expired. Please login again."
          );

        }


        /* ----------------------------------------------------
           FETCH ALL ORDERS
        ---------------------------------------------------- */

        const orderResponses =
          await Promise.all(
            orderIds.map(
              async (orderId) => {

                const response =
                  await axios.get(
                    `${API_BASE}/order/${orderId}`,
                    {
                      headers: {
                        Authorization:
                          `Bearer ${token}`,
                      },
                    }
                  );

                return response.data;

              }
            )
          );


        /* ----------------------------------------------------
           VALIDATE ORDERS
        ---------------------------------------------------- */

        const validOrders =
          orderResponses.filter(
            (order) =>
              order &&
              order.orderId
          );


        if (
          validOrders.length === 0
        ) {

          throw new Error(
            "Invalid order response."
          );

        }


        /* ----------------------------------------------------
           SAVE ALL ORDERS
        ---------------------------------------------------- */

        setOrders(
          validOrders
        );


        localStorage.setItem(
          "dealhuntsLastOrder",
          JSON.stringify(
            validOrders
          )
        );


      } catch (error) {

        console.error(
          "Failed to load order:",
          error
        );


        const backendMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error;


        setErrorMessage(
          backendMessage ||
          error?.message ||
          "Unable to load order details."
        );

      } finally {

        setLoading(false);

      }

    };


    loadOrders();

  }, [searchParams]);


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {

    return (

      <div className="os-page-user">

        <main className="os-content-user">

          <section className="os-state-user">

            <div className="os-loading-spinner-user" />

            <h1>
              Loading Order...
            </h1>

            <p>
              Fetching your order details.
            </p>

          </section>

        </main>

      </div>

    );

  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    !orders.length ||
    errorMessage
  ) {

    return (

      <div className="os-page-user">

        <main className="os-content-user">

          <section className="os-state-user">

            <div className="os-error-icon-user">
              !
            </div>


            <h1>
              Order Details Unavailable
            </h1>


            <p>
              {errorMessage ||
                "We could not find this order."}
            </p>


            <button
              type="button"
              className="os-primary-button-user"
              onClick={() =>
                navigate("/products")
              }
            >
              Continue Shopping
            </button>

          </section>

        </main>

      </div>

    );

  }


  /* ==========================================================
     TOTAL ORDERS
  ========================================================== */

  const totalOrders =
    orders.length;


  /* ==========================================================
     TOTAL AMOUNT
  ========================================================== */

  const totalAmount =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total || 0
        ),
      0
    );


  /* ==========================================================
     FIRST ORDER
  ========================================================== */

  const firstOrder =
    orders[0];


  /* ==========================================================
     PAYMENT
  ========================================================== */

  const payment =
    firstOrder?.paymentMethod
      ? String(
          firstOrder.paymentMethod
        ).toUpperCase()
      : "—";


  /* ==========================================================
     ORDER DATE
  ========================================================== */

  const orderDate =
    formatDate(
      firstOrder?.createdAt
    );


  /* ==========================================================
     UI
  ========================================================== */

  return (

    <div className="os-page-user">

      <main className="os-content-user">

        <section className="os-success-user">


          {/* ==================================================
              GOLD SUCCESS TICK
          ================================================== */}

          <div
            className="os-success-icon-user"
            aria-label="Order placed successfully"
          >

            <svg
              viewBox="0 0 52 52"
              className="os-success-check-user"
              aria-hidden="true"
            >

              <circle
                cx="26"
                cy="26"
                r="24"
                className="os-success-circle-user"
              />

              <path
                d="M14 27 L22 35 L38 18"
                className="os-success-tick-user"
              />

            </svg>

          </div>


          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          <h1>
            Order Placed Successfully!
          </h1>


          <p className="os-subtitle-user">

            Your order has been confirmed and is
            being prepared by the seller.

          </p>


          {/* ==================================================
              ORDER SUMMARY BUTTON
          ================================================== */}

          <button
            type="button"
            className="os-summary-button-user"
            onClick={() =>
              navigate("/orders")
            }
          >

            <Package
              size={17}
              strokeWidth={1.8}
            />

            <span>
              Order Summary
            </span>

          </button>


          {/* ==================================================
              ORDER OVERVIEW
          ================================================== */}

          <div className="os-overview-user">

            <div className="os-overview-item-user">

              <span className="os-overview-label-user">
                Orders
              </span>

              <span className="os-overview-value-user">
                {totalOrders}
              </span>

            </div>


            <div className="os-overview-divider-user" />


            <div className="os-overview-item-user">

              <span className="os-overview-label-user">
                Total Amount
              </span>

              <span className="os-overview-value-user">
                ₹{formatPrice(totalAmount)}
              </span>

            </div>

          </div>


          {/* ==================================================
              ORDER DETAILS
          ================================================== */}

          <div className="os-details-user">

            <div className="os-details-header-user">

              <h2>
                Order Details
              </h2>


              {totalOrders > 1 && (

                <span className="os-vendor-count-user">
                  {totalOrders} vendor orders
                </span>

              )}

            </div>


            {/* ==================================================
                EACH VENDOR ORDER
            ================================================== */}

            {orders.map(
              (order) => {

                const items =
                  Array.isArray(
                    order.items
                  )
                    ? order.items
                    : [];


                const firstItem =
                  items.length > 0
                    ? items[0]
                    : null;


                const vendors = [
                  ...new Set(
                    items
                      .map(
                        (item) =>
                          item?.vendorName ||
                          item?.shopName ||
                          item?.vendor?.name ||
                          item?.vendor?.shopName
                      )
                      .filter(Boolean)
                  ),
                ];


                const vendor =
                  vendors.length > 0
                    ? vendors.join(", ")
                    : "Vendor";


                return (

                  <div
                    className="os-order-card-user"
                    key={
                      order.orderId
                    }
                  >


                    {/* ==========================================
                        ORDER ID
                    ========================================== */}

                    <div className="os-detail-user">

                      <span className="os-detail-icon-user">

                        <Package
                          size={16}
                          strokeWidth={1.8}
                        />

                      </span>


                      <div>

                        <span className="os-detail-label-user">
                          Order ID
                        </span>

                        <span className="os-detail-value-user">
                          #{order.orderId}
                        </span>

                      </div>

                    </div>


                    {/* ==========================================
                        DATE
                    ========================================== */}

                    <div className="os-detail-user">

                      <span className="os-detail-icon-user">

                        <CalendarClock
                          size={16}
                          strokeWidth={1.8}
                        />

                      </span>


                      <div>

                        <span className="os-detail-label-user">
                          Order Date
                        </span>

                        <span className="os-detail-value-user">
                          {formatDate(
                            order.createdAt
                          )}
                        </span>

                      </div>

                    </div>


                    {/* ==========================================
                        VENDOR
                    ========================================== */}

                    <div className="os-detail-user">

                      <span className="os-detail-icon-user">

                        <Store
                          size={16}
                          strokeWidth={1.8}
                        />

                      </span>


                      <div>

                        <span className="os-detail-label-user">
                          Vendor
                        </span>

                        <span className="os-detail-value-user">
                          {vendor}
                        </span>

                      </div>

                    </div>


                    {/* ==========================================
                        PAYMENT
                    ========================================== */}

                    <div className="os-detail-user">

                      <span className="os-detail-icon-user">

                        <Wallet
                          size={16}
                          strokeWidth={1.8}
                        />

                      </span>


                      <div>

                        <span className="os-detail-label-user">
                          Payment Method
                        </span>

                        <span className="os-detail-value-user">
                          {order.paymentMethod
                            ? String(
                                order.paymentMethod
                              ).toUpperCase()
                            : payment}
                        </span>

                      </div>

                    </div>


                    {/* ==========================================
                        TOTAL
                    ========================================== */}

                    <div className="os-detail-user">

                      <span className="os-detail-icon-user">

                        <IndianRupee
                          size={16}
                          strokeWidth={1.8}
                        />

                      </span>


                      <div>

                        <span className="os-detail-label-user">
                          Total Amount
                        </span>

                        <span className="os-detail-value-user">
                          ₹
                          {formatPrice(
                            order.total
                          )}
                        </span>

                      </div>

                    </div>


                    {/* ==========================================
                        DELIVERY
                    ========================================== */}

                    <div className="os-detail-user">

                      <span className="os-detail-icon-user">

                        <CalendarClock
                          size={16}
                          strokeWidth={1.8}
                        />

                      </span>


                      <div>

                        <span className="os-detail-label-user">
                          Estimated Delivery
                        </span>

                        <span className="os-detail-value-user">
                          Will be updated by the seller
                        </span>

                      </div>

                    </div>


                    {/* ==========================================
                        PRODUCTS
                    ========================================== */}

                    {items.length > 0 && (

                      <div className="os-products-user">

                        <span className="os-products-title-user">
                          Products
                        </span>


                        {items.map(
                          (item, index) => (

                            <div
                              className="os-product-user"
                              key={
                                item?.orderItemId ||
                                item?.id ||
                                index
                              }
                            >

                              <span className="os-product-name-user">
                                {item?.productName ||
                                  item?.name ||
                                  firstItem?.productName ||
                                  "Product"}
                              </span>


                              <span className="os-product-quantity-user">
                                Qty{" "}
                                {item?.quantity ||
                                  1}
                              </span>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                );

              }
            )}

          </div>


          {/* ==================================================
              CONTINUE SHOPPING
          ================================================== */}

          <div className="os-actions-user">

            <button
              type="button"
              className="os-primary-button-user"
              onClick={() =>
                navigate("/products")
              }
            >
              Continue Shopping
            </button>

          </div>


        </section>

      </main>

    </div>

  );

}