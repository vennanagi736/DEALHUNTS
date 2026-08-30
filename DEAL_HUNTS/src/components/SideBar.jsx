import { useState } from "react";
import "../styles/SideBar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useRole } from "../context/UseRole";
  
const COMMON_MENU = [
  { label: "Home", path: "/home" },
  { label: "Products", path: "/products" }
];

const USER_MENU = [
  { label: "Cart", path: "/cart" },
  { label: "Wishlist", path: "/wishlist" },
  { label: "Orders", path: "/orders" }
];

const VENDOR_MENU = [
  { label: "Dashboard", path: "/vendorHome" },
  { label: "Add Product", path: "/vendorProductPage" }
];

const ADMIN_MENU = [
  { label: "Dashboard", path: "/adminDashboard" },
  { label: "Users", path: "/manage-users" },
  { label: "Vendors", path: "/manage-vendors" },
  { label: "Sales", path: "/manage-sales" },
  { label: "Vendor Requests", path: "/manage-request" },
  { label: "Payments", path: "/manage-payments" },
  { label: "Manage Promotions", path: "/admin/manage-promotions" },
  { label: "Import Products", path: "/admin/import-products" }
];

function SideWindow() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const { role, logout } = useRole();

  // ============================================================
  // CLEAN ROLE
  // ============================================================

  const cleanRole = role
    ?.replace("ROLE_", "")
    .toLowerCase();

  // ============================================================
  // LOGIN STATE
  //
  // RoleContext is the single source of truth.
  // If role is null -> guest
  // If role exists -> logged in
  // ============================================================

  const isLoggedIn =
    cleanRole === "user" ||
    cleanRole === "vendor" ||
    cleanRole === "admin";

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    const currentRole = cleanRole;

    // Clear RoleContext + authentication data
    logout();

    // Close sidebar
    setOpen(false);

    // Navigate according to previous role
    if (currentRole === "user") {
      navigate("/login");
    } else if (currentRole === "vendor") {
      navigate("/vendorLogin");
    } else if (currentRole === "admin") {
      navigate("/adminLogin");
    } else {
      navigate("/home");
    }
  };

  // ============================================================
  // NAVIGATION HELPER
  // ============================================================

  const handleNavigation = () => {
    setOpen(false);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      {/* ======================================================
          HAMBURGER
      ====================================================== */}

      <div
        className="hamburger"
        onClick={() => setOpen(true)}
      >
        ☰
      </div>

      {/* ======================================================
          OVERLAY
      ====================================================== */}

      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <div
        className={`sidebar ${
          open ? "open" : ""
        }`}
      >

        {/* ====================================================
            LOGO
        ==================================================== */}

        <div className="logo1">

          <span className="Gold">
            DEAL
          </span>

          <span className="Black">
            HUNTS
          </span>

        </div>

        {/* ====================================================
            CLOSE BUTTON
        ==================================================== */}

        <button
          className="close-btn"
          onClick={() => setOpen(false)}
        >
          ✖
        </button>

        {/* ====================================================
            MENU
        ==================================================== */}

        <div className="menu-box">

          {/* ==================================================
              GUEST
              
              Only COMMON_MENU + Login
          ================================================== */}

          {!isLoggedIn && (
            <>
              {COMMON_MENU.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigation}
                >
                  {item.label}
                </NavLink>
              ))}

              <button
                type="button"
                className="sidebar-login-btn"
                onClick={() => {
                  setOpen(false);
                  navigate("/login");
                }}
              >
                Login
              </button>
            </>
          )}

          {/* ==================================================
              LOGGED-IN USER
          ================================================== */}

          {isLoggedIn &&
            cleanRole === "user" && (
              <>
                {COMMON_MENU.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavigation}
                  >
                    {item.label}
                  </NavLink>
                ))}

                {USER_MENU.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavigation}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </>
            )}

          {/* ==================================================
              VENDOR
          ================================================== */}

          {isLoggedIn &&
            cleanRole === "vendor" &&
            VENDOR_MENU.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
              >
                {item.label}
              </NavLink>
            ))}

          {/* ==================================================
              ADMIN
          ================================================== */}

          {isLoggedIn &&
            cleanRole === "admin" &&
            ADMIN_MENU.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
              >
                {item.label}
              </NavLink>
            ))}

          {/* ==================================================
              LOGOUT
              
              ONLY LOGGED-IN USERS SEE THIS
          ================================================== */}

          {isLoggedIn && (
            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt
                style={{ color: "gold" }}
              />

              <span
                style={{
                  marginLeft: "8px"
                }}
              >
                Logout
              </span>
            </button>
          )}

        </div>
      </div>
    </>
  );
}

export default SideWindow;