import React from "react";
import "../../styles/Admin.css";
import SideWindow from "../../components/SideBar";

function Orders() {
return ( <div className="adminhome-container">

  <header className="admin-header">
    <div className="left-section">
      <SideWindow />
    </div>

    <div className="logo">
      <span className="Gold">DEAL</span>
      <span className="Black">HUNTS</span>
      <span className="Admin">Admin</span>
    </div>
  </header>

  <main className="main">
    {/* Page Content Here */}
  </main>

  <footer className="admin-footer">
    <p>© 2026 Website. All rights reserved.</p>
  </footer>

</div>
);
}

export default Orders;
