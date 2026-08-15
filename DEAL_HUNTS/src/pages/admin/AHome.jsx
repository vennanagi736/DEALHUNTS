import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../../styles/Admin.css";
import axios from "axios";
import { useEffect } from "react";
import { getTrendingItems } from "../../api/TrendingApi";
import { getUserCount, getVendorCount, getProductCount } from "../../api/AdminApi";
import SideWindow from "../../components/SideBar";
import TrendingPreview from "../../components/TrendingPreview";


function AdminDashboard() {

  console.log("Amaing home koade ")

  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [trendingItems, setTrendingItems] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [vendorCount, setVendorCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  const handleLogout = () => {

    localStorage.removeItem("adminJwtToken");
    localStorage.removeItem("role");

    navigate("/adminLogin");

  };


  const fetchProducts = async () => {

    const token = localStorage.getItem("adminJwtToken");

    if(!token){
      navigate("/adminLogin");
      return;
    }


    try{

      await axios.get(
        "http://localhost:8080/vendor/allProducts",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );


    }catch(error){

      console.log(error);

      if(error.response?.status === 401){

        localStorage.removeItem("adminJwtToken");
        navigate("/adminLogin");

      }

    }
   };
useEffect(() => {
    const loadTrending = async () => {
        try {
            console.log("Dashboard: calling promotions API");

            const response = await axios.get(
                "http://localhost:8080/admin/promotions/all"
            );

            console.log("Dashboard status:", response.status);
            console.log("Dashboard data:", response.data);

            setTrendingItems(response.data);

        } catch (error) {
            console.log("Dashboard trending ERROR:", error);
            console.log("URL:", error.config?.url);
            console.log("STATUS:", error.response?.status);
            console.log("DATA:", error.response?.data);
        }
    };

    loadTrending();
}, []);
//   useEffect(()=>{

//     console.log("useefefkmskdmvsdim");

//     const loadTrending = async()=>{

//       try{
//       console.log("Callinga aap");
//         const data = await getTrendingItems();
//         console.log("Admin Trending:",data);
//         setTrendingItems(data);
//       }
//       catch(err){
//         console.log("Ttencneomocme",err);
//       }
//     };

//     loadTrending();
// },[]);


  const handleSearch = () => {

    fetchProducts();

    navigate("/product");

  };

  useEffect(() => {

    const loadDashboardStats = async () => {
        try {

            const userResponse = await getUserCount();
            console.log("userCount:",userResponse.data);
            setUserCount(userResponse.data);

            const vendorResponse = await getVendorCount();
            console.log("VendorCount:",vendorResponse.data);
            setVendorCount(vendorResponse.data);

            const productResponse = await getProductCount();
            console.log("ProductCount:",productResponse.data);
            setProductCount(productResponse.data);
            
            // const orderResponse = await getOrderCount();
            // console.log("OrderCount:",orderResponse.data);
            // setOrderCount(orderResponse.data);

        } catch (error) {
            console.error(
                "Failed to load dashboard stats:",
                error
            );
        }
    };


    loadDashboardStats();

}, []);



  return (

    <div className="adminhome-container">


      <header className="admin-header">


        <div className="left-section">
          <SideWindow />
        </div>



        <div className="logo">

          <span className="Gold">
            DEAL
          </span>

          <span className="Black">
            HUNTS
          </span>

          <span className="Admin">
            Admin
          </span>

        </div>



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



          <div className="search-box">

            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />


            <span
              className="icon"
              onClick={handleSearch}
            >
              🔍
            </span>


          </div>



          <button
            className="home-Login"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>

     <main className="admin-main">
    <div className="admin-dashboard-content">
      <div className="top-dashboard">
        <div className="admin-dashboard-left">
           <h1>
                Welcome Admin
            </h1>
            <p>
                Manage your DealHunts platform
            </p>
        </div>
        <div className="right-strip">
            <TrendingPreview items={trendingItems} />
        </div>
        </div>

        <div className="dashboard-stats">
            <div className="dashboard-card">
        <h3>
            Total Users
        </h3>
        <p>
            {userCount}
        </p>
            </div>

        <div className="dashboard-card">
        <h3>
            Total Vendors
        </h3>
        <p>
            {vendorCount}
        </p>
        </div>
        <div className="dashboard-card">
            <h3>Total Products</h3>
            <p>{productCount}</p>
        </div>


        {/* <div className="dashboard-card">
            <h3>Total Orders</h3>
            <p>{orderCount}</p>
        </div>  */}
</div>

    </div>
</main>

      <footer className="admin-footer">

        <p>
          © 2026 Website. All rights reserved.
        </p>

      </footer>
    </div>
  );
}

export default AdminDashboard;