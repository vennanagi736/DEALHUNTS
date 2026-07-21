import React, { useState, useEffect } from "react";
import "../../styles/VendorHome.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import SideWindow from "../../components/SideBar";
import "../../styles/SideBar.css";

function VendorHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwtToken"));

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("jwtToken");
      const vendorId = localStorage.getItem("id");

      if (!token) {
        alert("Please login first!");
        navigate("/VendorLogin");
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:8080/vendor/myProducts?vendorId=${vendorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProducts(res.data);
      } catch (err) {
        console.error("FETCH ERROR:", err);

        if (err.response?.status === 404) {
          setProducts([]);
        } else if (err.response?.status === 401) {
          console.log("Unauthorized request");
        } else {
          alert("Failed to fetch products.");
        }
      }
    };

    fetchProducts();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("id");
    setIsLoggedIn(false);
    navigate("/VendorLogin");
  };

  const handleSearch = () => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    setProducts(filtered);
  };

  return (
    <div className="home-container">
      <header className="header">

        <div className="left-section">
          <SideWindow />
        </div>

        <div className="logo">
          <span className="Gold">DEAL</span>
          <span className="Black">HUNTS</span>
          <span className="Vendor">Vendor</span>
        </div>

        <div className="navigation">

          <div className="nav-links">
            <Link to="/vendorProductPage">Add Product</Link>
            <Link to="/VendorManage">Manage</Link>
          </div>

          <div className="nav-right">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="icon" onClick={handleSearch}>🔍</span>
            </div>

            {!isLoggedIn ? (
              <button className="home-Login" onClick={() => navigate("/VendorLogin")}>
                Login
              </button>
            ) : (
              <button className="home-Login" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>

        </div>

      </header>

      <main className="main">
        <h1>My Products</h1>

        <div className="vendor-product-grid">
          {products.length === 0 ? (
            <p>No products added yet.</p>
          ) : (
            products.map((product, index) => (
              <div className="vendor-product-card" key={product.id || index}>
                {product.image && (
                  <img src={product.image} alt={product.name} width="100%" />
                )}

                <h3>{product.name}</h3>
                <p>Price: ₹{product.price}</p>
                <p>{product.description}</p>

                <p>
                  Stock: {product.stock} |{" "}
                  {product.stock > 0 ? "Available" : "Out of stock"}
                </p>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 Website. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default VendorHome;