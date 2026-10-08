import React, { useEffect, useState } from "react";

import "../../styles/AManageComingSoon.css";


function AdminManageComingSoon() {

    // ============================================================
    // STATE
    // ============================================================

    const [productName, setProductName] = useState("");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");

    const [displayFromDate, setDisplayFromDate] = useState("");
    const [displayToDate, setDisplayToDate] = useState("");

    const [priority, setPriority] = useState(1);

    // ONE IMAGE ONLY
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    const [comingSoonProducts, setComingSoonProducts] = useState([]);

    // ADD POPUP
    const [showPopup, setShowPopup] = useState(false);

    // DETAILS / PRODUCTS DRAWER
    const [showDetailsPopup, setShowDetailsPopup] = useState(false);

    const [loading, setLoading] = useState(false);


    // ============================================================
    // BACKEND URL
    // ============================================================

    const API = "http://localhost:8080";


    // ============================================================
    // FETCH ALL COMING SOON PRODUCTS
    // ============================================================

    const fetchComingSoonProducts = async () => {

        try {

            const response = await fetch(
                `${API}/admin/coming-soon/all`
            );

            if (!response.ok) {

                throw new Error(
                    "Failed to load Coming Soon products"
                );

            }

            const data = await response.json();

            setComingSoonProducts(
                Array.isArray(data) ? data : []
            );

        } catch (error) {

            console.error(
                "Error loading Coming Soon products:",
                error
            );

            setComingSoonProducts([]);

        }

    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        fetchComingSoonProducts();

    }, []);


    // ============================================================
    // IMAGE CHANGE
    // ONE IMAGE ONLY
    // ============================================================

    const handleImageChange = (event) => {

        const selectedFile =
            event.target.files?.[0];

        if (!selectedFile) {
            return;
        }


        // --------------------------------------------------------
        // VALIDATE IMAGE TYPE
        // --------------------------------------------------------

        if (!selectedFile.type.startsWith("image/")) {

            alert(
                "Please select a valid image file."
            );

            event.target.value = "";

            return;

        }


        // --------------------------------------------------------
        // VALIDATE IMAGE SIZE
        // --------------------------------------------------------

        if (
            selectedFile.size >
            2 * 1024 * 1024
        ) {

            alert(
                "Image must be smaller than 2 MB."
            );

            event.target.value = "";

            return;

        }


        // --------------------------------------------------------
        // ONLY ONE IMAGE
        // --------------------------------------------------------

        setImage(selectedFile);


        // --------------------------------------------------------
        // CREATE PREVIEW
        // --------------------------------------------------------

        const preview =
            URL.createObjectURL(
                selectedFile
            );

        setPreviewImage(preview);


        // Allow selecting the same image again
        event.target.value = "";

    };


    // ============================================================
    // RESET FORM
    // ============================================================

    const resetForm = () => {

        setProductName("");
        setBrand("");
        setDescription("");

        setDisplayFromDate("");
        setDisplayToDate("");

        setPriority(1);

        setImage(null);
        setPreviewImage("");

    };


    // ============================================================
    // OPEN ADD POPUP
    // ============================================================

    const openAddPopup = () => {

        resetForm();

        setShowPopup(true);

    };


    // ============================================================
    // OPEN PRODUCTS DRAWER
    // ============================================================

    const openDetailsPopup = () => {

        if (comingSoonProducts.length === 0) {

            return;

        }

        setShowDetailsPopup(true);

    };


    // ============================================================
    // CLOSE PRODUCTS DRAWER
    // ============================================================

    const closeDetailsPopup = () => {

        setShowDetailsPopup(false);

    };


    // ============================================================
    // EDIT PRODUCT
    // ============================================================

    const handleEdit = (product) => {

        setProductName(
            product.productName || ""
        );

        setBrand(
            product.brand || ""
        );

        setDescription(
            product.description || ""
        );

        setDisplayFromDate(
            product.displayFromDate || ""
        );

        setDisplayToDate(
            product.displayToDate || ""
        );

        setPriority(
            product.priority || 1
        );


        // --------------------------------------------------------
        // EXISTING IMAGE
        // --------------------------------------------------------
        // Existing image is displayed as preview.
        // No remove-image button is provided.
        // --------------------------------------------------------

        setImage(null);

        setPreviewImage(
            getFirstImage(product) || ""
        );


        setShowDetailsPopup(false);

        setShowPopup(true);

    };


    // ============================================================
    // DELETE PRODUCT
    // ============================================================

    const handleDelete = async (product) => {

        if (!product?.id) {

            return;

        }


        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${product.productName}"?`
            );


        if (!confirmed) {

            return;

        }


        try {

            setLoading(true);


            const response = await fetch(
                `${API}/admin/coming-soon/${product.id}`,
                {
                    method: "DELETE"
                }
            );


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Failed to delete Coming Soon product"
                );

            }


            alert(
                "Coming Soon product deleted successfully."
            );


            await fetchComingSoonProducts();

        } catch (error) {

            console.error(
                "Coming Soon delete error:",
                error
            );

            alert(
                error.message ||
                "Failed to delete Coming Soon product."
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // SAVE
    // ============================================================

    const handleSave = async () => {

        if (!productName.trim()) {

            alert(
                "Please enter the product name."
            );

            return;

        }


        if (!brand.trim()) {

            alert(
                "Please enter the brand."
            );

            return;

        }


        if (!description.trim()) {

            alert(
                "Please enter the description."
            );

            return;

        }


        if (!displayFromDate) {

            alert(
                "Please select the Display From date."
            );

            return;

        }


        if (!displayToDate) {

            alert(
                "Please select the Display Until date."
            );

            return;

        }


        if (
            new Date(displayToDate) <
            new Date(displayFromDate)
        ) {

            alert(
                "Display Until date cannot be before Display From date."
            );

            return;

        }


        // --------------------------------------------------------
        // NEW PRODUCT MUST HAVE ONE IMAGE
        // --------------------------------------------------------

        if (!previewImage) {

            alert(
                "Please upload one product image."
            );

            return;

        }


        // --------------------------------------------------------
        // FOR NEW PRODUCT
        // --------------------------------------------------------
        // A real File must exist because the backend needs
        // the image upload.
        // --------------------------------------------------------

        if (!image) {

            alert(
                "Please upload one product image."
            );

            return;

        }


        const formData =
            new FormData();


        formData.append(
            "productName",
            productName.trim()
        );

        formData.append(
            "brand",
            brand.trim()
        );

        formData.append(
            "description",
            description.trim()
        );

        formData.append(
            "displayFromDate",
            displayFromDate
        );

        formData.append(
            "displayToDate",
            displayToDate
        );

        formData.append(
            "priority",
            priority
        );


        // --------------------------------------------------------
        // EXACTLY ONE IMAGE
        // --------------------------------------------------------

        formData.append(
            "images",
            image
        );


        setLoading(true);


        try {

            const response =
                await fetch(
                    `${API}/admin/coming-soon/add`,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Failed to add Coming Soon product"
                );

            }


            await response.json();


            alert(
                "Coming Soon product added successfully."
            );


            setShowPopup(false);

            resetForm();

            await fetchComingSoonProducts();

        } catch (error) {

            console.error(
                "Coming Soon save error:",
                error
            );

            alert(
                error.message ||
                "Failed to add Coming Soon product."
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (dateString) => {

        if (!dateString) {

            return "-";

        }


        const date =
            new Date(
                `${dateString}T00:00:00`
            );


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ============================================================
    // GET FIRST IMAGE
    // ============================================================

    const getFirstImage = (product) => {

        if (
            !product?.imageUrls ||
            product.imageUrls.length === 0
        ) {

            return null;

        }


        const imageUrl =
            product.imageUrls[0];


        return imageUrl.startsWith("http")
            ? imageUrl
            : `${API}${imageUrl}`;

    };


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div className="dh-manage-coming-soon">

            <main className="dh-coming-soon-main">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="dh-coming-soon-page-header">

                    <div className="dh-coming-soon-header-left">

                        <h1>
                            Manage Coming Soon Products
                        </h1>

                        <p>
                            Manage upcoming products,
                            display dates and priority.
                        </p>

                    </div>


                    <span className="dh-coming-soon-total">

                        Total Products:
                        {" "}

                        <strong>
                            {comingSoonProducts.length}
                        </strong>

                    </span>

                </div>


                {/* ==================================================
                    PRODUCT LIST
                ================================================== */}

                <section className="dh-coming-soon-content">

                    {comingSoonProducts.length === 0 ? (

                        <div className="dh-coming-soon-empty">

                            <div className="dh-coming-soon-empty-icon">
                                📦
                            </div>

                            <h2>
                                No Coming Soon Products
                            </h2>

                            <p>
                                Add your first upcoming
                                product to display it
                                in the Coming Soon section.
                            </p>

                        </div>

                    ) : (

                        <div className="dh-coming-soon-grid">

                            {comingSoonProducts.map(
                                (product) => {

                                    const image =
                                        getFirstImage(
                                            product
                                        );

                                    return (

                                        <article
                                            className="dh-coming-soon-card"
                                            key={product.id}
                                        >

                                            <div className="dh-coming-soon-card-image">

                                                {image ? (

                                                    <img
                                                        src={image}
                                                        alt={
                                                            product.productName
                                                        }
                                                    />

                                                ) : (

                                                    <div className="dh-coming-soon-no-image">
                                                        No Image
                                                    </div>

                                                )}

                                            </div>


                                            <div className="dh-coming-soon-card-content">

                                                <div className="dh-coming-soon-card-brand-row">

                                                    <span className="dh-coming-soon-card-brand">

                                                        {product.brand}

                                                    </span>


                                                    <span className="dh-coming-soon-card-priority">

                                                        Priority {product.priority}

                                                    </span>

                                                </div>


                                                <h3>
                                                    {product.productName}
                                                </h3>


                                                <p>
                                                    {product.description}
                                                </p>


                                                <div className="dh-coming-soon-card-date">

                                                    <span>
                                                        Display
                                                    </span>

                                                    <strong>

                                                        {formatDate(
                                                            product.displayFromDate
                                                        )}

                                                        {" → "}

                                                        {formatDate(
                                                            product.displayToDate
                                                        )}

                                                    </strong>

                                                </div>

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================================
                    BOTTOM ACTIONS
                ================================================== */}

                <div className="dh-coming-soon-footer">

                    <button
                        type="button"
                        className="dh-coming-soon-view-btn"
                        onClick={openDetailsPopup}
                        disabled={
                            comingSoonProducts.length === 0
                        }
                    >
                        View Details
                    </button>


                    <button
                        type="button"
                        className="dh-coming-soon-primary-btn"
                        onClick={openAddPopup}
                    >
                        + Upcoming Products
                    </button>

                </div>

            </main>


            {/* ======================================================
                ALL PRODUCTS RIGHT-SIDE DRAWER
            ====================================================== */}

            {showDetailsPopup && (

                <div
                    className="dh-coming-soon-popup-overlay dh-coming-soon-details-overlay"
                    onClick={closeDetailsPopup}
                >

                    <div
                        className="dh-coming-soon-popup dh-coming-soon-details-popup"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="dh-coming-soon-popup-header">

                            <div>

                                <h2>
                                    Coming Soon Products
                                </h2>

                                <p>
                                    View, edit or delete
                                    upcoming products.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="dh-coming-soon-popup-close"
                                onClick={
                                    closeDetailsPopup
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="dh-coming-soon-details-body">

                            {comingSoonProducts.length === 0 ? (

                                <div className="dh-coming-soon-empty">

                                    <div className="dh-coming-soon-empty-icon">
                                        📦
                                    </div>

                                    <h2>
                                        No Coming Soon Products
                                    </h2>

                                    <p>
                                        There are currently
                                        no Coming Soon products.
                                    </p>

                                </div>

                            ) : (

                                <div className="dh-coming-soon-details-list">

                                    {comingSoonProducts.map(
                                        (product) => {

                                            const image =
                                                getFirstImage(
                                                    product
                                                );

                                            return (

                                                <div
                                                    className="dh-coming-soon-details-item"
                                                    key={product.id}
                                                >

                                                    <div className="dh-coming-soon-details-item-image">

                                                        {image ? (

                                                            <img
                                                                src={image}
                                                                alt={
                                                                    product.productName
                                                                }
                                                            />

                                                        ) : (

                                                            <div className="dh-coming-soon-no-image">
                                                                No Image
                                                            </div>

                                                        )}

                                                    </div>


                                                    <div className="dh-coming-soon-details-item-content">

                                                        <span className="dh-coming-soon-details-item-label">
                                                            Product Name
                                                        </span>


                                                        <h3>
                                                            {
                                                                product.productName
                                                            }
                                                        </h3>


                                                        <div className="dh-coming-soon-details-item-actions">

                                                            <button
                                                                type="button"
                                                                className="dh-coming-soon-edit-btn"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        product
                                                                    )
                                                                }
                                                                disabled={loading}
                                                            >
                                                                Edit
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="dh-coming-soon-delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        product
                                                                    )
                                                                }
                                                                disabled={loading}
                                                            >
                                                                {loading
                                                                    ? "Deleting..."
                                                                    : "Delete"}
                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            )}

                        </div>


                        <div className="dh-coming-soon-popup-footer">

                            <button
                                type="button"
                                className="dh-coming-soon-cancel-btn"
                                onClick={
                                    closeDetailsPopup
                                }
                                disabled={loading}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ======================================================
                ADD / EDIT POPUP
            ====================================================== */}

            {showPopup && (

                <div className="dh-coming-soon-popup-overlay">

                    <div className="dh-coming-soon-popup">

                        <div className="dh-coming-soon-popup-header">

                            <div>

                                <h2>
                                    Add Coming Soon Product
                                </h2>

                                <p>
                                    Add the product information,
                                    image and display period.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="dh-coming-soon-popup-close"
                                onClick={() => {

                                    setShowPopup(false);
                                    resetForm();

                                }}
                            >
                                ×
                            </button>

                        </div>


                        <div className="dh-coming-soon-popup-body">

                            {/* ==================================================
                                PRODUCT IMAGE
                            ================================================== */}

                            <div className="dh-coming-soon-form-group">

                                <label>
                                    Product Image
                                </label>


                                <div className="dh-coming-soon-image-upload">

                                    {/* ==================================================
                                        SINGLE IMAGE UPLOAD AREA
                                    ================================================== */}

                                    <label
                                        className={`dh-coming-soon-upload-box ${
                                            previewImage
                                                ? "dh-coming-soon-upload-box-has-image"
                                                : ""
                                        }`}
                                    >

                                        <span>
                                            +
                                        </span>

                                        <small>
                                            {previewImage
                                                ? "Change Image"
                                                : "Add Image"}
                                        </small>


                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={
                                                handleImageChange
                                            }
                                        />

                                    </label>


                                    {/* ==================================================
                                        SINGLE IMAGE PREVIEW
                                    ================================================== */}

                                    {previewImage && (

                                        <div className="dh-coming-soon-preview">

                                            <img
                                                src={previewImage}
                                                alt="Product preview"
                                            />

                                        </div>

                                    )}

                                </div>


                                <small className="dh-coming-soon-help">
                                    JPG, PNG or WEBP · Maximum 2 MB ·
                                    One image per product
                                </small>

                            </div>


                            {/* ==================================================
                                PRODUCT NAME
                            ================================================== */}

                            <div className="dh-coming-soon-form-group">

                                <label>
                                    Product Name
                                </label>

                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(event) =>
                                        setProductName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter product name"
                                    maxLength={255}
                                />

                            </div>


                            {/* ==================================================
                                BRAND
                            ================================================== */}

                            <div className="dh-coming-soon-form-group">

                                <label>
                                    Brand
                                </label>

                                <input
                                    type="text"
                                    value={brand}
                                    onChange={(event) =>
                                        setBrand(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter brand name"
                                    maxLength={150}
                                />

                            </div>


                            {/* ==================================================
                                DESCRIPTION
                            ================================================== */}

                            <div className="dh-coming-soon-form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter a short product description"
                                    rows={4}
                                    maxLength={2000}
                                />

                            </div>


                            {/* ==================================================
                                DATE RANGE
                            ================================================== */}

                            <div className="dh-coming-soon-date-row">

                                <div className="dh-coming-soon-form-group">

                                    <label>
                                        Display From
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            displayFromDate
                                        }
                                        onChange={(event) =>
                                            setDisplayFromDate(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <small>
                                        Product starts appearing
                                        from this date.
                                    </small>

                                </div>


                                <div className="dh-coming-soon-form-group">

                                    <label>
                                        Display Until
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            displayToDate
                                        }
                                        min={
                                            displayFromDate ||
                                            undefined
                                        }
                                        onChange={(event) =>
                                            setDisplayToDate(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <small>
                                        Product disappears after
                                        this date.
                                    </small>

                                </div>

                            </div>


                            {/* ==================================================
                                PRIORITY
                            ================================================== */}

                            <div className="dh-coming-soon-form-group">

                                <label>
                                    Priority
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={priority}
                                    onChange={(event) =>
                                        setPriority(
                                            Number(
                                                event.target.value
                                            )
                                        )
                                    }
                                />

                                <small>
                                    Higher priority products
                                    appear first.
                                </small>

                            </div>

                        </div>


                        {/* ==================================================
                            POPUP FOOTER
                        ================================================== */}

                        <div className="dh-coming-soon-popup-footer">

                            <button
                                type="button"
                                className="dh-coming-soon-cancel-btn"
                                onClick={() => {

                                    setShowPopup(false);
                                    resetForm();

                                }}
                                disabled={loading}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="dh-coming-soon-save-btn"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading
                                    ? "Saving..."
                                    : "Add Product"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default AdminManageComingSoon;
