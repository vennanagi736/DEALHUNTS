import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiArrowLeft,
  FiSettings,
  FiSearch,
} from "react-icons/fi";

import Sidebar from "../../components/Sidebar";
import "../../styles/UProduct.css";

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
     IMAGE
  ---------------------------------------------------------- */

  const productImageSrc = image || "";

  /* ----------------------------------------------------------
     PRICE
  ---------------------------------------------------------- */

  const currentPrice = Number(price) || 0;
  const discountPercent = Number(discount) || 0;

  /*
   * Backend gives:
   *
   * price = selling price
   * discount = percentage
   *
   * Example:
   * price = 140000
   * discount = 5
   *
   * Original price =
   * 140000 / (1 - 5 / 100)
   */

  const originalPrice =
    discountPercent > 0 && discountPercent < 100
      ? currentPrice / (1 - discountPercent / 100)
      : 0;

  return (
    <article
      className="products-card"
      onClick={() => onProductClick(id)}
    >

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
          onClick={(event) => {
            event.stopPropagation();
            onToggleWishlist(id);
          }}
        >
          <FiHeart />
        </button>

        {/* DISCOUNT */}

        {discountPercent > 0 && (
          <span className="products-discount">
            {discountPercent}% OFF
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

        {/* BRAND */}

        <p className="products-brand-name">
          {brand || "Unknown Brand"}
        </p>

        {/* CATEGORY */}

        <p className="products-category">
          {category || "Unknown Category"}
        </p>

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
            {formatINR(currentPrice)}
          </span>

          {originalPrice > currentPrice && (
            <span className="products-old-price">
              {formatINR(Math.round(originalPrice))}
            </span>
          )}

        </div>

        {/* CART */}

        <button
  type="button"
  className="products-add-cart"
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();
    onAddToCart(product);
  }}
>
  <FiShoppingCart />
  Add to Cart
</button>

        {/* <button
          type="button"
          className="products-add-cart"
          onClick={(event) => {
            event.stopPropagation();
            onAddToCart(product);
          }}
        >
          <FiShoppingCart />
          Add to Cart
        </button> */}

      </div>

    </article>
  );
}

/* ============================================================
   PRODUCTS PAGE
============================================================ */

function Products() {

  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [isLoggedIn] = useState(
    !!localStorage.getItem("userJwtToken")
  );

  /* ==========================================================
     PRODUCT CLICK
  ========================================================== */

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  /* ==========================================================
     PRODUCTS
  ========================================================== */

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredProducts = products.filter((product) => {
  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  return (
    product.name?.toLowerCase().includes(search) ||
    product.brand?.toLowerCase().includes(search) ||
    product.category?.toLowerCase().includes(search)
  );
});

  /* ==========================================================
     FETCH PRODUCTS FROM BACKEND
  ========================================================== */

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:8080/admin/products/cards"
        );

        console.log(
          "Products received from backend:",
          response.data
        );

        setProducts(response.data);

      } catch (error) {

        console.error(
          "Failed to fetch products:",
          error
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
  ========================================================== */
const handleAddToCart = async (product) => {

  console.log("========== ADD TO CART START ==========");
  console.log("Product:", product);

  try {

    // ============================================================
    // CHECK LOGIN
    // ============================================================

    const token =
      localStorage.getItem("userJwtToken");

    if (!token) {

      alert(
        "Please login to add products to your cart."
      );

      navigate("/login");

      return;
    }


    // ============================================================
    // GET AVAILABLE VENDORS
    // ============================================================

    const vendorResponse =
      await axios.get(
        `http://localhost:8080/inventory/product/${product.id}/vendors`
      );

    console.log(
      "VENDOR RESPONSE:",
      vendorResponse.data
    );


    const inventories =
      vendorResponse.data;


    // ============================================================
    // CHECK INVENTORY
    // ============================================================

    if (
      !inventories ||
      inventories.length === 0
    ) {

      alert(
        "This product is currently out of stock."
      );

      return;
    }


    // ============================================================
    // FIRST INVENTORY = CHEAPEST VENDOR
    //
    // Backend sorts vendors by finalPrice ASC.
    // ============================================================

    const inventory =
      inventories[0];


    console.log(
      "SELECTED INVENTORY:",
      inventory
    );

    console.log(
      "Inventory ID:",
      inventory.inventoryId
    );

    console.log(
      "Vendor:",
      inventory.shopName
    );

    console.log(
      "Final Price:",
      inventory.finalPrice
    );


    // ============================================================
    // ADD TO CART
    // ============================================================

    const cartResponse =
      await axios.post(
        "http://localhost:8080/cart/add",

        {
          inventoryId:
            inventory.inventoryId,

          quantity: 1
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          }
        }
      );


    // ============================================================
    // SUCCESS
    // ============================================================

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


    // ============================================================
    // UNAUTHORIZED
    // ============================================================

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


    // ============================================================
    // BACKEND ERROR
    // ============================================================

    const message =
      error.response?.data?.message ||
      error.response?.data ||
      "Unable to add product to cart.";


    alert(message);
  }
};

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="products-page">

     {/* ======================================================
    HEADER — SAME AS HOME
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
      onClick={() => navigate("/")}
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
  <div className="pc-header-center">
     {/* NAVIGATION */}

  <nav className="pc-header-nav">

    <button
      type="button"
      onClick={() =>
        navigate("/home")
      }
    >
      Home
    </button>

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

  </div>

{/* ====================================================
    RIGHT SIDE
==================================================== */}

<div className="pc-header-right">

  {/* SEARCH */}

<div className="pc-search-box">

  <input
    type="text"
    placeholder="Search"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />

  <button
    type="button"
    className="pc-search-btn"
    aria-label="Search"
  >
    <FiSearch />
  </button>

</div>

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


    {/* LOGGED IN */}

    {isLoggedIn ? (
      <>

        <button
          type="button"
          className="pc-header-icon"
          onClick={() =>
            navigate("/profile")
          }
          aria-label="Profile"
        >
          <FiUser />
        </button>

        <button
          type="button"
          className="pc-header-icon"
          onClick={() =>
            navigate("/settings")
          }
          aria-label="Settings"
        >
          <FiSettings />
        </button>

      </>
    ) : (

      <button
        type="button"
        className="pc-header-login"
        onClick={() =>
          navigate("/login")
        }
      >
        Login
      </button>

    )}

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
            {filteredProducts.length} products
          </p>

        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (

          <div className="products-empty">

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

          <div className="products-empty">

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

            <div className="products-grid">

              {filteredProducts.map((product) => (

                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={
                    wishlist.has(product.id)
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

              ))}

            </div>

          )}

        {/* ====================================================
            EMPTY
        ==================================================== */}

        {!loading &&
  !error &&
  filteredProducts.length === 0 && (

  <div className="products-empty">

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