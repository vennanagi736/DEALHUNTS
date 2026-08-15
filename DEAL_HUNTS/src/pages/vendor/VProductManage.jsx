import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import SideWindow from "../../components/SideBar";

import "../../styles/VendorHome.css";
import "../../styles/SideBar.css";
import "../../styles/VProductManage.css";

function VendorProductManage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const fetchVendorProducts = async () => {
        const token = localStorage.getItem("vendorJwtToken");
        const vendorId = localStorage.getItem("vendorId");

        if (!token || !vendorId) {
            alert("Please login first!");
            navigate("/VendorLogin");
            return;
        }

        try {
            /*
             * Existing backend endpoint.
             *
             * The backend should return only the products
             * belonging to this vendor.
             */
            const response = await axios.get(
                `http://localhost:8080/vendor/myProducts?vendorId=${vendorId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setProducts(response.data);

        } catch (error) {
            console.error("FETCH PRODUCTS ERROR:", error);

            if (error.response?.status === 404) {
                setProducts([]);
            } else if (error.response?.status === 401) {
                console.log("Unauthorized request");
            } else {
                alert("Failed to fetch products.");
            }
        }
    };

     useEffect(() => {
        fetchVendorProducts();
    }, []);


    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedProduct(null);
    };

    return (
        <div className="home-container">

            {/* ================= HEADER ================= */}

            <header className="header">

                <div className="left-section">
                    <SideWindow />
                </div>

                <div className="logo">
                    <span className="Gold">DEAL</span>
                    <span className="Black">HUNTS</span>
                    <span className="Vendor">Vendor</span>
                </div>

                <div
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    ←
                </div>

            </header>


            {/* ================= MAIN ================= */}

            <main className="vendor-product-manage">

                <div className="vendor-manage-header">

                    <div>
                        <h1>My Products</h1>

                        <p>
                            Products added to your vendor account
                        </p>
                    </div>

                    <div className="vendor-product-count">
                        {products.length} Products
                    </div>

                </div>


                {/* ================= PRODUCTS ================= */}

                <div className="vendor-product-grid">

                    {products.length === 0 ? (

                        <div className="vendor-empty">
                            <div className="vendor-empty-icon">
                                📦
                            </div>

                            <h3>No Products Found</h3>

                            <p>
                                You haven't added any products yet.
                            </p>

                        </div>

                    ) : (

                        products.map((product) => (

                            <div
                                className="vendor-product-card"
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                            >

                                {/* IMAGE */}

                                <div className="vendor-image-wrapper">

                                    {product.image ? (

                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="vendor-product-image"
                                        />

                                    ) : (

                                        <div className="vendor-no-image">
                                            No Image
                                        </div>

                                    )}

                                </div>


                                {/* DETAILS */}

                                <div className="vendor-product-details">

                                    <h3>
                                        {product.name}
                                    </h3>

                                    <p className="vendor-description">
                                        {product.description}
                                    </p>

                                    <div className="vendor-product-bottom">

                                        <span className="vendor-price">
                                            ₹{Number(product.price).toLocaleString("en-IN")}
                                        </span>

                                        <span
                                            className={
                                                product.stock > 0
                                                    ? "vendor-stock available"
                                                    : "vendor-stock unavailable"
                                            }
                                        >
                                            {product.stock > 0
                                                ? `Stock: ${product.stock}`
                                                : "Out of Stock"}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </main>


            {/* ================= PRODUCT POPUP ================= */}

            {showPopup && selectedProduct && (

                <div
                    className="vendor-popup-overlay"
                    onClick={handleClosePopup}
                >

                    <div
                        className="vendor-popup"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="vendor-popup-close"
                            onClick={handleClosePopup}
                        >
                            ×
                        </button>


                        <div className="vendor-popup-content">

                            <div className="vendor-popup-image">

                                {selectedProduct.image ? (

                                    <img
                                        src={selectedProduct.image}
                                        alt={selectedProduct.name}
                                    />

                                ) : (

                                    <div className="vendor-no-image">
                                        No Image
                                    </div>

                                )}

                            </div>


                            <div className="vendor-popup-details">

                                <h2>
                                    {selectedProduct.name}
                                </h2>

                                <p>
                                    {selectedProduct.description}
                                </p>

                                <div className="vendor-popup-info">

                                    <div>
                                        <span>Price</span>
                                        <strong>
                                            ₹{Number(selectedProduct.price).toLocaleString("en-IN")}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Stock</span>
                                        <strong>
                                            {selectedProduct.stock}
                                        </strong>
                                    </div>

                                </div>

                                <div className="vendor-popup-vendor">

                                    Vendor ID:
                                    <strong>
                                        {localStorage.getItem("vendorId")}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default VendorProductManage;