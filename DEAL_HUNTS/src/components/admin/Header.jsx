import React from "react";
import { NavLink } from "react-router-dom";
import {
  SearchIcon,
  BellIcon,
  LogoutIcon
} from "./AIcons";
import SideWindow from "../SideBar";

import "../../styles/Header.css";

function AdminHeader({
  query,
  setQuery,
  onSearch,
  onLogout
}) {
  return (
    <header className="admin-header">

      {/* LEFT */}
      <div className="admin-header-left">

        <SideWindow />

        <div className="admin-header-logo">
          <span className="Gold">DEAL</span>
          <span className="Black">HUNTS</span>
          <span className="Admin">Admin</span>
        </div>

      </div>


      {/* CENTER */}
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

      </nav>


      {/* RIGHT */}
      <div className="admin-header-right">

        <div className="admin-search-box">

          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch();
              }
            }}
          />

          <button
            type="button"
            className="admin-search-btn"
            onClick={onSearch}
            aria-label="Search"
          >
            <SearchIcon
              width={16}
              height={16}
            />
          </button>

        </div>


        {/* NOTIFICATION */}
        <button
          type="button"
          className="admin-header-icon"
          title="Notifications"
          aria-label="Notifications"
        >
          <BellIcon
            width={18}
            height={18}
          />
        </button>


        {/* AVATAR */}
        <div
          className="admin-header-avatar"
          title="Admin"
        >
          A
        </div>


        {/* LOGOUT */}
        <button
          type="button"
          className="admin-logout"
          onClick={onLogout}
        >
          <LogoutIcon
            width={15}
            height={15}
          />

          <span>
            Logout
          </span>
        </button>

      </div>

    </header>
  );
}

export default AdminHeader;