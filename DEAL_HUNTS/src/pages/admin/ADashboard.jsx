import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../../styles/ADashboard.css";
import "../../styles/AProduct.css";

import {
  getUserCount,
  getVendorCount,
  getProductCount,
  getPromotionCount,
  getCategoryCount,
} from "../../api/AdminApi";

import AdminOperations from "../../components/admin/AOperations";
import BusinessAnalytics from "../../components/admin/ABusinessAnalytics";
import TopProductsChart from "../../components/admin/ATopProductsChart";
import TopCategoriesChart from "../../components/admin/ATopCategoriesChart";
import ProductPerformance from "../../components/admin/AProductPerformance";

import TrendingProducts from "../../components/admin/ATrendingProducts";
import ATrendingDeals from "../../components/admin/ATrendingDeals";
import ATrendingCategories from "../../components/admin/ATrendingCategories";
import RecentFeedback from "../../components/admin/ARecentFeedback";


/* =========================================================
   ANALYTICS DATA
========================================================= */

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


/* =========================================================
   TOP PRODUCTS CHART
========================================================= */

const TOP_PRODUCTS_CHART = [

  { name: "iPhone 17", value: 482 },
  { name: "Galaxy S26", value: 401 },
  { name: "OnePlus 15", value: 366 },
  { name: "Sony XM5", value: 298 },
  { name: "Dell XPS 13", value: 210 },

];


/* =========================================================
   TOP CATEGORIES CHART
========================================================= */

const TOP_CATEGORIES_CHART = [

  { name: "Smartphones", value: 1249 },
  { name: "Laptops", value: 640 },
  { name: "Audio", value: 420 },
  { name: "Accessories", value: 310 },
  { name: "Wearables", value: 180 },

];


/* =========================================================
   TOP PRODUCTS
========================================================= */

const TOP_PRODUCTS = [

  {
    rank: 1,
    name: "iPhone 15",
    category: "Smartphone",
    sales: 482,
    revenue: "₹3.4Cr",
    stock: "In Stock",
  },

  {
    rank: 2,
    name: "Galaxy S24",
    category: "Smartphone",
    sales: 401,
    revenue: "₹2.7Cr",
    stock: "In Stock",
  },

  {
    rank: 3,
    name: "OnePlus 12",
    category: "Smartphone",
    sales: 366,
    revenue: "₹2.1Cr",
    stock: "Low Stock",
  },

  {
    rank: 4,
    name: "Sony XM5",
    category: "Audio",
    sales: 298,
    revenue: "₹89L",
    stock: "In Stock",
  },

  {
    rank: 5,
    name: "Dell XPS 13",
    category: "Laptop",
    sales: 210,
    revenue: "₹1.6Cr",
    stock: "Low Stock",
  },

];


/* =========================================================
   FEEDBACK
========================================================= */

