import React from "react";
import "../../styles/Home.css";
import { useNavigate } from "react-router-dom";

function Home(){
    const navigate = useNavigate();
    return(
        <div className="home-container">
            <header className="header">
                <div className="logo">
                    <span className="Gold">DEAL</span>
                    <span className="Black">HUNTS</span>
                </div>
                <nav className="navigation">
                    <a href="/">Home</a>
                    <a href="/">Cart</a>
                    <a href="/">Categories</a>
                    <button className="home-Login"
                    type="button"
                    onClick={()=>navigate("/login")}
                    >Login</button> 
                </nav>
            </header>
            <main className="main">
                <h1>Welcome</h1>
                <p>Web applications</p>
            </main>
            <footer className="footer">
                <p>
                     © 2026 Website. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
export default Home;