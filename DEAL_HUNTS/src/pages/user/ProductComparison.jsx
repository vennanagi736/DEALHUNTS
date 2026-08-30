import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
  FiShoppingCart,
  FiUser,
  FiArrowLeft,
  FiTruck,
  FiShield,
  FiCreditCard,
  FiRefreshCw,
  FiMapPin,
  FiCheck,
} from "react-icons/fi";

import Sidebar from "../../components/Sidebar";

import "../../styles/UProductComparison.css";


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

  const number = Number(amount);

  if (Number.isNaN(number)) {
    return "—";
  }

  return `₹${number.toLocaleString("en-IN")}`;
}


/* ============================================================
   STAR RATING
============================================================ */

function StarRating({ value = 0 }) {
  const rating = Number(value) || 0;

  return (
    <span className="pc-stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={
            index < Math.round(rating)
              ? "pc-star active"
              : "pc-star"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}


/* ============================================================
   PRODUCT IMAGE
============================================================ */

function getProductImage(product) {
  if (product?.thumbnailUrl) {
    return product.thumbnailUrl;
  }

  if (
    Array.isArray(product?.images) &&
    product.images.length > 0
  ) {
    const firstImage = product.images.find(
      (image) => image?.thumbnailUrl
    );

    if (firstImage?.thumbnailUrl) {
      return firstImage.thumbnailUrl;
    }
  }

  return "";
}


/* ============================================================
   PRODUCT IMAGES
============================================================ */

function getProductImages(product) {
  if (
    Array.isArray(product?.images) &&
    product.images.length > 0
  ) {
    return product.images
      .map((image) => image?.thumbnailUrl)
      .filter(Boolean);
  }

  if (product?.thumbnailUrl) {
    return [product.thumbnailUrl];
  }

  return [];
}


/* ============================================================
   PRODUCT OVERVIEW
============================================================ */

function ProductOverview({
  product,
  vendors,
  onAddToCart,
  onBuyNow,
  onBookVisit,
}) {
  const image = getProductImage(product);
  const productImages = getProductImages(product);

  const rating = Number(product?.rating) || 0;


  /* ==========================================================
     BEST PRICE
  ========================================================== */

  const bestPrice =
    vendors.length > 0
      ? Math.min(
          ...vendors
            .map((vendor) => Number(vendor.sellingPrice))
            .filter((price) => !Number.isNaN(price) && price > 0)
        )
      : null;


  /* ==========================================================
     MAX SAVING
  ========================================================== */

  const maxSaving =
    vendors.length > 0
      ? Math.max(
          ...vendors.map((vendor) => {
            const sellingPrice =
              Number(vendor.sellingPrice) || 0;

            const discount =
              Number(vendor.discount) || 0;

            if (
              sellingPrice <= 0 ||
              discount <= 0 ||
              discount >= 100
            ) {
              return 0;
            }

            const originalPrice =
              sellingPrice /
              (1 - discount / 100);

            return Math.max(
              0,
              originalPrice - sellingPrice
            );
          })
        )
      : 0;


  return (
    <section className="pc-overview">

      <div className="pc-overview-grid">

        {/* ====================================================
            IMAGE GALLERY
        ==================================================== */}

        <div className="pc-gallery">

          {/* MAIN IMAGE */}

          <div className="pc-gallery-main">

            {image ? (
              <img
                src={image}
                alt={product?.name || "Product"}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="pc-gallery-placeholder">
                No Image
              </div>
            )}

          </div>


          {/* THUMBNAILS */}

          <div className="pc-gallery-thumbs">

            {productImages.length > 0 ? (

              productImages.map((thumbnail, index) => (
                <div
                  key={`${thumbnail}-${index}`}
                  className={`pc-gallery-thumb ${
                    index === 0 ? "active" : ""
                  }`}
                >
                  <img
                    src={thumbnail}
                    alt={`${product?.name || "Product"} ${
                      index + 1
                    }`}
                  />
                </div>
              ))

            ) : image ? (

              <div className="pc-gallery-thumb active">
                <img
                  src={image}
                  alt={product?.name || "Product"}
                />
              </div>

            ) : (

              <div className="pc-gallery-thumb">
                <span>No Image</span>
              </div>

            )}

          </div>

        </div>


        {/* ====================================================
            PRODUCT INFORMATION
        ==================================================== */}

        <div className="pc-product-info">

          {/* BRAND + RATING */}

          <div className="pc-brand-row">

            <span className="pc-brand-pill">
              {product?.brand || "Brand"}
            </span>

            <span className="pc-rating">

              <StarRating value={rating} />

              <strong>
                {rating.toFixed(1)}
              </strong>

              <span>
                (
                {Number(product?.reviewCount || 0)}
                )
              </span>

            </span>

          </div>


          {/* PRODUCT NAME */}

          <h1 className="pc-product-title">
            {product?.name || "Product Name"}
          </h1>


          {/* SUBTITLE */}

          <p className="pc-product-subtitle">
            Compare prices from multiple
            verified shops and find the
            best deal.
          </p>


          {/* ==================================================
              KEY SPECIFICATIONS
          ================================================== */}

          <div className="pc-spec-strip">

            {/* PROCESSOR */}

            <div className="pc-spec-chip">

              <span>Processor</span>

              <strong>
                {product?.processor || "—"}
              </strong>

            </div>


            {/* RAM */}

            <div className="pc-spec-chip">

              <span>RAM</span>

              <strong>
                {product?.variants?.length > 0
                  ? product.variants
                      .map((variant) => variant.ram)
                      .filter(Boolean)
                      .join(" / ")
                  : "—"}
              </strong>

            </div>


            {/* STORAGE */}

            <div className="pc-spec-chip">

              <span>Storage</span>

              <strong>
                {product?.variants?.length > 0
                  ? product.variants
                      .map((variant) => variant.storage)
                      .filter(Boolean)
                      .join(" / ")
                  : "—"}
              </strong>

            </div>


            {/* DISPLAY */}

            <div className="pc-spec-chip">

              <span>Display</span>

              <strong>
                {product?.displaySize || "—"}
              </strong>

            </div>


            {/* BATTERY */}

            <div className="pc-spec-chip">

              <span>Battery</span>

              <strong>
                {product?.battery || "—"}
              </strong>

            </div>

          </div>


          {/* ==================================================
              BEST PRICE
          ================================================== */}

          <div className="pc-best-price">

            <div>

              <span className="pc-best-price-label">
                Best price found across{" "}
                {vendors.length} shops
              </span>

              <strong>
                {formatINR(bestPrice)}

                <small>
                  {" "}onwards
                </small>
              </strong>

            </div>

            {maxSaving > 0 && (
              <span className="pc-save-badge">
                Save up to{" "}
                {formatINR(Math.round(maxSaving))}
              </span>
            )}

          </div>


          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <p className="pc-product-description">
            {product?.description ||
              "Compare prices, delivery options, warranty, payment methods and return policies from different shops before purchasing."}
          </p>


          {/* ==================================================
              PRODUCT ACTIONS
          ================================================== */}

          <div className="pc-product-actions">

            <button
              type="button"
              className="pc-action-button pc-action-button--cart"
              onClick={onAddToCart}
            >
              <FiShoppingCart />
              Add to Cart
            </button>


            <button
              type="button"
              className="pc-action-button pc-action-button--buy"
              onClick={onBuyNow}
            >
              Buy Now
            </button>


            <button
              type="button"
              className="pc-action-button pc-action-button--visit"
              onClick={onBookVisit}
            >
              <FiMapPin />
              Book Visit
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}


/* ============================================================
   TOP 5 VENDORS
============================================================ */

function TopFiveVendors({
  vendors
}) {
  const navigate = useNavigate();

  const bestPrice =
    vendors.length > 0
      ? Number(vendors[0].sellingPrice) || 0
      : 0;


  return (
    <section className="pc-section">

      <div className="pc-top5-banner">

        {/* HEADER */}

        <div className="pc-top5-header">

          <div>

            <span className="pc-section-eyebrow">
              Price comparison
            </span>

            <h2>
              🏆 Top 5 Lowest-Price Shops
            </h2>

            <p>
              Compare the cheapest available
              offers from verified vendors.
            </p>

          </div>

          <div className="pc-live-badge">
            <span />
            Live Prices
          </div>

        </div>


        {/* VENDOR CARDS */}

        <div className="pc-top5-grid">

          {vendors
            .slice(0, 5)
            .map((vendor, index) => {

              const sellingPrice =
                Number(vendor.sellingPrice) || 0;

              const difference =
                sellingPrice - bestPrice;

              const isBest =
                index === 0;

              const discount =
                Number(vendor.discount) || 0;

              let originalPrice = 0;

              if (
                discount > 0 &&
                discount < 100
              ) {
                originalPrice =
                  sellingPrice /
                  (1 - discount / 100);
              }


              return (
                <div
                  className={`pc-rank-card ${
                    isBest ? "best" : ""
                  }`}
                  key={
                    vendor.inventoryId ||
                    `${vendor.vendorId}-${index}`
                  }
                >

                  {/* RANK */}

                  <div className="pc-rank-number">
                    {index + 1}
                  </div>


                  {/* BEST BADGE */}

                  {isBest && (
                    <div className="pc-best-badge">
                      🏆 Best Price
                    </div>
                  )}


                  {/* SHOP */}

                  <div className="pc-rank-shop">
                    {vendor.shopName || "Shop"}
                  </div>


                  {/* RATING */}

                  <div className="pc-rank-meta">

                    <StarRating value={0} />

                    <span>
                      New
                    </span>

                  </div>


                  {/* PRICE */}

                  <div className="pc-rank-price">
                    {formatINR(sellingPrice)}
                  </div>


                  {/* OLD PRICE */}

                  {originalPrice > sellingPrice && (
                    <div className="pc-rank-old-price">
                      {formatINR(
                        Math.round(originalPrice)
                      )}
                    </div>
                  )}


                  {/* DIFFERENCE */}

                  {isBest ? (
                    <div className="pc-rank-difference best">
                      Cheapest available
                    </div>
                  ) : (
                    <div className="pc-rank-difference more">
                      +
                      {formatINR(difference)}
                      {" "}more
                    </div>
                  )}


                  {/* STOCK */}

                  <div className="pc-rank-stock">

                    <span />

                    {Number(vendor.stock) > 0
                      ? `${vendor.stock} available`
                      : "Out of Stock"}

                  </div>


                  {/* BUTTON */}

                  <button
                    type="button"
                    className="pc-rank-button"
                    onClick={() => {
                      console.log(
                        "Selected Vendor:",
                        vendor
                      );

                      navigate(
                        `/shop/${
                          vendor.vendorId ||
                          vendor.id
                        }`
                      );
                    }}
                  >
                    View Deal
                  </button>

                </div>
              );
            })}

        </div>

      </div>

    </section>
  );
}


/* ============================================================
   DETAILED COMPARISON
============================================================ */

function DetailedComparison({
  vendors
}) {
  const navigate = useNavigate();

  const bestPrice =
    vendors.length > 0
      ? Number(vendors[0].sellingPrice) || 0
      : 0;


  return (
    <section className="pc-section">

      {/* HEADING */}

      <div className="pc-section-heading">

        <div>

          <span className="pc-section-eyebrow">
            Full breakdown
          </span>

          <h2>
            Detailed Price Comparison
          </h2>

          <p>
            Compare price, delivery,
            warranty, payment and
            return options.
          </p>

        </div>

      </div>


      {/* DEAL LIST */}

      <div className="pc-deal-list">

        {vendors.map((vendor, index) => {

          const sellingPrice =
            Number(vendor.sellingPrice) || 0;

          const difference =
            sellingPrice - bestPrice;

          const isBest =
            index === 0;

          const discount =
            Number(vendor.discount) || 0;

          let originalPrice = 0;

          if (
            discount > 0 &&
            discount < 100
          ) {
            originalPrice =
              sellingPrice /
              (1 - discount / 100);
          }


          return (
            <article
              className={`pc-deal-card ${
                isBest ? "best" : ""
              }`}
              key={
                vendor.inventoryId ||
                `${vendor.vendorId}-${index}`
              }
            >

              {/* SHOP */}

              <div className="pc-deal-shop">

                <div className="pc-shop-mark">

                  {vendor.shopName
                    ?.substring(0, 2)
                    .toUpperCase() ||
                    "SH"}

                </div>


                <div>

                  <div className="pc-shop-name-row">

                    <span className="pc-shop-name">
                      {vendor.shopName || "Shop"}
                    </span>

                    {isBest && (
                      <span className="pc-best-tag">
                        🏆 Best Price
                      </span>
                    )}

                  </div>


                  <div className="pc-shop-rating">

                    <StarRating value={0} />

                    <strong>
                      New
                    </strong>

                    <span>
                      Verified vendor
                    </span>

                    <span className="pc-verified">
                      <FiCheck />
                      Verified Seller
                    </span>

                  </div>

                </div>

              </div>


              {/* PRICE */}

              <div className="pc-deal-price">

                <div>

                  <strong>
                    {formatINR(sellingPrice)}
                  </strong>

                  {originalPrice > sellingPrice && (
                    <span>
                      {formatINR(
                        Math.round(originalPrice)
                      )}
                    </span>
                  )}

                </div>


                {discount > 0 && (
                  <span className="pc-discount">
                    {discount}% OFF
                  </span>
                )}


                <div
                  className={
                    isBest
                      ? "pc-price-difference best"
                      : "pc-price-difference"
                  }
                >
                  {isBest
                    ? "✓ Cheapest available"
                    : `▲ ${formatINR(
                        difference
                      )} more than best`}
                </div>

              </div>


              {/* META */}

              <div className="pc-deal-meta">

                {/* DELIVERY */}

                <div className="pc-meta-item">

                  <FiTruck />

                  Delivery:

                  <strong>
                    {vendor.deliveryTime ||
                      "Not specified"}
                  </strong>

                </div>


                {/* WARRANTY */}

                <div className="pc-meta-item">

                  <FiShield />

                  Warranty:

                  <strong>
                    {vendor.warranty ||
                      "Not specified"}
                  </strong>

                </div>


                {/* COD */}

                <div className="pc-meta-item">

                  <FiCreditCard />

                  COD:

                  <strong
                    className={
                      vendor.cod
                        ? "yes"
                        : "no"
                    }
                  >
                    {vendor.cod
                      ? "Available"
                      : "Not available"}
                  </strong>

                </div>


                {/* EMI */}

                <div className="pc-meta-item">

                  <FiCreditCard />

                  EMI:

                  <strong
                    className={
                      vendor.emi
                        ? "yes"
                        : "no"
                    }
                  >
                    {vendor.emi
                      ? "Available"
                      : "Not available"}
                  </strong>

                </div>


                {/* RETURNS */}

                <div className="pc-meta-item">

                  <FiRefreshCw />

                  Returns:

                  <strong>
                    {vendor.returnPolicy ||
                      "Not specified"}
                  </strong>

                </div>


                {/* PICKUP */}

                <div className="pc-meta-item">

                  <FiMapPin />

                  Pickup:

                  <strong
                    className={
                      vendor.storePickup
                        ? "yes"
                        : "no"
                    }
                  >
                    {vendor.storePickup
                      ? "Available"
                      : "Not available"}
                  </strong>

                </div>


                {/* EXCHANGE */}

                <div className="pc-meta-item">

                  <FiRefreshCw />

                  Exchange:

                  <strong
                    className={
                      vendor.exchange
                        ? "yes"
                        : "no"
                    }
                  >
                    {vendor.exchange
                      ? "Available"
                      : "Not available"}
                  </strong>

                </div>

              </div>


              {/* ACTION */}

              <div className="pc-deal-action">

                <button
                  type="button"
                  className="pc-view-deal"
                  onClick={() => {
                    console.log(
                      "Selected vendor:",
                      vendor
                    );

                    navigate(
                      `/shop/${
                        vendor.vendorId ||
                        vendor.id
                      }`
                    );
                  }}
                >
                  View Deal →
                </button>


                <span>

                  ●{" "}

                  {Number(vendor.stock) > 0
                    ? `${vendor.stock} in stock`
                    : "Out of stock"}

                </span>

              </div>

            </article>
          );
        })}

      </div>

    </section>
  );
}


/* ============================================================
   PRODUCT SPECIFICATIONS
============================================================ */

function ProductSpecifications({
  product
}) {

  const ramValues =
    product?.variants
      ?.map((variant) => variant.ram)
      .filter(Boolean)
      .join(" / ");


  const storageValues =
    product?.variants
      ?.map((variant) => variant.storage)
      .filter(Boolean)
      .join(" / ");


  const specifications = [
    [
      "Brand",
      product?.brand
    ],

    [
      "Processor",
      product?.processor
    ],

    [
      "RAM",
      ramValues
    ],

    [
      "Storage",
      storageValues
    ],

    [
      "Display",
      product?.displaySize
    ],

    [
      "Battery",
      product?.battery
    ],

    [
      "Category",
      product?.category
    ],
  ];


  return (
    <section className="pc-section">

      {/* HEADING */}

      <div className="pc-section-heading">

        <div>

          <span className="pc-section-eyebrow">
            Under the hood
          </span>

          <h2>
            Product Details
          </h2>

        </div>

      </div>


      {/* SPECIFICATIONS */}

      <div className="pc-specifications-panel">

        <div className="pc-specifications-grid">

          {specifications.map(
            ([label, value]) => (

              <div
                className="pc-spec-row"
                key={label}
              >

                <span>
                  {label}
                </span>

                <strong>
                  {value || "—"}
                </strong>

              </div>

            )
          )}

        </div>

      </div>

    </section>
  );
}


/* ============================================================
   PRODUCT DESCRIPTION
============================================================ */

function ProductDescription({
  product
}) {

  return (
    <section className="pc-section">

      {/* HEADING */}

      <div className="pc-section-heading">

        <div>

          <span className="pc-section-eyebrow">
            About this product
          </span>

          <h2>
            Product Description
          </h2>

        </div>

      </div>


      {/* DESCRIPTION */}

      <div className="pc-description-panel">

        <p>
          {product?.description ||
            "This product is available from multiple shops on DealHunts. Compare prices, delivery options, warranty, payment methods and return policies before making your purchase."}
        </p>


        <p>
          DealHunts helps you find the best available
          price by comparing offers from different
          vendors in one place.
        </p>

      </div>

    </section>
  );
}


/* ============================================================
   PRODUCT COMPARISON PAGE
============================================================ */

function ProductComparison() {

  const navigate = useNavigate();

  const {
    productId
  } = useParams();


  /* ==========================================================
     STATE
  ========================================================== */

  const [product, setProduct] =
    useState(null);

  const [vendors, setVendors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ==========================================================
     LOAD PRODUCT + VENDORS
  ========================================================== */

  useEffect(() => {

    const loadProduct = async () => {

      try {

        setLoading(true);
        setError("");


        /* ==================================================
           GET PRODUCT
        ================================================== */

        const productResponse =
          await axios.get(
            `http://localhost:8080/admin/products/${productId}`
          );


        console.log(
          "Product details received:",
          productResponse.data
        );


        /* ==================================================
           GET AVAILABLE VENDORS
        ================================================== */

        const vendorResponse =
          await axios.get(
            `http://localhost:8080/inventory/product/${productId}/vendors`
          );


        console.log(
          "Vendor comparison data:",
          vendorResponse.data
        );


        /* ==================================================
           SET PRODUCT
        ================================================== */

        setProduct(
          productResponse.data
        );


        /* ==================================================
           SET VENDORS
        ================================================== */

        const vendorData =
          Array.isArray(
            vendorResponse.data
          )
            ? vendorResponse.data
            : [];


        /* ==================================================
           SORT BY SELLING PRICE
        ================================================== */

        vendorData.sort(
          (a, b) =>
            Number(a.sellingPrice || 0) -
            Number(b.sellingPrice || 0)
        );


        setVendors(
          vendorData
        );

      } catch (err) {

        console.error(
          "Failed to load product comparison:",
          err
        );


        setError(
          "Unable to load product details."
        );

      } finally {

        setLoading(false);

      }

    };


    if (productId) {
      loadProduct();
    }

  }, [productId]);


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {

    return (
      <div className="pc-page">

        <main className="pc-not-found">

          <h1>
            Loading product...
          </h1>

        </main>

      </div>
    );

  }


  /* ==========================================================
     ERROR / NOT FOUND
  ========================================================== */

  if (
    error ||
    !product
  ) {

    return (
      <div className="pc-page">

        {/* HEADER */}

        <header className="pc-header">

          <div className="pc-header-left">

            <div className="pc-header-sidebar">
              <Sidebar />
            </div>


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

              <span className="pc-header-tagline">
                Hunt deals, save money
              </span>

            </div>

          </div>

        </header>


        {/* ERROR */}

        <main className="pc-not-found">

          <h1>
            Product Not Found
          </h1>


          <p>
            {error ||
              "The product you are looking for does not exist."}
          </p>


          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >

            <FiArrowLeft />

            Back to Products

          </button>

        </main>

      </div>
    );

  }


  /* ==========================================================
     SORT VENDORS
  ========================================================== */

  const sortedVendors =
    [...vendors].sort(
      (a, b) =>
        Number(a.sellingPrice || 0) -
        Number(b.sellingPrice || 0)
    );


  /* ==========================================================
     BEST VENDOR
  ========================================================== */

  const bestVendor =
    sortedVendors.length > 0
      ? sortedVendors[0]
      : null;


  /* ==========================================================
     ADD TO CART
  ========================================================== */

  const handleAddToCart = () => {

    if (!bestVendor) {

      alert(
        "No vendor is currently available for this product."
      );

      return;
    }


    const existingCart =
      JSON.parse(
        localStorage.getItem(
          "dealhuntsCart"
        ) || "[]"
      );


    const vendorId =
      bestVendor.vendorId ||
      bestVendor.id;


    const cartItem = {

      productId:
        product.id,

      name:
        product.name,

      brand:
        product.brand,

      image:
        getProductImage(product),

      price:
        Number(
          bestVendor.sellingPrice
        ) || 0,

      quantity:
        1,

      vendor:
        bestVendor.shopName ||
        "Vendor",

      vendorId:
        vendorId,

    };


    const existingItemIndex =
      existingCart.findIndex(
        (item) =>
          String(item.productId) ===
            String(product.id) &&
          String(item.vendorId) ===
            String(vendorId)
      );


    if (
      existingItemIndex !== -1
    ) {

      existingCart[
        existingItemIndex
      ].quantity += 1;

    } else {

      existingCart.push(
        cartItem
      );

    }


    localStorage.setItem(
      "dealhuntsCart",
      JSON.stringify(
        existingCart
      )
    );


    window.dispatchEvent(
      new Event("cartUpdated")
    );


    alert(
      "Product added to cart."
    );

  };


  /* ==========================================================
     BUY NOW
  ========================================================== */

  const handleBuyNow = () => {

    if (!bestVendor) {

      alert(
        "No vendor is currently available for this product."
      );

      return;
    }


    const buyNowItem = {

      productId:
        product.id,

      name:
        product.name,

      brand:
        product.brand,

      image:
        getProductImage(product),

      price:
        Number(
          bestVendor.sellingPrice
        ) || 0,

      quantity:
        1,

      vendor:
        bestVendor.shopName ||
        "Vendor",

      vendorId:
        bestVendor.vendorId ||
        bestVendor.id,

    };


    localStorage.setItem(
      "dealhuntsBuyNow",
      JSON.stringify([
        buyNowItem
      ])
    );


    navigate(
      "/place-order"
    );

  };


  /* ==========================================================
     BOOK VISIT
  ========================================================== */

  const handleBookVisit = () => {

    if (!bestVendor) {

      alert(
        "No vendor is currently available for this product."
      );

      return;
    }


    const vendorId =
      bestVendor.vendorId ||
      bestVendor.id;


    if (!vendorId) {

      alert(
        "Vendor information is not available."
      );

      return;
    }


    navigate(
      `/shop/${vendorId}`
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

        <div className="pc-header-left">

          <div className="pc-header-sidebar">
            <Sidebar />
          </div>


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


            <span className="pc-header-tagline">
              Hunt deals, save money
            </span>

          </div>

        </div>


        {/* ====================================================
            HEADER RIGHT
        ==================================================== */}

        <div className="pc-header-right">

          <nav className="pc-nav">

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
            >
              Home
            </button>


            <button
              type="button"
              className="active"
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


          <div className="pc-header-actions">

            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
              aria-label="Profile"
            >
              <FiUser />
            </button>


            <button
              type="button"
              onClick={() =>
                navigate("/cart")
              }
              aria-label="Cart"
            >
              <FiShoppingCart />
            </button>

          </div>

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="pc-main">


        {/* ====================================================
            BACK
        ==================================================== */}

        <button
          type="button"
          className="pc-back-button"
          onClick={() =>
            navigate("/products")
          }
        >

          <FiArrowLeft />

          Back to Products

        </button>


        {/* ====================================================
            PRODUCT OVERVIEW
        ==================================================== */}

        <ProductOverview
          product={product}
          vendors={sortedVendors}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onBookVisit={handleBookVisit}
        />


        {/* ====================================================
            TOP 5
        ==================================================== */}

        <TopFiveVendors
          vendors={sortedVendors}
        />


        {/* ====================================================
            DETAILED COMPARISON
        ==================================================== */}

        <DetailedComparison
          vendors={sortedVendors}
        />


        {/* ====================================================
            PRODUCT SPECIFICATIONS
        ==================================================== */}

        <ProductSpecifications
          product={product}
        />


        {/* ====================================================
            PRODUCT DESCRIPTION
        ==================================================== */}

        <ProductDescription
          product={product}
        />

      </main>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="pc-footer">

        <strong>
          DEALHUNTS
        </strong>

        <span>
          © 2026 DealHunts.
          All rights reserved.
        </span>

      </footer>

    </div>

  );
}


export default ProductComparison;