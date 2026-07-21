import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrendingItems } from "../api/TrendingApi";

const TrendingCarousel = () => {
  const [trendingItems, setTrendingItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getTrendingItems().then(data => setTrendingItems(data));
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (trendingItems.length > 0) {
        setCurrentIndex(prev => (prev + 1) % trendingItems.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [trendingItems]);

  const prevItem = () => {
    setCurrentIndex(prev =>
      prev === 0 ? trendingItems.length - 1 : prev - 1
    );
  };

  const nextItem = () => {
    setCurrentIndex(prev => (prev + 1) % trendingItems.length);
  };

  if (trendingItems.length === 0) return <p>Loading trending items...</p>;

  return (
    <div className="carousel-container">
      <div className="carousel-item">
        <button className="nav-btn prev" onClick={prevItem}>{"<"}</button>

        <img
          src={trendingItems[currentIndex].image}
          alt={`Slide ${currentIndex + 1}`}
          className="carousel-image"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(trendingItems[currentIndex].url)}
        />

        <button className="nav-btn next" onClick={nextItem}>{">"}</button>

        <div className="dots-container">
          {trendingItems.map((_, index) => (
            <span
              key={index}
              className={`dot ${currentIndex === index ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingCarousel;