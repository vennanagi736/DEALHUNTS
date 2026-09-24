import React, { useState, useEffect } from "react";

import Popup from "../../components/Popup";

import "../../styles/AManageTrendingCategories.css";

import { getAllCategories } from "../../api/ProductApi";

import {
    getTrendingCategories,
    addTrendingCategory,
    deleteTrendingCategory
} from "../../api/TrendingCategoryApi";


function AdminManageTrendingCategories() {

    // =====================================================
    // ALL AVAILABLE CATEGORIES
    // =====================================================

    const [categories, setCategories] = useState([]);


    // =====================================================
    // CURRENT TRENDING CATEGORIES
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
    // ADD TRENDING CATEGORY
    // =====================================================

    const handleConfirmCategory = async () => {

        if (!pendingCategory) {

            alert("Please select a category.");

            return;

        }


        if (selectedCategories.length >= 7) {

            alert(
                "You can select maximum 7 trending categories."
            );

            return;

        }


        try {

            await addTrendingCategory(
                pendingCategory.id
            );

            await fetchTrendingCategories();

            setPendingCategory(null);
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

        const confirmed = window.confirm(
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

        <div className="adminhome-container-tc">

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="manage-trending-categories-main-tc">

                        <h2>
                            Manage Trending Categories
                        </h2>

                        <p>
                            Select and manage the categories displayed
                            in the trending categories section.
                        </p>

                {/* =================================================
                    TRENDING CATEGORIES
                ================================================= */}

                <section className="trending-categories-section-tc">

                    {/* =================================================
                        SECTION HEADER
                    ================================================= */}

                    <div className="trending-categories-header-tc">
                         <h2>
                            Trending Categories
                        </h2>

                        <button
                            type="button"
                            className="add-trending-category-btn-tc"
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

                    <div className="trending-categories-container-tc">

                        {selectedCategories.length === 0 ? (

                            <div className="empty-trending-categories-tc">

                                <div className="empty-icon-tc">
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
                                    className="trending-category-item-tc"
                                >

                                    <div className="trending-category-info-tc">

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
                className="trending-category-popup-tc"
            >

                <div className="trending-category-popup-wrapper-tc">

                    {/* =================================================
                        CATEGORY SELECT
                    ================================================= */}

                    <div className="trending-category-select-box-tc">

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
                        POPUP ACTIONS
                    ================================================= */}

                    <div className="trending-category-popup-content-tc">

                        <button
                            type="button"
                            onClick={handleClosePopup}
                        >
                            Cancel
                        </button>

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

            <footer className="footer-tc">

                <p>
                    © 2026 Website. All rights reserved.
                </p>

            </footer>

        </div>

    );

}


export default AdminManageTrendingCategories;
