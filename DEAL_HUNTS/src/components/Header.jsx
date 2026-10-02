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

function Logo({ admin = false }) {

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
        <span className="Admin">
          Admin
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
     
     Token is the actual login/session indicator.
     This prevents stale role values from localStorage
     incorrectly changing the current role.
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

  const [mobileNavVisible, setMobileNavVisible] =
    useState(true);


  /* ==========================================================
     CURRENT PATH
  ========================================================== */

  const currentPath =
    location.pathname.toLowerCase();


  /* ==========================================================
     MOBILE NAVIGATION VISIBILITY
  ========================================================== */

  useEffect(() => {

    const handleScroll = () => {

      if (window.scrollY <= 8) {
        setMobileNavVisible(true);
      } else {
        setMobileNavVisible(false);
      }

    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };

  }, []);


  /* ==========================================================
     LOGIN PAGES
  ========================================================== */

  const isLoginPage =
    currentPath === "/login" ||
    currentPath === "/register" ||
    currentPath === "/adminlogin" ||
    currentPath === "/vendorlogin" ||
    currentPath === "/vendorregister";


  /* ==========================================================
     PROFILE PAGE

     IMPORTANT:
     /profile is shared by USER / VENDOR / ADMIN.
  ========================================================== */

  const isProfilePage =
    currentPath === "/profile";


  /* ==========================================================
     PROFILE ROLE

     Only relevant when current page is /profile.
  ========================================================== */

  const profileRole =
    isProfilePage
      ? getCurrentStoredRole()
      : null;


  /* ==========================================================
     VENDOR PAGE

     Normal vendor pages:
       /vendorHome
       /vendorProductPage
       /vendor/manage-products
       /vendor/...

     Also:
       /profile when logged-in role = VENDOR
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

     Normal admin pages:
       /admin...
       /manage-...

     Also:
       /profile when logged-in role = ADMIN
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

     USER HEADER is shown only for a logged-in USER.
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


  /* ============================================================
     ADMIN IMPORT PRODUCTS
  ============================================================ */

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

        <AccountActions />

      </header>
    );

  }


  /* ============================================================
     ADMIN MASTER DATA
  ============================================================ */

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

        <AccountActions />

      </header>
    );

  }


  /* ============================================================
     ADMIN VENDORS
  ============================================================ */

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


  /* ============================================================
     ADMIN PROMOTIONS
  ============================================================ */

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


  /* ============================================================
     ADMIN TRENDING CAROUSEL
  ============================================================ */

  const isAdminTrendingCarouselPage =
    currentPath === "/admin/manage-carousel";


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

        <Logo admin />

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

        <AccountActions />

      </header>
    );

  }


  /* ============================================================
     ADMIN TRENDING DEALS
  ============================================================ */

  const isAdminTrendingDealsPage =
    currentPath === "/admin/manage-trending-deals";


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

        <Logo admin />

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

        <AccountActions />

      </header>
    );

  }


  /* ============================================================
     ADMIN TRENDING CATEGORIES
  ============================================================ */

  const isAdminTrendingCategoriesPage =
    currentPath === "/admin/manage-trending-categories";


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

        <Logo admin />

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

        <AccountActions />

      </header>
    );

  }


  /* ============================================================
     ADMIN ORDERS
  ============================================================ */

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


  /* ============================================================
     VENDOR HEADER
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

        <Logo />

        <nav className="dh-header-navigation">

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
     ADMIN GENERAL HEADER
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
          
          Hidden on USER HOME page.
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
            mobileNavVisible
              ? "mobile-nav-visible"
              : "mobile-nav-hidden"
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
          
          Used by both:
          - Wishlist
          - Cart
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
          
          Hidden on USER HOME page.
      -------------------------------------------------------- */}

      {currentPath !== "/home" && (

        <form className="header-search" onSubmit={handleSearch}>
  <input
    type="text"
    placeholder="Search products..."
    value={searchQuery}
    onChange={(event) => setSearchQuery(event.target.value)}
    aria-label="Search products"
  />

  {searchQuery ? (
    <button
      type="button"
      className="header-search-clear"
      onClick={() => setSearchQuery("")}
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

        {/* ------------------------------------------------------
            CART
        ------------------------------------------------------ */}

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


        {/* ------------------------------------------------------
            PROFILE / LOGIN
        ------------------------------------------------------ */}

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