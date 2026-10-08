import React, {
  useState,
  useEffect,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import { getTrendingDeals } from "../../api/TrendingDealApi";
import { getProductImages } from "../../api/ProductApi";
import { getTrendingCategories } from "../../api/TrendingCategoryApi";

import {
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiTag,
  FiShoppingBag,
  FiShield,
} from "react-icons/fi";

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
   IMAGE URL HELPER
============================================================ */

function resolveImageUrl(image) {

  if (
    !image ||
    typeof image !== "string"
  ) {
    return "";
  }

  const trimmed =
    image.trim();

  if (!trimmed) {
    return "";
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `http:${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE}${trimmed}`;
  }

  return `${API_BASE}/${trimmed}`;
}


/* ============================================================
   GET FIRST IMAGE FROM DIFFERENT RESPONSE STRUCTURES
============================================================ */

function getFirstImage(source) {

  if (!source) {
    return "";
  }


  /* ----------------------------------------------------------
     Direct image fields
  ---------------------------------------------------------- */

  const directImage =
    source.imageUrl ||
    source.imageURL ||
    source.thumbnailUrl ||
    source.thumbnailURL ||
    source.imagePath ||
    source.fileUrl ||
    source.fileURL ||
    source.cloudinaryUrl ||
    source.secureUrl ||
    source.url ||
    source.image;


  if (
    typeof directImage === "string" &&
    directImage.trim()
  ) {
    return resolveImageUrl(
      directImage
    );
  }


  /* ----------------------------------------------------------
     imageUrls[]
  ---------------------------------------------------------- */

  if (
    Array.isArray(source.imageUrls) &&
    source.imageUrls.length > 0
  ) {

    const first =
      source.imageUrls[0];


    if (
      typeof first === "string"
    ) {
      return resolveImageUrl(first);
    }


    if (first) {

      return resolveImageUrl(
        first.imageUrl ||
        first.imageURL ||
        first.thumbnailUrl ||
        first.thumbnailURL ||
        first.url ||
        first.path ||
        first.image
      );

    }

  }


  /* ----------------------------------------------------------
     images[]
  ---------------------------------------------------------- */

  if (
    Array.isArray(source.images) &&
    source.images.length > 0
  ) {

    const first =
      source.images[0];


    if (
      typeof first === "string"
    ) {
      return resolveImageUrl(first);
    }


    if (first) {

      return resolveImageUrl(
        first.imageUrl ||
        first.imageURL ||
        first.thumbnailUrl ||
        first.thumbnailURL ||
        first.url ||
        first.path ||
        first.image
      );

    }

  }


  return "";
}


/* ============================================================
   GET FIRST IMAGE FROM IMAGE API ARRAY
============================================================ */

function getFirstImageFromArray(
  data
) {

  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return "";
  }


  for (
    const item of data
  ) {

    const image =
      getFirstImage(item);


    if (image) {
      return image;
    }

  }


  return "";
}


/* ============================================================
   FIND PRODUCT ID
============================================================ */

function getProductId(item) {

  return (
    item?.product?.id ||
    item?.productId ||
    item?.product?.productId ||
    item?.id
  );

}


/* ============================================================
   TRENDING PRODUCTS CAROUSEL
============================================================ */

