import React, { useEffect, useState } from "react";
import "../../styles/Home.css";
import "../../styles/HomeProducts.css";
import "../../styles/Carousel.css"
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import SideWindow from "../../components/SideBar";
import { getTrendingItems } from "../../api/TrendingApi";
import TrendingCarousel from "../../components/TrendingCarousel";

// Demo images (replace with backend data later)
import img1 from "../../assets/image1.png";
import img2 from "../../assets/image2.png";
import img3 from "../../assets/image3.png";
import img4 from "../../assets/image4.png";
import img5 from "../../assets/image5.png";

const demoTrendingItems = [img1, img2, img3, img4, img5];
//till the above line
function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Trending carousel state
  const [trendingItems, setTrendingItems] = useState(demoTrendingItems);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [trendingItems]);

  // Fetch trending items from backend
  useEffect(() => {
    getTrendingItems()
      .then((data) => setTrendingItems(data))
      .catch(() => console.log("Failed to fetch trending items"));
  }, []);

  // Demo products (replace with backend later)
  const demoProducts = [
    { id: 1, name: "Product A", price: 499, image: "https://via.placeholder.com/150" },
    { id: 2, name: "Product B", price: 899, image: "https://via.placeholder.com/150" },
    { id: 3, name: "Product C", price: 1299, image: "https://via.placeholder.com/150" },
  ];
  //till here
  // Fetch all products from backend
  useEffect(() => {
    axios
      .get("http://localhost:8080/vendor/allProducts")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
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
        navigate("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleSearch = () => {
    fetchProducts();
    navigate("/product");
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

     <main className="main">
      <TrendingCarousel/>
  {/* Products */}
  <div className="product-details">
    {demoProducts.length === 0 ? (
      <p>No products available</p>
    ) : (
      demoProducts.map((p) => (
        <NavLink 
        key = {p.id} 
        to={`/product/${p.id}`}
        state= {{product: p}}
        className="product-link"
        >
          <div className="product-card">
          <div className="image-container">
            <img src={p.image} alt={p.name} />
          </div>
          <p>{p.name}</p>
          <p>₹{p.price}</p>
        </div>
        </NavLink>
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

export default Home;