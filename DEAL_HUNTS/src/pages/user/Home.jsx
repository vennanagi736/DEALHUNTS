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
   TRENDING PRODUCTS CAROUSEL
============================================================ */

function TrendingProducts({
  items = [],
}) {

  const [index, setIndex] = useState(0);

  const count = items.length;

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

  const timer = setTimeout(() => {

    setIndex((currentIndex) => {

      if (currentIndex >= count - 1) {
        return 0;
      }

      return currentIndex + 1;

    });

  }, 5000);

  return () => {
    clearTimeout(timer);
  };

}, [count, index]);



  if (count === 0) {

    return (
      <section className="dh-home-trending-section-user">

        <div className="dh-home-section-heading-user">
          <h2>Trending Carousel</h2>
        </div>

        <div className="dh-home-trending-empty-user">
          No trending products right now.
        </div>

      </section>
    );
  }


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
            onClick={() => goTo(index - 1)}
            aria-label="Previous trending product"
          >
            <FiChevronLeft />
          </button>

        )}


        <div className="dh-home-trend-viewport-user">

          <div
            className="dh-home-trend-track-user"
            style={{
              transform: `translateX(-${index * 100}%)`,
            }}
          >

            {items.map((item, i) => {

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
                          src={
                            image.startsWith("http")
                              ? image
                              : `${API_BASE}${image}`
                          }
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
                            Best Price {formatINR(price)}
                          </p>

                        )}

                    </div>

                  </div>

                </div>
              );

            })}

          </div>

        </div>


        {count > 1 && (

          <button
            type="button"
            className="dh-home-trending-arrow-user dh-home-trending-next-user"
            onClick={() => goTo(index + 1)}
            aria-label="Next trending product"
          >
            <FiChevronRight />
          </button>

        )}

      </div>


      {count > 1 && (

        <div className="dh-home-trend-dots-user">

          {items.map((_, i) => (

            <button
              type="button"
              key={i}
              className={`dh-home-trend-dot-user ${
                i === index
                  ? "dh-home-trend-dot-active-user"
                  : ""
              }`}
              onClick={() => goTo(i)}
              aria-label={`Go to trending product ${i + 1}`}
            />

          ))}

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

          {deals.map((deal) => {

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
                      src={
                        image.startsWith("http")
                          ? image
                          : `${API_BASE}${image}`
                      }
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
                    {product?.name || "Product"}
                  </h3>


                  <p>
                    {product?.brand?.name || ""}
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

          {categories.map((item, index) => {

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

          })}

        </div>

      )}

    </section>
  );
}


/* ============================================================
   HOME
============================================================ */

function Home() {

  const navigate = useNavigate();


  /* ============================================================
     TRENDING CAROUSEL DATA
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
     LOAD TRENDING CAROUSEL
  ============================================================ */

  useEffect(() => {

    const loadTrending = async () => {

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


  /* ============================================================
     VIEW ALL PRODUCTS
  ============================================================ */

  const handleViewAllProducts = () => {

    navigate("/products");

  };


  /* ============================================================
     VIEW ALL CATEGORIES
  ============================================================ */

  const handleViewAllCategories = () => {

    navigate("/categories");

  };


  /* ============================================================
     LOAD TRENDING DEALS
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
            Array.isArray(response.data)
              ? response.data
              : [];


          setTrendingDeals(
            deals
          );


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

  return (
    <div className="dh-home-user">


      {/* ========================================================
          HOME CONTENT
      ======================================================== */}

      <div className="dh-home-scroll-area-user">


        {/* ======================================================
            TRENDING CAROUSEL
        ====================================================== */}

        <TrendingProducts
          items={trendingItems}
        />


        {/* ======================================================
            TRENDING DEALS
        ====================================================== */}

        <TrendingDeals
          deals={trendingDeals}
          images={trendingDealImages}
          onViewAll={handleViewAllProducts}
        />


        {/* ======================================================
            TRENDING CATEGORIES
        ====================================================== */}

        <TrendingCategories
          categories={trendingCategories}
          onViewAll={handleViewAllCategories}
        />


        {/* ======================================================
            FOOTER
        ====================================================== */}

        {/* <footer className="dh-home-footer-user">

          <strong>
            DEALHUNTS
          </strong>

          <span>
            © 2026 DealHunts. All rights reserved.
          </span>

        </footer> */}

      </div>

    </div>
  );
}

export default Home;