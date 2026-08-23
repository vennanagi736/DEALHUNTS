import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SideWindow from "../../components/SideBar";
import Popup from "../../components/Popup";

import "../../styles/AManageTrendingCategories.css";

import { getAllCategories } from "../../api/ProductApi";

import {
    getTrendingCategories,
    addTrendingCategory,
    deleteTrendingCategory
} from "../../api/TrendingCategoryApi";


function AdminManageTrendingCategories() {

    const navigate = useNavigate();


    // =====================================================
    // ALL AVAILABLE CATEGORIES
    // =====================================================

    const [categories, setCategories] = useState([]);


    // =====================================================
    // CURRENT TRENDING CATEGORIES
    // These are already saved in database
    // =====================================================

    const [selectedCategories, setSelectedCategories] =
        useState([]);


    // =====================================================
    // TEMPORARY CATEGORY SELECTED INSIDE POPUP
    // =====================================================

    const [pendingCategory, setPendingCategory] =
        useState(null);


    // =====================================================
    // POPUP
    // =====================================================

    const [showPopup, setShowPopup] =
        useState(false);


    // =====================================================
    // FETCH ALL CATEGORIES
    // =====================================================

    const fetchCategories = async () => {

        try {

            const res = await getAllCategories();

            /*
             * Load all categories.
             *
             * If your Category entity does NOT have
             * an "active" field, do NOT filter here.
             */

            setCategories(res.data);

        } catch (error) {

            console.error(
                "Failed to fetch categories:",
                error
            );

        }

    };


    // =====================================================
    // FETCH TRENDING CATEGORIES
    // =====================================================

    const fetchTrendingCategories = async () => {

        try {

            const res = await getTrendingCategories();

            setSelectedCategories(res.data);

        } catch (error) {

            console.error(
                "Failed to fetch trending categories:",
                error
            );

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchCategories();
        fetchTrendingCategories();

    }, []);


    // =====================================================
    // OPEN POPUP
    // =====================================================

    const handleOpenPopup = () => {

        setPendingCategory(null);

        setShowPopup(true);

    };


    // =====================================================
    // CLOSE POPUP
    // =====================================================

    const handleClosePopup = () => {

        setPendingCategory(null);

        setShowPopup(false);

    };


    // =====================================================
    // SELECT CATEGORY
    // =====================================================

    const handleSelectCategory = (category) => {

        /*
         * Do not allow more than 4 categories.
         */

        if (selectedCategories.length >= 7) {

            alert(
                "You can select maximum 7 trending categories."
            );

            return;

        }


        /*
         * Check whether category is already trending.
         */

        const alreadyTrending =
            selectedCategories.some(
                trending =>
                    trending.category.id ===
                    category.id
            );


        if (alreadyTrending) {

            return;

        }


        /*
         * Select category temporarily.
         */

        setPendingCategory(category);

    };


    // =====================================================
    // ADD TRENDING CATEGORY
    // =====================================================

    const handleConfirmCategory = async () => {

        /*
         * No category selected.
         */

        if (!pendingCategory) {

            alert(
                "Please select a category."
            );

            return;

        }


        /*
         * Maximum 7 check.
         */

        if (selectedCategories.length >= 7) {

            alert(
                "You can select maximum 7 trending categories."
            );

            return;

        }


        try {

            /*
             * Send category ID to backend.
             */

            await addTrendingCategory(
                pendingCategory.id
            );


            /*
             * Refresh trending categories.
             */

            await fetchTrendingCategories();


            /*
             * Clear temporary selection.
             */

            setPendingCategory(null);


            /*
             * Close popup.
             */

            setShowPopup(false);

        } catch (error) {

            console.error(
                "Failed to add trending category:",
                error
            );

            alert(
                error.response?.data ||
                "Failed to add trending category."
            );

        }

    };


    // =====================================================
    // REMOVE TRENDING CATEGORY
    // =====================================================

    const handleRemoveTrendingCategory = async (id) => {

        const confirmed =
            window.confirm(
                "Remove this category from Trending Categories?"
            );


        if (!confirmed) {

            return;

        }


        try {

            await deleteTrendingCategory(id);

            await fetchTrendingCategories();

        } catch (error) {

            console.error(
                "Failed to remove trending category:",
                error
            );

            alert(
                error.response?.data ||
                "Failed to remove trending category."
            );

        }

    };


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="adminhome-container">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="header">


                {/* LEFT */}

                <div className="left-section">

                    <SideWindow />

                </div>


                {/* LOGO */}

                <div className="logo-container">

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

                </div>


                {/* NAVIGATION */}

                <nav className="admin-nav-links">

                    <div
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        &#8592;
                    </div>

                </nav>


            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="manage-trending-categories-main">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="manage-trending-categories-heading">

                    <h1>
                        Manage Trending Categories
                    </h1>

                    <p>
                        Select and manage the categories displayed
                        in the trending categories section.
                    </p>

                </div>


                {/* =================================================
                    TRENDING CATEGORIES
                ================================================= */}

                <section className="trending-categories-section">


                    {/* =================================================
                        SECTION HEADER
                    ================================================= */}

                    <div className="trending-categories-header">

                        <h2>
                            Trending Categories
                        </h2>


                        <button
                            type="button"
                            className="add-trending-category-btn"
                            onClick={handleOpenPopup}
                            disabled={
                                selectedCategories.length >= 7
                            }
                        >

                            {selectedCategories.length >= 7
                                ? "Manage"
                                : "+ Add Category"}

                        </button>

                    </div>
{/* =================================================
    SELECTED TRENDING CATEGORIES
================================================= */}

<div className="trending-categories-container">

    {selectedCategories.length === 0 ? (

        <div className="empty-trending-categories">

            <div className="empty-icon">
                🏷️
            </div>

            <h3>
                No Trending Categories
            </h3>

            <p>
                Add categories to display them
                in the trending categories section.
            </p>

        </div>

    ) : (

        selectedCategories.map((trending) => (

            <div
                key={trending.id}
                className="trending-category-item"
            >

                <div className="trending-category-info">

                    <h3>
                        {trending.category.name}
                    </h3>

                    <p>
                        Category ID:{" "}
                        {trending.category.id}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            handleRemoveTrendingCategory(
                                trending.id
                            )
                        }
                    >
                        Remove
                    </button>

                </div>

            </div>

        ))

    )}

