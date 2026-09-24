import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Heart,
  ShoppingCart,
} from "lucide-react";

import { FiArrowLeft } from "react-icons/fi";

import {
  getWishlist,
  removeFromWishlist,
  addToWishlist,
} from "../../api/WishlistApi";

import "../../styles/Wishlist.css";

export default function Wishlist() {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  // ============================================================
  // LOGIN CHECK
  // ============================================================

  const isLoggedIn =
    !!localStorage.getItem("userJwtToken");

  // ============================================================
  // LOAD WISHLIST ON PAGE LOAD
  // ============================================================

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    loadWishlist();
  }, [isLoggedIn]);

  // ============================================================
  // GET WISHLIST
  // ============================================================

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getWishlist();

      setItems(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load wishlist:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem(
          "userJwtToken"
        );

        navigate("/login");
        return;
      }

      setError(
        "Unable to load your wishlist. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ADD TO WISHLIST
  // ============================================================

  const handleAddToWishlist = async (
    productId
  ) => {
    if (
      productId === null ||
      productId === undefined
    ) {
      return;
    }

    const alreadyExists = items.some(
      (item) =>
        String(item.productId) ===
        String(productId)
    );

    if (alreadyExists) {
      return;
    }

    try {
      setError("");

      await addToWishlist(productId);

      const data =
        await getWishlist();

      setItems(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to add product to wishlist:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem(
          "userJwtToken"
        );

        navigate("/login");
        return;
      }

      /*
       * Product may already exist in wishlist.
       * Refresh silently in case backend
       * returned 409.
       */

      if (
        err.response?.status === 409
      ) {
        try {
          const data =
            await getWishlist();

          setItems(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (
          refreshError
        ) {
          console.error(
            "Failed to refresh wishlist:",
            refreshError
          );
        }

        return;
      }

      setError(
        "Unable to add the product to wishlist."
      );
    }
  };

  // ============================================================
  // REMOVE FROM WISHLIST
  // ============================================================

  const handleRemove = async (
    productId
  ) => {
    if (
      productId === null ||
      productId === undefined
    ) {
      return;
    }

    try {
      setRemovingId(productId);
      setError("");

      await removeFromWishlist(
        productId
      );

      /*
       * Remove immediately from UI.
       */

      setItems((prev) =>
        prev.filter(
          (item) =>
            String(
              item.productId
            ) !==
            String(productId)
        )
      );
    } catch (err) {
      console.error(
        "Failed to remove wishlist item:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem(
          "userJwtToken"
        );

        navigate("/login");
        return;
      }

      setError(
        "Unable to remove the product from wishlist."
      );
    } finally {
      setRemovingId(null);
    }
  };

  // ============================================================
  // ADD TO CART
  // ============================================================

  const handleAddToCart = (
    productId
  ) => {
    /*
     * Connect your cart API here when
     * the inventory/cart flow is ready.
     */

    console.log(
      "Add to cart:",
      productId
    );
  };

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="pc-page-user">

      {/* ======================================================
          WISHLIST CONTENT
      ====================================================== */}

      <main className="wishlist-page-user">

        {!isLoggedIn ? (

          /* ==================================================
             LOGIN REQUIRED
          ================================================== */

          <div className="wishlist-empty-user">

            <div className="wishlist-empty__icon-user">

              <Heart
                size={40}
                strokeWidth={1.4}
              />

            </div>

            <h2>
              Login to view your wishlist
            </h2>

            <p>
              Sign in to save products and
              manage your wishlist.
            </p>

            <button
              type="button"
              className="btn-primary-user"
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>

          </div>

        ) : (

          <>

            {/* ====================================================
                PAGE HEADING
            ==================================================== */}

            <div className="wishlist-page__heading-user">

              <div className="wishlist-page__heading-content-user">

                <h1>
                  My Wishlist
                </h1>

                <p>
                  Save products and keep an eye on
                  their prices.
                </p>

              </div>

              <button
                type="button"
                className="products-back-user"
                onClick={() =>
                  navigate("/home")
                }
              >
                <FiArrowLeft />
                Back to Home
              </button>

            </div>


            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (
              <div className="wishlist-error-user">
                {error}
              </div>
            )}


            {/* ====================================================
                LOADING
            ==================================================== */}

            {loading ? (

              <div className="wishlist-empty-user">

                <div className="wishlist-empty__icon-user">

                  <Heart
                    size={40}
                    strokeWidth={1.4}
                  />

                </div>

                <h2>
                  Loading wishlist...
                </h2>

                <p>
                  Please wait while we load
                  your saved products.
                </p>

              </div>

            ) : items.length === 0 ? (

              /* ==================================================
                 EMPTY WISHLIST
              ================================================== */

              <div className="wishlist-empty-user">

                <div className="wishlist-empty__icon-user">

                  <Heart
                    size={40}
                    strokeWidth={1.4}
                  />

                </div>

                <h2>
                  Your wishlist is empty
                </h2>

                <p>
                  Save products here to compare
                  prices and track your favorite deals.
                </p>

                <button
                  type="button"
                  className="btn-primary-user"
                  onClick={() =>
                    navigate("/products")
                  }
                >
                  Explore Products
                </button>

              </div>

            ) : (

              /* ==================================================
                 WISHLIST GRID
              ================================================== */

              <div className="wishlist-grid-user">

                {items.map(
                  (item) => (

                    <article
                      className="wishlist-card-user"
                      key={item.id}
                    >

                      {/* ==========================================
                          PRODUCT IMAGE
                      ========================================== */}

                      <div className="wishlist-card__image-wrap-user">

                        <img
                          src={
                            item.thumbnailUrl ||
                            item.imageUrl ||
                            "/placeholder-product.png"
                          }
                          alt={
                            item.name ||
                            "Product"
                          }
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              "/placeholder-product.png";
                          }}
                        />


                        {/* ========================================
                            REMOVE FROM WISHLIST
                        ======================================== */}

                        <button
                          type="button"
                          className="wishlist-card__remove-user"
                          onDoubleClick={(
                            event
                          ) => {
                            event.preventDefault();
                            event.stopPropagation();

                            if (
                              removingId ===
                              item.productId
                            ) {
                              return;
                            }

                            handleRemove(
                              item.productId
                            );
                          }}
                          onClick={(
                            event
                          ) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          disabled={
                            removingId ===
                            item.productId
                          }
                          aria-label="Remove from wishlist"
                          title="Double-click to remove from wishlist"
                        >

                          <Heart
                            size={16}
                            strokeWidth={2}
                            fill="currentColor"
                          />

                        </button>

                      </div>


                      {/* ==========================================
                          PRODUCT BODY
                      ========================================== */}

                      <div className="wishlist-card__body-user">

                        {/* BRAND */}

                        {item.brand && (
                          <span className="wishlist-card__brand-user">
                            {item.brand}
                          </span>
                        )}


                        {/* PRODUCT NAME */}

                        <h3 className="wishlist-card__name-user">
                          {item.name}
                        </h3>


                        {/* RATING */}

                        {item.rating !==
                          undefined &&
                          item.rating !==
                            null && (

                          <div className="wishlist-card__rating-user">

                            <span>
                              ★
                            </span>

                            <span>
                              {Number(
                                item.rating
                              ).toFixed(
                                1
                              )}
                            </span>

                            {item.reviewCount !==
                              undefined && (

                              <span>
                                (
                                {
                                  item.reviewCount
                                }
                                )
                              </span>

                            )}

                          </div>

                        )}


                        {/* PRICE */}

                        <div className="wishlist-card__price-row-user">

                          <span className="wishlist-card__price-user">

                            ₹
                            {Number(
                              item.basePrice ||
                              0
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </span>

                          {item.originalPrice && (

                            <span className="wishlist-card__price-original-user">

                              ₹
                              {Number(
                                item.originalPrice
                              ).toLocaleString(
                                "en-IN"
                              )}

                            </span>

                          )}

                        </div>


                        {/* SAVINGS */}

                        {item.discount && (

                          <span className="wishlist-card__savings-user">

                            Save{" "}
                            {
                              item.discount
                            }%

                          </span>

                        )}


                        {/* CATEGORY */}

                        {item.category && (

                          <div className="wishlist-card__vendors-user">
                            {
                              item.category
                            }
                          </div>

                        )}


                        {/* ACTIONS */}

                        <div className="wishlist-card__actions-user">

                          {/* ====================================
                              VIEW COMPARISON
                          ==================================== */}

                          <button
                            type="button"
                            className="btn-secondary-user"
                            onClick={() =>
                              navigate(
                                `/compare/${item.productId}`
                              )
                            }
                          >
                            View Comparison
                          </button>


                          {/* ====================================
                              ADD TO CART
                          ==================================== */}

                          <button
                            type="button"
                            className="btn-primary-user"
                            onClick={() =>
                              handleAddToCart(
                                item.productId
                              )
                            }
                          >

                            <ShoppingCart
                              size={14}
                              strokeWidth={2}
                            />

                            Add to Cart

                          </button>

                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </>

        )}

      </main>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      {/* <footer className="pc-footer-user">

        <strong>
          DEALHUNTS
        </strong>

        <span>
          © 2026 DealHunts. All rights reserved.
        </span>

      </footer> */}

    </div>
  );
}