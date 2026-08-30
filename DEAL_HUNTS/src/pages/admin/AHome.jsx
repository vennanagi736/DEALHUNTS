import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../../styles/Admin.css";
import axios from "axios";
import { useEffect } from "react";
import { getTrendingItems } from "../../api/TrendingApi";
import { getUserCount, getVendorCount, getProductCount } from "../../api/AdminApi";
import SideWindow from "../../components/SideBar";
import TrendingPreview from "../../components/TrendingPreview";

/* -------------------------------------------------------------------------
   Static placeholder datasets.
   These back the new Business Analytics graph, Product Performance table,
   Low Stock, Complaints and Feedback sections. Swap each for a real API
   call the same way userCount / vendorCount / productCount already are —
   nothing below depends on how the data arrives.
------------------------------------------------------------------------- */
const ANALYTICS_TABS = ["Sales", "Revenue", "Orders", "Products"];

const ANALYTICS_DATA = {
  Sales: [
    { label: "Mar", value: 320 },
    { label: "Apr", value: 410 },
    { label: "May", value: 380 },
    { label: "Jun", value: 460 },
    { label: "Jul", value: 520 },
    { label: "Aug", value: 610 },
  ],
  Revenue: [
    { label: "Mar", value: 1.2 },
    { label: "Apr", value: 1.6 },
    { label: "May", value: 1.4 },
    { label: "Jun", value: 1.9 },
    { label: "Jul", value: 2.3 },
    { label: "Aug", value: 2.8 },
  ],
  Orders: [
    { label: "Mar", value: 210 },
    { label: "Apr", value: 260 },
    { label: "May", value: 240 },
    { label: "Jun", value: 300 },
    { label: "Jul", value: 340 },
    { label: "Aug", value: 390 },
  ],
  Products: [
    { label: "Mar", value: 90 },
    { label: "Apr", value: 120 },
    { label: "May", value: 100 },
    { label: "Jun", value: 150 },
    { label: "Jul", value: 170 },
    { label: "Aug", value: 200 },
  ],
};

const TOP_PRODUCTS = [
  { rank: 1, name: "iPhone 15", category: "Smartphone", sales: 482, revenue: "₹3.4Cr", stock: "In Stock" },
  { rank: 2, name: "Galaxy S24", category: "Smartphone", sales: 401, revenue: "₹2.7Cr", stock: "In Stock" },
  { rank: 3, name: "OnePlus 12", category: "Smartphone", sales: 366, revenue: "₹2.1Cr", stock: "Low Stock" },
  { rank: 4, name: "Sony WH-1000XM5", category: "Audio", sales: 298, revenue: "₹89L", stock: "In Stock" },
  { rank: 5, name: "Dell XPS 13", category: "Laptop", sales: 210, revenue: "₹1.6Cr", stock: "Low Stock" },
];

const LOW_STOCK_ITEMS = [
  { name: "iPhone 15", left: 3 },
  { name: "Galaxy S24", left: 5 },
  { name: "OnePlus 12", left: 2 },
];

const FEEDBACK_ITEMS = [
  { rating: 5, message: "Excellent product comparison experience.", name: "Aditi R." },
  { rating: 4, message: "Very useful price tracking.", name: "Karan M." },
];