</div>


                </section>


            </main>

{/* =================================================
    CATEGORY POPUP
================================================= */}

<Popup
    open={showPopup}
    onClose={handleClosePopup}
    title="Add Trending Category"
    width="500px"
>

    <div className="trending-category-popup-wrapper">


        {/* =================================================
            CATEGORY SELECT
        ================================================= */}

        <div className="trending-category-select-box">

            <label htmlFor="trendingCategory">
                Select Category
            </label>


            <select
                id="trendingCategory"
                value={pendingCategory?.id || ""}
                onChange={(e) => {

                    const categoryId =
                        Number(e.target.value);

                    const category =
                        categories.find(
                            item =>
                                item.id === categoryId
                        );

                    setPendingCategory(
                        category || null
                    );

                }}
            >

                <option value="">
                    -- Select Category --
                </option>


                {categories
                    .filter(category =>
                        !selectedCategories.some(
                            trending =>
                                trending.category.id ===
                                category.id
                        )
                    )
                    .map(category => (

                        <option
                            key={category.id}
                            value={category.id}
                        >
                            {category.name}
                        </option>

                    ))}

            </select>

        </div>


        {/* =================================================
            POPUP FOOTER
        ================================================= */}

        <div className="trending-category-popup-content">


            {/* CANCEL */}

            <button
                type="button"
                onClick={handleClosePopup}
            >
                Cancel
            </button>


            {/* ADD CATEGORY */}

            <button
                type="button"
                onClick={handleConfirmCategory}
                disabled={
                    !pendingCategory ||
                    selectedCategories.length >= 7
                }
            >
                Add Trending Category
            </button>


        </div>

    </div>

</Popup>


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


export default AdminManageTrendingCategories;