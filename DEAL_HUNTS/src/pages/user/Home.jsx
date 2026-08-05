import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import { FiShoppingCart } from "react-icons/fi";
import SideWindow from "../../components/SideBar";
import TrendingCarousel from "../../components/TrendingCarousel";
import "../../styles/TrendingCarousel.css";
import "../../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const isLoggedIn = !!localStorage.getItem("userJwtToken");

  const fetchProducts = async () => {
    const token = localStorage.getItem("userJwtToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.get("http://localhost:8080/vendor/allProducts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/product");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("userJwtToken");
        localStorage.removeItem("userEmail");
        navigate("/login");
      }
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem("userJwtToken");
  //   localStorage.removeItem("userEmail");
  //   setIsLoggedIn(false);
  //   navigate("/login");
  // };

  const handleSearch = () => {
    fetchProducts();
  };

  return (
    <div className="home-container">
      <header className="header">
        <div className="left-section">
          <SideWindow />
        </div>

        <div className="logo">
          <span className="Gold">DEAL</span>
          <span className="Black">HUNTS</span>
        </div>

        <nav className="navigation">
          <div className="nav-links">
            <NavLink to="/Home">Home</NavLink>
            <NavLink to="/adminproducts">Products</NavLink>
            <NavLink to="/Categories">Categories</NavLink>
            <NavLink to="/Deals">Deals</NavLink>
          </div>

          <div className="nav-right">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="icon" onClick={handleSearch}>
                🔍
              </span>
            </div>

         {!isLoggedIn ? (
  <button
    className="home-Login"
    onClick={() => navigate("/login")}
  >
    Login
  </button>
) : (
  <button
    className="settings-btn"
    onClick={() => navigate("/settings")}
    title="Settings"
  >
    <FiShoppingCart size={22} />
  </button>
)}
          </div>
        </nav>
      </header>

      <main className="manage-main">
        <section className="trending-section-user">
      <div className="carousel-user">
        <TrendingCarousel />
        </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 DEALHUNTS. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;