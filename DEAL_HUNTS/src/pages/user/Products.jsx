import React, { useEffect, useState } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import Popup from "../../components/Popup";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  FiShoppingCart,
  FiArrowLeft,
  FiBookmark,
} from "react-icons/fi";

import "../../styles/UProduct.css";

/* ============================================================
   API
============================================================ */

const API_BASE_URL = "http://localhost:8080";

/* ============================================================
   FORMAT PRICE
============================================================ */

function formatINR(amount) {
  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return "—";
  }

  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return "—";
  }

  return `₹${numericAmount.toLocaleString("en-IN")}`;
}

/* ============================================================
   SAFE DISPLAY VALUE
============================================================ */

function displayValue(value, fallback = "—") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.title ||
      value?.label ||
      fallback
    );
  }

  return String(value);
}

/* ============================================================
   STAR RATING
============================================================ */

function StarRating({ value = 0 }) {
  const rating = Number(value) || 0;

  return (
    <span className="dh-products-stars-user">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={
            index < Math.round(rating)
              ? "dh-products-star-user dh-products-star-active-user"
              : "dh-products-star-user"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}

/* ============================================================
   PRODUCT CARD
============================================================ */

function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onProductClick,
}) {
  const {
    id,
    name,
    brand,
    category,
    image,
    rating = 0,
    reviewCount = 0,
    price,
    discount = 0,
  } = product;

  /* ----------------------------------------------------------
     SAFE DISPLAY VALUES
  ---------------------------------------------------------- */

  const productName = displayValue(
    name,
    "Unnamed Product"
  );

  const brandName = displayValue(
    brand,
    "Unknown Brand"
  );

  const categoryName = displayValue(
    category,
    "Unknown Category"
  );

  /* ----------------------------------------------------------
     IMAGE
  ---------------------------------------------------------- */

  const productImageSrc =
    typeof image === "string"
      ? image
      : image?.url ||
        image?.imageUrl ||
        "";

  /* ----------------------------------------------------------
     PRICE
  ---------------------------------------------------------- */

  const currentPrice =
    Number(price) || 0;

  const discountPercent =
    Number(discount) || 0;

  const originalPrice =
    discountPercent > 0 &&
    discountPercent < 100
      ? currentPrice /
        (1 - discountPercent / 100)
      : 0;

  return (
    <article
      className="dh-products-card-user"
      onClick={() =>
        onProductClick(id)
      }
    >
      {/* ======================================================
          IMAGE
      ====================================================== */}

      <div className="dh-products-card-image-user">

        {productImageSrc ? (
          <img
            src={productImageSrc}
            alt={productName}
            loading="lazy"
          />
        ) : (
          <div className="dh-products-image-placeholder-user">
            No Image
          </div>
        )}

        {/* DISCOUNT */}

        {discountPercent > 0 && (
          <span className="dh-products-discount-user">
            {discountPercent}% OFF
          </span>
        )}

        {/* WISHLIST */}

        <button
          type="button"
          className={`dh-products-wishlist-user ${
            isWishlisted
              ? "dh-products-wishlist-active-user"
              : ""
          }`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            onToggleWishlist(id);
          }}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          title={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <FiBookmark />
        </button>

      </div>

      {/* ======================================================
          DETAILS
      ====================================================== */}

      <div className="dh-products-card-body-user">

        {/* NAME */}

        <h3
          className="dh-products-name-user"
          title={productName}
        >
          {productName}
        </h3>

        {/* BRAND */}

        <p className="dh-products-brand-name-user">
          {brandName}
        </p>

        {/* CATEGORY */}

        <p className="dh-products-category-user">
          {categoryName}
        </p>

        {/* RATING */}

        <div className="dh-products-rating-user">

          <StarRating value={rating} />

          <span>
            {Number(rating || 0).toFixed(1)}
          </span>

          <span className="dh-products-review-count-user">
            ({Number(reviewCount || 0)})
          </span>

        </div>

        {/* PRICE */}

        <div className="dh-products-price-row-user">

          <span className="dh-products-price-user">
            {formatINR(currentPrice)}
          </span>

          {originalPrice > currentPrice && (
            <span className="dh-products-old-price-user">
              {formatINR(
                Math.round(originalPrice)
              )}
            </span>
          )}

        </div>

        {/* ADD TO CART */}

        <button
          type="button"
          className="dh-products-add-cart-user"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            onAddToCart(product);
          }}
        >
          <FiShoppingCart />
          Add to Cart
        </button>

      </div>
    </article>
  );
}

