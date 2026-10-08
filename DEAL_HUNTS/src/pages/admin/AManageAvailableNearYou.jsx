import React, { useState, useEffect } from "react";

import Popup from "../../components/Popup";

import "../../styles/AManageAvailableNearYou.css";

import { getAllProducts } from "../../api/ProductApi";


function AdminManageAvailableNearYou() {

    // =====================================================
    // ALL PRODUCTS
    // =====================================================

    const [products, setProducts] = useState([]);


    // =====================================================
    // PRODUCTS SELECTED FOR AVAILABLE NEAR YOU
    // =====================================================

    const [selectedProducts, setSelectedProducts] =
        useState([]);


    // =====================================================
    // TEMPORARY PRODUCT SELECTED INSIDE POPUP
    // =====================================================

    const [pendingProduct, setPendingProduct] =
        useState(null);


    // =====================================================
    // POPUP
    // =====================================================

    const [showPopup, setShowPopup] =
        useState(false);


    // =====================================================
    // MAXIMUM PRODUCTS
    // =====================================================

    const MAX_PRODUCTS = 7;


    // =====================================================
    // FETCH ALL PRODUCTS
    // =====================================================

    const fetchProducts = async () => {

        try {

            const res = await getAllProducts();

            const productList =
                Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.data)
                        ? res.data.data
                        : [];

            setProducts(productList);

        } catch (error) {

            console.error(
                "Failed to fetch products:",
                error
            );

            setProducts([]);

        }

    };


    // =====================================================
    // FETCH SELECTED PRODUCTS
    // =====================================================

    const fetchAvailableNearYou = async () => {

        try {

            const response = await fetch(
                "http://localhost:8080/admin/available-near-you/all"
            );

            if (!response.ok) {

                throw new Error(
                    `HTTP error: ${response.status}`
                );

            }

            const data = await response.json();

            const productList =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : Array.isArray(data?.products)
                            ? data.products
                            : [];

            setSelectedProducts(productList);

        } catch (error) {

            console.error(
                "Failed to fetch Available Near You products:",
                error
            );

            setSelectedProducts([]);

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchProducts();
        fetchAvailableNearYou();

    }, []);


    // =====================================================
    // OPEN POPUP
    // =====================================================

    const handleOpenPopup = () => {

        if (selectedProducts.length >= MAX_PRODUCTS) {

            alert(
                `You can select maximum ${MAX_PRODUCTS} products.`
            );

            return;

        }

        setPendingProduct(null);

        setShowPopup(true);

    };


    // =====================================================
    // CLOSE POPUP
    // =====================================================

    const handleClosePopup = () => {

        setPendingProduct(null);

        setShowPopup(false);

    };


    // =====================================================
    // GET PRODUCT ID FROM SELECTED ITEM
    // =====================================================

    const getSelectedProductId = (item) => {

        return (
            item?.product?.id ??
            item?.productId ??
            item?.id
        );

    };


    // =====================================================
    // GET PRODUCT NAME
    // =====================================================

    const getSelectedProductName = (item) => {

        return (
            item?.product?.name ??
            item?.productName ??
            item?.name ??
            "Product"
        );

    };


    // =====================================================
    // CHECK WHETHER PRODUCT IS ALREADY SELECTED
    // =====================================================

    const isProductSelected = (productId) => {

        return selectedProducts.some(
            item =>
                Number(getSelectedProductId(item)) ===
                Number(productId)
        );

    };


    // =====================================================
    // ADD PRODUCT
    // =====================================================

    const handleConfirmProduct = async () => {

        if (!pendingProduct) {

            alert("Please select a product.");

            return;

        }


        if (selectedProducts.length >= MAX_PRODUCTS) {

            alert(
                `You can select maximum ${MAX_PRODUCTS} products.`
            );

            return;

        }


        if (isProductSelected(pendingProduct.id)) {

            alert(
                "This product is already selected."
            );

            return;

        }


        try {

            const response = await fetch(
                "http://localhost:8080/admin/available-near-you/add",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        productId: pendingProduct.id
                    })
                }
            );


            if (!response.ok) {

                let errorMessage =
                    `HTTP error: ${response.status}`;

                try {

                    const errorData =
                        await response.json();

                    if (errorData?.message) {

                        errorMessage =
                            errorData.message;

                    }

                } catch {

                    try {

                        const text =
                            await response.text();

                        if (text) {

                            errorMessage = text;

                        }

                    } catch {

                        // Keep default error message

                    }

                }

                throw new Error(errorMessage);

            }


            await fetchAvailableNearYou();

            handleClosePopup();

        } catch (error) {

            console.error(
                "Failed to add Available Near You product:",
                error
            );

            alert(
                error.message ||
                "Failed to add product."
            );

        }

    };


    // =====================================================
    // REMOVE PRODUCT
    // =====================================================

    const handleRemoveProduct = async (id) => {

        if (!id) {

            alert("Invalid product selected.");

            return;

        }


        const confirmed = window.confirm(
            "Remove this product from Available Near You?"
        );


        if (!confirmed) {

            return;

        }


        try {

            const response = await fetch(
                `http://localhost:8080/admin/available-near-you/${id}`,
                {
                    method: "DELETE"
                }
            );


            if (!response.ok) {

                let errorMessage =
                    `HTTP error: ${response.status}`;

                try {

                    const errorData =
                        await response.json();

                    if (errorData?.message) {

                        errorMessage =
                            errorData.message;

                    }

                } catch {

                    try {

                        const text =
                            await response.text();

                        if (text) {

                            errorMessage = text;

                        }

                    } catch {

                        // Keep default error message

                    }

                }

                throw new Error(errorMessage);

            }


            await fetchAvailableNearYou();

        } catch (error) {

            console.error(
                "Failed to remove Available Near You product:",
                error
            );

            alert(
                error.message ||
                "Failed to remove product."
            );

        }

    };


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="adminhome-container-any">

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="manage-available-near-you-main-any">

                <h2>
                    Manage Availability
                </h2>

                <p>
                    Select the products that should be eligible
                    for the Available Near You section.
                </p>


                {/* =================================================
                    AVAILABLE NEAR YOU SECTION
                ================================================= */}

                <section className="available-near-you-section-any">

                    {/* =================================================
                        SECTION HEADER
                    ================================================= */}

                    <div className="available-near-you-header-any">

                        <div className="available-near-you-header-content-any">

                            <h2>
                                Available Near You
                            </h2>

                            <p>
                                Choose the products customers can
                                discover at nearby local shops.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="add-available-near-you-btn-any"
                            onClick={handleOpenPopup}
                            disabled={
                                selectedProducts.length >=
                                MAX_PRODUCTS
                            }
                        >
                            {selectedProducts.length >= MAX_PRODUCTS
                                ? "Maximum Added"
                                : "+ Add Product"}
                        </button>

                    </div>


                    {/* =================================================
                        SELECTED PRODUCTS
                    ================================================= */}

                    <div className="available-near-you-container-any">

                        {selectedProducts.length === 0 ? (

                            <div className="empty-available-near-you-any">

                                <div className="empty-icon-any">
                                    📍
                                </div>

                                <h3>
                                    No Products Selected
                                </h3>

                                <p>
                                    Add products that customers can
                                    discover from nearby local shops.
                                </p>

                            </div>

                        ) : (

                            selectedProducts.map((item) => {

                                const productId =
                                    getSelectedProductId(item);

                                const productName =
                                    getSelectedProductName(item);

                                const product =
                                    item?.product ||
                                    products.find(
                                        product =>
                                            Number(product.id) ===
                                            Number(productId)
                                    );

                                return (

                                    <div
                                        key={item.id}
                                        className="available-near-you-item-any"
                                    >

                                        {/* =================================================
                                            PRODUCT IMAGE
                                        ================================================= */}

                                        <div className="available-near-you-image-wrapper-any">

                                            {product?.thumbnailUrl ? (

                                                <img
                                                    src={
                                                        product.thumbnailUrl
                                                    }
                                                    alt={productName}
                                                    className="available-near-you-image-any"
                                                />

                                            ) : (

                                                <div className="available-near-you-image-placeholder-any">
                                                    📦
                                                </div>

                                            )}

                                        </div>


                                        {/* =================================================
                                            PRODUCT INFORMATION
                                        ================================================= */}

                                        <div className="available-near-you-info-any">

                                            <div className="available-near-you-status-any">
                                                <span>
                                                    📍
                                                </span>

                                                Eligible for nearby availability
                                            </div>


                                            <h3>
                                                {productName}
                                            </h3>


                                            <p>
                                                Product ID:{" "}
                                                {productId}
                                            </p>


                                            <p className="availability-note-any">
                                                Actual nearby availability
                                                is determined using vendor
                                                location and current stock.
                                            </p>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveProduct(
                                                        item.id
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>

                                        </div>

                                    </div>

                                );

                            })

                        )}

                    </div>


                    {/* =================================================
                        PRODUCT COUNT
                    ================================================= */}

                    <div className="available-near-you-count-any">

                        {selectedProducts.length} / {MAX_PRODUCTS} products selected

                    </div>

                </section>

            </main>


            {/* =================================================
                ADD PRODUCT POPUP
            ================================================= */}

            <Popup
                open={showPopup}
                onClose={handleClosePopup}
                title="Add Available Near You Product"
                className="available-near-you-popup-any"
            >

                <div className="available-near-you-popup-wrapper-any">

                    {/* =================================================
                        POPUP DESCRIPTION
                    ================================================= */}

                    <div className="available-near-you-popup-description-any">

                        Select a product that should be eligible
                        for nearby-shop availability.

                    </div>


                    {/* =================================================
                        PRODUCT SELECT
                    ================================================= */}

                    <div className="available-near-you-select-box-any">

                        <label htmlFor="availableNearYouProduct">

                            Select Product

                        </label>


                        <select
                            id="availableNearYouProduct"
                            value={
                                pendingProduct?.id || ""
                            }
                            onChange={(e) => {

                                const productId =
                                    Number(e.target.value);


                                const product =
                                    products.find(
                                        item =>
                                            Number(item.id) ===
                                            productId
                                    );


                                setPendingProduct(
                                    product || null
                                );

                            }}
                        >

                            <option value="">
                                -- Select Product --
                            </option>


                            {products
                                .filter(
                                    product =>
                                        !isProductSelected(
                                            product.id
                                        )
                                )
                                .map(product => (

                                    <option
                                        key={product.id}
                                        value={product.id}
                                    >
                                        {product.name}
                                    </option>

                                ))}

                        </select>

                    </div>


                    {/* =================================================
                        SELECTED PRODUCT PREVIEW
                    ================================================= */}

                    {pendingProduct && (

                        <div className="available-near-you-selected-preview-any">

                            <div className="available-near-you-preview-image-any">

                                {pendingProduct.thumbnailUrl ? (

                                    <img
                                        src={
                                            pendingProduct.thumbnailUrl
                                        }
                                        alt={
                                            pendingProduct.name
                                        }
                                    />

                                ) : (

                                    <span>
                                        📦
                                    </span>

                                )}

                            </div>


                            <div>

                                <strong>
                                    {pendingProduct.name}
                                </strong>

                                <p>
                                    Product ID:{" "}
                                    {pendingProduct.id}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        POPUP ACTIONS
                    ================================================= */}

                    <div className="available-near-you-popup-content-any">

                        <button
                            type="button"
                            onClick={handleClosePopup}
                        >
                            Cancel
                        </button>


                        <button
                            type="button"
                            onClick={handleConfirmProduct}
                            disabled={
                                !pendingProduct ||
                                selectedProducts.length >=
                                MAX_PRODUCTS
                            }
                        >
                            Add Product
                        </button>

                    </div>

                </div>

            </Popup>


            {/* =================================================
                FOOTER
            ================================================= */}

            {/* <footer className="footer-any">

                <p>
                    © 2026 Website. All rights reserved.
                </p>

            </footer> */}

        </div>

    );

}


export default AdminManageAvailableNearYou;