/* Compact SVG line chart — no charting library dependency required. */
function AnalyticsChart({ data }) {
  const width = 640;
  const height = 220;
  const padding = 32;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="db-chart-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="dbAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F3A5F" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1F3A5F" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={padding}
          x2={width - padding}
          y1={padding + f * (height - padding * 2)}
          y2={padding + f * (height - padding * 2)}
          className="db-chart-gridline"
        />
      ))}

      <path d={areaPath} fill="url(#dbAreaFill)" stroke="none" />
      <path d={linePath} fill="none" className="db-chart-line" />

      {points.map((p, i) => (
        <g key={p.label}>
          <circle
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 5 : 3.5}
            className={i === points.length - 1 ? "db-chart-dot db-chart-dot-active" : "db-chart-dot"}
          />
          <text x={p.x} y={height - 8} textAnchor="middle" className="db-chart-axis-label">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function AdminHome() {

  console.log("Amaing home koade ")

  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [trendingItems, setTrendingItems] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [vendorCount, setVendorCount] = useState(0);
  const [orderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  // Additional Admin Operations metrics (wire to real endpoints when ready).
  const [customerCount] = useState(0);
  const [categoryCount] = useState(0);
  const [complaintsCount] = useState(0);
  const [feedbackCount] = useState(0);

  // Which Business Analytics tab is active: Sales | Revenue | Orders | Products
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState("Sales");

  const handleLogout = () => {

    localStorage.removeItem("adminJwtToken");
    localStorage.removeItem("role");

    navigate("/adminLogin");

  };


  const fetchProducts = async () => {

    const token = localStorage.getItem("adminJwtToken");

    if(!token){
      navigate("/adminLogin");
      return;
    }


    try{

      await axios.get(
        "http://localhost:8080/vendor/allProducts",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );


    }catch(error){

      console.log(error);

      if(error.response?.status === 401){

        localStorage.removeItem("adminJwtToken");
        navigate("/adminLogin");

      }

    }
   };
useEffect(() => {
    const loadTrending = async () => {
        try {
            console.log("Dashboard: calling promotions API");

            const response = await axios.get(
                "http://localhost:8080/admin/promotions/all"
            );

            console.log("Dashboard status:", response.status);
            console.log("Dashboard data:", response.data);

            setTrendingItems(response.data);

        } catch (error) {
            console.log("Dashboard trending ERROR:", error);
            console.log("URL:", error.config?.url);
            console.log("STATUS:", error.response?.status);
            console.log("DATA:", error.response?.data);
        }
    };

    loadTrending();
}, []);
//   useEffect(()=>{

//     console.log("useefefkmskdmvsdim");

//     const loadTrending = async()=>{

//       try{
//       console.log("Callinga aap");
//         const data = await getTrendingItems();
//         console.log("Admin Trending:",data);
//         setTrendingItems(data);
//       }
//       catch(err){
//         console.log("Ttencneomocme",err);
//       }
//     };

//     loadTrending();
// },[]);


  const handleSearch = () => {

    fetchProducts();

    navigate("/product");

  };

  useEffect(() => {

    const loadDashboardStats = async () => {
        try {

            const userResponse = await getUserCount();
            console.log("userCount:",userResponse.data);
            setUserCount(userResponse.data);

            const vendorResponse = await getVendorCount();
            console.log("VendorCount:",vendorResponse.data);
            setVendorCount(vendorResponse.data);

            const productResponse = await getProductCount();
            console.log("ProductCount:",productResponse.data);
            setProductCount(productResponse.data);
            
            // const orderResponse = await getOrderCount();
            // console.log("OrderCount:",orderResponse.data);
            // setOrderCount(orderResponse.data);

        } catch (error) {
            console.error(
                "Failed to load dashboard stats:",
                error
            );
        }
    };


    loadDashboardStats();

}, []);

  // Admin Operations column — order matches the required spec exactly.
  const adminOperations = [
    { icon: "👥", label: "Users", value: userCount },
    { icon: "🏪", label: "Vendors", value: vendorCount },
    { icon: "🧑‍🤝‍🧑", label: "Customers", value: customerCount },
    { icon: "📦", label: "Products", value: productCount },
    { icon: "🧾", label: "Orders", value: orderCount },
    { icon: "🗂️", label: "Categories", value: categoryCount },
    { icon: "⚠️", label: "Complaints", value: complaintsCount },
    { icon: "💬", label: "Feedback", value: feedbackCount },
  ];

  return (

    <div className="adminhome-container">


      <header className="admin-header">


        <div className="left-section">
          <SideWindow />
        </div>



        <div className="logo">

          <span className="Gold">
            DEAL
          </span>

          <span className="Black">
            HUNTS
          </span>

          <span className="Admin">
            Admin
          </span>

        </div>



        <nav className="admin-nav-links">


          <NavLink to="/orders">
            Orders
          </NavLink>


          <NavLink to="/adminproducts">
            Products
          </NavLink>


          <NavLink to="/manage-vendors">
            Vendors
          </NavLink>



          <div className="search-box">

            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />


            <span
              className="icon"
              onClick={handleSearch}
            >
              🔍
            </span>


          </div>

          <span className="db-header-icon" title="Notifications">🔔</span>
          <span className="db-header-avatar" title="Admin">A</span>

          <button
            className="home-Login"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>

     <main className="admin-main">
      <div className="db-grid">

        {/* ================= LEFT 15% — ADMIN OPERATIONS ================= */}
        <aside className="db-left">
          <p className="db-left-title">Admin Operations</p>
          {adminOperations.map((op) => (
            <div className="db-op-card" key={op.label}>
              <span className="db-op-icon">{op.icon}</span>
              <span className="db-op-value">{op.value}</span>
              <span className="db-op-label">{op.label}</span>
            </div>
          ))}
        </aside>

        {/* ================= CENTER 60% — BUSINESS ANALYTICS ================= */}
        <section className="db-center">

          <div className="db-analytics-card">
            <div className="db-analytics-header">
              <div>
                <h2 className="db-card-title">Business Analytics</h2>
                <p className="db-card-subtitle">{activeAnalyticsTab} Overview</p>
              </div>
              <span className="db-period-pill">Last 30 Days</span>
            </div>

            <div className="db-chart-area">
              <AnalyticsChart data={ANALYTICS_DATA[activeAnalyticsTab]} />
            </div>

            <div className="db-analytics-tabs">
              {ANALYTICS_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`db-tab-btn ${activeAnalyticsTab === tab ? "db-tab-active" : ""}`}
                  onClick={() => setActiveAnalyticsTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="db-analytics-card db-performance-card">
            <h2 className="db-card-title">Product Performance</h2>
            <p className="db-card-subtitle">Top 5 Products</p>

            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_PRODUCTS.map((p) => (
                    <tr key={p.rank}>
                      <td>{p.rank}</td>
                      <td className="db-table-product">{p.name}</td>
                      <td className="db-table-secondary">{p.category}</td>
                      <td className="db-table-navy">{p.sales}</td>
                      <td className="db-table-navy">{p.revenue}</td>
                      <td>
                        <span className={`db-stock-pill ${p.stock === "Low Stock" ? "db-stock-low" : "db-stock-ok"}`}>
                          {p.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </section>

        {/* ================= RIGHT 25% — TRENDING + ALERTS ================= */}
        <aside className="db-right">

          <div className="db-right-card db-trending-card">
            <h2 className="db-card-title db-trending-title">Trending Products</h2>
            <TrendingPreview items={trendingItems} />
          </div>

          <div className="db-right-card">
            <h3 className="db-mini-title">Low Stock Alerts</h3>
            <ul className="db-mini-list">
              {LOW_STOCK_ITEMS.map((item) => (
                <li key={item.name} className="db-mini-row">
                  <span>{item.name}</span>
                  <span className="db-lowstock-badge">{item.left} left</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="db-right-card">
            <h3 className="db-mini-title">Complaints</h3>
            <ul className="db-mini-list">
              <li className="db-mini-row">
                <span>New</span>
                <span className="db-count-badge db-count-alert">{String(complaintsCount).padStart(2, "0") || "04"}</span>
              </li>
              <li className="db-mini-row">
                <span>Pending</span>
                <span className="db-count-badge">08</span>
              </li>
              <li className="db-mini-row">
                <span>Resolved</span>
                <span className="db-count-badge db-count-ok">32</span>
              </li>
            </ul>
          </div>

          <div className="db-right-card">
            <h3 className="db-mini-title">Recent Feedback</h3>
            <ul className="db-feedback-list">
              {FEEDBACK_ITEMS.map((f, i) => (
                <li key={i} className="db-feedback-row">
                  <span className="db-feedback-stars">
                    {"★".repeat(f.rating)}
                    <span className="db-feedback-stars-empty">{"★".repeat(5 - f.rating)}</span>
                  </span>
                  <p className="db-feedback-message">“{f.message}”</p>
                </li>
              ))}
            </ul>
          </div>

        </aside>

      </div>
</main>

      <footer className="admin-footer">

        <p>
          © 2026 Website. All rights reserved. 
        </p>

      </footer>
    </div>
  )
}


export default AdminHome;