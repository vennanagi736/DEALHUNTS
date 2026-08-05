import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../../styles/Admin.css";
import axios from "axios";
import { useEffect } from "react";
import { getTrendingItems } from "../../api/TrendingApi";

import SideWindow from "../../components/SideBar";
import TrendingPreview from "../../components/TrendingPreview";


function AdminDashboard() {

  console.log("Amaing home koade ")

  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [trendingItems, setTrendingItems] = useState([]);



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
  useEffect(()=>{

    console.log("useefefkmskdmvsdim");

    const loadTrending = async()=>{

      try{
      console.log("Callinga aap");
        const data = await getTrendingItems();
        console.log("Admin Trending:",data);
        setTrendingItems(data);
      }
      catch(err){
        console.log("Ttencneomocme",err);
      }
    };

    loadTrending();
},[]);


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