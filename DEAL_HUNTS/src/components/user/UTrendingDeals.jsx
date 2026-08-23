import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";

import "../../styles/TrendingDeals.css";

/* ============================================================
   HELPERS
============================================================ */

function formatINR(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function getDiscount(price, originalPrice) {
  const current = Number(price) || 0;
  const original = Number(originalPrice) || 0;

  if (
    original <= current ||
    original === 0
  ) {
    return 0;
  }

  return Math.round(
    ((original - current) / original) * 100
  );
}

function getProductImage(product) {
  return (
    product.image ||
    product.imageUrl ||
    product.productImage ||
    product.thumbnail ||
    product.imagePath ||
    ""
  );
}

function getProductName(product) {
  return (
    product.name ||
    product.productName ||
    product.title ||
    "Product"
  );
}

/* ============================================================
   RESPONSIVE VISIBLE COUNT

   Desktop      > 1100px = 4
   Tablet       801-1100  = 3
   Small tablet 561-800   = 2
   Mobile       <= 560    = 1
============================================================ */

function getVisibleCount() {
  if (window.innerWidth <= 560) {
    return 1;
  }

  if (window.innerWidth <= 800) {
    return 2;
  }

  if (window.innerWidth <= 1100) {
    return 3;
  }

  return 4;
}

/* ============================================================
   TRENDING DEALS
============================================================ */

function TrendingDeals({
  products = [],
}) {

  /* ==========================================================
     CURRENT CAROUSEL POSITION
  ========================================================== */

  const [currentIndex, setCurrentIndex] =
    useState(0);

  /* ==========================================================
     RESPONSIVE VISIBLE COUNT
  ========================================================== */

  const [visibleCount, setVisibleCount] =
    useState(() => {

      if (
        typeof window === "undefined"
      ) {
        return 4;
      }

      return getVisibleCount();
    });

  /* ==========================================================
     HANDLE SCREEN SIZE CHANGE
  ========================================================== */

  useEffect(() => {

    const handleResize = () => {

      setVisibleCount(
        getVisibleCount()
      );

    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };

  }, []);

  /* ==========================================================
     TRENDING PRODUCTS

     Currently first 12 products.

     Later:
     Replace with backend trending API.
  ========================================================== */

  const trendingProducts = useMemo(() => {

    return products.slice(0, 12);

  }, [products]);

  /* ==========================================================
     CAROUSEL LIMIT
  ========================================================== */

  const totalProducts =
    trendingProducts.length;

  const maxIndex =
    Math.max(
      0,
      totalProducts - visibleCount
    );

  /* ==========================================================
     KEEP CURRENT INDEX VALID

     Example:

     Desktop:
     4 visible
     maxIndex = 8

     Change to mobile:
     1 visible
     maxIndex = 11

     Or reverse.
  ========================================================== */

  useEffect(() => {

    setCurrentIndex(
      (previous) =>
        Math.min(
          previous,
          maxIndex
        )
    );

  }, [
    maxIndex,
  ]);

  /* ==========================================================
     PRODUCTS CHANGE

     If completely different products are loaded,
     make sure carousel starts from a valid position.
  ========================================================== */

  useEffect(() => {

    setCurrentIndex(0);

  }, [
    products,
  ]);

  /* ==========================================================
     PREVIOUS
  ========================================================== */

  const goPrevious = () => {

    setCurrentIndex(
      (previous) =>
        Math.max(
          0,
          previous - 1
        )
    );

  };

  /* ==========================================================
     NEXT
  ========================================================== */

  const goNext = () => {

    setCurrentIndex(
      (previous) =>
        Math.min(
          maxIndex,
          previous + 1
        )
    );

  };

  /* ==========================================================
     DOTS

     Example with 12 products:

     Desktop:
     12 - 4 + 1 = 9 positions

     Tablet:
     12 - 3 + 1 = 10 positions

     Small tablet:
     12 - 2 + 1 = 11 positions

     Mobile:
     12 - 1 + 1 = 12 positions
  ========================================================== */

  const totalPositions =
    Math.max(
      1,
      maxIndex + 1
    );

  /* ==========================================================
     EMPTY STATE
  ========================================================== */

  if (
    trendingProducts.length === 0
  ) {

    return (
      <section className="trending-deals">

        <div className="trending-deals-heading">

          <span className="trending-deals-label">
            TRENDING
          </span>

          <h2>
            Trending Deals
          </h2>

          <p>
            Discover products everyone
            is looking for right now.
          </p>

        </div>

        <div className="trending-deals-empty">
          No trending deals available.
        </div>

      </section>
    );
  }

  /* ==========================================================
     MAIN UI
  ========================================================== */

  return (
    <section className="trending-deals">

      {/* =====================================================
          HEADING
      ===================================================== */}

      <div className="trending-deals-heading">

        <div>

          <span className="trending-deals-label">
            TRENDING
          </span>

          <h2>
            Trending Deals
          </h2>

          <p>
            Discover products everyone
            is looking for right now.
          </p>

        </div>

        <button
          type="button"
          className="trending-view-all"
        >
          View All
        </button>

      </div>

      {/* =====================================================
          CAROUSEL
      ===================================================== */}

      <div className="trending-carousel">

        {/* =================================================
            PREVIOUS
        ================================================= */}

        <button
          type="button"
          className="trending-arrow trending-arrow-left"
          onClick={goPrevious}
          disabled={
            currentIndex === 0
          }
          aria-label="Previous trending deals"
        >
          <FiChevronLeft />
        </button>

        {/* =================================================
            VIEWPORT
        ================================================= */}

        <div className="trending-viewport">

          <div
            className="trending-track"
            style={{
              transform: `translateX(-${
                currentIndex *
                (100 / visibleCount)
              }%)`,
            }}
          >

            {trendingProducts.map(
              (product, index) => {

                const image =
                  getProductImage(
                    product
                  );

                const name =
                  getProductName(
                    product
                  );

                const price =
                  product.price ??
                  product.discountedPrice ??
                  product.offerPrice ??
                  product.bestPrice ??
                  0;

                const originalPrice =
                  product.originalPrice ??
                  product.mrp ??
                  product.oldPrice ??
                  0;

                const rating =
                  Number(
                    product.rating
                  ) || 0;

                const reviewCount =
                  product.reviewCount ||
                  product.reviews ||
                  0;

                const discount =
                  getDiscount(
                    price,
                    originalPrice
                  );

                return (
                  <article
                    className="trending-slide"
                    key={
                      product.id ||
                      product.productId ||
                      index
                    }
                  >

                    {/* ==================================
                        PRODUCT CARD
                    ================================== */}

                    <div className="trending-product-card">

                      {/* IMAGE */}

                      <div className="trending-product-image">

                        {image ? (

                          <img
                            src={image}
                            alt={name}
                            loading="lazy"
                          />

                        ) : (

                          <div className="trending-image-placeholder">
                            No Image
                          </div>

                        )}

                        {/* DISCOUNT */}

                        {discount > 0 && (

                          <span className="trending-discount">
                            {discount}% OFF
                          </span>

                        )}

                        {/* WISHLIST */}

                        <button
                          type="button"
                          className="trending-wishlist"
                          aria-label={`Add ${name} to wishlist`}
                        >
                          <FiHeart />
                        </button>

                      </div>

                      {/* DETAILS */}

                      <div className="trending-product-details">

                        {/* CATEGORY */}

                        <span className="trending-product-category">
                          {product.category ||
                            "Product"}
                        </span>

                        {/* NAME */}

                        <h3
                          title={name}
                          className="trending-product-name"
                        >
                          {name}
                        </h3>

                        {/* RATING */}

                        <div className="trending-rating">

                          <span className="trending-stars">
                            ★
                          </span>

                          <span>
                            {rating.toFixed(1)}
                          </span>

                          <span className="trending-review-count">
                            (
                            {Number(
                              reviewCount
                            ).toLocaleString(
                              "en-IN"
                            )}
                            )
                          </span>

                        </div>

                        {/* PRICE */}

                        <div className="trending-price-row">

                          <span className="trending-current-price">
                            {formatINR(
                              price
                            )}
                          </span>

                          {Number(
                            originalPrice
                          ) >
                            Number(
                              price
                            ) && (

                            <span className="trending-original-price">
                              {formatINR(
                                originalPrice
                              )}
                            </span>

                          )}

                        </div>

                        {/* CART */}

                        <button
                          type="button"
                          className="trending-cart-button"
                        >
                          <FiShoppingCart />
                          Add to Cart
                        </button>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        </div>

        {/* =================================================
            NEXT
        ================================================= */}

        <button
          type="button"
          className="trending-arrow trending-arrow-right"
          onClick={goNext}
          disabled={
            currentIndex >= maxIndex
          }
          aria-label="Next trending deals"
        >
          <FiChevronRight />
        </button>

      </div>

      {/* =====================================================
          DOTS
      ===================================================== */}

      {totalPositions > 1 && (

        <div className="trending-dots">

          {Array.from({
            length: totalPositions,
          }).map((_, index) => (

            <button
              key={index}
              type="button"
              className={`trending-dot ${
                index === currentIndex
                  ? "trending-dot-active"
                  : ""
              }`}
              onClick={() =>
                setCurrentIndex(
                  index
                )
              }
              aria-label={`Go to trending position ${
                index + 1
              }`}
            />

          ))}

        </div>

      )}

    </section>
  );
}

export default TrendingDeals;