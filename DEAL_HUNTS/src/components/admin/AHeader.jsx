import React from "react";
import { NavLink } from "react-router-dom";
import { SearchIcon, BellIcon, LogoutIcon } from "../../components/admin/AIcons";
import SideWindow from "../../components/SideBar";

/* -------------------------------------------------------------------------
   AdminHeader
   Reuses the existing <SideWindow /> component as the sidebar/menu
   trigger (per the brief: reuse working functionality instead of
   duplicating it). Everything else — nav links, search, notification,
   avatar, logout — is the new premium treatment.
------------------------------------------------------------------------- */
function AdminHeader({ query, setQuery, onSearch, onLogout }) {
  return (
    <header className="db-header">
      <div className="db-header-left">
        <SideWindow />

        <div className="db-logo">
          <span className="db-logo-deal">DEAL</span>
          <span className="db-logo-hunts">HUNTS</span>
          <span className="db-logo-admin">Admin</span>
        </div>
      </div>

      <nav className="db-header-nav">
        <NavLink to="/orders" className="db-nav-link">
          Orders
        </NavLink>
        <NavLink to="/adminproducts" className="db-nav-link">
          Products
        </NavLink>
        <NavLink to="/manage-vendors" className="db-nav-link">
          Vendors
        </NavLink>
      </nav>

      <div className="db-header-right">
        <div className="db-search-box">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <button className="db-search-btn" onClick={onSearch} aria-label="Search" type="button">
            <SearchIcon width={16} height={16} />
          </button>
        </div>

        <button className="db-icon-btn" title="Notifications" type="button">
          <BellIcon />
        </button>

        <div className="db-avatar" title="Admin">
          A
        </div>

        <button className="db-logout-btn" onClick={onLogout} type="button">
          <LogoutIcon width={15} height={15} />
          Logout
        </button>
      </div>
    </header>
  );
}
export default AdminHeader;