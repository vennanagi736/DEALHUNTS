import React, { useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import SideWindow from "../../components/SideBar";
import "../../styles/Home.css";
import "../../styles/POverview.css";

function ProductDetails() {
  const location = useLocation();

  const product = location.state?.product || {
    name: "Demo Product",
    price: 999,
    image: "https://via.placeholder.com/300",
    images: [
      "https://via.placeholder.com/300",
      "https://via.placeholder.com/300",
      "https://via.placeholder.com/300"
    ],
    description: "this is a demo product"
  };

  const navigate = useNavigate();
  const [selectedIndex,setSelectedIndex] = useState(0);

  const [query, setQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // NEW: main image state (for thumbnail click)
  const [mainImage, setMainImage] = useState(product.image);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleSearch = () => {
    navigate("/product");
  };
  const [items] = useState([
  { id: 1, price: 100, desc: "A1", other: "X1" },
  { id: 2, price: 200, desc: "A2", other: "X2" },
  { id: 3, price: 300, desc: "A3", other: "X3" },
  { id: 4, price: 400, desc: "A4", other: "X4" },
  { id: 5, price: 500, desc: "A5", other: "X5" },
  { id: 6, price: 600, desc: "B1", other: "Y1" },
  { id: 7, price: 700, desc: "B2", other: "Y2" },
  { id: 8, price: 800, desc: "B3", other: "Y3" },
  { id: 9, price: 900, desc: "B4", other: "Y4" },
  { id: 10, price: 1000, desc: "B5", other: "Y5" },
  { id: 11, price: 1100, desc: "C1", other: "Z1" },
  { id: 12, price: 1200, desc: "C2", other: "Z2" },
  { id: 13, price: 1300, desc: "C3", other: "Z3" },
  { id: 14, price: 1400, desc: "C4", other: "Z4" },
  { id: 15, price: 1500, desc: "C5", other: "Z5" }
]);
  return (
    <div className="home-container">
      <header className="header">
        <div className="left-section">
          <SideWindow />
        </div>

        <div className="logo">
          <span className="Gold">DEAL</span>
          <span className="Black">HUNTS</span>
        </div>

        <nav className="navigation">
          <div className="nav-links">
            <NavLink to="/Home">Home</NavLink>
            <NavLink to="/adminproducts">Products</NavLink>
            <NavLink to="/Categories">Categories</NavLink>
            <NavLink to="/Deals">Deals</NavLink>
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
              <button className="home-Login" onClick={() => navigate("/login")}>
                Login
              </button>
            ) : (
              <button className="home-Login" onClick={handleLogout}>
                LogOut
              </button>
            )}
          </div>
        </nav>
      </header>

      {/*Product Details */}
      <div className="product-container">

        {/* CENTER: main image */}
        <div className="image-section">
        <div className="main-image">
          <img src={mainImage} alt={product.name} />
        </div>
        <div className="image-list">
          {product.images?.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="thumb"
              className="thumb"
              onClick={() => setMainImage(img)} // ✅ click to change
            />
          ))}
        </div>
        </div>

        {/* RIGHT: details */}
        <div className="product-outer">
            <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">₹{product.price}</p>
          <p className="desc">{product.description}</p>
        </div>
        <div className="select-outer">
          <h1>Select the best one:</h1>
        <div className="main-container">

  {/* A → Dots (left side) */}
  <div className="dots">
    {items.map((_, index) => (
      <span
        key={index}
        className={`dot ${selectedIndex === index ? "active-dot" : ""}`}
        onClick={() => setSelectedIndex(index)}
      ></span>
    ))}
  </div>
  <div className="content-section">

  {/* Header */}
  <div className="header-row">
    <div>Price</div>
    <div>Description</div>
    <div>Else</div>
  </div>

  {/* Grid */}
  <div className="grid">
    {items.map((item, index) => (
      <div
        key={item.id}
        className={`cell ${selectedIndex === index ? "active" : ""}`}
        onClick={() => setSelectedIndex(index)}
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