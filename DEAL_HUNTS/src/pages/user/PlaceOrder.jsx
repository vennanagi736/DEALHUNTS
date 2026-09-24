import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Wallet,
  Smartphone,
  CreditCard,
  Landmark,
  ShieldCheck,
} from "lucide-react";

import "../../styles/PlaceOrder.css";


/* ============================================================
   API
============================================================ */

const API_BASE = "http://localhost:8080";


/* ============================================================
   PAYMENT METHODS
============================================================ */

const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI",
    helper: "Pay securely using UPI",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    helper: "Visa, Mastercard and more",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    helper: "Pay using your bank",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    helper: "Pay when your order arrives",
  },
];


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
   EMPTY ADDRESS
============================================================ */

const EMPTY_ADDRESS = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};


/* ============================================================
   NORMALIZE ITEM
   Handles both Buy Now data and backend Cart data
============================================================ */

const normalizeItem = (item = {}) => {

  const inventoryId =
    Number(
      item.inventoryId ??
      item.inventory?.id ??
      item.id
    ) || 0;


  const productId =
    Number(
      item.productId ??
      item.product?.id ??
      item.inventory?.productId ??
      item.inventory?.product?.id
    ) || null;


  const quantity =
    Number(
      item.quantity ??
      item.qty ??
      1
    );


  const price =
    Number(
      item.price ??
      item.sellingPrice ??
      item.finalPrice ??
      item.inventory?.sellingPrice ??
      item.inventory?.price ??
      item.product?.price ??
      0
    ) || 0;


  const name =
    item.name ??
    item.productName ??
    item.product?.name ??
    item.inventory?.product?.name ??
    "Product";


  const brand =
    item.brand ??
    item.brandName ??
    item.product?.brand?.name ??
    item.inventory?.product?.brand?.name ??
    "";


  const vendor =
    item.vendor ??
    item.vendorName ??
    item.shopName ??
    item.vendor?.shopName ??
    item.inventory?.vendor?.shopName ??
    "Vendor";


  const vendorId =
    Number(
      item.vendorId ??
      item.vendor?.id ??
      item.inventory?.vendorId ??
      item.inventory?.vendor?.id
    ) || null;


  const image =
    item.image ??
    item.imageUrl ??
    item.thumbnailUrl ??
    item.thumbnail ??
    item.productImage ??
    item.product?.imageUrl ??
    item.product?.image ??
    item.inventory?.product?.imageUrl ??
    "";


  return {
    inventoryId,
    productId,
    name,
    brand,
    image,
    price,
    quantity: quantity > 0 ? quantity : 1,
    vendor,
    vendorId,
  };
};


/* ============================================================
   EXTRACT CART ITEMS
   Supports common backend response structures
============================================================ */

const extractCartItems = (responseData) => {

  if (Array.isArray(responseData)) {
    return responseData;
  }


  if (
    responseData &&
    Array.isArray(responseData.items)
  ) {
    return responseData.items;
  }


  if (
    responseData &&
    Array.isArray(responseData.cartItems)
  ) {
    return responseData.cartItems;
  }


  if (
    responseData &&
    Array.isArray(responseData.cart?.items)
  ) {
    return responseData.cart.items;
  }


  if (
    responseData &&
    Array.isArray(responseData.cart?.cartItems)
  ) {
    return responseData.cart.cartItems;
  }


  return [];
};


/* ============================================================
   PLACE ORDER
============================================================ */

