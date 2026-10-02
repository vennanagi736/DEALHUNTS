import React from "react";
import "../styles/SideBar.css";

import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { FaSignOutAlt } from "react-icons/fa";

import { useRole } from "../context/UseRole";


/* ============================================================
   COMMON MENU
   LOGGED-OUT USERS
============================================================ */

const COMMON_MENU = [

  {
    label: "Home",
    path: "/home",
  },

  {
    label: "Products",
    path: "/products",
  },

];


/* ============================================================
   COMMON ACCOUNT MENU
   ALL LOGGED-IN USERS
============================================================ */

const ACCOUNT_MENU = [

  {
    label: "Profile",
    path: "/profile",
  },

  {
    label: "Settings",
    path: "/settings",
  },

];


/* ============================================================
   USER MENU
============================================================ */

const USER_MENU = [

  {
    label: "Home",
    path: "/home",
  },

  {
    label: "Products",
    path: "/products",
  },

  {
    label: "Wishlist",
    path: "/wishlist",
  },

  {
    label: "Cart",
    path: "/cart",
  },

  {
    label: "My Visit Requests",
    path: "/user/visit-requests",
  },

];


/* ============================================================
   VENDOR MENU
============================================================ */

const VENDOR_MENU = [

  {
    label: "Home",
    path: "/vendorHome",
  },

  {
    label: "Add Product",
    path: "/vendorProductPage",
  },

  {
    label: "Manage Products",
    path: "/vendor/manage-products",
  },

  {
    label: "Visit Requests",
    path: "/vendor/visit-requests",
  },

];


/* ============================================================
   ADMIN MENU
============================================================ */

const ADMIN_MENU = [

  {
    label: "Dashboard",
    path: "/adminDashboard",
  },

  {
    label: "Users",
    path: "/manage-users",
  },

  {
    label: "Vendors",
    path: "/manage-vendors",
  },

  {
    label: "Manage Products",
    path: "/admin/manage-product",
  },

  {
    label: "Master Data",
    path: "/admin/master-data",
  },

  {
    label: "Sales",
    path: "/manage-sales",
  },

  {
    label: "Vendor Requests",
    path: "/manage-request",
  },

  {
    label: "Visit Requests",
    path: "/admin/visit-requests",
  },

  {
    label: "Payments",
    path: "/manage-payments",
  },

  {
    label: "Manage Promotions",
    path: "/admin/manage-promotions",
  },

  {
    label: "Import Products",
    path: "/admin/import-products",
  },

];


/* ============================================================
   PATH NORMALIZER
============================================================ */

const normalizePath = (path) => {

  if (!path) {
    return "/";
  }

  const normalized =
    String(path)
      .trim()
      .replace(/\/+$/, "");

  return normalized || "/";
};


/* ============================================================
   ROLE NORMALIZER
============================================================ */

const normalizeRole = (role) => {

  if (!role) {
    return "";
  }

  return String(role)
    .replace(/^ROLE_/i, "")
    .trim()
    .toLowerCase();
};


/* ============================================================
   SIDEBAR
============================================================ */

