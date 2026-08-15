import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

import SideWindow from "../../components/SideBar";
import ProductManagementPopup from "../../components/ProductPopupManagement";

import "../../styles/AProduct.css";

import {
    getAllProducts,
    deleteProduct,
    restoreProduct
} from "../../api/ProductApi";


function AdminManageProduct() {

    const navigate = useNavigate();

    // =========================================================
    // STATE
    // =========================================================

    const [products, setProducts] = useState([]);

    const [selectedProducts, setSelectedProducts] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [showPopup, setShowPopup] = useState(false);

    const [productView, setProductView] = useState("available");

    const [selectionMode, setSelectionMode] = useState(false);


    // =========================================================
    // FILTER PRODUCTS
    // =========================================================

    const availableProducts = products.filter(
        product => product.active
    );

    const unavailableProducts = products.filter(
        product => !product.active
    );


    const displayedProducts =
        productView === "available"
            ? availableProducts
            : unavailableProducts;


    // =========================================================
    // FETCH PRODUCTS
    // =========================================================

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const res = await getAllProducts();

                console.log("PRODUCTS:", res.data);

                setProducts(res.data);

            } catch (error) {

                console.error(
                    "Failed to fetch products:",
                    error
                );

            }

        };

        fetchProducts();

    }, []);


    // =========================================================
    // SELECT / UNSELECT ONE PRODUCT
    // =========================================================

    const handleProductCheck = (productId) => {

        setSelectedProducts(prev => {

            if (prev.includes(productId)) {

                return prev.filter(
                    id => id !== productId
                );

            }

            return [
                ...prev,
                productId
            ];

        });

    };


    // =========================================================
    // OPEN PRODUCT POPUP
    // =========================================================

    const handleProductClick = (product) => {
        console.log("SELECTED PRODUCT:",product);

        // Don't open popup while selection mode is active
        if (selectionMode) {
            return;
        }

        setSelectedProduct(product);

        setShowPopup(true);

    };


    // =========================================================
    // CLOSE PRODUCT POPUP
    // =========================================================

    const handleClosePopup = () => {

        setShowPopup(false);

        setSelectedProduct(null);

    };


    // =========================================================
    // CLEAR SELECTION
    // =========================================================

    const handleClearSelection = async () => {

        setSelectedProducts([]);

        setSelectionMode(false);

        try {

            const res = await getAllProducts();

            setProducts(res.data);

        } catch (error) {

            console.error(
                "Failed to refresh products:",
                error
            );

        }

    };


    // =========================================================
    // DELETE SELECTED PRODUCTS
    // =========================================================

    const handleDeleteSelected = async () => {

        if (selectedProducts.length === 0) {

            alert(
                "Please select at least one product."
            );

            return;

        }


        const confirmed = window.confirm(
            `Are you sure you want to remove ${selectedProducts.length} product(s)?`
        );


        if (!confirmed) {
            return;
        }


        try {

            for (const productId of selectedProducts) {

                await deleteProduct(productId);

            }


            alert(
                "Selected products marked as unavailable successfully."
            );


            setSelectedProducts([]);


            const res = await getAllProducts();

            setProducts(res.data);


        } catch (error) {

            console.error(
                "Failed to delete products:",
                error
            );

            alert(
                "Failed to update selected products."
            );

        }

    };


    // =========================================================
    // RESTORE SELECTED PRODUCTS
    // =========================================================

    const handleRestoreSelected = async () => {

        if (selectedProducts.length === 0) {

            alert(
                "Please select at least one unavailable product."
            );

            return;

        }


        const confirmed = window.confirm(
            `Are you sure you want to restore ${selectedProducts.length} product(s)?`
        );


        if (!confirmed) {
            return;
        }


        try {

            for (const productId of selectedProducts) {

                await restoreProduct(productId);

            }


            alert(
                "Selected products restored successfully."
            );


            setSelectedProducts([]);


            const res = await getAllProducts();

            setProducts(res.data);


        } catch (error) {

            console.error(
                "Failed to restore products:",
                error
            );

            alert(
                "Failed to restore selected products."
            );

        }

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="adminhome-container">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="header">

                <div className="left-section">

                    <SideWindow />

                </div>


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


                <nav className="admin-nav-links">

                    <NavLink to="/admin/manage-promotions">
                        Manage Promotions
                    </NavLink>


                    <NavLink to="/adminAddProduct">
                        Add Product
                    </NavLink>


                    <div className="search-box">

                        <input
                            type="text"
                            placeholder="Search"
                        />

                        <span className="icon">
                            🔍
                        </span>

                    </div>


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

            <main className="main">

                <h1 className="mainheading">
                    Manage Products
                </h1>


                {/* =================================================
                    ACTION BAR
                ================================================= */}

                <div className="manage-product-actions">

                    <label className="select-all-products">

                        <input
                            type="checkbox"
                            checked={selectionMode}
                            onChange={(e) => {

                                const checked =
                                    e.target.checked;

                                setSelectionMode(checked);


                                if (checked) {

                                    setSelectedProducts(
                                        displayedProducts.map(
                                            product => product.id
                                        )
                                    );

                                } else {

                                    setSelectedProducts([]);

                                }

                            }}
                        />

                        Select All

                    </label>


                    {selectedProducts.length > 0 && (

                        <span
                            className="clear-selection"
                            onClick={handleClearSelection}
                        >
                            × Clear
                        </span>

                    )}

                </div>


                {/* =================================================
                    PRODUCT STATUS TABS
                ================================================= */}

                <div className="product-status-tabs">

                    <button
                        className={
                            productView === "available"
                                ? "product-tab active-tab"
                                : "product-tab"
                        }
                        onClick={() => {

                            setProductView("available");

                            setSelectedProducts([]);

                            setSelectionMode(false);

                        }}
                    >
                        Available
                    </button>


                    <button
                        className={
                            productView === "unavailable"
                                ? "product-tab unavailable-tab"
                                : "product-tab"
                        }
                        onClick={() => {

                            setProductView("unavailable");

                            setSelectedProducts([]);

                            setSelectionMode(false);

                        }}
                    >
                        Unavailable
                    </button>

                </div>


                {/* =================================================
                    PRODUCT TABLE
                ================================================= */}

                <table className="manage-product-table">

                    <thead>

                        <tr>

                            <th>
                                ID
                            </th>

                            <th>
                                Name
                            </th>

                            <th>
                                Brand
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                Variants
                            </th>

                            <th>
                                Status
                            </th>


                            {selectionMode && (

                                <th>
                                    Select
                                </th>

                            )}

                        </tr>

                    </thead>


                    <tbody>

                        {displayedProducts.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={
                                        selectionMode
                                            ? 7
                                            : 6
                                    }
                                >
                                    No products available
                                </td>

                            </tr>

                        ) : (

                            displayedProducts.map(product => (

                                <tr
                                    key={product.id}
                                    onClick={() =>
                                        handleProductClick(product)
                                    }
                                    className="product-row"
                                >

                                    <td>
                                        {product.id}
                                    </td>


                                    <td>
                                        {product.name}
                                    </td>


                                    <td>
                                        {product.brand}
                                    </td>


                                    <td>
                                        {product.category}
                                    </td>


                                    <td>

                                        {
                                            product.variants &&
                                            product.variants.length > 0
                                                ? (

                                                    product.variants.map(
                                                        (variant, index) => (

                                                            <div
                                                                key={
                                                                    variant.id ||
                                                                    index
                                                                }
                                                            >
                                                                {variant.ram},{" "}
                                                                {variant.storage}
                                                            </div>

                                                        )
                                                    )

                                                )
                                                : (
                                                    "No Variants"
                                                )
                                        }

                                    </td>


                                    <td>

                                        <span
                                            className={
                                                product.active
                                                    ? "status active"
                                                    : "status inactive"
                                            }
                                        >
                                            {
                                                product.active
                                                    ? "Available"
                                                    : "Unavailable"
                                            }
                                        </span>

                                    </td>


                                    {selectionMode && (

                                        <td>

                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedProducts.includes(
                                                        product.id
                                                    )
                                                }
                                                onChange={(e) => {

                                                    e.stopPropagation();

                                                    handleProductCheck(
                                                        product.id
                                                    );

                                                }}
                                            />

                                        </td>

                                    )}

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>


                {/* =================================================
                    DELETE / RESTORE BUTTON
                ================================================= */}

                <div className="product-action-buttons">

                    {selectedProducts.length > 0 &&

                        products.find(
                            product =>
                                product.id ===
                                selectedProducts[0]
                        )?.active ? (

                            <button
                                className="delete-selected-btn"
                                onClick={
                                    handleDeleteSelected
                                }
                            >
                                Delete Selected
                            </button>

                        ) : selectedProducts.length > 0 ? (

                            <button
                                className="restore-selected-btn"
                                onClick={
                                    handleRestoreSelected
                                }
                            >
                                Restore Selected
                            </button>

                        ) : null}

                </div>

            </main>


            {/* =================================================
                PRODUCT MANAGEMENT POPUP
            ================================================= */}

            <ProductManagementPopup
                open={showPopup}
                product={selectedProduct}
                onClose={() => {
                    setShowPopup(false);
                    setSelectedProduct(null);
                }}
                navigate={navigate}
            />


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


export default AdminManageProduct;