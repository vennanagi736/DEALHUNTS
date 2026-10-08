import React from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/AManagePromotions.css";


function AdminManagePromotions() {

    const navigate = useNavigate();


    return (

        <div className="adminhome-container">


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="manage-promotions-main">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="manage-promotions-heading">

                    <h1>
                        Manage Promotions
                    </h1>

                    <p>
                        Manage the promotional content displayed on the user home page.
                    </p>

                </div>


                {/* =================================================
                    MANAGEMENT OPTIONS
                ================================================= */}

                <div className="promotion-options">


                    {/* =================================================
                        MANAGE CAROUSEL
                    ================================================= */}

                    <button
                        type="button"
                        className="promotion-option"
                        onClick={() =>
                            navigate("/admin/manage-carousel")
                        }
                    >

                        <div className="promotion-option-icon">
                            🖼️
                        </div>

                        <div className="promotion-option-content">

                            <h2>
                                Manage Carousel
                            </h2>

                            <p>
                                Manage the carousel banners and promotional
                                content displayed on the home page.
                            </p>

                        </div>

                        <span className="promotion-option-arrow">
                            →
                        </span>

                    </button>


                    {/* =================================================
                        MANAGE TRENDING DEALS
                    ================================================= */}

                    <button
                        type="button"
                        className="promotion-option"
                        onClick={() =>
                            navigate("/admin/manage-trending-deals")
                        }
                    >

                        <div className="promotion-option-icon">
                            🔥
                        </div>

                        <div className="promotion-option-content">

                            <h2>
                                Manage Trending Deals
                            </h2>

                            <p>
                                Select and manage the products shown
                                in the trending deals section.
                            </p>

                        </div>

                        <span className="promotion-option-arrow">
                            →
                        </span>

                    </button>


                    {/* =================================================
                        MANAGE TRENDING CATEGORIES
                    ================================================= */}

                    <button
                        type="button"
                        className="promotion-option"
                        onClick={() =>
                            navigate("/admin/manage-trending-categories")
                        }
                    >

                        <div className="promotion-option-icon">
                            🏷️
                        </div>

                        <div className="promotion-option-content">

                            <h2>
                                Manage Trending Categories
                            </h2>

                            <p>
                                Manage the categories displayed in the
                                trending categories section.
                            </p>

                        </div>

                        <span className="promotion-option-arrow">
                            →
                        </span>

                    </button>


                    {/* =================================================
                        MANAGE TODAY'S BEST DEALS
                    ================================================= */}

                    <button
                        type="button"
                        className="promotion-option"
                        onClick={() =>
                            navigate("/admin/manage-todays-best-deals")
                        }
                    >

                        <div className="promotion-option-icon">
                            💰
                        </div>

                        <div className="promotion-option-content">

                            <h2>
                                Manage Today's Best Deals
                            </h2>

                            <p>
                                Select and manage the best deals that
                                should be highlighted on the user home page.
                            </p>

                        </div>

                        <span className="promotion-option-arrow">
                            →
                        </span>

                    </button>


                    {/* =================================================
                        MANAGE AVAILABLE NEAR YOU
                    ================================================= */}

                    <button
                        type="button"
                        className="promotion-option"
                        onClick={() =>
                            navigate("/admin/manage-available-near-you")
                        }
                    >

                        <div className="promotion-option-icon">
                            📍
                        </div>

                        <div className="promotion-option-content">

                            <h2>
                                Manage Available Near You
                            </h2>

                            <p>
                                Manage the products and local availability
                                displayed in the Available Near You section.
                            </p>

                        </div>

                        <span className="promotion-option-arrow">
                            →
                        </span>

                    </button>


                    {/* =================================================
                        MANAGE NEW ARRIVALS
                    ================================================= */}

                    <button
                        type="button"
                        className="promotion-option"
                        onClick={() =>
                            navigate("/admin/manage-new-arrivals")
                        }
                    >

                        <div className="promotion-option-icon">
                            ✨
                        </div>

                        <div className="promotion-option-content">

                            <h2>
                                Manage New Arrivals
                            </h2>

                            <p>
                                Select and manage the newly launched products
                                displayed on the user home page.
                            </p>

                        </div>

                        <span className="promotion-option-arrow">
                            →
                        </span>

                    </button>


                    {/* =================================================
                        MANAGE COMING SOON PRODUCTS
                    ================================================= */}

                    <button
                        type="button"
                        className="promotion-option"
                        onClick={() =>
                            navigate("/admin/manage-coming-soon")
                        }
                    >

                        <div className="promotion-option-icon">
                            🚀
                        </div>

                        <div className="promotion-option-content">

                            <h2>
                                Manage Coming Soon Products
                            </h2>

                            <p>
                                Select and manage products that will be
                                available soon on DEALHUNTS.
                            </p>

                        </div>

                        <span className="promotion-option-arrow">
                            →
                        </span>

                    </button>


                    {/* =================================================
                        MANAGE WHY DEALHUNTS
                    ================================================= */}

                    <button
                        type="button"
                        className="promotion-option"
                        onClick={() =>
                            navigate("/admin/manage-why-dealhunts")
                        }
                    >

                        <div className="promotion-option-icon">
                            ⭐
                        </div>

                        <div className="promotion-option-content">

                            <h2>
                                Manage Why DEALHUNTS
                            </h2>

                            <p>
                                Manage the benefits, highlights and content
                                displayed in the Why DEALHUNTS section.
                            </p>

                        </div>

                        <span className="promotion-option-arrow">
                            →
                        </span>

                    </button>


                </div>


            </main>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="footer">

                <p>
                    © 2026 Website. All rights reserved.
                </p>

            </footer>


        </div>

    );

}


export default AdminManagePromotions;
