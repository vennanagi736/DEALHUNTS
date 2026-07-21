import React, { useState, useEffect } from "react";
import "../../styles/VendorHome.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import SideWindow from "../../components/SideBar";
import "../../styles/SideBar.css";

function VendorManage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  // Increment
  const handleIncrement = (index) => {
    const updated = [...products];
    updated[index].stock += 1;
    setProducts(updated);
  };

  // Decrement
  const handleDecrement = (index) => {
    const updated = [...products];
    if (updated[index].stock > 0) {
      updated[index].stock -= 1;
      setProducts(updated);
    }
  };

  // Update button (for now)
  const handleUpdateStock = (index) => {
    console.log("Updated stock:", products[index].stock);
    navigate("/vendorManage");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("jwtToken");

      if (!token) {
        alert("Please login first!");
        navigate("/VendorLogin");
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:8080/vendor/allProducts",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProducts(res.data);
      } catch (err) {
        console.error("FETCH ERROR:", err);
        if (err.response?.status === 401) {
          console.log("401 error - token issue, but don't logout");
          return;
        } else if (err.response?.status === 404) {
          setProducts([]);
        } else {
          alert("Failed to fetch products.");
        }
      }
    };

    fetchProducts();
  }, [navigate]);

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
        <div className="back-btn" onClick={() => navigate(-1)}>
          &#8592; 
            {/* <img
                 src={homeIcon} // placeholder 40x40
                 width="40"
                 height="40"
                /> */}
        </div>
        
      </header>

      <main className="main">
        <h1>My Products</h1>
        <div className="vendor-product-grid">
          {products.length === 0 ? (
            <p>No products added yet.</p>
          ) : (
            products.map((product, index) => (
              <div
                className="vendor-product-card"
                key={product.id || index}
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    width="100%"
                  />
                )}

                <h3>{product.name}</h3>
                <p>Price: ₹{product.price}</p>
                <p>{product.description}</p>

                <p>
                  Stock: {product.stock} |{" "}
                  {product.stock > 0 ? "Available" : "Out of stock"}
                </p>

                <div>
                  <button onClick={() => handleDecrement(index)}>-</button>
                  <span>{product.stock}</span>
                  <button onClick={() => handleIncrement(index)}>+</button>
                </div>

                <button onClick={() => handleUpdateStock(index)}>
                  Update Stock
                </button>
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

export default VendorManage;