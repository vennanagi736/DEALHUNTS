import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Header from "../../components/Header";

import "../../styles/VProductManage.css";

import {
    getVendorCategories,
    getVendorBrands
} from "../../api/VendorApi";

import { deleteInventory } from "../../api/InventoryApi";


function VendorProductManage() {

    const navigate = useNavigate();


    // =========================================================
    // PRODUCTS
    // =========================================================

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [variantNames, setVariantNames] = useState({});
    const [colorNames, setColorNames] = useState({});


    // =========================================================
    // ADMIN MASTER DATA
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
    // =========================================================

    const [vendorCategories, setVendorCategories] = useState([]);
    const [vendorBrands, setVendorBrands] = useState([]);


    // =========================================================
    // FETCH VARIANT AND COLOR NAMES
    // =========================================================

    const fetchVariantAndColorNames = async (productList) => {

        try {

            const productIds = [
                ...new Set(
                    productList
                        .map(item => item.productId)
                        .filter(id => id != null)
                )
            ];

            const variantMap = {};
            const colorMap = {};


            // =====================================================
            // FETCH VARIANTS FOR EACH PRODUCT
            // =====================================================

            for (const productId of productIds) {

                const variantResponse = await axios.get(
                    `http://localhost:8080/admin/products/${productId}/variants`
                );

                const variants =
                    Array.isArray(variantResponse.data)
                        ? variantResponse.data
                        : [];


                variants.forEach(variant => {

                    variantMap[variant.id] =
                        variant.name;

                });


                // =================================================
                // FETCH COLORS FOR EACH VARIANT
                // =================================================

                for (const variant of variants) {

                    const colorResponse = await axios.get(
                        `http://localhost:8080/admin/products/variants/${variant.id}/colors`
                    );

                    const colors =
                        Array.isArray(colorResponse.data)
                            ? colorResponse.data
                            : [];


                    colors.forEach(color => {

                        colorMap[color.id] =
                            color.name;

                    });

                }
            }


            setVariantNames(variantMap);
            setColorNames(colorMap);


            console.log(
                "VARIANT NAMES:",
                variantMap
            );

            console.log(
                "COLOR NAMES:",
                colorMap
            );

        } catch (error) {

            console.error(
                "FETCH VARIANT/COLOR NAMES ERROR:",
                error
            );

        }
    };


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


            const productData =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            setProducts(productData);


            console.log(
                "VENDOR PRODUCTS API RESPONSE:",
                productData
            );


            await fetchVariantAndColorNames(
                productData
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
    // =========================================================

    const fetchMyCategories = async () => {

        const token =
            localStorage.getItem("vendorJwtToken");

        const vendorId =
            localStorage.getItem("vendorId");


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
                "FETCH MY CATEGORIES ERROR:",
                error
            );

            setVendorCategories([]);

        }
    };


    // =========================================================
    // FETCH VENDOR SAVED BRANDS
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

        console.log(
            "VENDOR CATEGORIES:",
            vendorCategories
        );

    }, [vendorCategories]);


    useEffect(() => {

        console.log(
            "VENDOR BRANDS:",
            vendorBrands
        );

    }, [vendorBrands]);


    // =========================================================
    // INITIAL DATA LOAD
    // =========================================================

    useEffect(() => {

        fetchVendorProducts();

        fetchVendorCategories();
        fetchVendorBrands();

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

    const groupedProducts = Object.values(
        products.reduce(
            (groups, product) => {

                const productId =
                    product.productId;


                if (!groups[productId]) {

                    groups[productId] = {
                        ...product,
                        inventoryItems: []
                    };

                }


                groups[productId]
                    .inventoryItems
                    .push(product);


                return groups;

            },
            {}
        )
    );


    const filteredProducts =
        groupedProducts.filter(
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


    const getVariantCount =
        (product) => {

            const variantKeys =
                new Set(
                    product.inventoryItems.map(
                        item =>
                            item.variantId ??
                            "default"
                    )
                );


            return variantKeys.size;

        };


    const getSellingPrice =
        (product) => {

            const basePrice =
                Number(
                    product.basePrice || 0
                );

            const discount =
                Number(
                    product.discount || 0
                );


            return (
                basePrice -
                (
                    basePrice *
                    discount /
                    100
                )
            );

        };


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
    // DELETE PRODUCT
    // =========================================================

    const handleDeleteProduct =
        async () => {

            if (
                !selectedProduct?.inventoryId
            ) {

                alert(
                    "Inventory ID not found."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    `Are you sure you want to delete "${selectedProduct.name}" from your inventory?`
                );


            if (!confirmed) {
                return;
            }


            try {

                await deleteInventory(
                    selectedProduct.inventoryId
                );


                alert(
                    "Product deleted successfully."
                );


                setShowPopup(false);
                setSelectedProduct(null);


                await fetchVendorProducts();

            } catch (error) {

                console.error(
                    "DELETE PRODUCT ERROR:",
                    error
                );


                alert(
                    error.response?.data ||
                    "Failed to delete product."
                );

            }
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


    const handleClosePopup =
        () => {

            setShowPopup(false);

            setSelectedProduct(null);

        };


    // =========================================================
    // OPEN MASTER POPUP
    // =========================================================

    const openMasterPopup =
        () => {

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

    const closeMasterPopup =
        () => {

            setShowMasterPopup(false);

            setPopupCategory("");
            setPopupBrand("");

        };


    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const handleClearFilters =
        () => {

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
                "vendor-popup-open-vpm"
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
            "vendor-popup-open-vpm"
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );


            document.body.classList.remove(
                "vendor-popup-open-vpm"
            );

        };

    }, [
        showPopup,
        showMasterPopup
    ]);


    // =========================================================
    // GROUPED VARIANTS
    // =========================================================

    const groupedVariants =
        selectedProduct
            ? Object.values(
                selectedProduct
                    .inventoryItems
                    .reduce(
                        (groups, item) => {

                            const variantKey =
                                item.variantId ??
                                "default";


                            if (
                                !groups[variantKey]
                            ) {

                                groups[variantKey] = {

                                    variantId:
                                        item.variantId,

                                    variantName:
                                        variantNames[
                                            item.variantId
                                        ] ||
                                        "Default Variant",

                                    items: []

                                };

                            }


                            groups[
                                variantKey
                            ].items.push({

                                ...item,

                                colorName:
                                    colorNames[
                                        item.colorId
                                    ] ||
                                    "N/A"

                            });


                            return groups;

                        },
                        {}
                    )
            )
            : [];


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="vendor-product-manage-page-vpm">


            {/* ================================================= */}
            {/* MAIN */}
            {/* ================================================= */}

            <main className="vendor-product-manage-vpm">


                {/* ================================================= */}
                {/* LEFT — PRODUCTS */}
                {/* ================================================= */}

                <section className="vendor-products-section-vpm">

                    <div className="vendor-manage-header-vpm">

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


                        <div className="vendor-product-count-vpm">

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

                        <div className="vendor-product-grid-vpm">

                            {Array.from({
                                length: 8
                            }).map(
                                (_, i) => (

                                    <div
                                        className="vendor-skeleton-card-vpm"
                                        key={i}
                                    >

                                        <div className="vendor-skeleton-media-vpm" />

                                        <div className="vendor-skeleton-line-vpm" />

                                        <div className="vendor-skeleton-line-vpm short" />

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <div className="vendor-product-grid-vpm">

                            {
                                filteredProducts.length === 0 ? (

                                    <div className="vendor-empty-vpm">

                                        <div className="vendor-empty-icon-vpm">
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
                                                className="vendor-product-card-vpm"
                                                key={
                                                    product.inventoryId
                                                }
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

                                                <div className="vendor-image-wrapper-vpm">

                                                    {product.image ? (

                                                        <img
                                                            src={
                                                                product.image
                                                            }
                                                            alt={
                                                                product.name
                                                            }
                                                            className="vendor-product-image-vpm"
                                                        />

                                                    ) : (

                                                        <div className="vendor-no-image-vpm">
                                                            No Image
                                                        </div>

                                                    )}


                                                    <span
                                                        className={
                                                            product.stock > 0
                                                                ? "vendor-stock-badge-vpm available-vpm"
                                                                : "vendor-stock-badge-vpm unavailable-vpm"
                                                        }
                                                    >

                                                        {
                                                            product.stock > 0
                                                                ? "In Stock"
                                                                : "Out of Stock"
                                                        }

                                                    </span>

                                                </div>


                                                <div className="vendor-product-details-vpm">

                                                    <h3>
                                                        {
                                                            product.name
                                                        }
                                                    </h3>


                                                    <p className="vendor-description-vpm">
                                                        {
                                                            product.description
                                                        }
                                                    </p>


                                                    <div className="vendor-product-bottom-vpm">

                                                        <span className="vendor-variant-count-vpm">

                                                            Variants:{" "}
                                                            {
                                                                getVariantCount(
                                                                    product
                                                                )
                                                            }

                                                        </span>


                                                        <span className="vendor-price-vpm">

                                                            ₹
                                                            {
                                                                getSellingPrice(
                                                                    product
                                                                ).toLocaleString(
                                                                    "en-IN"
                                                                )
                                                            }

                                                        </span>


                                                        <span
                                                            className={
                                                                product.stock > 0
                                                                    ? "vendor-stock-vpm available-vpm"
                                                                    : "vendor-stock-vpm unavailable-vpm"
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

                </section>


                {/* ================================================= */}
                {/* RIGHT — VENDOR CATEGORIES + BRANDS */}
                {/* ================================================= */}

                <aside className="vendor-categories-section-vpm">


                    {/* ================================================= */}
                    {/* CATEGORIES */}
                    {/* ================================================= */}

                    <div className="vendor-categories-header-vpm">

                        <h2>
                            Categories
                        </h2>

                        <span>
                            {
                                vendorCategories.length
                            }
                        </span>

                    </div>


                    <p className="vendor-categories-description-vpm">
                        Select a category to view its products.
                    </p>


                    <div className="vendor-category-list-vpm">

                        {
                            vendorCategories.length === 0 ? (

                                <div className="vendor-no-categories-vpm">
                                    No categories added yet.
                                </div>

                            ) : (

                                vendorCategories.map(
                                    item => {

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
                                                        ? "vendor-category-item-vpm active-vpm"
                                                        : "vendor-category-item-vpm"
                                                }
                                                onClick={() =>
                                                    setSelectedCategory(
                                                        category.name
                                                    )
                                                }
                                            >

                                                <span className="vendor-category-icon-vpm">
                                                    📦
                                                </span>


                                                <span className="vendor-category-name-vpm">

                                                    {
                                                        category.name
                                                    }

                                                </span>


                                                <span className="vendor-category-count-vpm">

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

                    <div className="vendor-categories-header-vpm vendor-brands-header-vpm">

                        <h2>
                            Brands
                        </h2>

                        <span>
                            {
                                vendorBrands.length
                            }
                        </span>

                    </div>


                    <p className="vendor-categories-description-vpm">
                        Select a brand to view its products.
                    </p>


                    <div className="vendor-category-list-vpm">

                        {
                            vendorBrands.length === 0 ? (

                                <div className="vendor-no-categories-vpm">
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
                                                        ? "vendor-category-item-vpm active-vpm"
                                                        : "vendor-category-item-vpm"
                                                }
                                                onClick={() =>
                                                    setSelectedBrand(
                                                        brand.name
                                                    )
                                                }
                                            >

                                                <span className="vendor-category-icon-vpm">
                                                    🏷️
                                                </span>


                                                <span className="vendor-category-name-vpm">

                                                    {
                                                        brand.name
                                                    }

                                                </span>


                                                <span className="vendor-category-count-vpm">

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
                        className="vendor-clear-filter-btn-vpm"
                        onClick={
                            handleClearFilters
                        }
                    >
                        Clear Filters
                    </button>


                    {/* ================================================= */}
                    {/* ADD CATEGORY / BRAND */}
                    {/* ================================================= */}

                    <div className="vendor-master-actions-vpm">

                        <button
                            type="button"
                            className="vendor-add-master-btn-vpm"
                            onClick={
                                openMasterPopup
                            }
                        >
                            + Add Category / Brand
                        </button>

                    </div>

                </aside>

            </main>


            {/* ========================================================= */}
            {/* CATEGORY / BRAND POPUP */}
            {/* ========================================================= */}

            {
                showMasterPopup && (

                    <div
                        className="vendor-popup-overlay-vpm"
                        onClick={
                            closeMasterPopup
                        }
                        role="presentation"
                    >

                        <div
                            className="vendor-popup-vpm master-popup-vpm"
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
                                className="vendor-popup-close-vpm"
                                onClick={
                                    closeMasterPopup
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>


                            <div className="vendor-popup-details-vpm">

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

                                <div className="master-option-content-vpm">

                                    <label
                                        htmlFor="vendor-category-select"
                                        className="master-select-label-vpm"
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
                                        className="vendor-master-select-vpm"
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
                                        className="vendor-save-master-btn-vpm"
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

                                <div className="master-option-content-vpm">

                                    <label
                                        htmlFor="vendor-brand-select"
                                        className="master-select-label-vpm"
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
                                        className="vendor-master-select-vpm"
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
                                        className="vendor-save-master-btn-vpm"
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
                        className="vendor-popup-overlay-vpm"
                        onClick={
                            handleClosePopup
                        }
                        role="presentation"
                    >

                        <div
                            className="vendor-popup-vpm"
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
                                className="vendor-popup-close-vpm"
                                onClick={
                                    handleClosePopup
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>


                            <div className="vendor-popup-content-vpm">


                                <div className="vendor-popup-image-vpm">

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

                                            <div className="vendor-no-image-vpm">
                                                No Image
                                            </div>

                                        )
                                    }

                                </div>


                                <div className="vendor-popup-details-vpm">

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


                                    <div className="vendor-popup-info-vpm">


                                        <div>

                                            <span>
                                                Price
                                            </span>

                                            <strong>
                                                ₹
                                                {
                                                    getSellingPrice(
                                                        selectedProduct
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


                                        {/* ================================================= */}
                                        {/* VARIANTS */}
                                        {/* ================================================= */}

                                        <div className="vendor-popup-variants-vpm">

                                            {groupedVariants.map(
                                                (
                                                    variant,
                                                    index
                                                ) => (

                                                    <div
                                                        className="vendor-popup-variant-vpm"
                                                        key={
                                                            variant.variantId ??
                                                            `variant-${index}`
                                                        }
                                                    >

                                                        <h3>
                                                            Variant{" "}
                                                            {index + 1}:
                                                        </h3>


                                                        <p className="vendor-popup-variant-name-vpm">

                                                            Variant:{" "}
                                                            {
                                                                variant.variantName
                                                            }

                                                        </p>


                                                        {
                                                            variant.items.map(
                                                                (
                                                                    item,
                                                                    colorIndex
                                                                ) => (

                                                                    <div
                                                                        className="vendor-popup-color-row-vpm"
                                                                        key={
                                                                            item.inventoryId ??
                                                                            `color-${colorIndex}`
                                                                        }
                                                                    >

                                                                        <span>

                                                                            Color:{" "}
                                                                            {
                                                                                item.colorName ||
                                                                                "N/A"
                                                                            }

                                                                        </span>


                                                                        <strong>

                                                                            Price: ₹
                                                                            {
                                                                                getSellingPrice(
                                                                                    item
                                                                                ).toLocaleString(
                                                                                    "en-IN"
                                                                                )
                                                                            }

                                                                        </strong>

                                                                    </div>

                                                                )
                                                            )
                                                        }

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>


                                    <div className="vendor-popup-vendor-vpm">

                                        Vendor ID:

                                        <strong>
                                            {
                                                localStorage.getItem(
                                                    "vendorId"
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div className="vendor-popup-actions-vpm">

                                        <button
                                            type="button"
                                            className="vendor-edit-btn-vpm"
                                            onClick={() => {

                                                navigate(
                                                    `/vendor/edit-product/${selectedProduct.inventoryId}`
                                                );

                                            }}
                                        >
                                            Edit
                                        </button>


                                        <button
                                            type="button"
                                            className="vendor-delete-btn-vpm"
                                            onClick={
                                                handleDeleteProduct
                                            }
                                        >
                                            Delete
                                        </button>

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