export default function PlaceOrder() {

  const navigate = useNavigate();


  /* ==========================================================
     LOGIN STATE
  ========================================================== */

  const isLoggedIn =
    !!localStorage.getItem("userJwtToken");


  /* ==========================================================
     ITEMS
  ========================================================== */

  const [items, setItems] = useState([]);

  const [loadingItems, setLoadingItems] =
    useState(true);


  /* ==========================================================
     ADDRESS
  ========================================================== */

  const [address, setAddress] =
    useState(EMPTY_ADDRESS);


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

  const [errorMessage, setErrorMessage] =
    useState("");


  /* ==========================================================
     LOAD ORDER ITEMS

     Priority:

     1. Buy Now data
     2. Backend Cart
  ========================================================== */

  useEffect(() => {

    const loadOrderItems = async () => {

      setLoadingItems(true);

      try {

        /* ------------------------------------------------------
           AUTH TOKEN
        ------------------------------------------------------ */

        const token =
          localStorage.getItem("userJwtToken");


        /* ------------------------------------------------------
           1. CHECK BUY NOW
        ------------------------------------------------------ */

        const buyNowData =
          localStorage.getItem("dealhuntsBuyNow");


        if (buyNowData) {

          try {

            const parsed =
              JSON.parse(buyNowData);


            if (
              Array.isArray(parsed) &&
              parsed.length > 0
            ) {

              const normalizedItems =
                parsed
                  .map(normalizeItem)
                  .filter(
                    (item) =>
                      item.inventoryId > 0
                  );


              if (normalizedItems.length > 0) {

                console.log(
                  "PlaceOrder - Using Buy Now items:",
                  normalizedItems
                );


                setItems(normalizedItems);

                setLoadingItems(false);

                return;

              }

            }

          } catch (buyNowError) {

            console.error(
              "Invalid Buy Now data:",
              buyNowError
            );

          }

        }


        /* ------------------------------------------------------
           2. LOAD REAL BACKEND CART
        ------------------------------------------------------ */

        if (!token) {

          setItems([]);

          setErrorMessage(
            "Please login to continue to checkout."
          );

          return;

        }


        console.log(
          "PlaceOrder - Loading cart from backend..."
        );


        const response =
          await axios.get(
            `${API_BASE}/cart`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        console.log(
          "PlaceOrder - Cart response:",
          response.data
        );


        const cartItems =
          extractCartItems(
            response.data
          );


        console.log(
          "PlaceOrder - Extracted cart items:",
          cartItems
        );


        const normalizedItems =
          cartItems
            .map(normalizeItem)
            .filter(
              (item) =>
                item.inventoryId > 0
            );


        console.log(
          "PlaceOrder - Normalized cart items:",
          normalizedItems
        );


        setItems(normalizedItems);


      } catch (error) {

        console.error(
          "Failed to load checkout items:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          setErrorMessage(
            "Your login session has expired. Please login again."
          );

        } else {

          setErrorMessage(
            "Unable to load your cart. Please try again."
          );

        }


        setItems([]);

      } finally {

        setLoadingItems(false);

      }

    };


    loadOrderItems();

  }, []);


  /* ==========================================================
     LOAD SAVED ADDRESS
  ========================================================== */

  useEffect(() => {

    try {

      const savedAddress =
        localStorage.getItem(
          "dealhuntsDeliveryAddress"
        );


      if (savedAddress) {

        const parsed =
          JSON.parse(savedAddress);


        if (
          parsed &&
          typeof parsed === "object"
        ) {

          setAddress({
            ...EMPTY_ADDRESS,
            ...parsed,
          });

        }

      }

    } catch (error) {

      console.error(
        "Failed to load saved address:",
        error
      );

    }

  }, []);


  /* ==========================================================
     ADDRESS CHANGE
  ========================================================== */

  const handleAddressChange = (
    field,
    value
  ) => {

    setAddress((previous) => ({
      ...previous,
      [field]: value,
    }));

  };


  /* ==========================================================
     ORDER SUMMARY
  ========================================================== */

  const {
    subtotal,
    discount,
    delivery,
    total,
  } = useMemo(() => {

    let subtotalAmount = 0;


    items.forEach((item) => {

      const price =
        Number(item.price) || 0;

      const quantity =
        Number(item.quantity) || 0;


      subtotalAmount +=
        price * quantity;

    });


    const discountAmount = 0;

    const deliveryAmount = 0;

    const totalAmount =
      subtotalAmount -
      discountAmount +
      deliveryAmount;


    return {
      subtotal: subtotalAmount,
      discount: discountAmount,
      delivery: deliveryAmount,
      total: totalAmount,
    };

  }, [items]);


  /* ==========================================================
     FORMAT PRICE
  ========================================================== */

  const formatPrice = (amount) => {

    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;

  };


  /* ==========================================================
     PLACE ORDER
  ========================================================== */

  const handlePlaceOrder = async () => {

    if (placing) {
      return;
    }


    setErrorMessage("");


    /* --------------------------------------------------------
       VALIDATE ITEMS
    -------------------------------------------------------- */

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {

      setErrorMessage(
        "No products are available for checkout."
      );

      return;
    }


    /* --------------------------------------------------------
       VALIDATE INVENTORY
    -------------------------------------------------------- */

    const invalidItem =
      items.find(
        (item) =>
          !item.inventoryId ||
          Number(item.inventoryId) <= 0
      );


    if (invalidItem) {

      setErrorMessage(
        "Inventory information is missing for the selected product."
      );

      return;
    }


    /* --------------------------------------------------------
       VALIDATE QUANTITY
    -------------------------------------------------------- */

    const invalidQuantity =
      items.find(
        (item) =>
          !Number.isInteger(
            Number(item.quantity)
          ) ||
          Number(item.quantity) <= 0
      );


    if (invalidQuantity) {

      setErrorMessage(
        "Invalid product quantity."
      );

      return;
    }


    /* --------------------------------------------------------
       VALIDATE ADDRESS
    -------------------------------------------------------- */

    if (
      !address.name.trim() ||
      !address.phone.trim() ||
      !address.line1.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {

      setErrorMessage(
        "Please provide complete delivery details."
      );

      return;
    }


    /* --------------------------------------------------------
       VALIDATE PINCODE
    -------------------------------------------------------- */

    if (
      !/^\d{6}$/.test(
        address.pincode.trim()
      )
    ) {

      setErrorMessage(
        "Please enter a valid 6-digit PIN code."
      );

      return;
    }


    /* --------------------------------------------------------
       VALIDATE PAYMENT
    -------------------------------------------------------- */

    if (!selectedPayment) {

      setErrorMessage(
        "Please select a payment method."
      );

      return;
    }


    setPlacing(true);


    try {

      /* ------------------------------------------------------
         AUTH TOKEN
      ------------------------------------------------------ */

      const token =
        localStorage.getItem(
          "userJwtToken"
        );


      if (!token) {

        setErrorMessage(
          "Your login session has expired. Please login again."
        );

        setPlacing(false);

        return;
      }


      /* ------------------------------------------------------
         ORDER ITEMS
      ------------------------------------------------------ */

      const orderItems =
        items.map((item) => ({
          inventoryId:
            Number(item.inventoryId),

          quantity:
            Number(item.quantity),
        }));


      /* ------------------------------------------------------
         REQUEST DATA
      ------------------------------------------------------ */

      const requestData = {

        paymentMethod:
          selectedPayment,

        deliveryAddress:
          [
            address.name.trim(),
            address.phone.trim(),
            address.line1.trim(),
            address.line2.trim(),
          ]
            .filter(Boolean)
            .join(", "),

        city:
          address.city.trim(),

        state:
          address.state.trim(),

        pincode:
          address.pincode.trim(),

        items:
          orderItems,
      };


      console.log(
        "Placing real order:",
        requestData
      );


      /* ------------------------------------------------------
         SAVE ADDRESS
      ------------------------------------------------------ */

      localStorage.setItem(
        "dealhuntsDeliveryAddress",
        JSON.stringify(address)
      );


      /* ------------------------------------------------------
         PLACE ORDER API
      ------------------------------------------------------ */

      const response =
        await axios.post(
          `${API_BASE}/order/place`,
          requestData,
          {
            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      /* ------------------------------------------------------
         BACKEND RESPONSE
         Backend returns one OrderResponse per vendor
      ------------------------------------------------------ */

      const orders = response.data;

      console.log(
        "PlaceOrder - Orders created:",
        orders
      );


      /* ------------------------------------------------------
         VALIDATE RESPONSE
      ------------------------------------------------------ */

      if (
        !Array.isArray(orders) ||
        orders.length === 0
      ) {

        throw new Error(
          "Invalid order response from server."
        );

      }


      const validOrders =
        orders.filter(
          (order) =>
            order &&
            order.orderId
        );


      if (validOrders.length === 0) {

        throw new Error(
          "Invalid order response from server."
        );

      }


      /* ------------------------------------------------------
         CLEAR BUY NOW
      ------------------------------------------------------ */

      localStorage.removeItem(
        "dealhuntsBuyNow"
      );


      /* ------------------------------------------------------
         SAVE ALL ORDERS
      ------------------------------------------------------ */

      localStorage.setItem(
        "dealhuntsLastOrder",
        JSON.stringify(validOrders)
      );


      /* ------------------------------------------------------
         SUCCESS PAGE
      ------------------------------------------------------ */

      const orderIds =
        validOrders
          .map(
            (order) =>
              order.orderId
          )
          .join(",");


      navigate(
        `/order-success?orderIds=${orderIds}`
      );


    } catch (error) {

      console.error(
        "Place order failed:",
        error
      );


      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error;


      if (
        error?.response?.status === 401
      ) {

        setErrorMessage(
          "Your session has expired. Please login again."
        );

      } else {

        setErrorMessage(
          backendMessage ||
          error?.message ||
          "Unable to place the order. Please try again."
        );

      }

    } finally {

      setPlacing(false);

    }

  };


  /* ==========================================================
     PAGE
  ========================================================== */

  return (

    <div className="po-page-user">

      {/* ====================================================
          LOADING
      ==================================================== */}

      {loadingItems && (

        <div className="po-loading-user">

          <div className="po-loading-spinner-user" />

          <span>
            Loading your order...
          </span>

        </div>

      )}


      {/* ====================================================
          EMPTY
      ==================================================== */}

      {!loadingItems &&
        items.length === 0 && (

          <main className="po-content-user">

            <div className="po-page-heading-user">

              <h1>
                Place Your Order
              </h1>

              <p>
                No products are currently available
                for checkout.
              </p>

            </div>


            {errorMessage && (

              <div className="po-error-user">
                {errorMessage}
              </div>

            )}


            <div className="po-card-user">

              <div className="po-summary-empty-user">

                Your cart does not contain any
                products available for checkout.

              </div>


              <button
                type="button"
                className="po-btn-primary-user"
                onClick={() =>
                  navigate("/products")
                }
              >
                Browse Products
              </button>

            </div>

          </main>

        )}


      {/* ====================================================
          MAIN CHECKOUT
      ==================================================== */}

      {!loadingItems &&
        items.length > 0 && (

          <main className="po-content-user">

            {/* ==================================================
                PAGE HEADING
            ================================================== */}

            <div className="po-page-heading-user">

              <h1>
                Place Your Order
              </h1>

              <p>
                Review your selected products and
                confirm your delivery details.
              </p>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {errorMessage && (

              <div className="po-error-user">
                {errorMessage}
              </div>

            )}


            {/* ==================================================
                MAIN LAYOUT
            ================================================== */}

            <div className="po-layout-user">


              {/* ==================================================
                  LEFT
              ================================================== */}

              <div className="po-left-user">


                {/* ==================================================
                    DELIVERY ADDRESS
                ================================================== */}

                <section className="po-card-user">

                  <div className="po-card-header-user">

                    <h2>
                      Delivery Address
                    </h2>

                  </div>


                  <form
                    className="po-address-form-user"
                    onSubmit={(event) =>
                      event.preventDefault()
                    }
                  >

                    <label>

                      Full Name

                      <input
                        type="text"
                        value={address.name}
                        onChange={(event) =>
                          handleAddressChange(
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Enter your full name"
                      />

                    </label>


                    <label>

                      Phone Number

                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(event) =>
                          handleAddressChange(
                            "phone",
                            event.target.value
                          )
                        }
                        placeholder="Enter phone number"
                      />

                    </label>


                    <label className="po-address-form-full-user">

                      House / Flat / Building

                      <input
                        type="text"
                        value={address.line1}
                        onChange={(event) =>
                          handleAddressChange(
                            "line1",
                            event.target.value
                          )
                        }
                        placeholder="House / Flat / Building"
                      />

                    </label>


                    <label className="po-address-form-full-user">

                      Street / Area

                      <input
                        type="text"
                        value={address.line2}
                        onChange={(event) =>
                          handleAddressChange(
                            "line2",
                            event.target.value
                          )
                        }
                        placeholder="Street / Area"
                      />

                    </label>


                    <label>

                      City

                      <input
                        type="text"
                        value={address.city}
                        onChange={(event) =>
                          handleAddressChange(
                            "city",
                            event.target.value
                          )
                        }
                        placeholder="City"
                      />

                    </label>


                    <label>

                      State

                      <input
                        type="text"
                        value={address.state}
                        onChange={(event) =>
                          handleAddressChange(
                            "state",
                            event.target.value
                          )
                        }
                        placeholder="State"
                      />

                    </label>


                    <label>

                      PIN Code

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={address.pincode}
                        onChange={(event) =>
                          handleAddressChange(
                            "pincode",
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        placeholder="6-digit PIN"
                      />

                    </label>

                  </form>

                </section>


                {/* ==================================================
                    PAYMENT METHOD
                ================================================== */}

                <section className="po-card-user">

                  <div className="po-card-header-user">

                    <h2>
                      Payment Method
                    </h2>

                  </div>


                  <div className="po-payment-grid-user">

                    {PAYMENT_METHODS.map(
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
                            className={`po-payment-option-user ${
                              isSelected
                                ? "po-payment-option-selected-user"
                                : ""
                            }`}
                            onClick={() =>
                              setSelectedPayment(
                                method.id
                              )
                            }
                          >

                            <span className="po-payment-option-icon-user">

                              <Icon
                                size={18}
                                strokeWidth={1.8}
                              />

                            </span>


                            <span className="po-payment-option-text-user">

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

              <aside className="po-summary-user">

                <h2>
                  Order Summary
                </h2>


                <div className="po-summary-items-user">

                  {items.map(
                    (item, index) => (

                      <div
                        className="po-summary-item-user"
                        key={
                          item.inventoryId ||
                          index
                        }
                      >

                        <div className="po-summary-item-image-user">

                          {item.image ? (

                            <img
                              src={item.image}
                              alt={
                                item.name ||
                                "Product"
                              }
                            />

                          ) : (

                            <div className="po-summary-item-image-placeholder-user">
                              Product
                            </div>

                          )}

                        </div>


                        <div className="po-summary-item-info-user">

                          <span className="po-summary-item-name-user">

                            {item.name ||
                              "Product"}

                          </span>


                          {item.brand && (

                            <span className="po-summary-item-meta-user">

                              {item.brand}

                            </span>

                          )}


                          <span className="po-summary-item-meta-user">

                            {item.vendor ||
                              "Vendor"}

                            {" · "}

                            Qty{" "}

                            {Number(
                              item.quantity
                            ) || 1}

                          </span>

                        </div>


                        <span className="po-summary-item-price-user">

                          {formatPrice(
                            Number(
                              item.price || 0
                            ) *
                            Number(
                              item.quantity || 1
                            )
                          )}

                        </span>

                      </div>

                    )
                  )}

                </div>


                <div className="po-summary-divider-user" />


                <div className="po-summary-row-user">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    {formatPrice(subtotal)}
                  </span>

                </div>


                <div className="po-summary-row-user po-summary-row-discount-user">

                  <span>
                    Discount
                  </span>

                  <span>
                    {discount > 0
                      ? `−${formatPrice(discount)}`
                      : "—"}
                  </span>

                </div>


                <div className="po-summary-row-user">

                  <span>
                    Delivery
                  </span>

                  <span>

                    {delivery === 0
                      ? "Free"
                      : formatPrice(delivery)}

                  </span>

                </div>


                <div className="po-summary-divider-user" />


                <div className="po-summary-row-total-user">

                  <span>
                    Total
                  </span>

                  <span>
                    {formatPrice(total)}
                  </span>

                </div>


                <button
                  type="button"
                  className="po-summary-cta-user"
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


                <div className="po-summary-secure-user">

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
        </main>
        )}
    </div>
  );
}