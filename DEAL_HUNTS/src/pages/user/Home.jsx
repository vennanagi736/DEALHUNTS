import React, {
  useState,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import { getTrendingDeals } from "../../api/TrendingDealApi";
import { getProductImages } from "../../api/ProductApi";
import { getTrendingCategories } from "../../api/TrendingCategoryApi";

import {
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiSettings,
  FiSearch,
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

   Backend:
   GET /admin/promotions/all

   ONE PRODUCT / IMAGE AT A TIME.
============================================================ */

function TrendingProducts({
  items = [],
}) {
  const [index, setIndex] = useState(0);

  const count = items.length;

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
  }, [count, index]);

  /* ----------------------------------------------------------
     Empty state
  ---------------------------------------------------------- */

  if (count === 0) {
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

  const goTo = (newIndex) => {

    if (newIndex < 0) {
      setIndex(count - 1);
      return;
    }

    if (newIndex >= count) {
      setIndex(0);
      return;
    }

    setIndex(newIndex);
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
        {/* Existing carousel heading intentionally hidden */}
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
              goTo(index - 1)
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
                `translateX(-${index * 100}%)`,
            }}
          >

            {items.map(
              (item, i) => {

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
                      flex: "0 0 100%",
                      width: "100%",
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

                        {price !== undefined &&
                          price !== null && (

                          <p className="pc-trend-price">
                            Best Price{" "}
                            {formatINR(price)}
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
              goTo(index + 1)
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
            (_, i) => (

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
   TRENDING DEALS
============================================================ */

function TrendingDeals({
  deals = [],
  images = {},
  onViewAll,
}) {

  return (

    <section className="pc-trending-deals-section">

      {/* ======================================================
          HEADING + VIEW ALL
      ====================================================== */}

      <div className="pc-trending-deals-heading">

        <h2>
          Trending Deals
        </h2>

        <button
          type="button"
          className="pc-view-all-products"
          onClick={onViewAll}
        >
          View All Products
        </button>

      </div>

      {/* ======================================================
          PRODUCT GRID
      ====================================================== */}

      {deals.length === 0 ? (

        <div className="pc-trending-deals-placeholder">

          <div className="pc-trending-deals-placeholder-content">

            <span>
              No Trending Deals
            </span>

            <p>
              Trending products will appear here.
            </p>

          </div>

        </div>

      ) : (

        <div className="pc-trending-deals-grid">

          {deals.map((deal) => {

            const product =
              deal.product;

            const image =
              product?.id
                ? images[product.id]
                : "";

            return (

              <div
                className="pc-trending-deal-card"
                key={deal.id}
              >

                {/* IMAGE */}

                <div className="pc-trending-deal-image-box">

                  {image ? (

                    <img
                      src={image}
                      alt={
                        product?.name ||
                        "Trending Product"
                      }
                      className="pc-trending-deal-image"
                    />

                  ) : (

                    <div className="pc-trending-deal-no-image">
                      No Image
                    </div>

                  )}

                </div>

                {/* DETAILS */}

                <div className="pc-trending-deal-details">

                  <h3>
                    {product?.name ||
                      "Product"}
                  </h3>

                  <p>
                    {product?.brand ||
                      ""}
                  </p>

                  <span>
                    Position {deal.position}
                  </span>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </section>
  );
}

/* ============================================================
   TRENDING CATEGORIES
============================================================ */

function TrendingCategories({
  categories = [],
  onViewAll,
}) {

  return (

    <section className="pc-trending-categories-section">

      {/* ======================================================
          HEADING + VIEW ALL
      ====================================================== */}

      <div className="pc-trending-categories-heading">

        <h2>
          Trending Categories
        </h2>

        <button
          type="button"
          className="pc-view-all-categories"
          onClick={onViewAll}
        >
          View All Categories
        </button>

      </div>

      {/* ======================================================
          CATEGORY SCROLL BOX
      ====================================================== */}

      {categories.length === 0 ? (

        <div className="pc-trending-categories-empty">

          <span>
            No Trending Categories
          </span>

        </div>

      ) : (

        <div className="pc-trending-categories-scroll">

          {categories.map(
            (item, index) => {

              const category =
                item.category || item;

              const categoryId =
                category?.id ||
                item.categoryId ||
                index;

              const categoryName =
                category?.name ||
                item.categoryName ||
                item.name ||
                "Category";

              return (

                <div
                  className="pc-trending-category-card"
                  key={
                    item.id ||
                    categoryId
                  }
                >

                  <div className="pc-trending-category-content">

                    <h3>
                      {categoryName}
                    </h3>

                    <span>
                      Trending
                    </span>

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}

    </section>
  );
}

/* ============================================================
   HOME
============================================================ */

function Home() {

  const navigate =
    useNavigate();

  const [isLoggedIn] = useState(
    !!localStorage.getItem("userJwtToken")
  );

  /* ==========================================================
     TRENDING CAROUSEL DATA
  ========================================================== */

  const [
    trendingItems,
    setTrendingItems,
  ] = useState([]);

  /* ==========================================================
     TRENDING CATEGORIES
  ========================================================== */

  const [
    trendingCategories,
    setTrendingCategories,
  ] = useState([]);

  /* ==========================================================
     TRENDING DEALS
  ========================================================== */

  const [
    trendingDeals,
    setTrendingDeals,
  ] = useState([]);

  const [
    trendingDealImages,
    setTrendingDealImages,
  ] = useState({});

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
            Array.isArray(response.data)
              ? response.data
              : response.data?.products ||
                response.data?.content ||
                response.data?.promotions ||
                [];

          setTrendingItems(data);

        } catch (err) {

          console.error(
            "Trending carousel error:",
            err
          );

          setTrendingItems([]);

        }

      };

    loadTrending();

  }, []);


  /* ==========================================================
     LOAD TRENDING CATEGORIES
  ========================================================== */

  useEffect(() => {

    const loadTrendingCategories =
      async () => {

        try {

          const response =
            await getTrendingCategories();

          console.log(
            "User Home Trending Categories:",
            response.data
          );

          const categories =
            Array.isArray(response.data)
              ? response.data
              : [];

          setTrendingCategories(
            categories
          );

        } catch (error) {

          console.error(
            "Trending categories error:",
            error
          );

          setTrendingCategories([]);

        }

      };

    loadTrendingCategories();

  }, []);

  /* ==========================================================
     VIEW ALL PRODUCTS
  ========================================================== */

  const handleViewAllProducts =
    () => {

      navigate("/products");

    };

  /* ==========================================================
     VIEW ALL CATEGORIES
  ========================================================== */

  const handleViewAllCategories =
    () => {

      navigate("/categories");

    };

  /* ==========================================================
     LOAD TRENDING DEALS
  ========================================================== */

  useEffect(() => {

    const loadTrendingDeals =
      async () => {

        try {

          const response =
            await getTrendingDeals();

          console.log(
            "User Home Trending Deals:",
            response.data
          );

          const deals =
            Array.isArray(response.data)
              ? response.data
              : [];

          setTrendingDeals(deals);

          const imageMap = {};

          for (const deal of deals) {

            const product =
              deal.product;

            if (!product?.id) {
              continue;
            }

            try {

              const imageResponse =
                await getProductImages(
                  product.id
                );

              console.log(
                "Trending deal images:",
                product.id,
                imageResponse.data
              );

              if (
                Array.isArray(
                  imageResponse.data
                ) &&
                imageResponse.data.length > 0
              ) {

                const firstImage =
                  imageResponse.data[0];

                imageMap[product.id] =
                  firstImage.thumbnailUrl ||
                  firstImage.thumbnailURL ||
                  firstImage.imageUrl ||
                  firstImage.imageURL ||
                  "";

              }

            } catch (imageError) {

              console.error(
                `Failed to fetch image for product ${product.id}:`,
                imageError
              );

            }

          }

          console.log(
            "Trending Deal Image Map:",
            imageMap
          );

          setTrendingDealImages(
            imageMap
          );

        } catch (error) {

          console.error(
            "Trending deals error:",
            error
          );

          setTrendingDeals([]);

          setTrendingDealImages({});

        }

      };

    loadTrendingDeals();

  }, []);

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

            {/* <button
              type="button"
              className="pc-nav-active"
              onClick={() =>
                navigate("/")
              }
            >
              Home
            </button> */}

            <button
              type="button"
              onClick={() =>
                navigate("/products")
              }
            >
              Products
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/wishlist")
              }
            >
              Wishlist
            </button>

          </nav>

          {/* HEADER ACTIONS */}

          <div className="pc-header-actions">
             {/* CART */}

            <button
              type="button"
              className="pc-header-icon"
              onClick={() =>
                navigate("/cart")
              }
              aria-label="Cart"
            >
              <FiShoppingCart />
            </button>

          {isLoggedIn ? (
            <>
              <button
                type="button"
                className="pc-header-icon"
                onClick={() => navigate("/profile")}
                aria-label="Profile"
              >
                <FiUser />
              </button>

              <button
                type="button"
                className="pc-header-icon"
                onClick={() => navigate("/settings")}
                aria-label="Settings"
              >
                <FiSettings />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="pc-header-login"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
          </div>
      </div>
      </header>

      {/* ======================================================
          1. EXISTING TRENDING CAROUSEL

          Backend:
          /admin/promotions/all

          DO NOT CHANGE
      ====================================================== */}

      <TrendingProducts
        items={trendingItems}
      />

      {/* ======================================================
          2. TRENDING DEALS
      ====================================================== */}

      <TrendingDeals
        deals={trendingDeals}
        images={trendingDealImages}
        onViewAll={
          handleViewAllProducts
        }
      />

      {/* ======================================================
          3. TRENDING CATEGORIES
      ====================================================== */}

      <TrendingCategories
        categories={
          trendingCategories
        }
        onViewAll={
          handleViewAllCategories
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