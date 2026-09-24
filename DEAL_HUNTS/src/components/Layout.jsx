import React, { useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/SideBar";

function Layout({ title, children }) {

  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentPath = location.pathname.toLowerCase();

  const authPages = [
    "/login",
    "/register",
    "/vendorlogin",
    "/vendorregister",
    "/adminlogin",
  ];

  const hideSideBar = authPages.includes(currentPath);

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="home-container">

      <Header
        onMenuClick={openSidebar}
        showMenu={!hideSideBar}
      />

      {!hideSideBar && (
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          closeSidebar={closeSidebar}
        />
      )}

      <main className="main">

        {title && (
          <h2 className="page-title">
            {title}
          </h2>
        )}

        {children}

      </main>

    </div>
  );
}

export default Layout;