/* ============================================================
   PRODUCTS PAGE
============================================================ */

function Products() {
  const navigate = useNavigate();

  const [wishlistLoginPopup, setWishlistLoginPopup] =
    useState(false);

  const [searchParams] =
    useSearchParams();

  /* ==========================================================
     SEARCH FROM HEADER
  ========================================================== */

  const query =
    searchParams.get("search") || "";

  /* ==========================================================
     PRODUCTS
  ========================================================== */

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ==========================================================
     WISHLIST
  ========================================================== */

  const [wishlist, setWishlist] =
    useState(() => new Set());

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  /* ==========================================================
     PRODUCT CLICK
  ========================================================== */

  const handleProductClick = (productId) => {
    if (
      productId === null ||
      productId === undefined
    ) {
      return;
    }

    navigate(`/products/${productId}`);
  };

  /* ==========================================================
     FILTER PRODUCTS
  ========================================================== */

  const filteredProducts =
    products.filter((product) => {
      const search =
        query.trim().toLowerCase();

      if (!search) {
        return true;
      }

      const productName =
        displayValue(
          product?.name,
          ""
        ).toLowerCase();

      const brandName =
        displayValue(
          product?.brand,
          ""
        ).toLowerCase();

      const categoryName =
        displayValue(
          product?.category,
          ""
        ).toLowerCase();

      return (
        productName.includes(search) ||
        brandName.includes(search) ||
        categoryName.includes(search)
      );
    });

  /* ==========================================================
     FETCH PRODUCTS
  ========================================================== */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axios.get(
            `${API_BASE_URL}/admin/products/cards`
          );

        console.log(
          "Products received from backend:",
          response.data
        );

        if (Array.isArray(response.data)) {
          setProducts(
            response.data
          );
        } else if (
          Array.isArray(
            response.data?.content
          )
        ) {
          setProducts(
            response.data.content
          );
        } else {
          console.error(
            "Unexpected products response:",
            response.data
          );

          setProducts([]);

          setError(
            "Invalid product data received from server."
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch products:",
          error
        );

        console.error(
          "Backend response:",
          error.response?.data
        );

        setError(
          "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ==========================================================
     LOAD WISHLIST FROM BACKEND
  ========================================================== */

  useEffect(() => {
    const fetchWishlist = async () => {
      const token =
        localStorage.getItem(
          "userJwtToken"
        );

      if (!token) {
        setWishlist(
          new Set()
        );

        return;
      }

      try {
        console.log(
          "========== FETCH WISHLIST =========="
        );

        const response =
          await axios.get(
            `${API_BASE_URL}/wishlist`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        console.log(
          "Wishlist response:",
          response.data
        );

        const wishlistItems =
          Array.isArray(response.data)
            ? response.data
            : [];

        const productIds =
          wishlistItems
            .map((item) => {
              const productId =
                item?.productId;

              if (
                productId === null ||
                productId === undefined
              ) {
                return null;
              }

              return String(
                productId
              );
            })
            .filter(Boolean);

        setWishlist(
          new Set(productIds)
        );

        console.log(
          "Loaded wishlist product IDs:",
          productIds
        );
      } catch (error) {
        console.error(
          "Failed to load wishlist:",
          error
        );

        console.error(
          "Wishlist backend response:",
          error.response?.data
        );

        setWishlist(
          new Set()
        );
      }
    };

    fetchWishlist();
  }, []);

  /* ==========================================================
     TOGGLE WISHLIST
  ========================================================== */

  const toggleWishlist =
    async (productId) => {
      if (
        productId === null ||
        productId === undefined
      ) {
        console.error(
          "Invalid product ID for wishlist:",
          productId
        );

        return;
      }

      const token =
        localStorage.getItem(
          "userJwtToken"
        );

      /* ======================================================
         LOGIN CHECK
      ====================================================== */

      if (!token) {
        setWishlistLoginPopup(true);
        return;
      }

      const normalizedProductId =
        String(productId);

      const alreadyWishlisted =
        wishlist.has(
          normalizedProductId
        );

      try {
        setWishlistLoading(
          true
        );

        console.log(
          "========== WISHLIST ACTION =========="
        );

        console.log(
          "Product ID:",
          normalizedProductId
        );

        console.log(
          "Already wishlisted:",
          alreadyWishlisted
        );

        /* ==================================================
           REMOVE
        ================================================== */

        if (alreadyWishlisted) {
          const response =
            await axios.delete(
              `${API_BASE_URL}/wishlist/remove/${normalizedProductId}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          console.log(
            "Wishlist remove response:",
            response.data
          );

          setWishlist(
            (previous) => {
              const next =
                new Set(previous);

              next.delete(
                normalizedProductId
              );

              return next;
            }
          );

          console.log(
            "Removed from wishlist."
          );
        }

        /* ==================================================
           ADD
        ================================================== */

        else {
          const response =
            await axios.post(
              `${API_BASE_URL}/wishlist/add/${normalizedProductId}`,
              {},
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,

                  "Content-Type":
                    "application/json",
                },
              }
            );

          console.log(
            "Wishlist add response:",
            response.data
          );

          setWishlist(
            (previous) => {
              const next =
                new Set(previous);

              next.add(
                normalizedProductId
              );

              return next;
            }
          );

          console.log(
            "Added to wishlist."
          );
        }
      } catch (error) {
        console.error(
          "========== WISHLIST ERROR =========="
        );

        console.error(
          "Wishlist error:",
          error
        );

        console.error(
          "Wishlist backend response:",
          error.response?.data
        );

        /* ==================================================
           SESSION EXPIRED
        ================================================== */

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem(
            "userJwtToken"
          );

          setWishlist(
            new Set()
          );

          alert(
            "Your session has expired. Please login again."
          );

          navigate("/login");

          return;
        }

        /* ==================================================
           BACKEND MESSAGE
        ================================================== */

        let message =
          "Unable to update wishlist.";

        if (
          typeof error.response?.data ===
          "string"
        ) {
          message =
            error.response.data;
        } else if (
          error.response?.data?.message
        ) {
          message =
            error.response.data.message;
        }

        alert(message);
      } finally {
        setWishlistLoading(
          false
        );
      }
    };

  /* ==========================================================
     ADD TO CART
  ========================================================== */

  const handleAddToCart =
    async (product) => {
      console.log(
        "========== ADD TO CART START =========="
      );

      console.log(
        "Product:",
        product
      );

      try {
        /* ====================================================
           CHECK LOGIN
        ==================================================== */

        const token =
          localStorage.getItem(
            "userJwtToken"
          );

        if (!token) {
          alert(
            "Please login to add products to your cart."
          );

          navigate("/login");

          return;
        }

        /* ====================================================
           VALIDATE PRODUCT
        ==================================================== */

        if (
          !product ||
          !product.id
        ) {
          alert(
            "Invalid product."
          );

          return;
        }

        /* ====================================================
           GET AVAILABLE VENDORS
        ==================================================== */

        const vendorResponse =
          await axios.get(
            `${API_BASE_URL}/inventory/product/${product.id}/vendors`
          );

        console.log(
          "VENDOR RESPONSE:",
          vendorResponse.data
        );

        const inventories =
          Array.isArray(
            vendorResponse.data
          )
            ? vendorResponse.data
            : [];

        /* ====================================================
           CHECK INVENTORY
        ==================================================== */

        if (
          inventories.length === 0
        ) {
          alert(
            "This product is currently out of stock."
          );

          return;
        }

        /* ====================================================
           FIRST INVENTORY
        ==================================================== */

        const inventory =
          inventories[0];

        console.log(
          "SELECTED INVENTORY:",
          inventory
        );

        /* ====================================================
           VALIDATE INVENTORY ID
        ==================================================== */

        if (
          !inventory.inventoryId
        ) {
          alert(
            "Unable to identify the selected inventory."
          );

          return;
        }

        /* ====================================================
           ADD TO CART
        ==================================================== */

        const cartResponse =
          await axios.post(
            `${API_BASE_URL}/cart/add`,
            {
              inventoryId:
                inventory.inventoryId,

              quantity: 1,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        /* ====================================================
           SUCCESS
        ==================================================== */

        console.log(
          "CART RESPONSE:",
          cartResponse.data
        );

        console.log(
          "========== ADD TO CART END =========="
        );

        alert(
          "Product added to cart!"
        );
      } catch (error) {
        console.error(
          "========== ADD TO CART ERROR =========="
        );

        console.error(
          "ERROR:",
          error
        );

        console.error(
          "ERROR RESPONSE:",
          error.response?.data
        );

        /* ==================================================
           UNAUTHORIZED
        ================================================== */

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem(
            "userJwtToken"
          );

          alert(
            "Your session has expired. Please login again."
          );

          navigate("/login");

          return;
        }

        /* ==================================================
           BACKEND ERROR MESSAGE
        ================================================== */

        let message =
          "Unable to add product to cart.";

        if (
          typeof error.response?.data ===
          "string"
        ) {
          message =
            error.response.data;
        } else if (
          error.response?.data?.message
        ) {
          message =
            error.response.data.message;
        }

        alert(message);
      }
    };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="dh-products-page-user">

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="dh-products-main-user">

        {/* BACK */}

        <button
          type="button"
          className="dh-products-back-home-user"
          onClick={() =>
            navigate("/home")
          }
        >
          <FiArrowLeft />
          Back to Home
        </button>

        {/* ====================================================
            TITLE
        ==================================================== */}

        <div className="dh-products-title-section-user">

          <h1>
            All Products
          </h1>

          <p>
            {filteredProducts.length} products
          </p>

        </div>

        {/* ====================================================
            SEARCH RESULT
        ==================================================== */}

        {query.trim() && (
          <div className="dh-products-search-result-user">

            Showing results for:

            <strong>
              {" "}
              "{query}"
            </strong>

          </div>
        )}

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="dh-products-empty-user">

            <h2>
              Loading products...
            </h2>

            <p>
              Please wait while we load the latest products.
            </p>

          </div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {!loading && error && (
          <div className="dh-products-empty-user">

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

          </div>
        )}

        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <div className="dh-products-grid-user">

              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={
                      wishlist.has(
                        String(product.id)
                      )
                    }
                    onToggleWishlist={
                      toggleWishlist
                    }
                    onAddToCart={
                      handleAddToCart
                    }
                    onProductClick={
                      handleProductClick
                    }
                  />
                )
              )}

            </div>
          )}

        {/* ====================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="dh-products-empty-user">

              <h2>
                {query.trim()
                  ? "No products found"
                  : "No products available"}
              </h2>

              <p>
                {query.trim()
                  ? `No products match "${query}".`
                  : "There are no active products available right now."}
              </p>

            </div>
          )}

      </main>

      {/* ======================================================
          WISHLIST LOGIN POPUP
          RENDERED DIRECTLY INTO BODY
      ====================================================== */}

      {createPortal(
        <Popup
          open={wishlistLoginPopup}
          title="Sign in to continue"
          onClose={() =>
            setWishlistLoginPopup(false)
          }
          width="400px"
          className="wishlist-login-popup"
        >
          <p>
            Please login to use your wishlist.
          </p>

          <div className="wishlist-popup-actions">

            <button
              type="button"
              className="wishlist-proceed-login"
              onClick={() => {
                setWishlistLoginPopup(false);
                navigate("/login");
              }}
            >
              Proceed to Login
            </button>

            <button
              type="button"
              className="wishlist-no-thanks"
              onClick={() =>
                setWishlistLoginPopup(false)
              }
            >
              No Thanks
            </button>

          </div>
        </Popup>,
        document.body
      )}

      {/* ======================================================
          FOOTER
      ====================================================== */}

      {/*
      <footer className="dh-products-footer-user">

        <strong>
          DEALHUNTS
        </strong>

        <span>
          © 2026 DealHunts. All rights reserved.
        </span>

      </footer>
      */}

    </div>
  );
}

export default Products;