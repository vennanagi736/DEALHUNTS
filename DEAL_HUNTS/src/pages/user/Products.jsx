import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiArrowLeft,
} from "react-icons/fi";

import Sidebar from "../../components/Sidebar";
import "../../styles/UProduct.css";
import fakeProducts from "../../data/FakeProducts";

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

  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

/* ============================================================
   STAR RATING
============================================================ */

function StarRating({ value = 0 }) {
  const rating = Number(value) || 0;

  return (
    <span className="products-stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={
            index < Math.round(rating)
              ? "products-star active"
              : "products-star"
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
}) {
  const {
    id,
    name,
    image,
    imageUrl,
    productImage,
    thumbnail,
    rating = 0,
    reviewCount = 0,
    price,
    originalPrice,
  } = product;

  /* ----------------------------------------------------------
     IMAGE
  ---------------------------------------------------------- */

  const productImageSrc =
    image ||
    imageUrl ||
    productImage ||
    thumbnail ||
    "";

  /* ----------------------------------------------------------
     PRICE
  ---------------------------------------------------------- */

  const currentPrice = Number(price) || 0;
  const oldPrice = Number(originalPrice) || 0;

  /* ----------------------------------------------------------
     DISCOUNT
  ---------------------------------------------------------- */

  const discount =
    oldPrice > currentPrice
      ? Math.round(
          ((oldPrice - currentPrice) / oldPrice) * 100
        )
      : 0;

  return (
    <article className="products-card">

      {/* ======================================================
          IMAGE
      ====================================================== */}

      <div className="products-card-image">

        {productImageSrc ? (
          <img
            src={productImageSrc}
            alt={name || "Product"}
            loading="lazy"
          />
        ) : (
          <div className="products-image-placeholder">
            No Image
          </div>
        )}

        {/* WISHLIST */}

        <button
          type="button"
          className={`products-wishlist ${
            isWishlisted
              ? "products-wishlist-active"
              : ""
          }`}
          onClick={() => onToggleWishlist(id)}
        >
          <FiHeart />
        </button>

        {/* DISCOUNT */}

        {discount > 0 && (
          <span className="products-discount">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* ======================================================
          DETAILS
      ====================================================== */}

      <div className="products-card-body">

        {/* NAME */}

        <h3
          className="products-name"
          title={name}
        >
          {name || "Unnamed Product"}
        </h3>

        {/* RATING */}

        <div className="products-rating">

          <StarRating value={rating} />

          <span>
            {Number(rating || 0).toFixed(1)}
          </span>

          <span className="products-review-count">
            ({Number(reviewCount || 0)})
          </span>

        </div>

        {/* PRICE */}

        <div className="products-price-row">

          <span className="products-price">
            {formatINR(price)}
          </span>

          {oldPrice > currentPrice && (
            <span className="products-old-price">
              {formatINR(originalPrice)}
            </span>
          )}

        </div>

        {/* CART */}

        <button
          type="button"
          className="products-add-cart"
          onClick={() => onAddToCart(product)}
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

  /* ==========================================================
     PRODUCTS
     
     FOR NOW:
     Directly use fakeProducts.
     NO API.
     NO AXIOS.
     NO TOKEN.
  ========================================================== */

  const [products] = useState(fakeProducts);

  /* ==========================================================
     WISHLIST
  ========================================================== */

  const [wishlist, setWishlist] = useState(
    () => new Set()
  );

  const toggleWishlist = (id) => {
    setWishlist((previous) => {

      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  /* ==========================================================
     CART
     
     FOR NOW:
     Just display a message.
     No backend/cart API.
  ========================================================== */

  const handleAddToCart = (product) => {
    console.log("Add to cart:", product);

    // Later we can connect this to your backend.
  };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="products-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="products-header">

        {/* LEFT */}

        <div className="products-header-left">

          <div className="products-sidebar">
            <Sidebar />
          </div>

          <div
            className="products-brand"
            onClick={() => navigate("/")}
          >

            <div className="products-logo">

              <span className="products-logo-deal">
                DEAL
              </span>

              <span className="products-logo-hunts">
                HUNTS
              </span>

            </div>

            <span className="products-tagline">
              Hunt deals, save money
            </span>

          </div>

        </div>

        {/* RIGHT */}

        <div className="products-header-right">

          <nav className="products-nav">

            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Home
            </button>

            <button
              type="button"
              className="products-nav-active"
            >
              Products
            </button>

            <button
              type="button"
              onClick={() => navigate("/wishlist")}
            >
              Wishlist
            </button>

          </nav>

          <div className="products-actions">

            <button
              type="button"
              className="products-icon-button"
              onClick={() => navigate("/profile")}
            >
              <FiUser />
            </button>

            <button
              type="button"
              className="products-icon-button"
              onClick={() => navigate("/cart")}
            >
              <FiShoppingCart />
            </button>

          </div>

        </div>

      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="products-main">

        {/* BACK BUTTON */}

        <button
          type="button"
          className="products-back"
          onClick={() => navigate("/")}
        >
          <FiArrowLeft />
          Back to Home
        </button>

        {/* TITLE */}

        <div className="products-title-section">

          <h1>
            All Products
          </h1>

          <p>
            {products.length} products
          </p>

        </div>

        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        {products.length > 0 ? (

          <div className="products-grid">

            {products.map((product) => (

              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.has(product.id)}
                onToggleWishlist={toggleWishlist}
                onAddToCart={handleAddToCart}
              />

            ))}

          </div>

        ) : (

          /* ==================================================
             EMPTY
          ================================================== */

          <div className="products-empty">

            <h2>
              No products found
            </h2>

            <p>
              There are no products available right now.
            </p>

          </div>

        )}

      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="products-footer">

        <strong>
          DEALHUNTS
        </strong>

        <span>
          © 2026 DealHunts. All rights reserved.
        </span>

      </footer>

    </div>
  );
}

export default Products;