function Sidebar({

  isSidebarOpen = false,

  closeSidebar,

}) {

  const navigate = useNavigate();

  const location = useLocation();

  const {
    role,
    logout,
  } = useRole();


  /* ==========================================================
     NORMALIZE ROLE
  ========================================================== */

  const cleanRole =
    normalizeRole(role);


  /* ==========================================================
     TOKEN FALLBACK

     This makes the Sidebar more reliable if the role context
     has not updated yet after login.
  ========================================================== */

  const detectedRole = (() => {

    if (cleanRole === "user") {
      return "user";
    }

    if (cleanRole === "vendor") {
      return "vendor";
    }

    if (cleanRole === "admin") {
      return "admin";
    }


    /* --------------------------------------------------------
       ADMIN
    -------------------------------------------------------- */

    if (
      localStorage.getItem("adminJwtToken") ||
      localStorage.getItem("adminToken")
    ) {
      return "admin";
    }


    /* --------------------------------------------------------
       VENDOR
    -------------------------------------------------------- */

    if (
      localStorage.getItem("vendorJwtToken") ||
      localStorage.getItem("vendorToken")
    ) {
      return "vendor";
    }


    /* --------------------------------------------------------
       USER
    -------------------------------------------------------- */

    if (
      localStorage.getItem("userJwtToken") ||
      localStorage.getItem("jwtToken")
    ) {
      return "user";
    }


    return "";

  })();


  /* ==========================================================
     LOGIN STATUS
  ========================================================== */

  const isLoggedIn =
    detectedRole === "user" ||
    detectedRole === "vendor" ||
    detectedRole === "admin";


  /* ==========================================================
     SAFE CLOSE SIDEBAR
  ========================================================== */

  const handleCloseSidebar = () => {

    if (
      typeof closeSidebar === "function"
    ) {

      closeSidebar();

    }

  };


  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {

    const currentRole =
      detectedRole;


    try {

      if (
        typeof logout === "function"
      ) {

        logout();

      }

    } catch (error) {

      console.error(
        "Sidebar logout error:",
        error
      );

    }


    /* --------------------------------------------------------
       EXTRA TOKEN CLEANUP

       This guarantees the correct session is removed even
       if the context logout does not remove every token.
    -------------------------------------------------------- */

    if (currentRole === "user") {

      localStorage.removeItem(
        "userJwtToken"
      );

      localStorage.removeItem(
        "userRole"
      );

      localStorage.removeItem(
        "userId"
      );

      localStorage.removeItem(
        "role"
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );

      handleCloseSidebar();

      return;
    }


    if (currentRole === "vendor") {

      localStorage.removeItem(
        "vendorJwtToken"
      );

      localStorage.removeItem(
        "vendorRole"
      );

      localStorage.removeItem(
        "vendorId"
      );

      navigate(
        "/vendorLogin",
        {
          replace: true,
        }
      );

      handleCloseSidebar();

      return;
    }


    if (currentRole === "admin") {

      localStorage.removeItem(
        "adminJwtToken"
      );

      localStorage.removeItem(
        "adminRole"
      );

      localStorage.removeItem(
        "adminId"
      );

      navigate(
        "/adminLogin",
        {
          replace: true,
        }
      );

      handleCloseSidebar();

      return;
    }


    handleCloseSidebar();

    navigate(
      "/home",
      {
        replace: true,
      }
    );

  };


  /* ==========================================================
     LOGIN
  ========================================================== */

  const handleLogin = () => {

    handleCloseSidebar();

    navigate(
      "/login",
      {
        replace: false,
      }
    );

  };


  /* ==========================================================
     MENU ITEM
  ========================================================== */

  const renderMenuItem = (item) => {

    const currentPath =
      normalizePath(
        location.pathname
      );

    const itemPath =
      normalizePath(
        item.path
      );


    const isExactMatch =
      currentPath === itemPath;


    const isNestedPage =
      itemPath !== "/" &&
      currentPath.startsWith(
        `${itemPath}/`
      );


    const isActive =
      isExactMatch ||
      isNestedPage;


    return (

      <NavLink
        key={item.path}
        to={item.path}
        end={
          item.path === "/home" ||
          item.path === "/products"
        }
        onClick={
          handleCloseSidebar
        }
        className={
          isActive
            ? "dh-navigation-link dh-navigation-link-active"
            : "dh-navigation-link"
        }
        aria-current={
          isActive
            ? "page"
            : undefined
        }
      >

        <span
          className="dh-navigation-link-label"
        >
          {item.label}
        </span>

      </NavLink>

    );

  };


  /* ==========================================================
     USER SIDEBAR
  ========================================================== */

  const renderUserMenu = () => {

    return (

      <>

        <div
          className="dh-sidebar-menu-group"
        >
          {USER_MENU.map(
            renderMenuItem
          )}
        </div>


        <div
          className="dh-sidebar-account-section"
        >
          {ACCOUNT_MENU.map(
            renderMenuItem
          )}
        </div>

      </>

    );

  };


  /* ==========================================================
     VENDOR SIDEBAR
  ========================================================== */

  const renderVendorMenu = () => {

    return (

      <>

        <div
          className="dh-sidebar-menu-group"
        >
          {VENDOR_MENU.map(
            renderMenuItem
          )}
        </div>


        <div
          className="dh-sidebar-account-section"
        >
          {ACCOUNT_MENU.map(
            renderMenuItem
          )}
        </div>

      </>

    );

  };


  /* ==========================================================
     ADMIN SIDEBAR
  ========================================================== */

  const renderAdminMenu = () => {

    return (

      <>

        <div
          className="dh-sidebar-menu-group"
        >
          {ADMIN_MENU.map(
            renderMenuItem
          )}
        </div>


        <div
          className="dh-sidebar-account-section"
        >
          {ACCOUNT_MENU.map(
            renderMenuItem
          )}
        </div>

      </>

    );

  };


  /* ==========================================================
     LOGGED-OUT SIDEBAR
  ========================================================== */

  const renderLoggedOutMenu = () => {

    return (

      <>

        <div
          className="dh-sidebar-menu-group"
        >
          {COMMON_MENU.map(
            renderMenuItem
          )}
        </div>


        <div
          className="dh-sidebar-account-section"
        >

          <button
            type="button"
            className="dh-sidebar-login"
            onClick={handleLogin}
          >
            Login
          </button>

        </div>

      </>

    );

  };


  /* ==========================================================
     ROLE MENU
  ========================================================== */

  const renderRoleMenu = () => {

    /* --------------------------------------------------------
       NOT LOGGED IN
    -------------------------------------------------------- */

    if (!isLoggedIn) {
      return renderLoggedOutMenu();
    }


    /* --------------------------------------------------------
       USER
    -------------------------------------------------------- */

    if (detectedRole === "user") {
      return renderUserMenu();
    }


    /* --------------------------------------------------------
       VENDOR
    -------------------------------------------------------- */

    if (detectedRole === "vendor") {
      return renderVendorMenu();
    }


    /* --------------------------------------------------------
       ADMIN
    -------------------------------------------------------- */

    if (detectedRole === "admin") {
      return renderAdminMenu();
    }


    return renderLoggedOutMenu();

  };


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <>

      {/* ======================================================
          BACKDROP
      ====================================================== */}

      {isSidebarOpen && (

        <div
          className="dh-sidebar-backdrop"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />

      )}


      {/* ======================================================
          SIDEBAR PANEL
      ====================================================== */}

      <aside
        className={
          isSidebarOpen
            ? "dh-sidebar-panel dh-sidebar-panel-open"
            : "dh-sidebar-panel"
        }
        aria-hidden={
          !isSidebarOpen
        }
      >

        {/* ====================================================
            BRAND
        ==================================================== */}

        <div
          className="dh-sidebar-brand"
        >

          <span
            className="dh-sidebar-brand-deal"
          >
            DEAL
          </span>

          <span
            className="dh-sidebar-brand-hunts"
          >
            HUNTS
          </span>

        </div>


        {/* ====================================================
            CLOSE BUTTON
        ==================================================== */}

        <button
          type="button"
          className="dh-sidebar-close"
          onClick={
            handleCloseSidebar
          }
          aria-label="Close navigation menu"
        >

          <span aria-hidden="true">
            ×
          </span>

        </button>


        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <nav
          className="dh-sidebar-navigation"
          aria-label="Main navigation"
        >

          {renderRoleMenu()}


          {/* ==================================================
              LOGOUT
          ================================================== */}

          {isLoggedIn && (

            <div
              className="dh-sidebar-logout-section"
            >

              <button
                type="button"
                className="dh-sidebar-logout"
                onClick={
                  handleLogout
                }
              >

                <FaSignOutAlt
                  className="dh-sidebar-logout-icon"
                  aria-hidden="true"
                />

                <span
                  className="dh-sidebar-logout-text"
                >
                  Logout
                </span>

              </button>

            </div>

          )}

        </nav>

      </aside>

    </>

  );

}


export default Sidebar;
