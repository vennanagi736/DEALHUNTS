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