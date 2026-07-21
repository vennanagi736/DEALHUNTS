import React, { useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import SideWindow from "../../components/SideBar";
import "../../styles/Home.css";
import "../../styles/POverview.css";

function ProductDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.product || {
    name: "Demo Product",
    image: "https://via.placeholder.com/300",
    images: [
      "https://via.placeholder.com/300",
      "https://via.placeholder.com/300",
      "https://via.placeholder.com/300"
    ],
    description: "this is a demo product"
  };

  const [selectedIndex, setSelectedIndex] = useState(0); // selected row
  const [mainImage, setMainImage] = useState(product.image);
  const [query, setQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleSearch = () => navigate("/product");

  // 15 items → 5 rows × 3 columns
  const [items] = useState([
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
    { id: 1, price: "nagi"},
     ]);

  // 5 rows → map for dots
  const rows = 5;

  return (
    <div className="home-container">
      <header className="header">
        <div className="left-section"><SideWindow /></div>
        <div className="logo"><span className="Gold">DEAL</span><span className="Black">HUNTS</span></div>

        <nav className="navigation">
          <div className="nav-links">
            <NavLink to="/Home">Home</NavLink>
            <NavLink to="/adminproducts">Products</NavLink>
            <NavLink to="/Categories">Categories</NavLink>
            <NavLink to="/Deals">Deals</NavLink>
          </div>
          <div className="nav-right">
            <div className="search-box">
              <input type="text" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
              <span className="icon" onClick={handleSearch}>🔍</span>
            </div>
            {!isLoggedIn ? (
              <button className="home-Login" onClick={() => navigate("/login")}>Login</button>
            ) : (
              <button className="home-Login" onClick={handleLogout}>LogOut</button>
            )}
          </div>
        </nav>
      </header>

      {/* Product Details */}
      <div className="product-container">

        {/* LEFT: Main Image */}
        <div className="image-section">
          <div className="main-image">
            <img src={mainImage} alt={product.name} />
          </div>
          <div className="image-list">
            {product.images?.map((img, index) => (
              <img key={index} src={img} alt="thumb" className={`thumb ${mainImage===img ? "active":""}`} onClick={() => setMainImage(img)} />
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info + Selection */}
        <div className="product-outer">
          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="desc">{product.description}</p>
          </div>

          <div className="select-outer">
            <h1>Select the best one:</h1>
            <div className="main-container">

              {/* LEFT: Dots (5 rows) */}
              <div className="dots">
                {[...Array(rows)].map((_, rowIndex) => (
                  <span
                    key={rowIndex}
                    className={`dot ${selectedIndex === rowIndex ? "active-dot" : ""}`}
                    onClick={() => setSelectedIndex(rowIndex)}
                  ></span>
                ))}
              </div>

              {/* RIGHT: Grid */}
              <div className="content-section">
                <div className="header-row">
                  <div>Price</div>
                  <div>Description</div>
                  <div>Else</div>
                </div>

                <div className="grid">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`cell ${Math.floor(index/3) === selectedIndex ? "active" : ""}`}
                      onClick={() => setSelectedIndex(Math.floor(index/3))}
                    >
                      <p>{item.price}</p>
                      <p>{item.desc}</p>
                      <p>{item.other}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;