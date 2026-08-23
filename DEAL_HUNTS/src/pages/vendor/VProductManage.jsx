import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import SideWindow from "../../components/SideBar";

import "../../styles/VendorHome.css";
import "../../styles/SideBar.css";
import "../../styles/VProductManage.css";

import {
    getVendorCategories,
    getVendorBrands
} from "../../api/VendorApi";


function VendorProductManage() {

    const navigate = useNavigate();


    // =========================================================
    // PRODUCTS
    // =========================================================

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    // =========================================================
    // ADMIN MASTER DATA
    // These are ALL categories and brands created by Admin
    // Used only for popup dropdowns
    // =========================================================

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);


    // =========================================================
    // CURRENT PRODUCT FILTERS
    // =========================================================

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");


    // =========================================================
    // MASTER POPUP
    // =========================================================

    const [showMasterPopup, setShowMasterPopup] = useState(false);

    const [popupCategory, setPopupCategory] = useState("");
    const [popupBrand, setPopupBrand] = useState("");


    // =========================================================
    // PRODUCT POPUP
    // =========================================================

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showPopup, setShowPopup] = useState(false);


    // =========================================================
    // VENDOR-SPECIFIC DATA
    // These contain ONLY the categories/brands saved by
    // the currently logged-in vendor
    // =========================================================

    const [vendorCategories, setVendorCategories] = useState([]);
    const [vendorBrands, setVendorBrands] = useState([]);


    // =========================================================
    // FETCH VENDOR PRODUCTS
    // =========================================================

    const fetchVendorProducts = async () => {

        const token =
            localStorage.getItem("vendorJwtToken");

        const vendorId =
            localStorage.getItem("vendorId");


        if (!token || !vendorId) {

            alert("Please login first!");

            navigate("/vendorLogin");

            return;
        }


        setIsLoading(true);


        try {

            const response = await axios.get(
                `http://localhost:8080/vendor/myProducts?vendorId=${vendorId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            setProducts(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );


        } catch (error) {

            console.error(
                "FETCH PRODUCTS ERROR:",
                error
            );


            if (error.response?.status === 404) {

                setProducts([]);

            } else if (error.response?.status === 401) {

                console.log(
                    "Unauthorized request"
                );

            } else {

                alert(
                    "Failed to fetch products."
                );

            }


        } finally {

            setIsLoading(false);

        }
    };


    // =========================================================
    // FETCH ADMIN CATEGORIES
    // Used for popup dropdown
    // =========================================================

    const fetchVendorCategories = async () => {

        try {

            const response =
                await getVendorCategories();


            const categoryData =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            setCategories(categoryData);


        } catch (error) {

            console.error(
                "FETCH CATEGORIES ERROR:",
                error
            );


            setCategories([]);

        }
    };


    // =========================================================
    // FETCH ADMIN BRANDS
    // Used for popup dropdown
    // =========================================================

    const fetchVendorBrands = async () => {

        try {

            const response =
                await getVendorBrands();


            const brandData =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            setBrands(brandData);


        } catch (error) {

            console.error(
                "FETCH BRANDS ERROR:",
                error
            );


            setBrands([]);

        }
    };


    // =========================================================
    // FETCH VENDOR SAVED CATEGORIES
    // Used for RIGHT SIDE
    // =========================================================

    const fetchMyCategories = async () => {

        const token = localStorage.getItem("vendorJwtToken");
        const vendorId = localStorage.getItem("vendorId");

        if (!token || !vendorId) {
            return;
        }

        try {
            const response = await axios.get(
                "http://localhost:8080/vendor/myCategories",
                {
                    params: {
                        vendorId: vendorId
                    },

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            setVendorCategories(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );


        } catch (error) {

            console.error(
                "FETCH MY CATEGORIES ERROR:", error
            );

            setVendorCategories([]);
        }
    };

    // =========================================================
    // FETCH VENDOR SAVED BRANDS
    // Used for RIGHT SIDE
    // =========================================================

    const fetchMyBrands = async () => {

        const token =
            localStorage.getItem("vendorJwtToken");

        const vendorId =
            localStorage.getItem("vendorId");


        if (!token || !vendorId) {
            return;
        }


        try {

            const response = await axios.get(
                "http://localhost:8080/vendor/myBrands",
                {
                    params: {
                        vendorId: vendorId
                    },

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            setVendorBrands(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );


        } catch (error) {

            console.error(
                "FETCH MY BRANDS ERROR:",
                error
            );


            setVendorBrands([]);

        }
    };
useEffect(() => {
    console.log("VENDOR CATEGORIES:", vendorCategories);
}, [vendorCategories]);

useEffect(() => {
    console.log("VENDOR BRANDS:", vendorBrands);
}, [vendorBrands]);

    console.log("VENDOR CATEGORIES:", vendorCategories);
console.log("VENDOR BRANDS:", vendorBrands);


    // =========================================================
    // INITIAL DATA LOAD
    // =========================================================

    useEffect(() => {

        fetchVendorProducts();

        // Admin master data
        fetchVendorCategories();
        fetchVendorBrands();

        // Vendor-specific data
        fetchMyCategories();
        fetchMyBrands();

    }, []);


    // =========================================================
    // SAVE CATEGORY FOR VENDOR
    // =========================================================

    const handleSaveCategory = async () => {

        if (!popupCategory) {

            alert(
                "Please select a category."
            );

            return;
        }


        const token =
            localStorage.getItem(
                "vendorJwtToken"
            );

        const vendorId =
            localStorage.getItem(
                "vendorId"
            );


        if (!token || !vendorId) {

            alert(
                "Please login first."
            );

            navigate("/vendorLogin");

            return;
        }


        try {

            const category =
                categories.find(
                    item =>
                        item.name ===
                        popupCategory
                );


            if (!category) {

                alert(
                    "Selected category not found."
                );

                return;
            }


            await axios.post(
                "http://localhost:8080/vendor/category",
                null,
                {
                    params: {
                        vendorId: vendorId,
                        categoryId: category.id
                    },

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            alert(
                "Category added successfully."
            );


            setPopupCategory("");


            // Refresh vendor-specific categories
            await fetchMyCategories();


        } catch (error) {

            console.error(
                "SAVE CATEGORY ERROR:",
                error
            );


            alert(
                error.response?.data ||
                "Failed to save category."
            );

        }
    };


    // =========================================================
    // SAVE BRAND FOR VENDOR
    // =========================================================

    const handleSaveBrand = async () => {

        if (!popupBrand) {

            alert(
                "Please select a brand."
            );

            return;
        }


        const token =
            localStorage.getItem(
                "vendorJwtToken"
            );

        const vendorId =
            localStorage.getItem(
                "vendorId"
            );


        if (!token || !vendorId) {

            alert(
                "Please login first."
            );

            navigate("/vendorLogin");

            return;
        }


        try {

            const brand =
                brands.find(
                    item =>
                        item.name ===
                        popupBrand
                );


            if (!brand) {

                alert(
                    "Selected brand not found."
                );

                return;
            }


            await axios.post(
                "http://localhost:8080/vendor/brand",
                null,
                {
                    params: {
                        vendorId: vendorId,
                        brandId: brand.id
                    },

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            alert(
                "Brand added successfully."
            );


            setPopupBrand("");


            // Refresh vendor-specific brands
            await fetchMyBrands();


        } catch (error) {

            console.error(
                "SAVE BRAND ERROR:",
                error
            );


            alert(
                error.response?.data ||
                "Failed to save brand."
            );

        }
    };


    // =========================================================
    // FILTER PRODUCTS
    // =========================================================

    const filteredProducts =
        products.filter(
            product => {

                const categoryMatches =
                    !selectedCategory ||
                    product.category ===
                        selectedCategory;


                const brandMatches =
                    !selectedBrand ||
                    product.brand ===
                        selectedBrand;


                return (
                    categoryMatches &&
                    brandMatches
                );

            }
        );


    // =========================================================
    // CATEGORY PRODUCT COUNT
    // =========================================================

    const getCategoryProductCount =
        (categoryName) => {

            return products.filter(
                product =>
                    product.category ===
                    categoryName
            ).length;

        };


    // =========================================================
    // BRAND PRODUCT COUNT
    // =========================================================

    const getBrandProductCount =
        (brandName) => {

            return products.filter(
                product =>
                    product.brand ===
                    brandName
            ).length;

        };


    // =========================================================
    // PRODUCT POPUP
    // =========================================================

    const handleProductClick =
        (product) => {

            setSelectedProduct(product);

            setShowPopup(true);

        };


    const handleCardKeyDown =
        (e, product) => {

            if (
                e.key === "Enter" ||
                e.key === " "
            ) {

                e.preventDefault();

                handleProductClick(
                    product
                );

            }

        };


    const handleClosePopup = () => {

        setShowPopup(false);

        setSelectedProduct(null);

    };


    // =========================================================
    // OPEN MASTER POPUP
    // =========================================================

    const openMasterPopup = () => {

        setPopupCategory(
            selectedCategory
        );

        setPopupBrand(
            selectedBrand
        );

        setShowMasterPopup(true);

    };


    // =========================================================
    // CLOSE MASTER POPUP
    // =========================================================

    const closeMasterPopup = () => {

        setShowMasterPopup(false);

        setPopupCategory("");

        setPopupBrand("");

    };


    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const handleClearFilters = () => {

        setSelectedCategory("");

        setSelectedBrand("");

        setPopupCategory("");

        setPopupBrand("");

    };


    // =========================================================
    // ESCAPE + SCROLL LOCK
    // =========================================================

    useEffect(() => {

        if (
            !showPopup &&
            !showMasterPopup
        ) {

            document.body.classList.remove(
                "vendor-popup-open"
            );

            return;
        }


        const handleKeyDown =
            (e) => {

                if (
                    e.key !== "Escape"
                ) {
                    return;
                }


                if (showPopup) {

                    handleClosePopup();

                }


                if (
                    showMasterPopup
                ) {

                    closeMasterPopup();

                }

            };


        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        document.body.classList.add(
            "vendor-popup-open"
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );


            document.body.classList.remove(
                "vendor-popup-open"
            );

        };

    }, [
        showPopup,
        showMasterPopup
    ]);


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="home-container">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <header className="header">

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

                    <span className="Vendor">
                        Vendor
                    </span>

                </div>


                <button
                    className="back-btn"
                    onClick={() =>
                        navigate(-1)
                    }
                    aria-label="Go back"
                    title="Go back"
                >
                    ←
                </button>

            </header>


            {/* ================================================= */}
            {/* MAIN */}
            {/* ================================================= */}

            <main className="vendor-product-manage">


                {/* ================================================= */}
                {/* LEFT — PRODUCTS */}
                {/* ================================================= */}

                <section className="vendor-products-section">


                    <div className="vendor-manage-header">

                        <div>

                            <h1>
                                My Products
                            </h1>

                            <p>

                                Products in{" "}

                                <strong>
                                    {
                                        selectedCategory ||
                                        "All Categories"
                                    }
                                </strong>


                                {selectedBrand && (

                                    <>

                                        {" • "}

                                        <strong>
                                            {
                                                selectedBrand
                                            }
                                        </strong>

                                    </>

                                )}

                            </p>

                        </div>


                        <div className="vendor-product-count">

                            {
                                filteredProducts.length
                            }{" "}

                            {
                                filteredProducts.length === 1
                                    ? "Product"
                                    : "Products"
                            }

                        </div>

                    </div>


                    {/* ================================================= */}
                    {/* PRODUCTS */}
                    {/* ================================================= */}

                    {isLoading ? (

                        <div className="vendor-product-grid">

                            {Array.from({
                                length: 8
                            }).map(
                                (_, i) => (

                                    <div
                                        className="vendor-skeleton-card"
                                        key={i}
                                    >

                                        <div className="vendor-skeleton-media" />

                                        <div className="vendor-skeleton-line" />

                                        <div className="vendor-skeleton-line short" />

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <div className="vendor-product-grid">


                            {
                                filteredProducts.length === 0 ? (

                                    <div className="vendor-empty">

                                        <div className="vendor-empty-icon">
                                            📦
                                        </div>

                                        <h3>
                                            No Products Found
                                        </h3>

                                        <p>
                                            No products are available
                                            for the selected
                                            category and brand.
                                        </p>

                                    </div>

                                ) : (

                                    filteredProducts.map(
                                        product => (

                                            <div
                                                className="vendor-product-card"
                                                key={product.id}
                                                onClick={() =>
                                                    handleProductClick(
                                                        product
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    handleCardKeyDown(
                                                        e,
                                                        product
                                                    )
                                                }
                                                role="button"
                                                tabIndex={0}
                                            >

                                                <div className="vendor-image-wrapper">

                                                    {product.image ? (

                                                        <img
                                                            src={
                                                                product.image
                                                            }
                                                            alt={
                                                                product.name
                                                            }
                                                            className="vendor-product-image"
                                                        />

                                                    ) : (

                                                        <div className="vendor-no-image">
                                                            No Image
                                                        </div>

                                                    )}


                                                    <span
                                                        className={
                                                            product.stock > 0
                                                                ? "vendor-stock-badge available"
                                                                : "vendor-stock-badge unavailable"
                                                        }
                                                    >

                                                        {
                                                            product.stock > 0
                                                                ? "In Stock"
                                                                : "Out of Stock"
                                                        }

                                                    </span>

                                                </div>


                                                <div className="vendor-product-details">

                                                    <h3>
                                                        {
                                                            product.name
                                                        }
                                                    </h3>


                                                    <p className="vendor-description">
                                                        {
                                                            product.description
                                                        }
                                                    </p>


                                                    <div className="vendor-product-bottom">

                                                        <span className="vendor-price">

                                                            ₹
                                                            {
                                                                Number(
                                                                    product.sellingPrice
                                                                ).toLocaleString(
                                                                    "en-IN"
                                                                )
                                                            }

                                                        </span>


                                                        <span
                                                            className={
                                                                product.stock > 0
                                                                    ? "vendor-stock available"
                                                                    : "vendor-stock unavailable"
                                                            }
                                                        >

                                                            {
                                                                product.stock > 0
                                                                    ? `Stock: ${product.stock}`
                                                                    : "Out of Stock"
                                                            }

                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )

                                )
                            }

                        </div>

                    )}


                    {/* ================================================= */}
                    {/* ADD CATEGORY / BRAND */}
                    {/* ================================================= */}

                    <div className="vendor-master-actions">

                        <button
                            type="button"
                            className="vendor-add-master-btn"
                            onClick={
                                openMasterPopup
                            }
                        >
                            + Add Category / Brand
                        </button>

                    </div>


                </section>


                {/* ================================================= */}
                {/* RIGHT — VENDOR CATEGORIES + BRANDS */}
                {/* ================================================= */}

                <aside className="vendor-categories-section">


                    {/* ================================================= */}
                    {/* CATEGORIES */}
                    {/* ================================================= */}

                    <div className="vendor-categories-header">

                        <h2>
                            Categories
                        </h2>

                        <span>
                            {
                                vendorCategories.length
                            }
                        </span>

                    </div>


                    <p className="vendor-categories-description">
                        Select a category to view its products.
                    </p>


                    <div className="vendor-category-list">

                        {
                            vendorCategories.length === 0 ? (

                                <div className="vendor-no-categories">
                                    No categories added yet.
                                </div>

                            ) : (

                                vendorCategories.map(item => {

                                        const category =
                                            item.category;


                                        return (

                                            <button
                                                key={
                                                    item.id
                                                }
                                                type="button"
                                                className={
                                                    selectedCategory ===
                                                    category.name
                                                        ? "vendor-category-item active"
                                                        : "vendor-category-item"
                                                }
                                                onClick={() =>
                                                    setSelectedCategory(
                                                        category.name
                                                    )
                                                }
                                            >

                                                <span className="vendor-category-icon">
                                                    📦
                                                </span>


                                                <span className="vendor-category-name">

                                                    {
                                                        category.name
                                                    }

                                                </span>


                                                <span className="vendor-category-count">

                                                    {
                                                        getCategoryProductCount(
                                                            category.name
                                                        )
                                                    }

                                                </span>

                                            </button>

                                        );

                                    }
                                )

                            )
                        }

                    </div>


                    {/* ================================================= */}
                    {/* BRANDS */}
                    {/* ================================================= */}

                    <div className="vendor-categories-header vendor-brands-header">

                        <h2>
                            Brands
                        </h2>

                        <span>
                            {
                                vendorBrands.length
                            }
                        </span>

                    </div>


                    <p className="vendor-categories-description">
                        Select a brand to view its products.
                    </p>


                    <div className="vendor-category-list">

                        {
                            vendorBrands.length === 0 ? (

                                <div className="vendor-no-categories">
                                    No brands added yet.
                                </div>

                            ) : (

                                vendorBrands.map(
                                    item => {

                                        const brand =
                                            item.brand;


                                        return (

                                            <button
                                                key={
                                                    item.id
                                                }
                                                type="button"
                                                className={
                                                    selectedBrand ===
                                                    brand.name
                                                        ? "vendor-category-item active"
                                                        : "vendor-category-item"
                                                }
                                                onClick={() =>
                                                    setSelectedBrand(
                                                        brand.name
                                                    )
                                                }
                                            >

                                                <span className="vendor-category-icon">
                                                    🏷️
                                                </span>


                                                <span className="vendor-category-name">

                                                    {
                                                        brand.name
                                                    }

                                                </span>
                                                


                                                <span className="vendor-category-count">

                                                    {
                                                        getBrandProductCount(
                                                            brand.name
                                                        )
                                                    }

                                                </span>

                                            </button>

                                        );

                                    }
                                )

                            )
                        }

                    </div>


                    {/* ================================================= */}
                    {/* CLEAR FILTERS */}
                    {/* ================================================= */}

                    <button
                        type="button"
                        className="vendor-clear-filter-btn"
                        onClick={
                            handleClearFilters
                        }
                    >
                        Clear Filters
                    </button>


                </aside>

            </main>


            {/* ========================================================= */}
            {/* CATEGORY / BRAND POPUP */}
            {/* ========================================================= */}

            {
                showMasterPopup && (

                    <div
                        className="vendor-popup-overlay"
                        onClick={
                            closeMasterPopup
                        }
                        role="presentation"
                    >

                        <div
                            className="vendor-popup master-popup"
                            onClick={
                                e =>
                                    e.stopPropagation()
                            }
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="master-popup-title"
                        >


                            <button
                                type="button"
                                className="vendor-popup-close"
                                onClick={
                                    closeMasterPopup
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>


                            <div className="vendor-popup-details">


                                <h2 id="master-popup-title">
                                    Add Category / Brand
                                </h2>


                                <p>
                                    Select from the categories and
                                    brands provided by the administrator.
                                </p>


                                {/* ================================================= */}
                                {/* CATEGORY */}
                                {/* ================================================= */}

                                <div className="master-option-content">

                                    <label
                                        htmlFor="vendor-category-select"
                                        className="master-select-label"
                                    >
                                        Category
                                    </label>


                                    <select
                                        id="vendor-category-select"
                                        value={
                                            popupCategory
                                        }
                                        onChange={
                                            e =>
                                                setPopupCategory(
                                                    e.target.value
                                                )
                                        }
                                        className="vendor-master-select"
                                    >

                                        <option value="">
                                            Select Category
                                        </option>


                                        {
                                            categories.map(
                                                category => (

                                                    <option
                                                        key={
                                                            category.id
                                                        }
                                                        value={
                                                            category.name
                                                        }
                                                    >
                                                        {
                                                            category.name
                                                        }
                                                    </option>

                                                )
                                            )
                                        }

                                    </select>


                                    <button
                                        type="button"
                                        className="vendor-save-master-btn"
                                        onClick={
                                            handleSaveCategory
                                        }
                                        disabled={
                                            !popupCategory
                                        }
                                    >
                                        Add Category
                                    </button>

                                </div>


                                {/* ================================================= */}
                                {/* BRAND */}
                                {/* ================================================= */}

                                <div className="master-option-content">

                                    <label
                                        htmlFor="vendor-brand-select"
                                        className="master-select-label"
                                    >
                                        Brand
                                    </label>


                                    <select
                                        id="vendor-brand-select"
                                        value={
                                            popupBrand
                                        }
                                        onChange={
                                            e =>
                                                setPopupBrand(
                                                    e.target.value
                                                )
                                        }
                                        className="vendor-master-select"
                                    >

                                        <option value="">
                                            Select Brand
                                        </option>


                                        {
                                            brands.map(
                                                brand => (

                                                    <option
                                                        key={
                                                            brand.id
                                                        }
                                                        value={
                                                            brand.name
                                                        }
                                                    >
                                                        {
                                                            brand.name
                                                        }
                                                    </option>

                                                )
                                            )
                                        }

                                    </select>


                                    <button
                                        type="button"
                                        className="vendor-save-master-btn"
                                        onClick={
                                            handleSaveBrand
                                        }
                                        disabled={
                                            !popupBrand
                                        }
                                    >
                                        Add Brand
                                    </button>

                                </div>


                            </div>

                        </div>

                    </div>

                )
            }


            {/* ========================================================= */}
            {/* PRODUCT DETAILS POPUP */}
            {/* ========================================================= */}

            {
                showPopup &&
                selectedProduct && (

                    <div
                        className="vendor-popup-overlay"
                        onClick={
                            handleClosePopup
                        }
                        role="presentation"
                    >

                        <div
                            className="vendor-popup"
                            onClick={
                                e =>
                                    e.stopPropagation()
                            }
                            role="dialog"
                            aria-modal="true"
                            aria-label={
                                selectedProduct.name
                            }
                        >


                            <button
                                type="button"
                                className="vendor-popup-close"
                                onClick={
                                    handleClosePopup
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>


                            <div className="vendor-popup-content">


                                <div className="vendor-popup-image">

                                    {
                                        selectedProduct.image ? (

                                            <img
                                                src={
                                                    selectedProduct.image
                                                }
                                                alt={
                                                    selectedProduct.name
                                                }
                                            />

                                        ) : (

                                            <div className="vendor-no-image">
                                                No Image
                                            </div>

                                        )
                                    }

                                </div>


                                <div className="vendor-popup-details">

                                    <h2>
                                        {
                                            selectedProduct.name
                                        }
                                    </h2>


                                    <p>
                                        {
                                            selectedProduct.description
                                        }
                                    </p>


                                    <div className="vendor-popup-info">


                                        <div>

                                            <span>
                                                Price
                                            </span>

                                            <strong>
                                                ₹
                                                {
                                                    Number(
                                                        selectedProduct.sellingPrice
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Stock
                                            </span>

                                            <strong>
                                                {
                                                    selectedProduct.stock
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Category
                                            </span>

                                            <strong>
                                                {
                                                    selectedProduct.category
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Brand
                                            </span>

                                            <strong>
                                                {
                                                    selectedProduct.brand ||
                                                    "N/A"
                                                }
                                            </strong>

                                        </div>


                                    </div>


                                    <div className="vendor-popup-vendor">

                                        Vendor ID:

                                        <strong>
                                            {
                                                localStorage.getItem(
                                                    "vendorId"
                                                )
                                            }
                                        </strong>

                                    </div>


                                </div>

                            </div>

                        </div>

                    </div>

                )
            }


        </div>
    );
}


export default VendorProductManage;