import React, { useState, useEffect } from "react";
import "../../styles/VendorHome.css";
import "../../styles/VendorDashboard.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import SideWindow from "../../components/SideBar";
import "../../styles/SideBar.css";

import TrendingCarousel from "../../components/TrendingCarousel";
import VendorBusinessOverview from "./VBusinessOverview";
import VendorGreetingBanner from "./VGreetingBanner";
import VendorInventoryOverview from "./VInventoryOverview";
import VendorProductPerformance from "./VProductPerformance";
import VendorQuickActions from "./VQuickActions";
import VendorSalesOverview from "./VSalesOverview";
import VendorSalesSummary from "./VSalesSummary";
import VendorBestSeller from "./VBestSeller";
import VendorSalesGrowth from "./VSalesGrowth";

function VendorHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("vendorJwtToken"));

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("vendorJwtToken");
      const vendorId = localStorage.getItem("id");

      if (!token) {
        alert("Please login first!");
        navigate("/VendorLogin");
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:8080/vendor/myProducts?vendorId=${vendorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProducts(res.data);
      } catch (err) {
        console.error("FETCH ERROR:", err);

        if (err.response?.status === 404) {
          setProducts([]);
        } else if (err.response?.status === 401) {
          console.log("Unauthorized request");
        } else {
          alert("Failed to fetch products.");
        }
      }
    };

    fetchProducts();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("vendorJwtToken");
    localStorage.removeItem("vendorId");
    setIsLoggedIn(false);
    navigate("/VendorLogin");
  };

  const handleSearch = () => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    setProducts(filtered);
  };

  const vendorInfo = {
    name: "Nagi",
    shopName: "Nagi Electronics"
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
          <span className="Vendor">Vendor</span>
        </div>

        <div className="navigation">
          <div className="nav-links">
            <Link to="/vendorProductPage">Add Product</Link>
            <Link to="/vendor/manage-products">Manage Products</Link>
          </div>

          <div className="nav-right">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="icon" onClick={handleSearch}>🔍</span>
            </div>

            {!isLoggedIn ? (
              <button className="home-Login" onClick={() => navigate("/VendorLogin")}>
                Login
              </button>
            ) : (
              <button className="home-Login" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="vendor-dashboard">

    {/* ================= LEFT 65% ================= */}
    <div className="vendor-dashboard-main">

        <VendorGreetingBanner
            vendorName={vendorInfo.name}
        />

        <VendorSalesOverview />

        <VendorSalesSummary />

        <VendorProductPerformance />

    </div>


    {/* ================= RIGHT 35% ================= */}
    <aside className="vendor-dashboard-side">

        {/* EXISTING TRENDING CAROUSEL */}
        <section className="vd-carousel-card">

            <div className="vd-carousel-tagline">
                <span className="dot"></span>
                Trending Now
                <span className="dot"></span>
            </div>
            <div className="trending-section-vendor">
              <div className="carousel-vendor">
                <TrendingCarousel/>
              </div>
            </div>

        </section>

        {/* Inventory + Business Overview will go here later */}
        <VendorInventoryOverview />
        <VendorBusinessOverview/>

        <div className="vd-mini-grid">
          <VendorBestSeller/>
          <VendorSalesGrowth/>
        </div>

    </aside>

</main>

      <footer className="footer
      ppppp">
        <p>© 2026 Website. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default VendorHome;
