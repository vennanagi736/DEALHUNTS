import React, {
  useState,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
} from "react-icons/fi";

import Sidebar from "../../components/Sidebar";

import "../../styles/Home.css";

const API_BASE = "http://localhost:8080";

/* ============================================================
   HELPERS
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
   TRENDING PRODUCTS CAROUSEL

   THIS IS THE EXISTING CORRECT CAROUSEL.

   Backend:
   GET /admin/promotions/all

   ONE PRODUCT / IMAGE AT A TIME.
============================================================ */

function TrendingProducts({
  items = [],
}) {
  const [index, setIndex] =
    useState(0);

  const count =
    items.length;

  /* ----------------------------------------------------------
     Keep index valid when items change
  ---------------------------------------------------------- */

  useEffect(() => {
    if (
      count === 0 ||
      index >= count
    ) {
      setIndex(0);
    }
  }, [
    count,
    index,
  ]);

  /* ----------------------------------------------------------
     Empty state
  ---------------------------------------------------------- */

  if (
    count === 0
  ) {
    return (
      <section className="pc-trending-section">

        <div className="pc-section-heading">
          <h2>
            Trending Deals
          </h2>
        </div>

        <div className="pc-trending-empty">
          No trending products right now.
        </div>

      </section>
    );
  }

  /* ----------------------------------------------------------
     Navigation
  ---------------------------------------------------------- */

  const goTo = (
    newIndex
  ) => {

    if (
      newIndex < 0
    ) {
      setIndex(
        count - 1
      );

      return;
    }

    if (
      newIndex >= count
    ) {
      setIndex(0);

      return;
    }

    setIndex(
      newIndex
    );
  };

  /* ----------------------------------------------------------
     UI
  ---------------------------------------------------------- */

  return (
    <section className="pc-trending-section">

      {/* ======================================================
          HEADING
      ====================================================== */}

      <div className="pc-section-heading">

        <h2>
          Trending Deals
        </h2>

      </div>

      {/* ======================================================
          LARGE CAROUSEL
      ====================================================== */}

      <div className="pc-trending-carousel">

        {/* PREVIOUS */}

        {count > 1 && (
          <button
            type="button"
            className="pc-trending-arrow pc-trending-prev"
            onClick={() =>
              goTo(
                index - 1
              )
            }
            aria-label="Previous trending product"
          >
            <FiChevronLeft />
          </button>
        )}

        {/* ====================================================
            VIEWPORT
        ==================================================== */}

        <div className="pc-trend-viewport">

          <div
            className="pc-trend-track"
            style={{
              transform:
                `translateX(-${
                  index * 100
                }%)`,
            }}
          >

            {items.map(
              (
                item,
                i
              ) => {

                const image =
                  item.image ||
                  item.imageUrl ||
                  item.productImage ||
                  item.thumbnail ||
                  item.imagePath ||
                  "";

                const name =
                  item.name ||
                  item.productName ||
                  item.title ||
                  "Product";

                const price =
                  item.price ??
                  item.bestPrice ??
                  item.discountedPrice ??
                  item.offerPrice;

                return (
                  <div
                    className="pc-trend-slide"
                    key={
                      item.id ||
                      item.productId ||
                      i
                    }
                    style={{
                      flex:
                        "0 0 100%",
                      width:
                        "100%",
                    }}
                  >

                    <div className="pc-trend-card">

                      {/* IMAGE */}

                      <div className="pc-trend-image-box">

                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            className="pc-trend-image"
                          />
                        ) : (
                          <div className="pc-trend-image-fallback">
                            No Image
                          </div>
                        )}

                      </div>

                      {/* DETAILS */}

                      <div className="pc-trend-details">

                        <p
                          className="pc-trend-name"
                          title={name}
                        >
                          {name}
                        </p>

                        {price !==
                          undefined &&
                          price !==
                            null && (
                            <p className="pc-trend-price">
                              Best Price{" "}
                              {formatINR(
                                price
                              )}
                            </p>
                          )}

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* ====================================================
            NEXT
        ==================================================== */}

        {count > 1 && (
          <button
            type="button"
            className="pc-trending-arrow pc-trending-next"
            onClick={() =>
              goTo(
                index + 1
              )
            }
            aria-label="Next trending product"
          >
            <FiChevronRight />
          </button>
        )}

      </div>

      {/* ======================================================
          DOTS
      ====================================================== */}

      {count > 1 && (
        <div className="pc-trend-dots">

          {items.map(
            (
              _,
              i
            ) => (
              <button
                type="button"
                key={i}
                className={`pc-trend-dot ${
                  i === index
                    ? "pc-trend-dot-active"
                    : ""
                }`}
                onClick={() =>
                  goTo(i)
                }
                aria-label={`Go to trending product ${
                  i + 1
                }`}
              />
            )
          )}

        </div>
      )}

    </section>
  );
}

/* ============================================================
   TRENDING DEALS PLACEHOLDER

   IMPORTANT:

   This is NOT connected to backend yet.

   Later you can replace the placeholder content with:
   - 4 products per row
   - product cards
   - discounts
   - newly added products
   - etc.

   For now we only create the structure/space.
============================================================ */

function TrendingDealsPlaceholder({
  onViewAll,
}) {
  return (
    <section className="pc-trending-deals-section">

      {/* ======================================================
          HEADING
      ====================================================== */}

      <div className="pc-section-heading">

        <h2>
          Trending Deals
        </h2>

      </div>

      {/* ======================================================
          EMPTY BACKGROUND BOX

          PLACEHOLDER FOR FUTURE PRODUCT GRID
      ====================================================== */}

      <div className="pc-trending-deals-placeholder">

        <div className="pc-trending-deals-placeholder-content">

          <span>
            Trending Deals
          </span>

          <p>
            Products will appear here.
          </p>

        </div>

      </div>

      {/* ======================================================
          VIEW ALL PRODUCTS
      ====================================================== */}

      <div className="pc-view-all-products-wrapper">

        <button
          type="button"
          className="pc-view-all-products-btn"
          onClick={onViewAll}
        >
          View All Products
        </button>

      </div>

    </section>
  );
}

/* ============================================================
   HOME
============================================================ */

function Home() {

  const navigate =
    useNavigate();

  /* ==========================================================
     TRENDING CAROUSEL DATA

     EXISTING BACKEND ONLY
  ========================================================== */

  const [
    trendingItems,
    setTrendingItems,
  ] = useState([]);

  /* ==========================================================
     LOAD EXISTING TRENDING CAROUSEL

     GET /admin/promotions/all
  ========================================================== */

  useEffect(() => {

    const loadTrending =
      async () => {

        try {

          const response =
            await axios.get(
              `${API_BASE}/admin/promotions/all`
            );

          const data =
            Array.isArray(
              response.data
            )
              ? response.data
              : response.data
                  ?.products ||
                response.data
                  ?.content ||
                response.data
                  ?.promotions ||
                [];

          setTrendingItems(
            data
          );

        } catch (err) {

          console.error(
            "Trending carousel error:",
            err
          );

          setTrendingItems(
            []
          );
        }
      };

    loadTrending();

  }, []);

  /* ==========================================================
     VIEW ALL PRODUCTS
  ========================================================== */

  const handleViewAllProducts =
    () => {

      navigate(
        "/products"
      );

    };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="pc-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="pc-header">

        {/* ====================================================
            LEFT SIDE
        ==================================================== */}

        <div className="pc-header-left">

          {/* SIDEBAR */}

          <div className="pc-header-sidebar">

            <Sidebar />

          </div>

          {/* BRAND */}

          <div
            className="pc-brand"
            onClick={() =>
              navigate("/")
            }
          >

            <div className="pc-logo">

              <span className="pc-logo-deal">
                DEAL
              </span>

              <span className="pc-logo-hunts">
                HUNTS
              </span>

            </div>

            <div className="pc-header-tagline">
              Hunt deals, save money
            </div>

          </div>

        </div>

        {/* ====================================================
            RIGHT SIDE
        ==================================================== */}

        <div className="pc-header-right">

          {/* NAVIGATION */}

          <nav className="pc-header-nav">

            <button
              type="button"
              className="pc-nav-active"
              onClick={() =>
                navigate("/")
              }
            >
              Home
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/products"
                )
              }
            >
              Products
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/wishlist"
                )
              }
            >
              Wishlist
            </button>

          </nav>

          {/* HEADER ACTIONS */}

          <div className="pc-header-actions">

            {/* PROFILE */}

            <button
              type="button"
              className="pc-header-icon"
              onClick={() =>
                navigate(
                  "/profile"
                )
              }
              aria-label="Profile"
            >
              <FiUser />
            </button>

            {/* CART */}

            <button
              type="button"
              className="pc-header-icon"
              onClick={() =>
                navigate(
                  "/cart"
                )
              }
              aria-label="Cart"
            >
              <FiShoppingCart />
            </button>

          </div>

        </div>

      </header>

      {/* ======================================================
          1. EXISTING TRENDING CAROUSEL

          Backend:
          /admin/promotions/all

          DO NOT CHANGE THIS
      ====================================================== */}

      <TrendingProducts
        items={
          trendingItems
        }
      />

      {/* ======================================================
          2. TRENDING DEALS

          PLACEHOLDER ONLY

          NO BACKEND YET
      ====================================================== */}

      <TrendingDealsPlaceholder
        onViewAll={
          handleViewAllProducts
        }
      />

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="pc-footer">

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

export default Home;