const FEEDBACK_ITEMS = [

  {
    rating: 5,
    message: "Excellent product comparison experience.",
    name: "Aditi R.",
  },

  {
    rating: 4,
    message: "Very useful price tracking.",
    name: "Karan M.",
  },

];


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {

  const navigate = useNavigate();


  /* =========================================================
     STATES
  ========================================================= */

  const [trendingItems, setTrendingItems] = useState([]);

  const [userCount, setUserCount] = useState(0);
  const [vendorCount, setVendorCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [promotionCount, setPromotionCount] = useState(0);

  const [orderCount] = useState(0);
  const [complaintsCount] = useState(4);
  const [feedbackCount] = useState(0);
  const [lowStockAlertsCount] = useState(0);


  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  const fetchProducts = async () => {

    const token =
      localStorage.getItem("adminJwtToken");

    if (!token) {

      navigate("/adminLogin");

      return;

    }

    try {

      await axios.get(
        "http://localhost:8080/vendor/allProducts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    } catch (error) {

      console.log(error);

      if (error.response?.status === 401) {

        localStorage.removeItem(
          "adminJwtToken"
        );

        localStorage.removeItem(
          "role"
        );

        navigate("/adminLogin");

      }

    }

  };


  /* =========================================================
     LOAD TRENDING DEALS
  ========================================================= */

  useEffect(() => {

    const loadTrending = async () => {

      try {

        const response = await axios.get(
          "http://localhost:8080/admin/promotions/all"
        );

        console.log(
          "Trending Deals response:",
          response.data
        );

        setTrendingItems(
          Array.isArray(response.data)
            ? response.data
            : []
        );

      } catch (error) {

        console.error(
          "Dashboard trending deals ERROR:",
          error
        );

        setTrendingItems([]);

      }

    };

    loadTrending();

  }, []);


  /* =========================================================
     LOAD DASHBOARD COUNTS
  ========================================================= */

  useEffect(() => {

    const loadDashboardStats = async () => {

      try {

        const [
          userResponse,
          vendorResponse,
          productResponse,
          promotionResponse,
          categoryResponse,
        ] = await Promise.all([

          getUserCount(),

          getVendorCount(),

          getProductCount(),

          getPromotionCount(),

          getCategoryCount(),

        ]);


        setUserCount(
          Number(userResponse.data) || 0
        );

        setVendorCount(
          Number(vendorResponse.data) || 0
        );

        setProductCount(
          Number(productResponse.data) || 0
        );

        setPromotionCount(
          Number(promotionResponse.data) || 0
        );

        setCategoryCount(
          Number(categoryResponse.data) || 0
        );

      } catch (error) {

        console.error(
          "Failed to load dashboard stats:",
          error
        );

      }

    };


    loadDashboardStats();

  }, []);


  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = () => {

    fetchProducts();

    navigate("/product");

  };


  /* =========================================================
     SHOW ALL PRODUCTS
  ========================================================= */

  const handleShowAllProducts = () => {

    navigate("/adminproducts");

  };


  /* =========================================================
     RETURN
  ========================================================= */

  return (

    <div className="db-shell">


      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <main className="db-main">

        <div className="db-grid">


          {/* =================================================
              LEFT
          ================================================= */}

          <AdminOperations
            userCount={userCount}
            vendorCount={vendorCount}
            productCount={productCount}
            orderCount={orderCount}
            categoryCount={categoryCount}
            promotionCount={promotionCount}
            complaintsCount={complaintsCount}
            feedbackCount={feedbackCount}
            lowStockAlertsCount={
              lowStockAlertsCount
            }
          />


          {/* =================================================
              CENTER
          ================================================= */}

          <section className="db-center">

            <BusinessAnalytics
              data={ANALYTICS_DATA}
            />

            <TopProductsChart
              data={TOP_PRODUCTS_CHART}
            />

            <TopCategoriesChart
              data={TOP_CATEGORIES_CHART}
            />

            <ProductPerformance
              products={TOP_PRODUCTS}
              onShowAll={handleShowAllProducts}
            />

          </section>


          {/* =================================================
              RIGHT
              1. Trending Carousel
              2. Trending Categories
              3. Trending Deals
              4. Recent Feedback
          ================================================= */}

          <aside className="db-right">


            {/* =================================================
                1. TRENDING CAROUSEL
            ================================================= */}

            <div className="db-card db-right-card db-trending-card">

              <TrendingProducts
                items={trendingItems}
              />

            </div>


            {/* =================================================
                2. TRENDING CATEGORIES
            ================================================= */}

            <div className="db-card db-right-card db-trending-card">

              <ATrendingCategories />

            </div>


            {/* =================================================
                3. TRENDING DEALS
            ================================================= */}

            <div className="db-card db-right-card db-trending-card">

              <ATrendingDeals
                items={trendingItems}
              />

            </div>


            {/* =================================================
                4. RECENT FEEDBACK
            ================================================= */}

            <div className="db-card db-right-card">

              <RecentFeedback
                items={FEEDBACK_ITEMS}
              />

            </div>


          </aside>


        </div>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      {/*
      <footer className="db-footer">
        <p>
          © 2026 DealHunts. All rights reserved.
        </p>
      </footer>
      */}


    </div>

  );

}


export default AdminDashboard;