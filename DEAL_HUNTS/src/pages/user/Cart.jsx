import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Minus,
  Plus,
  Trash2,
  Heart,
  ShoppingCart,
  ShieldCheck,
  BadgeCheck,
  RotateCcw,
} from "lucide-react";

import {
  getCart,
  updateCartQuantity,
  removeCartItem,
} from "../../api/ProductApi";

import "../../styles/Cart.css";

export default function Cart() {

  const navigate = useNavigate();

  // ============================================================
  // LOGIN STATUS
  // ============================================================

  const isLoggedIn =
    !!localStorage.getItem("userJwtToken");


  // ============================================================
  // CART STATE
  // ============================================================

  const [cart, setCart] = useState({
    cartId: null,
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    delivery: 0,
    total: 0,
    items: [],
  });

  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [error, setError] = useState("");


  // ============================================================
  // LOAD CART
  // ============================================================

  const loadCart = async () => {

    if (!localStorage.getItem("userJwtToken")) {

      setLoading(false);

      setError(
        "Please login to view your cart."
      );

      return;
    }

    try {

      setLoading(true);
      setError("");

      const response = await getCart();

      console.log(
        "CART RESPONSE:",
        response.data
      );

      setCart({
        cartId: response.data.cartId,
        itemCount:
          response.data.itemCount ?? 0,
        subtotal:
          response.data.subtotal ?? 0,
        discount:
          response.data.discount ?? 0,
        delivery:
          response.data.delivery ?? 0,
        total:
          response.data.total ?? 0,
        items:
          response.data.items ?? [],
      });

    } catch (err) {

      console.error(
        "GET CART ERROR:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {

        setError(
          "Please login to view your cart."
        );

      } else {

        setError(
          "Unable to load your cart."
        );

      }

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // LOAD CART ON PAGE OPEN
  // ============================================================

  useEffect(() => {

    loadCart();

  }, []);


  // ============================================================
  // UPDATE QUANTITY
  // ============================================================

  const updateQuantity = async (
    cartItemId,
    currentQuantity,
    delta,
    stock
  ) => {

    const newQuantity =
      currentQuantity + delta;

    if (newQuantity < 1) {
      return;
    }

    if (
      stock &&
      newQuantity > stock
    ) {
      return;
    }

    try {

      setUpdatingItem(cartItemId);

      const response =
        await updateCartQuantity(
          cartItemId,
          newQuantity
        );

      console.log(
        "UPDATED CART:",
        response.data
      );

      setCart({
        cartId:
          response.data.cartId,

        itemCount:
          response.data.itemCount ?? 0,

        subtotal:
          response.data.subtotal ?? 0,

        discount:
          response.data.discount ?? 0,

        delivery:
          response.data.delivery ?? 0,

        total:
          response.data.total ?? 0,

        items:
          response.data.items ?? [],
      });

    } catch (err) {

      console.error(
        "UPDATE CART ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to update cart quantity."
      );

    } finally {

      setUpdatingItem(null);

    }
  };


  // ============================================================
  // REMOVE ITEM
  // ============================================================

  const removeItem = async (
    cartItemId
  ) => {

    try {

      setUpdatingItem(cartItemId);

      const response =
        await removeCartItem(
          cartItemId
        );

      console.log(
        "CART AFTER REMOVE:",
        response.data
      );

      setCart({
        cartId:
          response.data.cartId,

        itemCount:
          response.data.itemCount ?? 0,

        subtotal:
          response.data.subtotal ?? 0,

        discount:
          response.data.discount ?? 0,

        delivery:
          response.data.delivery ?? 0,

        total:
          response.data.total ?? 0,

        items:
          response.data.items ?? [],
      });

    } catch (err) {

      console.error(
        "REMOVE CART ITEM ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to remove item from cart."
      );

    } finally {

      setUpdatingItem(null);

    }
  };


  // ============================================================
  // MOVE TO WISHLIST
  // ============================================================

  const moveToWishlist = async (
    cartItemId
  ) => {

    // Wishlist API can be connected later.
    // Currently removing the item from cart.

    await removeItem(cartItemId);

  };


  // ============================================================
  // CART DATA
  // ============================================================

  const items =
    cart.items || [];


  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (

    <div className="uc-page">

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (

        <div className="uc-cart-page">

          <div className="uc-cart-page__heading">

            <h1>
              Shopping Cart
            </h1>

            <p>
              Loading your cart...
            </p>

          </div>


          <div className="uc-cart-empty">

            <div className="uc-cart-empty__icon">

              <ShoppingCart
                size={40}
                strokeWidth={1.4}
              />

            </div>

            <h2>
              Loading cart
            </h2>

            <p>
              Please wait while we load your products.
            </p>

          </div>

        </div>

      )}


      {/* ======================================================
          ERROR / LOGIN REQUIRED
      ====================================================== */}

      {!loading && error && (

        <div className="uc-cart-page">

          <div className="uc-cart-page__heading">

            <h1>
              Shopping Cart
            </h1>

            <p>
              Review your selected products before placing your order.
            </p>

          </div>


          <div className="uc-cart-empty">

            <div className="uc-cart-empty__icon">

              <ShoppingCart
                size={40}
                strokeWidth={1.4}
              />

            </div>


            <h2>
              {!isLoggedIn
                ? "Login Required"
                : "Unable to load cart"}
            </h2>


            <p>
              {error}
            </p>


            {!isLoggedIn ? (

              <button
                className="uc-btn-primary"
                onClick={() =>
                  navigate("/login")
                }
              >
                Login
              </button>

            ) : (

              <button
                className="uc-btn-primary"
                onClick={loadCart}
              >
                Try Again
              </button>

            )}

          </div>

        </div>

      )}


      {/* ======================================================
          EMPTY CART
      ====================================================== */}

      {!loading &&
        !error &&
        items.length === 0 && (

          <div className="uc-cart-page">

            <div className="uc-cart-page__heading">

              <h1>
                Shopping Cart
              </h1>

              <p>
                Review your selected products before placing your order.
              </p>

            </div>


            <div className="uc-cart-empty">

              <div className="uc-cart-empty__icon">

                <ShoppingCart
                  size={40}
                  strokeWidth={1.4}
                />

              </div>


              <h2>
                Your cart is empty
              </h2>


              <p>
                Looks like you haven&apos;t added anything yet.
              </p>


              <button
                className="uc-btn-primary"
                onClick={() =>
                  navigate("/products")
                }
              >
                Browse Products
              </button>

            </div>

          </div>

        )}


      {/* ======================================================
          MAIN CART
      ====================================================== */}

      {!loading &&
        !error &&
        items.length > 0 && (

          <div className="uc-cart-page">

            <div className="uc-cart-page__heading">

              <h1>
                Shopping Cart
              </h1>

              <p>
                Review your selected products before placing your order.
              </p>

            </div>


            <div className="uc-cart-layout">

              {/* ==================================================
                  CART ITEMS
              ================================================== */}

              <div className="uc-cart-items">

                {items.map((item) => {

                  const originalPrice =
                    Number(item.price || 0) +
                    Number(item.discount || 0);


                  const discountPct =
                    originalPrice > 0 &&
                    item.discount
                      ? Math.round(
                          (
                            Number(item.discount) /
                            originalPrice
                          ) * 100
                        )
                      : 0;


                  const isUpdating =
                    updatingItem ===
                    item.cartItemId;


                  return (

                    <div
                      className="uc-cart-item"
                      key={item.cartItemId}
                    >

                      {/* PRODUCT IMAGE */}

                      <img
                        src={item.image}
                        alt={item.productName}
                        className="uc-cart-item__image"
                      />


                      {/* PRODUCT INFORMATION */}

                      <div className="uc-cart-item__info">

                        <span className="uc-cart-item__brand">
                          {item.brand}
                        </span>


                        <h3 className="uc-cart-item__name">
                          {item.productName}
                        </h3>


                        <div className="uc-cart-item__meta">

                          {item.vendorName && (
                            <span>
                              Sold by {item.vendorName}
                            </span>
                          )}

                          {item.variant && (
                            <span>
                              &middot; {item.variant}
                            </span>
                          )}

                          {item.color && (
                            <span>
                              &middot; {item.color}
                            </span>
                          )}

                        </div>


                        <span
                          className={`uc-cart-item__stock ${
                            item.stock > 0
                              ? "uc-cart-item__stock--in"
                              : "uc-cart-item__stock--out"
                          }`}
                        >

                          {item.stock > 0
                            ? `${item.stock} in stock`
                            : "Out of stock"}

                        </span>


                        {/* ACTIONS */}

                        <div className="uc-cart-item__actions">

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.cartItemId
                              )
                            }
                            disabled={
                              isUpdating
                            }
                          >

                            <Trash2
                              size={14}
                              strokeWidth={1.8}
                            />

                            Remove

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              moveToWishlist(
                                item.cartItemId
                              )
                            }
                            disabled={
                              isUpdating
                            }
                          >

                            <Heart
                              size={14}
                              strokeWidth={1.8}
                            />

                            Move to Wishlist

                          </button>

                        </div>

                      </div>


                      {/* ==================================================
                          QUANTITY
                      ================================================== */}

                      <div className="uc-cart-item__qty">

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.cartItemId,
                              item.quantity,
                              -1,
                              item.stock
                            )
                          }
                          disabled={
                            isUpdating ||
                            item.quantity <= 1
                          }
                          aria-label="Decrease quantity"
                        >

                          <Minus size={14} />

                        </button>


                        <span>

                          {isUpdating
                            ? "..."
                            : item.quantity}

                        </span>


                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.cartItemId,
                              item.quantity,
                              1,
                              item.stock
                            )
                          }
                          disabled={
                            isUpdating ||
                            (
                              item.stock &&
                              item.quantity >=
                                item.stock
                            )
                          }
                          aria-label="Increase quantity"
                        >

                          <Plus size={14} />

                        </button>

                      </div>


                      {/* ==================================================
                          PRICE
                      ================================================== */}

                      <div className="uc-cart-item__price">

                        <span className="uc-cart-item__price-current">

                          &#8377;

                          {Number(
                            item.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </span>


                        {item.discount > 0 && (

                          <>

                            <span className="uc-cart-item__price-original">

                              &#8377;

                              {Number(
                                originalPrice
                              ).toLocaleString(
                                "en-IN"
                              )}

                            </span>


                            <span className="uc-cart-item__price-discount">

                              {discountPct}% off

                            </span>

                          </>

                        )}

                      </div>

                    </div>

                  );

                })}

              </div>


              {/* ==================================================
                  ORDER SUMMARY
              ================================================== */}

              <aside className="uc-cart-summary">

                <h2>
                  Order Summary
                </h2>


                <div className="uc-cart-summary__row">

                  <span>
                    Original Price
                  </span>

                  <span>

                    &#8377;

                    {Number(
                      cart.subtotal || 0
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </span>

                </div>


                <div className="uc-cart-summary__row uc-cart-summary__row--discount">

                  <span>
                    Discount
                  </span>

                  <span>

                    &minus;&#8377;

                    {Number(
                      cart.discount || 0
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </span>

                </div>


                <div className="uc-cart-summary__row">

                  <span>
                    Delivery
                  </span>

                  <span>

                    {cart.delivery === 0
                      ? "Free"
                      : `₹${Number(
                          cart.delivery
                        ).toLocaleString(
                          "en-IN"
                        )}`}

                  </span>

                </div>


                <div className="uc-cart-summary__divider" />


                <div className="uc-cart-summary__row uc-cart-summary__row--total">

                  <span>
                    Total
                  </span>

                  <span>

                    &#8377;

                    {Number(
                      cart.total || 0
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </span>

                </div>


                <button
                  type="button"
                  className="uc-btn-primary uc-cart-summary__cta"
                  onClick={() =>
                    navigate(
                      "/place-order"
                    )
                  }
                >
                  Proceed to Checkout
                </button>


                {/* TRUST */}

                <div className="uc-cart-summary__trust">

                  <div>

                    <ShieldCheck
                      size={16}
                      strokeWidth={1.8}
                    />

                    <span>
                      Secure checkout
                    </span>

                  </div>


                  <div>

                    <BadgeCheck
                      size={16}
                      strokeWidth={1.8}
                    />

                    <span>
                      Verified vendors
                    </span>

                  </div>


                  <div>

                    <RotateCcw
                      size={16}
                      strokeWidth={1.8}
                    />

                    <span>
                      Easy returns
                    </span>

                  </div>

                </div>

              </aside>

            </div>

          </div>

        )}

    </div>

  );
}