import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "../../components/admin/AIcons";

export default function TrendingProducts({ items = [] }) {

  const [index, setIndex] = useState(0);

  const count = items.length;

  console.log("TrendingProducts items:", items);

  if (count === 0) {
    return (
      <div className="db-admin-trending-card-atp">

        <h2 className="db-admin-trending-heading-atp">
          Trending Deals
        </h2>

        <p className="db-admin-trending-empty-atp">
          No trending deals right now.
        </p>

      </div>
    );
  }

  const goTo = (i) => {
    setIndex((i + count) % count);
  };

  return (
    <div className="db-admin-trending-card-atp">

      {/* ================= TITLE ================= */}

      <h2 className="db-admin-trending-heading-atp">
        Trending Deals
      </h2>


      {/* ================= CAROUSEL ================= */}

      <div className="db-admin-trending-viewport-atp">

        <div
          className="db-admin-trending-track-atp"
          style={{
            width: `${count * 100}%`,
            transform: `translateX(-${index * (100 / count)}%)`,
          }}
        >

          {items.map((item, i) => (

            <div
              className="db-admin-trending-slide-atp"
              style={{
                width: `${100 / count}%`,
              }}
              key={item.id ?? i}
            >

              {/* ================= IMAGE ================= */}

              <div className="db-admin-trending-image-box-atp">

                {item.imageUrl ? (

                  <img
                    src={item.imageUrl}
                    alt={item.title || "Trending Deal"}
                    className="db-admin-trending-image-atp"
                  />

                ) : (

                  <div className="db-admin-trending-image-fallback-atp">
                    No Image
                  </div>

                )}

              </div>


              {/* ================= PRODUCT NAME ================= */}

              <p className="db-admin-trending-name-atp">
                {item.title || "Trending Deal"}
              </p>

            </div>

          ))}

        </div>

      </div>


      {/* ================= DOTS ================= */}

      <div className="db-admin-trending-dots-atp">

        {items.map((_, i) => (

          <span
            key={i}
            className={`db-admin-trending-dot-atp ${
              i === index
                ? "db-admin-trending-dot-active-atp"
                : ""
            }`}
            onClick={() => goTo(i)}
          />

        ))}

      </div>


      {/* ================= ARROWS ================= */}

      <div className="db-admin-trending-nav-atp">

        <button
          type="button"
          className="db-admin-trending-arrow-atp"
          onClick={() => goTo(index - 1)}
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>

        <button
          type="button"
          className="db-admin-trending-arrow-atp"
          onClick={() => goTo(index + 1)}
          aria-label="Next"
        >
          <ChevronRight />
        </button>

      </div>

    </div>
  );
}