function TrendingProducts({
  items = [],
}) {

  const [index, setIndex] =
    useState(0);

  const count =
    items.length;


  useEffect(() => {

    if (count === 0) {
      return;
    }


    if (index >= count) {

      setIndex(0);

      return;
    }


    if (count <= 1) {
      return;
    }


    const timer =
      setTimeout(() => {

        setIndex((currentIndex) => {

          if (
            currentIndex >=
            count - 1
          ) {
            return 0;
          }

          return currentIndex + 1;

        });

      }, 5000);


    return () => {
      clearTimeout(timer);
    };

  }, [
    count,
    index,
  ]);


  if (count === 0) {

    return (
      <section className="dh-home-trending-section-user">

        <div className="dh-home-section-heading-user">

          <h2>
            Trending Carousel
          </h2>

        </div>


        <div className="dh-home-trending-empty-user">

          No trending products right now.

        </div>

      </section>
    );

  }


  const goTo =
    (newIndex) => {

      if (newIndex < 0) {

        setIndex(
          count - 1
        );

        return;
      }


      if (newIndex >= count) {

        setIndex(0);

        return;
      }


      setIndex(newIndex);

    };


  return (
    <section className="dh-home-trending-section-user">

      <div className="dh-home-section-heading-user">
        {/* Heading intentionally hidden */}
      </div>


      <div className="dh-home-trending-carousel-user">

        {count > 1 && (

          <button
            type="button"
            className="dh-home-trending-arrow-user dh-home-trending-prev-user"
            onClick={() =>
              goTo(index - 1)
            }
            aria-label="Previous trending product"
          >
            <FiChevronLeft />
          </button>

        )}


        <div className="dh-home-trend-viewport-user">

          <div
            className="dh-home-trend-track-user"
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
                    className="dh-home-trend-slide-user"
                    key={
                      item.id ||
                      item.productId ||
                      i
                    }
                  >

                    <div className="dh-home-trend-card-user">

                      <div className="dh-home-trend-image-box-user">

                        {image ? (

                          <img
                            src={resolveImageUrl(
                              image
                            )}
                            alt={name}
                            className="dh-home-trend-image-user"
                          />

                        ) : (

                          <div className="dh-home-trend-image-fallback-user">

                            No Image

                          </div>

                        )}

                      </div>


                      <div className="dh-home-trend-details-user">

                        <p
                          className="dh-home-trend-name-user"
                          title={name}
                        >
                          {name}
                        </p>


                        {price !== undefined &&
                          price !== null && (

                            <p className="dh-home-trend-price-user">

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


        {count > 1 && (

          <button
            type="button"
            className="dh-home-trending-arrow-user dh-home-trending-next-user"
            onClick={() =>
              goTo(index + 1)
            }
            aria-label="Next trending product"
          >
            <FiChevronRight />
          </button>

        )}

      </div>


      {count > 1 && (

        <div className="dh-home-trend-dots-user">

          {items.map(
            (_, i) => (

              <button
                type="button"
                key={i}
                className={
                  `dh-home-trend-dot-user ${
                    i === index
                      ? "dh-home-trend-dot-active-user"
                      : ""
                  }`
                }
                onClick={() =>
                  goTo(i)
                }
                aria-label={
                  `Go to trending product ${i + 1}`
                }
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
    <section className="dh-home-trending-deals-section-user">

      <div className="dh-home-trending-deals-heading-user">

        <h2>
          Trending Deals
        </h2>


        <button
          type="button"
          className="dh-home-view-all-products-user"
          onClick={onViewAll}
        >
          View All Products
        </button>

      </div>


      {deals.length === 0 ? (

        <div className="dh-home-trending-deals-placeholder-user">

          <div className="dh-home-trending-deals-placeholder-content-user">

            <span>
              No Trending Deals
            </span>

            <p>
              Trending products will appear here.
            </p>

          </div>

        </div>

      ) : (

        <div className="dh-home-trending-deals-grid-user">

          {deals.map(
            (deal) => {

              const product =
                deal.product;


              const image =
                product?.id
                  ? images[product.id]
                  : "";


              return (
                <div
                  className="dh-home-trending-deal-card-user"
                  key={deal.id}
                >

                  <div className="dh-home-trending-deal-image-box-user">

                    {image ? (

                      <img
                        src={resolveImageUrl(
                          image
                        )}
                        alt={
                          product?.name ||
                          "Trending Product"
                        }
                        className="dh-home-trending-deal-image-user"
                      />

                    ) : (

                      <div className="dh-home-trending-deal-no-image-user">

                        No Image

                      </div>

                    )}

                  </div>


                  <div className="dh-home-trending-deal-details-user">

                    <h3>
                      {product?.name ||
                        "Product"}
                    </h3>


                    <p>
                      {product?.brand?.name ||
                        ""}
                    </p>


                    <span>
                      Position{" "}
                      {deal.position}
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
   TRENDING CATEGORIES
============================================================ */

function TrendingCategories({
  categories = [],
  onViewAll,
}) {

  return (
    <section className="dh-home-trending-categories-section-user">

      <div className="dh-home-trending-categories-heading-user">

        <h2>
          Trending Categories
        </h2>


        <button
          type="button"
          className="dh-home-view-all-categories-user"
          onClick={onViewAll}
        >
          View All Categories
        </button>

      </div>


      {categories.length === 0 ? (

        <div className="dh-home-trending-categories-empty-user">

          <span>
            No Trending Categories
          </span>

        </div>

      ) : (

        <div className="dh-home-trending-categories-scroll-user">

          {categories.map(
            (item, index) => {

              const category =
                item.category ||
                item;


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
                  className="dh-home-trending-category-card-user"
                  key={
                    item.id ||
                    categoryId
                  }
                >

                  <div className="dh-home-trending-category-content-user">

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
   TODAY'S BEST DEALS
============================================================ */

function TodaysBestDeals({
  deals = [],
  images = {},
  onViewAll,
}) {

  return (
    <section className="dh-home-best-deals-section-user">

      <div className="dh-home-new-section-heading-user">

        <div>

          <span className="dh-home-section-eyebrow-user">
            SAVE MORE
          </span>


          <h2>
            Today's Best Deals
          </h2>


          <p>
            Discover products worth checking out today.
          </p>

        </div>


        <button
          type="button"
          className="dh-home-new-section-button-user"
          onClick={onViewAll}
        >
          View All
        </button>

      </div>


      {deals.length === 0 ? (

        <div className="dh-home-new-empty-user">

          <FiTag />

          <span>
            Best deals will appear here.
          </span>

          <p>
            Check back soon for new offers.
          </p>

        </div>

      ) : (

        <div className="dh-home-best-deals-grid-user">

          {deals
            .slice(0, 4)
            .map(
              (deal) => {

                const product =
                  deal.product;


                const image =
                  product?.id
                    ? images[product.id]
                    : "";


                return (
                  <article
                    className="dh-home-best-deal-card-user"
                    key={
                      `best-${deal.id}`
                    }
                  >

                    <div className="dh-home-best-deal-image-user">

                      {image ? (

                        <img
                          src={resolveImageUrl(
                            image
                          )}
                          alt={
                            product?.name ||
                            "Best Deal"
                          }
                        />

                      ) : (

                        <div className="dh-home-new-image-fallback-user">

                          No Image

                        </div>

                      )}

                    </div>


                    <div className="dh-home-best-deal-content-user">

                      <span className="dh-home-deal-badge-user">

                        BEST DEAL

                      </span>


                      <h3>
                        {product?.name ||
                          "Product"}
                      </h3>


                      {product?.brand?.name && (

                        <p>
                          {
                            product.brand.name
                          }
                        </p>

                      )}

                    </div>

                  </article>
                );

              }
            )}

        </div>

      )}

    </section>
  );
}


/* ============================================================
   SEPARATE PRODUCT CAROUSEL HELPER
============================================================ */

function ProductHighlightCarousel({
  products = [],
  type = "new",
}) {

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);


  const count =
    products.length;


  /* ----------------------------------------------------------
     Keep index valid
  ---------------------------------------------------------- */

  useEffect(() => {

    if (count === 0) {

      setCurrentIndex(0);

      return;
    }


    if (currentIndex >= count) {

      setCurrentIndex(0);

    }

  }, [
    count,
    currentIndex,
  ]);


  /* ----------------------------------------------------------
     Auto rotation
  ---------------------------------------------------------- */

  useEffect(() => {

    if (count <= 1) {
      return;
    }


    const interval =
      setInterval(() => {

        setCurrentIndex(
          (previous) =>
            (
              previous + 1
            ) %
            count
        );

      }, 5000);


    return () => {
      clearInterval(interval);
    };

  }, [
    count,
  ]);


  if (count === 0) {
    return null;
  }


  const currentItem =
    products[currentIndex];


  if (!currentItem) {
    return null;
  }


  const product =
    currentItem.product ||
    null;


  const productName =
    currentItem.productName ||
    currentItem.name ||
    product?.name ||
    product?.productName ||
    "Product";


  const brand =
    currentItem.brand?.name ||
    currentItem.brand ||
    product?.brand?.name ||
    product?.brand ||
    "";


  const description =
    currentItem.description ||
    product?.description ||
    "";


  const displayFromDate =
    currentItem.displayFromDate ||
    currentItem.startDate ||
    currentItem.availableFrom ||
    "";


  const displayToDate =
    currentItem.displayToDate ||
    currentItem.endDate ||
    "";


  let image =
    getFirstImage(
      currentItem
    );


  if (!image) {

    image =
      getFirstImage(
        product
      );

  }


  const isComingSoon =
    type === "coming";


  const handlePrevious =
    () => {

      setCurrentIndex(
        (previous) =>
          previous === 0
            ? count - 1
            : previous - 1
      );

    };


  const handleNext =
    () => {

      setCurrentIndex(
        (previous) =>
          (
            previous + 1
          ) %
          count
      );

    };


  return (
    <div className="dh-new-content-carousel-user">

      {count > 1 && (

        <button
          type="button"
          className="dh-new-content-arrow-user dh-new-content-arrow-left-user"
          onClick={handlePrevious}
          aria-label={
            `Previous ${
              isComingSoon
                ? "coming soon"
                : "new arrival"
            } product`
          }
        >
          <FiChevronLeft />
        </button>

      )}


      <div className="dh-new-content-slide-user">

        {/* --------------------------------------------------
            IMAGE
        -------------------------------------------------- */}

        <div className="dh-new-content-image-user">

          {image ? (

            <img
              src={image}
              alt={productName}
              onError={(event) => {

                event.currentTarget.style.display =
                  "none";

                const fallback =
                  event.currentTarget
                    .parentElement
                    ?.querySelector(
                      ".dh-new-content-image-fallback-user"
                    );

                if (fallback) {

                  fallback.style.display =
                    "flex";

                }

              }}
            />

          ) : null}


          <div
            className="dh-new-content-image-fallback-user"
            style={{
              display: image
                ? "none"
                : "flex",
            }}
          >

            <FiShoppingBag />

            <span>
              Image unavailable
            </span>

          </div>


          <span
            className={
              isComingSoon
                ? "dh-new-content-badge-user coming"
                : "dh-new-content-badge-user new"
            }
          >

            {isComingSoon
              ? "Coming Soon"
              : "New Arrival"}

          </span>

        </div>


        {/* --------------------------------------------------
            INFORMATION
        -------------------------------------------------- */}

        <div className="dh-new-content-info-user">

          <span className="dh-new-content-type-user">

            {isComingSoon
              ? "COMING SOON"
              : "NEW ARRIVAL"}

          </span>


          <h3>
            {productName}
          </h3>


          {brand && (

            <p className="dh-new-content-brand-user">
              {brand}
            </p>

          )}


          {description && (

            <p className="dh-new-content-description-user">
              {description}
            </p>

          )}


          {displayFromDate && (

            <div className="dh-new-content-date-user">

              {isComingSoon
                ? "Expected from "
                : "Available from "}

              {displayFromDate}

            </div>

          )}


          {displayToDate && (

            <div className="dh-new-content-end-date-user">

              Until{" "}
              {displayToDate}

            </div>

          )}

        </div>

      </div>


      {count > 1 && (

        <button
          type="button"
          className="dh-new-content-arrow-user dh-new-content-arrow-right-user"
          onClick={handleNext}
          aria-label={
            `Next ${
              isComingSoon
                ? "coming soon"
                : "new arrival"
            } product`
          }
        >
          <FiChevronRight />
        </button>

      )}

    </div>
  );
}


/* ============================================================
   NEW ARRIVALS
   COMPLETELY SEPARATE SECTION
============================================================ */

function NewArrivals({
  products = [],
}) {

  return (
    <section className="dh-new-content-user">

      <div className="dh-new-content-header-user">

        <div>

          <span className="dh-home-section-eyebrow-user">
            WHAT'S NEW
          </span>


          <h2>
            New Arrivals
          </h2>


          <p>
            Explore the latest products recently added
            to DEALHUNTS.
          </p>

        </div>

      </div>


      {products.length === 0 ? (

        <div className="dh-home-new-empty-user">

          <FiShoppingBag />

          <span>
            No New Arrivals
          </span>

          <p>
            New products will appear here when they are
            added by DEALHUNTS.
          </p>

        </div>

      ) : (

        <>

          <ProductHighlightCarousel
            products={products}
            type="new"
          />


          {products.length > 1 && (

            <div className="dh-new-content-dots-user">

              {products.map(
                (item, index) => (

                  <span
                    key={
                      item.id ||
                      `new-${index}`
                    }
                    className="dh-new-content-dot-user"
                  />

                )
              )}

            </div>

          )}

        </>

      )}

    </section>
  );
}


/* ============================================================
   COMING SOON
   COMPLETELY SEPARATE SECTION
============================================================ */

function ComingSoonProducts({
  products = [],
}) {

  return (
    <section className="dh-new-content-user">

      <div className="dh-new-content-header-user">

        <div>

          <span className="dh-home-section-eyebrow-user">
            COMING NEXT
          </span>


          <h2>
            Coming Soon
          </h2>


          <p>
            Discover products that will be available
            soon on DEALHUNTS.
          </p>

        </div>

      </div>


      {products.length === 0 ? (

        <div className="dh-home-new-empty-user">

          <FiShoppingBag />

          <span>
            No Coming Soon Products
          </span>

          <p>
            Upcoming products will appear here when
            they are scheduled.
          </p>

        </div>

      ) : (

        <>

          <ProductHighlightCarousel
            products={products}
            type="coming"
          />


          {products.length > 1 && (

            <div className="dh-new-content-dots-user">

              {products.map(
                (item, index) => (

                  <span
                    key={
                      item.id ||
                      `coming-${index}`
                    }
                    className="dh-new-content-dot-user"
                  />

                )
              )}

            </div>

          )}

        </>

      )}

    </section>
  );
}


/* ============================================================
   AVAILABLE NEAR YOU
============================================================ */

function AvailableNearYou({
  onFindNearby,
}) {

  return (
    <section className="dh-home-nearby-section-user">

      <div className="dh-home-new-section-heading-user">

        <div>

          <span className="dh-home-section-eyebrow-user">
            LOCAL AVAILABILITY
          </span>


          <h2>
            Available Near You
          </h2>


          <p>
            Find products available at nearby local
            stores.
          </p>

        </div>


        <button
          type="button"
          className="dh-home-new-section-button-user"
          onClick={onFindNearby}
        >
          Find Shops Near Me
        </button>

      </div>


      <div className="dh-home-nearby-card-user">

        <div className="dh-home-nearby-icon-user">
          <FiMapPin />
        </div>


        <div className="dh-home-nearby-content-user">

          <h3>
            Find local store availability
          </h3>


          <p>
            Discover products selected by DEALHUNTS
            and see which nearby participating vendors
            currently have them in stock.
          </p>


          <span className="dh-home-nearby-note-user">
            Availability is based on real vendor
            inventory and your location.
          </span>

        </div>


        <div className="dh-home-nearby-status-user">

          <span>
            Find Nearby
          </span>

        </div>

      </div>

    </section>
  );
}


/* ============================================================
   WHY DEALHUNTS
============================================================ */

function WhyDealHunts() {

  return (
    <section className="dh-home-why-section-user">

      <div className="dh-home-why-heading-user">

        <span className="dh-home-section-eyebrow-user">
          SHOP SMARTER
        </span>


        <h2>
          Why DEALHUNTS?
        </h2>


        <p>
          One place to discover deals, compare products,
          and connect online shopping with local stores.
        </p>

      </div>


      <div className="dh-home-why-grid-user">

        <div className="dh-home-why-card-user">

          <div className="dh-home-why-icon-user">
            <FiTag />
          </div>


          <h3>
            Better Deals
          </h3>


          <p>
            Discover competitive prices and deals across
            products available on DEALHUNTS.
          </p>

        </div>


        <div className="dh-home-why-card-user">

          <div className="dh-home-why-icon-user">
            <FiMapPin />
          </div>


          <h3>
            Local Availability
          </h3>


          <p>
            Connect online product discovery with
            participating local stores.
          </p>

        </div>


        <div className="dh-home-why-card-user">

          <div className="dh-home-why-icon-user">
            <FiShoppingBag />
          </div>


          <h3>
            Easy Comparison
          </h3>


          <p>
            Compare products and make better purchasing
            decisions from one place.
          </p>

        </div>


        <div className="dh-home-why-card-user">

          <div className="dh-home-why-icon-user">
            <FiShield />
          </div>


          <h3>
            Trusted Experience
          </h3>


          <p>
            A simple shopping experience designed around
            products, vendors, and useful deals.
          </p>

        </div>

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


  /* ============================================================
     TRENDING CAROUSEL
  ============================================================ */

  const [
    trendingItems,
    setTrendingItems,
  ] = useState([]);


  /* ============================================================
     TRENDING CATEGORIES
  ============================================================ */

  const [
    trendingCategories,
    setTrendingCategories,
  ] = useState([]);


  /* ============================================================
     TRENDING DEALS
  ============================================================ */

  const [
    trendingDeals,
    setTrendingDeals,
  ] = useState([]);


  const [
    trendingDealImages,
    setTrendingDealImages,
  ] = useState({});


  /* ============================================================
     NEW ARRIVALS
  ============================================================ */

  const [
    newArrivalProducts,
    setNewArrivalProducts,
  ] = useState([]);


  /* ============================================================
     COMING SOON
  ============================================================ */

  const [
    comingSoonProducts,
    setComingSoonProducts,
  ] = useState([]);

  const [showFeatureUpgrades, setShowFeatureUpgrades] = useState(false);


  /* ============================================================
     LOAD NEW ARRIVALS
  ============================================================ */

  useEffect(() => {

    const loadNewArrivals =
      async () => {

        try {

          const response =
            await axios.get(
              `${API_BASE}/admin/new-arrivals/all`
            );


          console.log(
            "User Home New Arrivals:",
            response.data
          );


          let arrivals = [];


          if (
            Array.isArray(
              response.data
            )
          ) {

            arrivals =
              response.data;

          } else {

            arrivals =
              response.data?.content ||
              response.data?.data ||
              response.data?.products ||
              response.data?.items ||
              [];

          }


          arrivals =
            arrivals.filter(
              (item) =>
                item?.active === undefined ||
                item?.active === true
            );


          arrivals.sort(
            (a, b) =>
              Number(
                a?.priority ?? 999999
              ) -
              Number(
                b?.priority ?? 999999
              )
          );


          setNewArrivalProducts(
            arrivals
          );


          console.log(
            "Loaded New Arrivals:",
            arrivals
          );

        } catch (error) {

          console.error(
            "New Arrivals error:",
            error
          );

          setNewArrivalProducts([]);

        }

      };


    loadNewArrivals();

  }, []);


  /* ============================================================
     LOAD COMING SOON
  ============================================================ */

  useEffect(() => {

    const loadComingSoon =
      async () => {

        try {

          const response =
            await axios.get(
              `${API_BASE}/admin/coming-soon/all`
            );


          console.log(
            "User Home Coming Soon:",
            response.data
          );


          let comingSoon = [];


          if (
            Array.isArray(
              response.data
            )
          ) {

            comingSoon =
              response.data;

          } else {

            comingSoon =
              response.data?.content ||
              response.data?.data ||
              response.data?.products ||
              response.data?.items ||
              [];

          }


          /* --------------------------------------------------
             Only active records when backend provides active
          -------------------------------------------------- */

          comingSoon =
            comingSoon.filter(
              (item) =>
                item?.active === undefined ||
                item?.active === true
            );


          comingSoon.sort(
            (a, b) =>
              Number(
                a?.priority ?? 999999
              ) -
              Number(
                b?.priority ?? 999999
              )
          );


          setComingSoonProducts(
            comingSoon
          );


          console.log(
            "Loaded Coming Soon:",
            comingSoon
          );

        } catch (error) {

          console.error(
            "Coming Soon error:",
            error
          );

          setComingSoonProducts([]);

        }

      };


    loadComingSoon();

  }, []);


  /* ============================================================
     LOAD TRENDING CAROUSEL
  ============================================================ */

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


  /* ============================================================
     LOAD TRENDING CATEGORIES
  ============================================================ */

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
            Array.isArray(
              response.data
            )
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


  /* ============================================================
     LOAD TRENDING DEALS + IMAGES
  ============================================================ */

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
            Array.isArray(
              response.data
            )
              ? response.data
              : [];


          setTrendingDeals(
            deals
          );


          const imageMap = {};


          for (
            const deal of deals
          ) {

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


              const image =
                getFirstImageFromArray(
                  imageResponse.data
                );


              if (image) {

                imageMap[
                  product.id
                ] = image;

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


  /* ============================================================
     VIEW ALL PRODUCTS
  ============================================================ */

  const handleViewAllProducts =
    () => {

      navigate(
        "/products"
      );

    };


  /* ============================================================
     VIEW ALL CATEGORIES
  ============================================================ */

  const handleViewAllCategories =
    () => {setShowFeatureUpgrades(true);

    };


  /* ============================================================
     AVAILABLE NEAR YOU
  ============================================================ */

  const handleFindNearby =
    () => {

      navigate(
        "/available-near-you"
      );

    };


  return (
    <div className="dh-home-user">

      <div className="dh-home-scroll-area-user">


        {/* ======================================================
            1. EXISTING TRENDING CAROUSEL
        ====================================================== */}

        <TrendingProducts
          items={
            trendingItems
          }
        />


        {/* ======================================================
            2. EXISTING TRENDING DEALS
        ====================================================== */}

        <TrendingDeals
          deals={
            trendingDeals
          }
          images={
            trendingDealImages
          }
          onViewAll={
            handleViewAllProducts
          }
        />


        {/* ======================================================
            3. EXISTING TRENDING CATEGORIES
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
            4. TODAY'S BEST DEALS
        ====================================================== */}

        <TodaysBestDeals
          deals={
            trendingDeals
          }
          images={
            trendingDealImages
          }
          onViewAll={
            handleViewAllProducts
          }
        />


        {/* ======================================================
            5. NEW ARRIVALS
        ====================================================== */}

        <NewArrivals
          products={
            newArrivalProducts
          }
        />


        {/* ======================================================
            6. COMING SOON
        ====================================================== */}

        <ComingSoonProducts
          products={
            comingSoonProducts
          }
        />


        {/* ======================================================
            7. AVAILABLE NEAR YOU
        ====================================================== */}

        <AvailableNearYou
          onFindNearby={
            handleFindNearby
          }
        />


        {/* ======================================================
            8. WHY DEALHUNTS - LAST
        ====================================================== */}

        <WhyDealHunts />

      </div>
      {showFeatureUpgrades && (
  <div
    className="dh-home-feature-upgrades-overlay-user"
    onClick={() => setShowFeatureUpgrades(false)}
  >
    <div
      className="dh-home-feature-upgrades-modal-user"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="dh-home-feature-upgrades-close-user"
        onClick={() => setShowFeatureUpgrades(false)}
        aria-label="Close"
      >
        ×
      </button>

      <img
        src="images/upgrade-features.png"
        alt="Feature Upgrades"
        className="dh-home-feature-upgrades-image-user"
      />
    </div>
  </div>
)}

    </div>
  );
}


export default Home;