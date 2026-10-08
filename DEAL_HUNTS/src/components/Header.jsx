import React, { useEffect, useState } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Popup from "./Popup";

import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiBell,
  FiX,
} from "react-icons/fi";

import "../styles/Header.css";


/* ============================================================
   COMMON LOGO
============================================================ */

function Logo({ admin = false, vendor = false }) {

  return (
    <div className="left-section">

      <div className="logo">

        <span className="Gold">
          DEAL
        </span>

        <span className="Black">
          HUNTS
        </span>

      </div>

      {admin && (
        <span className="Admin-hl">
          ADMIN
        </span>
      )}

      {vendor && (
        <span className="Vendor">
          VENDOR
        </span>
      )}

    </div>
  );
}


/* ============================================================
   ROLE NORMALIZER
============================================================ */

function normalizeHeaderRole(role) {

  if (!role) {
    return null;
  }

  const normalized = String(role)
    .replace(/^ROLE_/i, "")
    .trim()
    .toUpperCase();

  if (
    normalized === "USER" ||
    normalized === "VENDOR" ||
    normalized === "ADMIN"
  ) {
    return normalized;
  }

  return null;
}


/* ============================================================
   GET CURRENT LOGGED-IN ROLE
============================================================ */

function getCurrentStoredRole() {

  /* ----------------------------------------------------------
     TOKEN FIRST
  ---------------------------------------------------------- */

  if (
    localStorage.getItem("adminJwtToken") ||
    localStorage.getItem("adminToken")
  ) {
    return "ADMIN";
  }


  if (
    localStorage.getItem("vendorJwtToken") ||
    localStorage.getItem("vendorToken")
  ) {
    return "VENDOR";
  }


  if (
    localStorage.getItem("userJwtToken") ||
    localStorage.getItem("jwtToken")
  ) {
    return "USER";
  }


  /* ----------------------------------------------------------
     FALLBACK: EXPLICIT ROLE VALUES
  ---------------------------------------------------------- */

  const roleKeys = [
    "adminRole",
    "vendorRole",
    "userRole",
    "role",
    "admin_role",
    "vendor_role",
    "user_role",
  ];

  for (const key of roleKeys) {

    const storedRole =
      localStorage.getItem(key);

    const normalizedRole =
      normalizeHeaderRole(storedRole);

    if (normalizedRole) {
      return normalizedRole;
    }
  }


  return null;
}


/* ============================================================
   ACCOUNT ACTIONS
   Used by ADMIN and VENDOR headers
============================================================ */

function AccountActions() {

  const navigate = useNavigate();

  return (
    <div className="header-actions">

      {/* ------------------------------------------------------
          NOTIFICATIONS
      ------------------------------------------------------ */}

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


      {/* ------------------------------------------------------
          PROFILE
      ------------------------------------------------------ */}

      <button
        type="button"
        className="header-icon"
        onClick={() => navigate("/profile")}
        aria-label="Profile"
        title="Profile"
      >
        <FiUser />
      </button>

    </div>
  );
}


/* ============================================================
   HEADER
============================================================ */

