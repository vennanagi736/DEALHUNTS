import React from "react";
import SideWindow from "./SideBar";
import { useLocation } from "react-router-dom";

function Layout({ title, children }) {
  const isLoggedIn = !!localStorage.getItem("jwtToken");
  
  const location = useLocation("");

  const hideSideBar = 
  location.pathname ==="/login" ||
  location.pathname ==="/register" ||
  location.pathname ==="/VendorLogin" ||
  location.pathname ==="/VendorRegister";
  
  return (
    <div className="home-container">
      
      {/* Header */}
      <header className="header">
        <div className="left-section">
          
          {/* Sidebar only if logged in */}
          {isLoggedIn && !hideSideBar && <SideWindow />}

          <div className="logo">
            <span className="Gold">DEAL</span>
            <span className="Black">HUNTS</span>
          </div>
        </div>
  
        <nav className="navigation"></nav>
      </header>

      {/* Main */}
      <main className="main">
        {title && <h2 className="page-title">{title}</h2>}
        {children}
      </main>

    </div>
  );
}

export default Layout;