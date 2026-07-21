import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../../styles/Admin.css";
import axios from "axios";
import { useState } from "react";
import SideWindow from "../../components/SideBar";

function AdminDashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("role");
    navigate("/adminLogin");
  };
  const fetchProducts = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/adminLogin");
      return;
    }
    try {
      const res = await axios.get("http://localhost:8080/vendor/allProducts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/adminLogin");
      }
    }
  };
  const handleSearch = () => {
    fetchProducts();
    navigate("/product");
  };

  return (
    <div className="adminhome-container">

      <header className="admin-header">
<div className="left-section">
          <SideWindow />
        </div>
        <div className="logo">
          <span className="Gold">DEAL</span>
          <span className="Black">HUNTS</span>
          <span className="Admin">Admin</span>
        </div>

        <nav className="admin-nav-links">
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/adminproducts">Products</NavLink>
          <NavLink to="/manage-vendors">Vendors</NavLink>
          <div className="search-box">
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="icon" onClick={handleSearch}>🔍</span>
            </div>
          <div className="nav-right">
            <button
              className="home-Login"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main className="main">
        <h1>Welcome</h1>
        <p>Web applications</p>
      </main>

      <footer className="admin-footer">
        <p>© 2026 Website. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default AdminDashboard;