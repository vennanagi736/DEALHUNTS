import "../styles/SideBar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useRole } from "../context/UseRole";

/* ============================================================
   COMMON MENU
   Available to logged-out users
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
   Available to every logged-in role
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
   SIDEBAR
============================================================ */

function Sidebar({
  isSidebarOpen,
  closeSidebar,
}) {
  const navigate = useNavigate();

  const {
    role,
    logout,
  } = useRole();

  /* ==========================================================
     NORMALIZE ROLE
  ========================================================== */

  const cleanRole = role
    ?.replace("ROLE_", "")
    .toLowerCase();

  /* ==========================================================
     LOGIN STATUS
  ========================================================== */

  const isLoggedIn =
    cleanRole === "user" ||
    cleanRole === "vendor" ||
    cleanRole === "admin";

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    const currentRole = cleanRole;

    logout();
    closeSidebar();

    if (currentRole === "user") {
      navigate("/login");
      return;
    }

    if (currentRole === "vendor") {
      navigate("/vendorLogin");
      return;
    }

    if (currentRole === "admin") {
      navigate("/adminLogin");
      return;
    }

    navigate("/home");
  };

  /* ==========================================================
     NAVIGATION ITEM
  ========================================================== */

  const renderMenuItem = (item) => {
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={closeSidebar}
        className={({ isActive }) =>
          `dh-navigation-link ${
            isActive
              ? "dh-navigation-link-active"
              : ""
          }`
        }
      >
        {item.label}
      </NavLink>
    );
  };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <>
      {/* ======================================================
          BACKDROP
      ====================================================== */}

      {isSidebarOpen && (
        <div
          className="dh-sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ======================================================
          SIDEBAR PANEL
      ====================================================== */}

      <aside
        className={`dh-sidebar-panel ${
          isSidebarOpen
            ? "dh-sidebar-panel-open"
            : ""
        }`}
        aria-hidden={!isSidebarOpen}
      >

        {/* ====================================================
            BRAND
        ==================================================== */}

        <div className="dh-sidebar-brand">
          <span className="dh-sidebar-brand-deal">
            DEAL
          </span>

          <span className="dh-sidebar-brand-hunts">
            HUNTS
          </span>
        </div>

        {/* ====================================================
            CLOSE
        ==================================================== */}

        <button
          type="button"
          className="dh-sidebar-close"
          onClick={closeSidebar}
          aria-label="Close navigation menu"
        >
          ✖
        </button>

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <nav
          className="dh-sidebar-navigation"
          aria-label="Main navigation"
        >

          {/* ==================================================
              LOGGED OUT
              
              Home
              Products
              Login
          ================================================== */}

          {!isLoggedIn && (
            <>
              {COMMON_MENU.map(renderMenuItem)}

              <button
                type="button"
                className="dh-sidebar-login"
                onClick={() => {
                  closeSidebar();
                  navigate("/login");
                }}
              >
                Login
              </button>
            </>
          )}

          {/* ==================================================
              USER

              Home
              Products
              Wishlist
              Cart
              Profile
              Settings
          ================================================== */}

          {isLoggedIn && cleanRole === "user" && (
            <>
              {USER_MENU.map(renderMenuItem)}

              {ACCOUNT_MENU.map(renderMenuItem)}
            </>
          )}

          {/* ==================================================
              VENDOR

              Home
              Add Product
              Manage Products
              Profile
              Settings
          ================================================== */}

          {isLoggedIn && cleanRole === "vendor" && (
            <>
              {VENDOR_MENU.map(renderMenuItem)}

              {ACCOUNT_MENU.map(renderMenuItem)}
            </>
          )}

          {/* ==================================================
              ADMIN

              Dashboard
              Users
              Vendors
              Manage Products
              Master Data
              Sales
              Vendor Requests
              Payments
              Manage Promotions
              Import Products
              Profile
              Settings
          ================================================== */}

          {isLoggedIn && cleanRole === "admin" && (
            <>
              {ADMIN_MENU.map(renderMenuItem)}

              {ACCOUNT_MENU.map(renderMenuItem)}
            </>
          )}

          {/* ==================================================
              LOGOUT
          ================================================== */}

          {isLoggedIn && (
            <button
              type="button"
              className="dh-sidebar-logout"
              onClick={handleLogout}
            >
              <FaSignOutAlt
                className="dh-sidebar-logout-icon"
              />

              <span className="dh-sidebar-logout-text">
                Logout
              </span>
            </button>
          )}

        </nav>
      </aside>
    </>
  );
}

export default Sidebar;