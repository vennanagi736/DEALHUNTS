import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "../../components/admin/AIcons";

export default function TrendingProducts({ items = [] }) {

  const [index, setIndex] = useState(0);

  const count = items.length;

  console.log("TrendingProducts items:", items);

  if (count === 0) {
    return (
      <div>
        <h2 className="db-card-title db-trending-heading">
          Trending Deals
        </h2>

        <p className="db-trending-empty">
          No trending deals right now.
        </p>
      </div>
    );
  }

  const goTo = (i) => {
    setIndex((i + count) % count);
  };

  return (
    <div>

      <h2 className="db-card-title db-trending-heading">
        Trending Deals
      </h2>

      <div className="db-trend-viewport">

        <div
          className="db-trend-track"
          style={{
            width: `${count * 100}%`,
            transform: `translateX(-${index * (100 / count)}%)`,
          }}
        >

          {items.map((item, i) => (

            <div
              className="db-trend-slide"
              style={{
                width: `${100 / count}%`,
              }}
              key={item.id ?? i}
            >

              <div className="db-trend-image-box">

                {item.imageUrl ? (

                  <img
                    src={item.imageUrl}
                    alt={item.title || "Trending Deal"}
                    className="db-trend-image"
                  />

                ) : (

                  <div className="db-trend-image-fallback">
                    No Image
                  </div>

                )}

              </div>

              <p className="db-trend-name">
                {item.title || "Trending Deal"}
              </p>

            </div>

          ))}

        </div>

      </div>


      {/* DOTS */}

      <div className="db-trend-dots">

        {items.map((_, i) => (

          <span
            key={i}
            className={`db-trend-dot ${
              i === index
                ? "db-trend-dot-active"
                : ""
            }`}
            onClick={() => goTo(i)}
          />

        ))}

      </div>


      {/* ARROWS */}

      <div className="db-trend-nav">

        <button
          className="db-trend-arrow"
          onClick={() => goTo(index - 1)}
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>

        <button
          className="db-trend-arrow"
          onClick={() => goTo(index + 1)}
          aria-label="Next"
        >
          <ChevronRight />
        </button>

      </div>

    </div>
  );
}