import React, { useState, useEffect } from "react";

import Popup from "../../components/Popup";

import "../../styles/AManageTrendingDeals.css";

import {
    getAllProducts,
    getProductImages
} from "../../api/ProductApi";

import {
    getTrendingDeals,
    addTrendingDeal,
    deleteTrendingDeal
} from "../../api/TrendingDealApi";


function AdminManageTrendingDeals() {

    // =====================================================
    // AVAILABLE PRODUCTS
    // =====================================================

    const [products, setProducts] = useState([]);

    const [productImages, setProductImages] = useState({});


    // =====================================================
    // CURRENT TRENDING DEALS
    // =====================================================

    const [selectedProducts, setSelectedProducts] =
        useState([]);


    // =====================================================
    // TEMPORARY PRODUCTS SELECTED INSIDE POPUP
    // =====================================================

    const [pendingProducts, setPendingProducts] =
        useState([]);


    // =====================================================
    // POPUP
    // =====================================================

    const [showPopup, setShowPopup] =
        useState(false);


    // =====================================================
    // FETCH AVAILABLE PRODUCTS
    // =====================================================

    const fetchProducts = async () => {

        try {

            const res = await getAllProducts();

            const availableProducts =
                res.data.filter(
                    product => product.active
                );

            setProducts(availableProducts);

        } catch (error) {

            console.error(
                "Failed to fetch products:",
                error
            );

        }

    };


    // =====================================================
    // FETCH TRENDING DEALS
    // =====================================================

    const fetchTrendingDeals = async () => {

        try {

            const res = await getTrendingDeals();

            setSelectedProducts(res.data);


            const imageMap = {};


            for (const deal of res.data) {

                const productId =
                    deal.product.id;


                const imageRes =
                    await getProductImages(productId);


                console.log(
                    "Images for product",
                    productId,
                    imageRes.data
                );


                imageMap[productId] =
                    imageRes.data?.[0]?.thumbnailUrl ||
                    null;

            }


            setProductImages(imageMap);

        } catch (error) {

            console.error(
                "Failed to fetch trending deals:",
                error
            );

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchProducts();
        fetchTrendingDeals();

    }, []);


    // =====================================================
    // OPEN POPUP
    // =====================================================

    const handleOpenPopup = () => {

        const currentProducts =
            selectedProducts.map(
                deal => deal.product
            );


        setPendingProducts(
            currentProducts
        );


        setShowPopup(true);

    };


    // =====================================================
    // CLOSE POPUP
    // =====================================================

    const handleClosePopup = () => {

        setPendingProducts([]);

        setShowPopup(false);

    };


    // =====================================================
    // SELECT / UNSELECT PRODUCT
    // =====================================================

    const handleSelectProduct = (product) => {

        const alreadyPending =
            pendingProducts.some(
                item =>
                    item.id === product.id
            );


        // =================================================
        // REMOVE FROM PENDING
        // =================================================

        if (alreadyPending) {

            const alreadyTrending =
                selectedProducts.some(
                    deal =>
                        deal.product.id ===
                        product.id
                );


            /*
             * Existing trending products cannot
             * be removed from popup.
             */

            if (alreadyTrending) {

                return;

            }


            setPendingProducts(prev =>
                prev.filter(
                    item =>
                        item.id !== product.id
                )
            );


            return;

        }


        // =================================================
        // MAXIMUM 7
        // =================================================

        if (pendingProducts.length >= 7) {

            alert(
                "You can select maximum 7 trending deals."
            );

            return;

        }


        // =================================================
        // ADD TO PENDING
        // =================================================

        setPendingProducts(prev => [
            ...prev,
            product
        ]);

    };


    // =====================================================
    // CONFIRM / ADD PRODUCTS
    // =====================================================

    const handleConfirmProducts = async () => {

        if (pendingProducts.length === 0) {

            alert(
                "Please select at least one product."
            );

            return;

        }


        // =================================================
        // FIND ONLY NEW PRODUCTS
        // =================================================

        const newProducts =
            pendingProducts.filter(
                product =>
                    !selectedProducts.some(
                        deal =>
                            deal.product.id ===
                            product.id
                    )
            );


        if (newProducts.length === 0) {

            alert(
                "No new products selected."
            );

            return;

        }


        try {

            // =================================================
            // ADD NEW PRODUCTS
            // =================================================

            for (const product of newProducts) {

                await addTrendingDeal(
                    product.id
                );

            }


            // =================================================
            // REFRESH TRENDING DEALS
            // =================================================

            await fetchTrendingDeals();


            // =================================================
            // CLOSE POPUP
            // =================================================

            setPendingProducts([]);

            setShowPopup(false);

        } catch (error) {

            console.error(
                "Failed to add trending deals:",
                error
            );

            alert(
                error.response?.data ||
                "Failed to add trending deals."
            );

        }

    };


    // =====================================================
    // REMOVE TRENDING DEAL
    // =====================================================

    const handleRemoveTrendingDeal = async (dealId) => {

        const confirmed =
            window.confirm(
                "Remove this product from Trending Deals?"
            );


        if (!confirmed) {

            return;

        }


        try {

            await deleteTrendingDeal(
                dealId
            );


            await fetchTrendingDeals();

        } catch (error) {

            console.error(
                "Failed to remove trending deal:",
                error
            );

            alert(
                error.response?.data ||
                "Failed to remove trending deal."
            );

        }

    };


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="adminhome-container">


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="manage-trending-deals-main">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="manage-trending-deals-heading">

                    <h1>
                        Manage Trending Deals
                    </h1>

                    <p>
                        Select and manage the products displayed
                        in the trending deals section.
                    </p>

                </div>


                {/* =================================================
                    TRENDING DEALS
                ================================================= */}

                <section className="trending-deals-section">


                    {/* =================================================
                        SECTION HEADER
                    ================================================= */}

                    <div className="trending-deals-header">

                        <h2>
                            Trending Deals
                        </h2>


                        <button
                            type="button"
                            className="add-trending-deal-btn"
                            onClick={handleOpenPopup}
                        >

                            {selectedProducts.length >= 7
                                ? "Manage"
                                : "+ Add Product"}

                        </button>

                    </div>


                    {/* =================================================
                        TRENDING PRODUCTS
                    ================================================= */}

                    <div className="trending-deals-container">

                        {selectedProducts.length === 0 ? (

                            /* =============================================
                                EMPTY STATE
                            ============================================= */

                            <div className="empty-trending-deals">

                                <div className="empty-icon">
                                    🔥
                                </div>

                                <h3>
                                    No Trending Deals
                                </h3>

                                <p>
                                    Add products to display them
                                    in the trending deals section.
                                </p>

                            </div>

                        ) : (

                            /* =============================================
                                SELECTED PRODUCTS
                            ============================================= */

                            selectedProducts.map((deal) => (

                                <div
                                    key={deal.id}
                                    className="trending-deal-item"
                                >


                                    {/* =====================================
                                        PRODUCT IMAGE
                                    ===================================== */}

                                    <div className="trending-deal-image">

                                        {productImages[
                                            deal.product.id
                                        ] ? (

                                            <img
                                                src={
                                                    productImages[
                                                        deal.product.id
                                                    ]
                                                }
                                                alt={
                                                    deal.product.name
                                                }
                                            />

                                        ) : (

                                            <div className="trending-no-image">
                                                No Image
                                            </div>

                                        )}

                                    </div>


                                    {/* =====================================
                                        PRODUCT INFORMATION
                                    ===================================== */}

                                    <div className="trending-deal-info">

                                        <h3>
                                            {deal.product.name}
                                        </h3>


                                        <p>
                                            Brand:{" "}
                                            {deal.product.brand?.name}
                                        </p>


                                        <p>
                                            Position:{" "}
                                            {deal.position}
                                        </p>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveTrendingDeal(
                                                    deal.id
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
                PRODUCT POPUP
            ================================================= */}

            <Popup
                open={showPopup}
                onClose={handleClosePopup}
                title={
                    selectedProducts.length >= 7
                        ? "Manage Trending Deals"
                        : "Add Trending Deals"
                }
                width="850px"
            >

                <div className="trending-popup-wrapper">


                    {/* =================================================
                        PRODUCTS OUTER BOX
                    ================================================= */}

                    <div className="trending-products-box">

                        {products.length === 0 ? (

                            <p>
                                No products available.
                            </p>

                        ) : (

                            /* =============================================
                                PRODUCT GRID
                            ============================================= */

                            <div className="trending-products-grid">

                                {products.map((product) => {


                                    // =====================================
                                    // CHECK ALREADY TRENDING
                                    // =====================================

                                    const isAlreadyTrending =
                                        selectedProducts.some(
                                            deal =>
                                                deal.product.id ===
                                                product.id
                                        );


                                    // =====================================
                                    // CHECK PENDING
                                    // =====================================

                                    const isPending =
                                        pendingProducts.some(
                                            item =>
                                                item.id ===
                                                product.id
                                        );


                                    return (

                                        <div
                                            key={product.id}
                                            className={`
                                                trending-product-card
                                                ${
                                                    isAlreadyTrending
                                                        ? "already-trending"
                                                        : ""
                                                }
                                                ${
                                                    isPending &&
                                                    !isAlreadyTrending
                                                        ? "pending-trending"
                                                        : ""
                                                }
                                            `}
                                            onClick={() => {

                                                if (
                                                    !isAlreadyTrending
                                                ) {

                                                    handleSelectProduct(
                                                        product
                                                    );

                                                }

                                            }}
                                        >


                                            {/* =================================
                                                PRODUCT INFORMATION
                                            ================================= */}

                                            <div className="trending-product-info">

                                                <h3>
                                                    {product.name}
                                                </h3>


                                                <p>
                                                    {product.brand?.name}
                                                </p>


                                                {/* =============================
                                                    SELECT BUTTON
                                                ============================= */}

                                                <button
                                                    type="button"
                                                    disabled={
                                                        isAlreadyTrending
                                                    }
                                                    onClick={(e) => {

                                                        e.stopPropagation();


                                                        if (
                                                            !isAlreadyTrending
                                                        ) {

                                                            handleSelectProduct(
                                                                product
                                                            );

                                                        }

                                                    }}
                                                >

                                                    {isAlreadyTrending
                                                        ? "Selected ✓"
                                                        : isPending
                                                            ? "Selected ✓"
                                                            : "Select"}

                                                </button>

                                            </div>


                                        </div>

                                    );

                                })}

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        POPUP FOOTER
                    ================================================= */}

                    <div className="trending-popup-content">


                        {/* =============================================
                            CANCEL
                        ============================================= */}

                        <button
                            type="button"
                            onClick={handleClosePopup}
                        >
                            Cancel
                        </button>


                        {/* =============================================
                            ADD TRENDING DEALS
                        ============================================= */}

                        {selectedProducts.length < 7 && (

                            <button
                                type="button"
                                onClick={handleConfirmProducts}
                                disabled={
                                    pendingProducts.length ===
                                    selectedProducts.length
                                }
                            >
                                Add Trending Deals
                            </button>

                        )}


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


export default AdminManageTrendingDeals;