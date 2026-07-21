import { useState } from "react";
import "../styles/SideBar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useRole } from "../context/UseRole";

const MENU_CONFIG = {
  user: [
    { label: "Home", path: "/home" },
    { label: "Cart", path: "/cart" },
    { label: "Wishlist", path: "/wishlist" },
    { label: "Orders", path: "/orders" }
  ],
  vendor: [
    { label: "Dashboard", path: "/vendorHome" },
    { label: "Add Product", path: "/vendorProductPage" }
  ],
  admin: [
    { label: "Dashboard", path: "/adminDashboard" },
    { label: "Users", path: "/manage-users" },
    { label: "Vendors", path: "/manage-vendors" },
    { label: "Sales", path: "/manage-sales" },
    { label: "Vendor Requests", path: "/manage-request" },
    { label: "Payments", path: "/manage-payments" }
  ]
};

function SideWindow() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { role, logout } = useRole();

  const cleanRole = role?.replace("ROLE_", "").toLowerCase();

  const menuItems = MENU_CONFIG[cleanRole] || [];

  const handleLogout = () => {
    const currentRole = cleanRole;

    logout();
    setOpen(false);

    if (currentRole === "user") navigate("/login");
    else if (currentRole === "vendor") navigate("/vendorLogin");
    else if (currentRole === "admin") navigate("/adminLogin");
    else navigate("/");
  };

  return (
    <>
      <div className="hamburger" onClick={() => setOpen(true)}>☰</div>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      <div className={`sidebar ${open ? "open" : ""}`}>
        <div className="logo1">
          <span className="Gold">DEAL</span>
          <span className="Black">HUNTS</span>
        </div>

        <button className="close-btn" onClick={() => setOpen(false)}>✖</button>

        <div className="menu-box">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt style={{ color: "gold" }} />
            <span style={{ marginLeft: "8px" }}>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default SideWindow;