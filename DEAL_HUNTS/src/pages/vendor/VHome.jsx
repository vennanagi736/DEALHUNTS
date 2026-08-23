import React, { useState } from "react";
import "../../styles/VendorHome.css";
import "../../styles/VendorDashboard.css";
import { useNavigate, Link } from "react-router-dom";
import SideWindow from "../../components/SideBar";
import "../../styles/SideBar.css";

import TrendingCarousel from "../../components/TrendingCarousel";
import VendorBusinessOverview from "./VBusinessOverview";
import VendorGreetingBanner from "./VGreetingBanner";
import VendorInventoryOverview from "./VInventoryOverview";
import VendorProductPerformance from "./VProductPerformance";
import VendorSalesOverview from "./VSalesOverview";
import VendorSalesSummary from "./VSalesSummary";
import VendorBestSeller from "./VBestSeller";
import VendorSalesGrowth from "./VSalesGrowth";

function VendorHome() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("vendorJwtToken")
  );

  const handleLogout = () => {
    localStorage.removeItem("vendorJwtToken");
    localStorage.removeItem("vendorId");

    setIsLoggedIn(false);
    navigate("/VendorLogin");
  };

  const vendorInfo = {
    name: "Nagi",
    shopName: "Nagi Electronics",
  };

  return (
    <div className="home-container">

      {/* ================= HEADER ================= */}

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
            <Link to="/vendorProductPage">
              Add Product
            </Link>

            <Link to="/vendor/manage-products">
              Manage Products
            </Link>
          </div>

          <div className="nav-right">

            {!isLoggedIn ? (
              <button
                className="home-Login"
                onClick={() => navigate("/VendorLogin")}
              >
                Login
              </button>
            ) : (
              <button
                className="home-Login"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}

          </div>

        </div>

      </header>


      {/* ================= DASHBOARD ================= */}

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

          {/* ================= TRENDING ================= */}

          <section className="vd-carousel-card">

            <div className="vd-carousel-tagline">

              <span className="dot"></span>

              Trending Now

              <span className="dot"></span>

            </div>

            <div className="trending-section-vendor">

              <div className="carousel-vendor">

                <TrendingCarousel />

              </div>

            </div>

          </section>


          {/* ================= INVENTORY ================= */}

          <VendorInventoryOverview />


          {/* ================= BUSINESS OVERVIEW ================= */}

          <VendorBusinessOverview />


          {/* ================= BEST SELLER + GROWTH ================= */}

          <div className="vd-mini-grid">

            <VendorBestSeller />

            <VendorSalesGrowth />

          </div>

        </aside>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <p>
          © 2026 Website. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default VendorHome;