function Header({
  onMenuClick,
  showMenu = true,
}) {

  const navigate = useNavigate();
  const location = useLocation();


  /* ==========================================================
     STATE
  ========================================================== */

  const [searchQuery, setSearchQuery] =
    useState("");

  const [showWishlistPopup, setShowWishlistPopup] =
    useState(false);

  const [loginPopupMessage, setLoginPopupMessage] =
    useState(
      "Please login to access your wishlist."
    );

  const [searchOpen, setSearchOpen] =
    useState(false);


  /*
     This state controls ONLY the mobile navigation.

     Desktop and laptop/tablet remain visible.
  */
  const [mobileNavVisible, setMobileNavVisible] =
    useState(true);


  /*
     Controls the Admin Content / Trending dropdowns.
  */
  const [openAdminDropdown, setOpenAdminDropdown] =
    useState(null);


  /* ==========================================================
     CURRENT PATH
  ========================================================== */

  const currentPath =
    location.pathname.toLowerCase();


  /* ==========================================================
     MOBILE NAVIGATION VISIBILITY
  ========================================================== */

  useEffect(() => {

    let hideTimer = null;

    const isMobile = () => {
      return window.innerWidth <= 768;
    };


    const handleScroll = () => {

      /*
         Desktop / laptop / tablet:
         Do absolutely nothing to navigation visibility.
      */

      if (!isMobile()) {

        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }

        setMobileNavVisible(true);

        return;
      }


      /*
         MOBILE:
         As soon as scrolling begins,
         show the navigation.
      */

      setMobileNavVisible(true);


      /*
         Clear previous hide timer.
      */

      if (hideTimer) {
        clearTimeout(hideTimer);
      }


      /*
         Hide after scrolling stops
         for 1.5 seconds.
      */

      hideTimer = setTimeout(() => {

        if (window.innerWidth <= 768) {
          setMobileNavVisible(false);
        }

      }, 1500);

    };


    const handleResize = () => {

      if (window.innerWidth > 768) {

        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }

        setMobileNavVisible(true);
      }
    };


    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      handleResize
    );


    setMobileNavVisible(true);


    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      if (hideTimer) {
        clearTimeout(hideTimer);
      }

    };

  }, []);


  /* ==========================================================
     CLOSE ADMIN DROPDOWN WHEN ROUTE CHANGES
  ========================================================== */

  useEffect(() => {

    setOpenAdminDropdown(null);

  }, [location.pathname]);


  /* ==========================================================
     CLOSE ADMIN DROPDOWN WHEN CLICKING OUTSIDE
  ========================================================== */

  useEffect(() => {

    const handleOutsideClick = (event) => {

      if (
        !event.target.closest(
          ".dh-admin-dropdown"
        )
      ) {

        setOpenAdminDropdown(null);

      }

    };


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);


  /* ==========================================================
     TOGGLE ADMIN DROPDOWN
  ========================================================== */

  const toggleAdminDropdown = (name) => {

    setOpenAdminDropdown(
      previous =>
        previous === name
          ? null
          : name
    );

  };


  /* ==========================================================
     MOBILE NAV CLASS
  ========================================================== */

  const mobileNavClass =
    mobileNavVisible
      ? "mobile-nav-visible"
      : "mobile-nav-hidden";


  /* ==========================================================
     LOGIN / AUTH PAGES
  ========================================================== */

  const isLoginPage =
    currentPath === "/login" ||
    currentPath === "/register" ||
    currentPath === "/adminlogin" ||
    currentPath === "/vendorlogin" ||
    currentPath === "/vendorregister";


  /* ==========================================================
     FORGOT PASSWORD PAGE
  ========================================================== */

  const isForgotPasswordPage =
    currentPath === "/forgot-password";


  /* ==========================================================
     FORGOT PASSWORD HEADER
  ========================================================== */

  if (isForgotPasswordPage) {

    return (
      <header className="header">

        <Logo />

      </header>
    );

  }


  /* ==========================================================
     PROFILE PAGE
  ========================================================== */

  const isProfilePage =
    currentPath === "/profile";


  /* ==========================================================
     PROFILE ROLE
  ========================================================== */

  const profileRole =
    isProfilePage
      ? getCurrentStoredRole()
      : null;


  /* ==========================================================
     VENDOR PAGE
  ========================================================== */

  const isVendorPage =
    !isLoginPage &&
    (
      currentPath.startsWith("/vendor") ||
      (
        isProfilePage &&
        profileRole === "VENDOR"
      )
    );


  /* ==========================================================
     ADMIN PAGE
  ========================================================== */

  const isAdminPage =
    !isLoginPage &&
    (
      currentPath.startsWith("/admin") ||
      currentPath.startsWith("/manage-") ||
      (
        isProfilePage &&
        profileRole === "ADMIN"
      )
    );


  /* ==========================================================
     USER LOGIN STATUS
  ========================================================== */

  const isUserLoggedIn =
    !!(
      localStorage.getItem("userJwtToken") ||
      localStorage.getItem("jwtToken")
    );


  /* ==========================================================
     SEARCH
  ========================================================== */

  const handleSearch = (event) => {

    event.preventDefault();

    const search =
      searchQuery.trim();

    setSearchOpen(false);

    if (!search) {

      navigate("/products");

      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(search)}`
    );

  };


  /* ==========================================================
     MOBILE SEARCH
  ========================================================== */

  const toggleMobileSearch = () => {

    setSearchOpen(
      previous => !previous
    );

  };


  /* ==========================================================
     WISHLIST LOGIN POPUP
  ========================================================== */

  const openWishlistLoginPopup = () => {

    setLoginPopupMessage(
      "Please login to access your wishlist."
    );

    setShowWishlistPopup(true);

  };


  /* ==========================================================
     CART LOGIN POPUP
  ========================================================== */

  const openCartLoginPopup = () => {

    setLoginPopupMessage(
      "Please login to continue first."
    );

    setShowWishlistPopup(true);

  };


  /* ==========================================================
     LOGIN / REGISTER HEADER
  ========================================================== */

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

        <Logo />

      </header>
    );

  }


  /* ==========================================================
     ADMIN PRODUCTS
  ========================================================== */

  const isAdminProductsPage =
    currentPath === "/adminproducts";


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

        <Logo admin />

        <nav
          className={`dh-header-navigation ${mobileNavClass}`}
        >

          
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

        <AccountActions />

      </header>
    );

  }


  /* ==========================================================
     ADMIN IMPORT PRODUCTS
  ========================================================== */

  const isAdminImportPage =
    currentPath === "/admin/import-products";


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

        <Logo admin />

        <nav
          className={`dh-header-navigation ${mobileNavClass}`}
        >

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

        <AccountActions />

      </header>
    );

  }


  /* ==========================================================
     ADMIN MASTER DATA
  ========================================================== */

  const isAdminMasterDataPage =
    currentPath === "/admin/master-data";


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

        <Logo admin />

        <nav
          className={`dh-header-navigation ${mobileNavClass}`}
        >

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

        <AccountActions />

      </header>
    );

  }


  /* ==========================================================
     ADMIN VENDORS
  ========================================================== */

  const isAdminVendorsSection =
    currentPath === "/manage-vendors" ||
    currentPath.startsWith("/admin/vendors");


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

        <Logo admin />

        <AccountActions />

      </header>
    );

  }


  /* ==========================================================
     ADMIN PROMOTIONS
  ========================================================== */

  const isAdminPromotionsPage =
    currentPath === "/admin/manage-promotions";


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

        <Logo admin />

        <AccountActions />

      </header>
    );

  }


  /* ==========================================================
     ADMIN ORDERS
  ========================================================== */

  const isAdminOrdersPage =
    currentPath === "/manage-orders" ||
    currentPath === "/admin/orders";


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

        <Logo admin />

        <div className="page-header-title">
          Orders
        </div>

        <AccountActions />

      </header>
    );

  }


  /* ==========================================================
     VENDOR HEADER
  ========================================================== */

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

        <Logo vendor />

        <nav
          className={`dh-header-navigation ${mobileNavClass}`}
        >

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

        <AccountActions />

      </header>
    );

  }


  /* ============================================================
     ADMIN CONTENT + TRENDING PAGES
     
     IMPORTANT:
     Content / Trending dropdowns appear ONLY on these
     8 pages.
  ============================================================ */

  const isAdminContentTrendingPage =
    currentPath === "/admin/manage-carousel" ||
    currentPath === "/admin/manage-trending-deals" ||
    currentPath === "/admin/manage-trending-categories" ||
    currentPath === "/admin/manage-available-near-you" ||
    currentPath === "/admin/manage-why-dealhunts" ||
    currentPath === "/admin/manage-todays-deals" ||
    currentPath === "/admin/manage-coming-soon" ||
    currentPath === "/admin/manage-new-arrivals";


  if (isAdminContentTrendingPage) {

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


        {/* ====================================================
            ADMIN LOGO
        ==================================================== */}

        <Logo admin />


        {/* ====================================================
            ADMIN CONTENT / TRENDING NAVIGATION

            ONLY THESE TWO SECTIONS
        ==================================================== */}

        <nav
          className={`dh-header-navigation ${mobileNavClass} dh-admin-navigation`}
        >

          {/* ==================================================
              CONTENT DROPDOWN
          ================================================== */}

          <div
            className={`dh-admin-dropdown ${
              openAdminDropdown === "content"
                ? "open"
                : ""
            }`}
          >

            <button
              type="button"
              className="dh-admin-dropdown-trigger"
              onClick={() =>
                toggleAdminDropdown("content")
              }
              aria-haspopup="true"
              aria-expanded={
                openAdminDropdown === "content"
              }
            >

              <span>
                Content
              </span>

              <span className="dh-admin-dropdown-arrow">
                ▾
              </span>

            </button>


            <div className="dh-admin-dropdown-menu">

              <NavLink
                to="/admin/manage-new-arrivals"
                className="dh-admin-dropdown-item"
              >
                New Arrivals
              </NavLink>


              <NavLink
                to="/admin/manage-coming-soon"
                className="dh-admin-dropdown-item"
              >
                Coming Soon
              </NavLink>


              <NavLink
                to="/admin/manage-why-dealhunts"
                className="dh-admin-dropdown-item"
              >
                Why DealHunts
              </NavLink>


              <NavLink
                to="/admin/manage-available-near-you"
                className="dh-admin-dropdown-item"
              >
                Available Near You
              </NavLink>


              <NavLink
                to="/admin/manage-todays-deals"
                className="dh-admin-dropdown-item"
              >
                Today's Deals
              </NavLink>

            </div>

          </div>


          {/* ==================================================
              TRENDING DROPDOWN
          ================================================== */}

          <div
            className={`dh-admin-dropdown ${
              openAdminDropdown === "trending"
                ? "open"
                : ""
            }`}
          >

            <button
              type="button"
              className="dh-admin-dropdown-trigger"
              onClick={() =>
                toggleAdminDropdown("trending")
              }
              aria-haspopup="true"
              aria-expanded={
                openAdminDropdown === "trending"
              }
            >

              <span>
                Trending
              </span>

              <span className="dh-admin-dropdown-arrow">
                ▾
              </span>

            </button>


            <div className="dh-admin-dropdown-menu">

              <NavLink
                to="/admin/manage-carousel"
                className="dh-admin-dropdown-item"
              >
                Trending Carousel
              </NavLink>


              <NavLink
                to="/admin/manage-trending-deals"
                className="dh-admin-dropdown-item"
              >
                Trending Deals
              </NavLink>


              <NavLink
                to="/admin/manage-trending-categories"
                className="dh-admin-dropdown-item"
              >
                Trending Categories
              </NavLink>

            </div>

          </div>

        </nav>


        {/* ====================================================
            ADMIN ACCOUNT ACTIONS
        ==================================================== */}

        <AccountActions />

      </header>
    );

  }


  /* ============================================================
     ADMIN GENERAL HEADER
     
     KEEP THE OLD ADMIN HEADER FOR ALL OTHER ADMIN PAGES.
     
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

        <Logo admin />

        <nav
          className={`dh-header-navigation ${mobileNavClass}`}
        >

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

        <AccountActions />

      </header>
    );

  }


  /* ============================================================
     USER HEADER
  ============================================================ */

  return (
    <header
      className={
        `header ${
          searchOpen
            ? "mobile-search-open"
            : ""
        }`
      }
    >

      {/* --------------------------------------------------------
          MENU
      -------------------------------------------------------- */}

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


      {/* --------------------------------------------------------
          LOGO
      -------------------------------------------------------- */}

      <Logo />


      {/* --------------------------------------------------------
          MOBILE SEARCH BUTTON
      -------------------------------------------------------- */}

      {currentPath !== "/home" && (

        <button
          type="button"
          className="mobile-search-button"
          onClick={toggleMobileSearch}
          aria-label={
            searchOpen
              ? "Close search"
              : "Open search"
          }
          aria-expanded={searchOpen}
          title={
            searchOpen
              ? "Close search"
              : "Search"
          }
        >

          {searchOpen ? (
            <FiX />
          ) : (
            <FiSearch />
          )}

        </button>

      )}


      {/* --------------------------------------------------------
          USER NAVIGATION
      -------------------------------------------------------- */}

      <nav
        className={
          `dh-header-navigation ${
            mobileNavClass
          }`
        }
      >

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

              openWishlistLoginPopup();

            }

          }}
        >
          Wishlist
        </NavLink>

      </nav>


      {/* --------------------------------------------------------
          LOGIN POPUP
      -------------------------------------------------------- */}

      <Popup
        open={showWishlistPopup}
        title="Please login first"
        onClose={() =>
          setShowWishlistPopup(false)
        }
        width="400px"
        className="wishlist-login-popup"
      >

        <p>
          {loginPopupMessage}
        </p>


        <div className="wishlist-popup-actions">

          <NavLink
            to="/login"
            className="wishlist-proceed-login"
            onClick={() =>
              setShowWishlistPopup(false)
            }
          >
            Proceed to Login
          </NavLink>


          <button
            type="button"
            className="wishlist-no-thanks"
            onClick={() =>
              setShowWishlistPopup(false)
            }
          >
            No Thanks
          </button>

        </div>

      </Popup>


      {/* --------------------------------------------------------
          SEARCH FORM
      -------------------------------------------------------- */}

      {currentPath !== "/home" && (

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


          {searchQuery ? (

            <button
              type="button"
              className="header-search-clear"
              onClick={() =>
                setSearchQuery("")
              }
              aria-label="Clear search"
              title="Clear search"
            >
              <FiX />
            </button>

          ) : (

            <button
              type="submit"
              aria-label="Search"
              title="Search"
            >
              <FiSearch />
            </button>

          )}

        </form>

      )}


      {/* --------------------------------------------------------
          USER ACTIONS
      -------------------------------------------------------- */}

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
          onClick={(event) => {

            if (!isUserLoggedIn) {

              event.preventDefault();

              openCartLoginPopup();

            }

          }}
        >
          <FiShoppingCart />
        </NavLink>


        {isUserLoggedIn ? (

          <button
            type="button"
            className={
              `header-icon ${
                currentPath === "/profile"
                  ? "active"
                  : ""
              }`
            }
            onClick={() =>
              navigate("/profile")
            }
            aria-label="Profile"
            title="Profile"
          >
            <FiUser />
          </button>

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