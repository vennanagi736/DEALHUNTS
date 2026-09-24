import "../../styles/VendorHome.css";

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

  const vendorInfo = {
    name: "Nagi",
    shopName: "Nagi Electronics",
  };

  return (
    <div className="home-container-vendor-vd">

      {/* ================= COMMON HEADER ================= */}



      {/* ================= DASHBOARD ================= */}

      <main className="vendor-dashboard-vd">

        {/* ================= LEFT 65% ================= */}

        <div className="vendor-dashboard-main-vd">

          <VendorGreetingBanner
            vendorName={vendorInfo.name}
          />

          <VendorSalesOverview />

          <VendorSalesSummary />

          <VendorProductPerformance />

        </div>


        {/* ================= RIGHT 35% ================= */}

        <aside className="vendor-dashboard-side-vd">

          {/* ================= TRENDING ================= */}

          <section className="vd-carousel-card-vd">

            <div className="vd-carousel-tagline-vd">

              <span className="dot-vd"></span>

              Trending Now

              <span className="dot-vd"></span>

            </div>

            <div className="trending-section-vendor-vd">

              <div className="carousel-vendor-vd">

                <TrendingCarousel />

              </div>

            </div>

          </section>


          {/* ================= INVENTORY ================= */}

          <VendorInventoryOverview />


          {/* ================= BUSINESS OVERVIEW ================= */}

          <VendorBusinessOverview />


          {/* ================= BEST SELLER + GROWTH ================= */}

          <div className="vd-mini-grid-vd">

            <VendorBestSeller />

            <VendorSalesGrowth />

          </div>

        </aside>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="footer-vendor-vd">

        <p>
          © 2026 Website. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default VendorHome;