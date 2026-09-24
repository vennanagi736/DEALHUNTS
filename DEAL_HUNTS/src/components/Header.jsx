import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Popup from "./Popup";

import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiBell,
} from "react-icons/fi";

import "../styles/Header.css";


function Header({ onMenuClick, showMenu = true }) {

  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);

  const currentPath = location.pathname.toLowerCase();


  /* ============================================================
     PAGE TYPE
  ============================================================ */

  const isLoginPage =
    currentPath === "/login" ||
    currentPath === "/register" ||
    currentPath === "/adminlogin" ||
    currentPath === "/vendorlogin" ||
    currentPath === "/vendorregister";


  const isVendorPage =
    currentPath.startsWith("/vendor");


  const isAdminPage =
    currentPath.startsWith("/admin") ||
    currentPath.startsWith("/manage-");


  /* ============================================================
     ADMIN PRODUCTS
  ============================================================ */

  const isAdminProductsPage =
    currentPath === "/adminproducts";


  const isAdminImportPage =
    currentPath === "/admin/import-products";


  const isAdminMasterDataPage =
    currentPath === "/admin/master-data";


  /* ============================================================
     ADMIN VENDORS
  ============================================================ */

  const isAdminVendorsSection =
    currentPath === "/manage-vendors" ||
    currentPath.startsWith("/admin/vendors");


  /* ============================================================
     ADMIN PROMOTIONS
  ============================================================ */

  const isAdminPromotionsPage =
    currentPath === "/admin/manage-promotions";


  /* ============================================================
     ADMIN TRENDING CAROUSEL
  ============================================================ */

  const isAdminTrendingCarouselPage =
    currentPath === "/admin/manage-carousel";


  /* ============================================================
     ADMIN TRENDING DEALS
  ============================================================ */

  const isAdminTrendingDealsPage =
    currentPath === "/admin/manage-trending-deals";


  /* ============================================================
     ADMIN TRENDING CATEGORIES
  ============================================================ */

  const isAdminTrendingCategoriesPage =
    currentPath === "/admin/manage-trending-categories";


  /* ============================================================
     ADMIN ORDERS
  ============================================================ */

  const isAdminOrdersPage =
    currentPath === "/admin/orders" ||
    currentPath === "/manage-orders";


  /* ============================================================
     USER LOGIN
  ============================================================ */

  const isUserLoggedIn =
    !!localStorage.getItem("userJwtToken");


  /* ============================================================
     SEARCH
  ============================================================ */

  const handleSearch = (event) => {

    event.preventDefault();

    const search = searchQuery.trim();

    if (!search) {

      navigate("/products");

      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(search)}`
    );
  };


  /* ============================================================
     LOGIN / REGISTER HEADER
  ============================================================ */

  if (isLoginPage) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

        </div>

      </header>
    );
  }


  /* ============================================================
     ADMIN PRODUCTS

     /adminProducts

     NAVIGATION:
     Import CSV | Master Data
  ============================================================ */

  if (isAdminProductsPage) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

          <span className="Admin">
            Admin
          </span>

        </div>


        <nav className="dh-header-navigation">

          <NavLink
            to="/adminAddProduct"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Add Product
          </NavLink>

          <NavLink
            to="/admin/import-products"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Import CSV
          </NavLink>


          <NavLink
            to="/admin/master-data"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Master Data
          </NavLink>

        </nav>


        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            onClick={() => {
              console.log("Notifications clicked");
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell />
          </button>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        </div>

      </header>
    );
  }


  /* ============================================================
     ADMIN IMPORT PRODUCTS

     /admin/import-products

     NAVIGATION:
     Master Data
  ============================================================ */

  if (isAdminImportPage) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

          <span className="Admin">
            Admin
          </span>

        </div>


        <nav className="dh-header-navigation">

          <NavLink
            to="/admin/master-data"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Master Data
          </NavLink>

        </nav>


        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            onClick={() => {
              console.log("Notifications clicked");
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell />
          </button>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        </div>

      </header>
    );
  }


  /* ============================================================
     ADMIN MASTER DATA

     /admin/master-data

     NAVIGATION:
     Import CSV
  ============================================================ */

  if (isAdminMasterDataPage) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

          <span className="Admin">
            Admin
          </span>

        </div>


        <nav className="dh-header-navigation">

          <NavLink
            to="/admin/import-products"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Import CSV
          </NavLink>

        </nav>


        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            onClick={() => {
              console.log("Notifications clicked");
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell />
          </button>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        </div>

      </header>
    );
  }


  /* ============================================================
     ADMIN VENDORS

     /manage-vendors

     NO NAVIGATION
  ============================================================ */

  if (isAdminVendorsSection) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

          <span className="Admin">
            Admin
          </span>

        </div>


        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            onClick={() => {
              console.log("Notifications clicked");
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell />
          </button>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        </div>

      </header>
    );
  }


  /* ============================================================
     ADMIN PROMOTIONS

     /admin/manage-promotions

     NO NAVIGATION
  ============================================================ */

  if (isAdminPromotionsPage) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

          <span className="Admin">
            Admin
          </span>

        </div>


        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            onClick={() => {
              console.log("Notifications clicked");
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell />
          </button>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        </div>

      </header>
    );
  }


  /* ============================================================
     ADMIN TRENDING CAROUSEL

     /admin/manage-carousel

     NAVIGATION:
     Trending Deals | Trending Categories
  ============================================================ */

  if (isAdminTrendingCarouselPage) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

          <span className="Admin">
            Admin
          </span>

        </div>


        <nav className="dh-header-navigation">

          <NavLink
            to="/admin/manage-trending-deals"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Trending Deals
          </NavLink>


          <NavLink
            to="/admin/manage-trending-categories"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Trending Categories
          </NavLink>

        </nav>


        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            onClick={() => {
              console.log("Notifications clicked");
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell />
          </button>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        </div>

      </header>
    );
  }


  /* ============================================================
     ADMIN TRENDING DEALS

     /admin/manage-trending-deals

     NAVIGATION:
     Trending Categories | Trending Carousel
  ============================================================ */

  if (isAdminTrendingDealsPage) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

          <span className="Admin">
            Admin
          </span>

        </div>


        <nav className="dh-header-navigation">

          <NavLink
            to="/admin/manage-trending-categories"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Trending Categories
          </NavLink>


          <NavLink
            to="/admin/manage-carousel"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Trending Carousel
          </NavLink>

        </nav>


        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            onClick={() => {
              console.log("Notifications clicked");
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell />
          </button>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        </div>

      </header>
    );
  }


  /* ============================================================
     ADMIN TRENDING CATEGORIES

     /admin/manage-trending-categories

     NAVIGATION:
     Trending Deals | Trending Carousel
  ============================================================ */

  if (isAdminTrendingCategoriesPage) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

          <span className="Admin">
            Admin
          </span>

        </div>


        <nav className="dh-header-navigation">

          <NavLink
            to="/admin/manage-trending-deals"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Trending Deals
          </NavLink>


          <NavLink
            to="/admin/manage-carousel"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Trending Carousel
          </NavLink>

        </nav>


        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            onClick={() => {
              console.log("Notifications clicked");
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell />
          </button>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        </div>

      </header>
    );
  }


  /* ============================================================
     ADMIN ORDERS

     /manage-orders

     NO BACK BUTTON
  ============================================================ */

  if (isAdminOrdersPage) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

          <span className="Admin">
            Admin
          </span>

        </div>


        <div className="page-header-title">
          Orders
        </div>


        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            onClick={() => {
              console.log("Notifications clicked");
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell />
          </button>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        </div>

      </header>
    );
  }


  /* ============================================================
     VENDOR HEADER

     ALL VENDOR PAGES SHOW:

     Home | Add Products | Manage Products

     VENDOR HOME:
     /vendorHome

     ADD PRODUCTS:
     /vendorProductPage

     EDIT PRODUCT:
     /vendor/edit-product/:inventoryId

     MANAGE PRODUCTS:
     /vendor/manage-products

     NO DASHBOARD
     NO VENDOR REQUESTS
     NO BACK BUTTON
  ============================================================ */

  if (isVendorPage) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

        </div>


        <nav className="dh-header-navigation">

          {/* ==================================================
              HOME
          ================================================== */}

          <NavLink
            to="/vendorHome"
            end
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Home
          </NavLink>


          {/* ==================================================
              ADD PRODUCTS
          ================================================== */}

          <NavLink
            to="/vendorProductPage"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Add Products
          </NavLink>


          {/* ==================================================
              MANAGE PRODUCTS
          ================================================== */}

          <NavLink
            to="/vendor/manage-products"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Manage Products
          </NavLink>

        </nav>


        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            onClick={() => {
              console.log("Notifications clicked");
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell />
          </button>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        </div>

      </header>
    );
  }


  /* ============================================================
     ADMIN DASHBOARD

     /adminDashboard

     NAVIGATION:
     Products | Vendors | Promotions
  ============================================================ */

  if (isAdminPage) {

    return (

      <header className="header">

        {showMenu && (

          <button
            type="button"
            className="dh-header-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            title="Menu"
          >
            ☰
          </button>

        )}


        <div className="left-section">

          <div className="logo">

            <span className="Gold">
              DEAL
            </span>

            <span className="Black">
              HUNTS
            </span>

          </div>

          <span className="Admin">
            Admin
          </span>

        </div>


        <nav className="dh-header-navigation">

          <NavLink
            to="/adminProducts"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Products
          </NavLink>


          <NavLink
            to="/manage-vendors"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Vendors
          </NavLink>


          <NavLink
            to="/admin/manage-promotions"
            className={({ isActive }) =>
              isActive
                ? "header-nav-link active"
                : "header-nav-link"
            }
          >
            Promotions
          </NavLink>

        </nav>


        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            onClick={() => {
              console.log("Notifications clicked");
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell />
          </button>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        </div>

      </header>
    );
  }


  /* ============================================================
     USER HEADER
  ============================================================ */

  return (

    <header className="header">

      {showMenu && (

        <button
          type="button"
          className="dh-header-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          title="Menu"
        >
          ☰
        </button>

      )}


      <div className="left-section">

        <div className="logo">

          <span className="Gold">
            DEAL
          </span>

          <span className="Black">
            HUNTS
          </span>

        </div>

      </div>


      <nav className="dh-header-navigation">

        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive
              ? "header-nav-link active"
              : "header-nav-link"
          }
        >
          Home
        </NavLink>


        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive
              ? "header-nav-link active"
              : "header-nav-link"
          }
        >
          Products
        </NavLink>


        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            isActive
              ? "header-nav-link active"
              : "header-nav-link"
          }
          onClick={(event) => {

            if (!isUserLoggedIn) {

              event.preventDefault();

              setShowWishlistPopup(true);
            }
          }}
        >
          Wishlist
        </NavLink>

      </nav>


      <Popup
        open={showWishlistPopup}
        title="Please login first"
        onClose={() => setShowWishlistPopup(false)}
        width="400px"
        className="wishlist-login-popup"
      >

        <p>
          Please login to access your wishlist.
        </p>


        <div className="wishlist-popup-actions">

          <NavLink
            to="/login"
            className="wishlist-proceed-login"
            onClick={() => setShowWishlistPopup(false)}
          >
            Proceed to Login
          </NavLink>


          <button
            type="button"
            className="wishlist-no-thanks"
            onClick={() => setShowWishlistPopup(false)}
          >
            No Thanks
          </button>

        </div>

      </Popup>


      <form
        className="header-search"
        onSubmit={handleSearch}
      >

        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
          aria-label="Search products"
        />


        <button
          type="submit"
          aria-label="Search"
          title="Search"
        >
          <FiSearch />
        </button>

      </form>


      <div className="header-actions">

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            isActive
              ? "header-icon active"
              : "header-icon"
          }
          aria-label="Cart"
          title="Cart"
        >
          <FiShoppingCart />
        </NavLink>


        {isUserLoggedIn ? (

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "header-icon active"
                : "header-icon"
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </NavLink>

        ) : (

          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive
                ? "header-login active"
                : "header-login"
            }
          >
            Login
          </NavLink>

        )}

      </div>

    </header>
  );
}


export default Header;