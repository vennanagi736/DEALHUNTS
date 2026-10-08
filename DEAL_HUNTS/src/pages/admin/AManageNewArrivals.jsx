import React, { useEffect, useState } from "react";

import "../../styles/AManageNewArrivals.css";


function AdminManageNewArrivals() {

    // ============================================================
    // STATE
    // ============================================================

    const [newArrivals, setNewArrivals] = useState([]);
    const [products, setProducts] = useState([]);

    // ADD / EDIT POPUP
    const [showPopup, setShowPopup] = useState(false);

    // DETAILS RIGHT DRAWER
    const [showDetailsPopup, setShowDetailsPopup] = useState(false);

    // EDITING
    const [editingId, setEditingId] = useState(null);

    // FORM
    const [productId, setProductId] = useState("");
    const [displayFromDate, setDisplayFromDate] = useState("");
    const [displayToDate, setDisplayToDate] = useState("");

    // ONE IMAGE ONLY
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    const [loading, setLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);


    // ============================================================
    // BACKEND URL
    // ============================================================

    const API = "http://localhost:8080";


    // ============================================================
    // ADMIN AUTH
    // ============================================================

    const getAdminHeaders = () => {

        const token =
            localStorage.getItem("adminJwtToken");

        return token
            ? {
                Authorization: `Bearer ${token}`
            }
            : {};
    };


    // ============================================================
    // NORMALIZE API RESPONSE
    // ============================================================

    const normalizeArrayResponse = (data) => {

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.content)) {
            return data.content;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        if (Array.isArray(data?.products)) {
            return data.products;
        }

        if (Array.isArray(data?.items)) {
            return data.items;
        }

        return [];
    };


    // ============================================================
    // FETCH NEW ARRIVALS
    // ============================================================

    const fetchNewArrivals = async () => {

        try {

            const response =
                await fetch(
                    `${API}/admin/new-arrivals/all`,
                    {
                        headers: getAdminHeaders()
                    }
                );

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Failed to load New Arrivals"
                );
            }

            const data =
                await response.json();

            console.log(
                "NEW ARRIVALS API RESPONSE:",
                data
            );

            setNewArrivals(
                normalizeArrayResponse(data)
            );

        } catch (error) {

            console.error(
                "Error loading New Arrivals:",
                error
            );

            setNewArrivals([]);
        }
    };


    // ============================================================
    // FETCH EXISTING PRODUCTS
    // ============================================================

    const fetchProducts = async () => {

        setProductsLoading(true);

        try {

            const headers =
                getAdminHeaders();

            let response =
                await fetch(
                    `${API}/admin/products/all`,
                    {
                        headers
                    }
                );

            if (!response.ok) {

                response =
                    await fetch(
                        `${API}/admin/products`,
                        {
                            headers
                        }
                    );
            }

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Failed to load products"
                );
            }

            const data =
                await response.json();

            const productList =
                normalizeArrayResponse(data);

            console.log(
                "Existing products loaded:",
                productList
            );

            setProducts(productList);

        } catch (error) {

            console.error(
                "Error loading existing products:",
                error
            );

            setProducts([]);

        } finally {

            setProductsLoading(false);
        }
    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        fetchNewArrivals();
        fetchProducts();

    }, []);


    // ============================================================
    // PRODUCT NAME
    // ============================================================

    const getProductName = (product) => {

        return (
            product?.name ||
            product?.productName ||
            product?.title ||
            "-"
        );
    };


    // ============================================================
    // PRODUCT BRAND
    // ============================================================

    const getProductBrand = (product) => {

        if (
            typeof product?.brand === "string"
        ) {

            return product.brand;
        }

        return (
            product?.brand?.name ||
            product?.brandName ||
            "-"
        );
    };


    // ============================================================
    // NORMALIZE IMAGE URL
    // ============================================================

    const normalizeImageUrl = (imageUrl) => {

        if (!imageUrl) {
            return null;
        }

        if (
            typeof imageUrl !== "string"
        ) {

            return null;
        }

        const trimmedUrl =
            imageUrl.trim();

        if (!trimmedUrl) {
            return null;
        }

        if (
            trimmedUrl.startsWith("http://") ||
            trimmedUrl.startsWith("https://")
        ) {

            return trimmedUrl;
        }

        if (
            trimmedUrl.startsWith("data:")
        ) {

            return trimmedUrl;
        }

        if (
            trimmedUrl.startsWith("blob:")
        ) {

            return trimmedUrl;
        }

        if (
            trimmedUrl.startsWith("//")
        ) {

            return `http:${trimmedUrl}`;
        }

        if (
            trimmedUrl.startsWith("/")
        ) {

            return `${API}${trimmedUrl}`;
        }

        return `${API}/${trimmedUrl}`;
    };


    // ============================================================
    // IMAGE OBJECT -> URL
    // ============================================================

    const getImageFromObject = (imageObject) => {

        if (!imageObject) {
            return null;
        }

        if (
            typeof imageObject === "string"
        ) {

            return normalizeImageUrl(
                imageObject
            );
        }

        if (
            typeof imageObject !== "object"
        ) {

            return null;
        }

        return normalizeImageUrl(
            imageObject?.imageUrl ||
            imageObject?.thumbnailUrl ||
            imageObject?.url ||
            imageObject?.src ||
            imageObject?.path ||
            imageObject?.imagePath ||
            imageObject?.fileUrl ||
            imageObject?.cloudinaryUrl
        );
    };


    // ============================================================
    // ADD IMAGE CANDIDATE
    // ============================================================

    const addImageCandidate = (
        candidates,
        value
    ) => {

        if (!value) {
            return;
        }

        if (Array.isArray(value)) {

            value.forEach(
                (item) => {

                    addImageCandidate(
                        candidates,
                        item
                    );
                }
            );

            return;
        }

        const imageUrl =
            getImageFromObject(value);

        if (
            imageUrl &&
            !candidates.includes(imageUrl)
        ) {

            candidates.push(
                imageUrl
            );
        }
    };


    // ============================================================
    // PRODUCT IMAGE CANDIDATES
    // ============================================================

    const getProductImageCandidates = (product) => {

        const candidates = [];

        if (!product) {
            return candidates;
        }

        addImageCandidate(
            candidates,
            product.imageUrl
        );

        addImageCandidate(
            candidates,
            product.thumbnailUrl
        );

        addImageCandidate(
            candidates,
            product.image
        );

        addImageCandidate(
            candidates,
            product.imagePath
        );

        addImageCandidate(
            candidates,
            product.fileUrl
        );

        addImageCandidate(
            candidates,
            product.cloudinaryUrl
        );

        addImageCandidate(
            candidates,
            product.images
        );

        addImageCandidate(
            candidates,
            product.imageUrls
        );

        addImageCandidate(
            candidates,
            product.productImage
        );

        addImageCandidate(
            candidates,
            product.productImages
        );

        return candidates;
    };


    // ============================================================
    // NEW ARRIVAL IMAGE CANDIDATES
    // ============================================================

    const getNewArrivalImageCandidates = (arrival) => {

        const candidates = [];

        if (!arrival) {
            return candidates;
        }

        // NEW ARRIVAL IMAGE FIRST

        addImageCandidate(
            candidates,
            arrival.imageUrl
        );

        addImageCandidate(
            candidates,
            arrival.thumbnailUrl
        );

        addImageCandidate(
            candidates,
            arrival.image
        );

        addImageCandidate(
            candidates,
            arrival.imagePath
        );

        addImageCandidate(
            candidates,
            arrival.fileUrl
        );

        addImageCandidate(
            candidates,
            arrival.cloudinaryUrl
        );

        addImageCandidate(
            candidates,
            arrival.images
        );

        addImageCandidate(
            candidates,
            arrival.imageUrls
        );


        // PRODUCT IMAGE FALLBACK
        // Used only when the New Arrival itself has no image.

        if (
            candidates.length === 0 &&
            arrival.product
        ) {

            const productCandidates =
                getProductImageCandidates(
                    arrival.product
                );

            productCandidates.forEach(
                (imageUrl) => {

                    if (
                        !candidates.includes(
                            imageUrl
                        )
                    ) {

                        candidates.push(
                            imageUrl
                        );
                    }
                }
            );
        }

        return candidates;
    };


    // ============================================================
    // SAFE IMAGE
    // ============================================================

    const SafeImage = ({
        candidates = [],
        alt = "",
        className = "",
        fallbackClassName =
            "dh-new-arrivals-no-image"
    }) => {

        const [currentIndex, setCurrentIndex] =
            useState(0);

        const [failed, setFailed] =
            useState(false);


        useEffect(() => {

            setCurrentIndex(0);
            setFailed(false);

        }, [candidates.join("|")]);


        if (
            !candidates ||
            candidates.length === 0 ||
            failed
        ) {

            return (
                <div
                    className={
                        fallbackClassName
                    }
                >
                    No Image
                </div>
            );
        }


        const currentImage =
            candidates[currentIndex];


        return (

            <img
                src={currentImage}
                alt={alt}
                className={className}

                onError={() => {

                    console.error(
                        "NEW ARRIVAL IMAGE FAILED:",
                        currentImage
                    );

                    if (
                        currentIndex <
                        candidates.length - 1
                    ) {

                        setCurrentIndex(
                            (previousIndex) =>
                                previousIndex + 1
                        );

                    } else {

                        setFailed(true);
                    }
                }}
            />

        );
    };


    // ============================================================
    // GET SELECTED PRODUCT
    // ============================================================

    const getSelectedProduct = () => {

        if (!productId) {
            return null;
        }

        return (
            products.find(
                (product) =>
                    String(product.id) ===
                    String(productId)
            ) || null
        );
    };


    // ============================================================
    // IMAGE CHANGE
    // ============================================================

    const handleImageChange = (event) => {

        const selectedFile =
            event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        if (
            !selectedFile.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select a valid image file."
            );

            event.target.value = "";

            return;
        }

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

        if (
            previewImage &&
            previewImage.startsWith("blob:")
        ) {

            URL.revokeObjectURL(
                previewImage
            );
        }

        setImage(
            selectedFile
        );

        const preview =
            URL.createObjectURL(
                selectedFile
            );

        setPreviewImage(
            preview
        );

        event.target.value = "";
    };


    // ============================================================
    // RESET FORM
    // ============================================================

    const resetForm = () => {

        setEditingId(null);

        setProductId("");

        setDisplayFromDate("");

        setDisplayToDate("");

        setImage(null);

        setPreviewImage("");
    };


    // ============================================================
    // CLOSE ADD / EDIT POPUP
    // ============================================================

    const closePopup = () => {

        if (loading) {
            return;
        }

        setShowPopup(false);

        resetForm();
    };


    // ============================================================
    // OPEN ADD POPUP
    // ============================================================

    const openAddPopup = () => {

        if (loading) {
            return;
        }

        resetForm();

        setShowPopup(true);
    };


    // ============================================================
    // OPEN DETAILS
    // ============================================================

    const openDetailsPopup = () => {

        if (
            newArrivals.length === 0 ||
            loading
        ) {

            return;
        }

        setShowDetailsPopup(true);
    };


    // ============================================================
    // CLOSE DETAILS
    // ============================================================

    const closeDetailsPopup = () => {

        if (loading) {
            return;
        }

        setShowDetailsPopup(false);
    };


    // ============================================================
    // PRODUCT SELECTION
    // ============================================================

    const handleProductSelect = (event) => {

        setProductId(
            event.target.value
        );
    };


    // ============================================================
    // EDIT NEW ARRIVAL
    // ============================================================

    const handleEdit = (arrival) => {

        if (
            !arrival ||
            loading
        ) {

            return;
        }

        setEditingId(
            arrival?.id || null
        );

        setProductId(
            arrival?.product?.id
                ? String(
                    arrival.product.id
                )
                : arrival?.productId
                    ? String(
                        arrival.productId
                    )
                    : ""
        );

        setDisplayFromDate(
            arrival?.displayFromDate || ""
        );

        setDisplayToDate(
            arrival?.displayToDate || ""
        );

        setImage(null);

        const existingImages =
            getNewArrivalImageCandidates(
                arrival
            );

        setPreviewImage(
            existingImages.length > 0
                ? existingImages[0]
                : ""
        );

        setShowDetailsPopup(false);

        setShowPopup(true);
    };


    // ============================================================
    // DELETE NEW ARRIVAL
    // ============================================================

    const handleDelete = async (arrival) => {

        if (
            !arrival?.id ||
            loading
        ) {

            return;
        }

        const productName =
            getProductName(
                arrival?.product
            );

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${productName}" from New Arrivals?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setLoading(true);

            const response =
                await fetch(
                    `${API}/admin/new-arrivals/${arrival.id}`,
                    {
                        method: "DELETE",
                        headers:
                            getAdminHeaders()
                    }
                );

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Failed to delete New Arrival"
                );
            }

            alert(
                "New Arrival deleted successfully."
            );

            await fetchNewArrivals();

        } catch (error) {

            console.error(
                "New Arrival delete error:",
                error
            );

            alert(
                error.message ||
                "Failed to delete New Arrival."
            );

        } finally {

            setLoading(false);
        }
    };


    // ============================================================
    // SAVE
    // ============================================================

    const handleSave = async () => {

        if (!productId) {

            alert(
                "Please select a product."
            );

            return;
        }

        if (!displayFromDate) {

            alert(
                "Please select the Start Date."
            );

            return;
        }

        if (!displayToDate) {

            alert(
                "Please select the End Date."
            );

            return;
        }

        if (
            new Date(displayToDate) <
            new Date(displayFromDate)
        ) {

            alert(
                "End Date cannot be before Start Date."
            );

            return;
        }

        if (
            !editingId &&
            !image
        ) {

            alert(
                "Please upload one image."
            );

            return;
        }


        // ========================================================
        // FORM DATA
        // ========================================================

        const formData =
            new FormData();

        formData.append(
            "productId",
            productId
        );

        formData.append(
            "displayFromDate",
            displayFromDate
        );

        formData.append(
            "displayToDate",
            displayToDate
        );

        /*
         * Backend currently expects priority.
         * We do not show a priority field in the UI.
         * Default priority is silently set to 1.
         */
        formData.append(
            "priority",
            "1"
        );


        if (image) {

            formData.append(
                "image",
                image
            );
        }


        setLoading(true);


        try {

            const url =
                editingId
                    ? `${API}/admin/new-arrivals/${editingId}`
                    : `${API}/admin/new-arrivals/add`;


            const response =
                await fetch(
                    url,
                    {
                        method:
                            editingId
                                ? "PUT"
                                : "POST",

                        headers:
                            getAdminHeaders(),

                        body: formData
                    }
                );


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    (
                        editingId
                            ? "Failed to update New Arrival"
                            : "Failed to add New Arrival"
                    )
                );
            }


            alert(
                editingId
                    ? "New Arrival updated successfully."
                    : "New Arrival added successfully."
            );


            setShowPopup(false);

            resetForm();

            await fetchNewArrivals();

        } catch (error) {

            console.error(
                "New Arrival save error:",
                error
            );

            alert(
                error.message ||
                "Failed to save New Arrival."
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
    // RENDER
    // ============================================================

    return (

        <div className="dh-manage-new-arrivals">

            <main className="dh-new-arrivals-main">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="dh-new-arrivals-page-header">

                    <div className="dh-new-arrivals-header-left">

                        <h1>
                            Manage New Arrivals
                        </h1>

                        <p>
                            Manage newly added products
                            displayed in New Arrivals.
                        </p>

                    </div>


                    <span className="dh-new-arrivals-total">

                        Total Products:
                        {" "}

                        <strong>
                            {newArrivals.length}
                        </strong>

                    </span>

                </div>


                {/* ==================================================
                    PRODUCT LIST
                ================================================== */}

                <section className="dh-new-arrivals-content">

                    {newArrivals.length === 0 ? (

                        <div className="dh-new-arrivals-empty">

                            <div className="dh-new-arrivals-empty-icon">
                                📦
                            </div>

                            <h2>
                                No New Arrivals
                            </h2>

                            <p>
                                Add your first product
                                to display it in the
                                New Arrivals section.
                            </p>

                        </div>

                    ) : (

                        <div className="dh-new-arrivals-grid">

                            {newArrivals.map(
                                (arrival) => {

                                    const product =
                                        arrival?.product;

                                    const imageCandidates =
                                        getNewArrivalImageCandidates(
                                            arrival
                                        );

                                    const name =
                                        getProductName(
                                            product
                                        );

                                    const brand =
                                        getProductBrand(
                                            product
                                        );

                                    return (

                                        <article
                                            className="dh-new-arrivals-card"
                                            key={arrival.id}
                                        >

                                            <div className="dh-new-arrivals-card-image">

                                                <SafeImage
                                                    candidates={
                                                        imageCandidates
                                                    }
                                                    alt={
                                                        name
                                                    }
                                                />

                                            </div>


                                            <div className="dh-new-arrivals-card-content">

                                                <div className="dh-new-arrivals-card-brand-row">

                                                    <span className="dh-new-arrivals-card-brand">
                                                        {brand}
                                                    </span>

                                                </div>


                                                <h3>
                                                    {name}
                                                </h3>


                                                <p>
                                                    {
                                                        product?.description ||
                                                        "New product added to DEALHUNTS."
                                                    }
                                                </p>


                                                <div className="dh-new-arrivals-card-date">

                                                    <span>
                                                        Display
                                                    </span>

                                                    <strong>

                                                        {
                                                            formatDate(
                                                                arrival.displayFromDate
                                                            )
                                                        }

                                                        {" → "}

                                                        {
                                                            formatDate(
                                                                arrival.displayToDate
                                                            )
                                                        }

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

                <div className="dh-new-arrivals-footer">

                    <button
                        type="button"
                        className="dh-new-arrivals-view-btn"
                        onClick={openDetailsPopup}
                        disabled={
                            newArrivals.length === 0 ||
                            loading
                        }
                    >
                        View Details
                    </button>


                    <button
                        type="button"
                        className="dh-new-arrivals-primary-btn"
                        onClick={openAddPopup}
                        disabled={loading}
                    >
                        + New Arrivals
                    </button>

                </div>

            </main>


            {/* ======================================================
                DETAILS RIGHT-SIDE DRAWER
                DESKTOP: 500PX SPACE ON RIGHT
            ====================================================== */}

            {showDetailsPopup && (

                <div
                    className="dh-new-arrivals-popup-overlay dh-new-arrivals-details-overlay"
                    onClick={closeDetailsPopup}
                >

                    <div
                        className="dh-new-arrivals-popup dh-new-arrivals-details-popup"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="dh-new-arrivals-popup-header">

                            <div>

                                <h2>
                                    New Arrivals
                                </h2>

                                <p>
                                    View, edit or delete
                                    New Arrival products.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="dh-new-arrivals-popup-close"
                                onClick={
                                    closeDetailsPopup
                                }
                                disabled={loading}
                            >
                                ×
                            </button>

                        </div>


                        <div className="dh-new-arrivals-details-body">

                            <div className="dh-new-arrivals-details-list">

                                {newArrivals.map(
                                    (arrival) => {

                                        const product =
                                            arrival?.product;

                                        const imageCandidates =
                                            getNewArrivalImageCandidates(
                                                arrival
                                            );

                                        const name =
                                            getProductName(
                                                product
                                            );

                                        return (

                                            <div
                                                className="dh-new-arrivals-details-item"
                                                key={arrival.id}
                                            >

                                                <div className="dh-new-arrivals-details-item-image">

                                                    <SafeImage
                                                        candidates={
                                                            imageCandidates
                                                        }
                                                        alt={
                                                            name
                                                        }
                                                    />

                                                </div>


                                                <div className="dh-new-arrivals-details-item-content">

                                                    <span className="dh-new-arrivals-details-item-label">
                                                        Product Name
                                                    </span>


                                                    <h3>
                                                        {name}
                                                    </h3>


                                                    <span className="dh-new-arrivals-details-item-brand">

                                                        {
                                                            getProductBrand(
                                                                product
                                                            )
                                                        }

                                                    </span>


                                                    <div className="dh-new-arrivals-details-item-date">

                                                        {
                                                            formatDate(
                                                                arrival.displayFromDate
                                                            )
                                                        }

                                                        {" → "}

                                                        {
                                                            formatDate(
                                                                arrival.displayToDate
                                                            )
                                                        }

                                                    </div>


                                                    <div className="dh-new-arrivals-details-item-actions">

                                                        <button
                                                            type="button"
                                                            className="dh-new-arrivals-edit-btn"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    arrival
                                                                )
                                                            }
                                                            disabled={
                                                                loading
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="dh-new-arrivals-delete-btn"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    arrival
                                                                )
                                                            }
                                                            disabled={
                                                                loading
                                                            }
                                                        >
                                                            {
                                                                loading
                                                                    ? "Deleting..."
                                                                    : "Delete"
                                                            }
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        </div>


                        <div className="dh-new-arrivals-popup-footer">

                            <button
                                type="button"
                                className="dh-new-arrivals-cancel-btn"
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
                ADD / EDIT CENTER POPUP
            ====================================================== */}

            {showPopup && (

                <div
                    className="dh-new-arrivals-popup-overlay dh-new-arrivals-form-overlay"
                    onClick={closePopup}
                >

                    <div
                        className="dh-new-arrivals-popup"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="dh-new-arrivals-popup-header">

                            <div>

                                <h2>
                                    {
                                        editingId
                                            ? "Edit New Arrival"
                                            : "Add New Arrival"
                                    }
                                </h2>

                                <p>
                                    Add a product to the
                                    New Arrivals section.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="dh-new-arrivals-popup-close"
                                onClick={closePopup}
                                disabled={loading}
                            >
                                ×
                            </button>

                        </div>


                        {/* ==================================================
                            FORM BODY
                        ================================================== */}

                        <div className="dh-new-arrivals-popup-body">


                            {/* IMAGE */}

                            <div className="dh-new-arrivals-form-group">

                                <label>
                                    Image
                                </label>


                                <div className="dh-new-arrivals-image-upload">

                                    <label
                                        className={
                                            `dh-new-arrivals-upload-box ${
                                                previewImage
                                                    ? "dh-new-arrivals-upload-box-has-image"
                                                    : ""
                                            }`
                                        }
                                    >

                                        <span>
                                            +
                                        </span>


                                        <small>
                                            {
                                                previewImage
                                                    ? "Change Image"
                                                    : "Add Image"
                                            }
                                        </small>


                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={
                                                handleImageChange
                                            }
                                        />

                                    </label>


                                    {previewImage && (

                                        <div className="dh-new-arrivals-preview">

                                            <img
                                                src={
                                                    previewImage
                                                }
                                                alt="New Arrival"
                                                onError={() => {

                                                    console.error(
                                                        "New Arrival preview failed:",
                                                        previewImage
                                                    );

                                                    setPreviewImage("");

                                                }}
                                            />

                                        </div>

                                    )}

                                </div>


                                <small className="dh-new-arrivals-help">
                                    JPG, PNG or WEBP · Maximum 2 MB ·
                                    One image only
                                </small>

                            </div>


                            {/* PRODUCT NAME */}

                            <div className="dh-new-arrivals-form-group">

                                <label>
                                    Product Name
                                </label>


                                {productsLoading ? (

                                    <div className="dh-new-arrivals-product-loading">
                                        Loading products...
                                    </div>

                                ) : (

                                    <select
                                        value={
                                            productId
                                        }
                                        onChange={
                                            handleProductSelect
                                        }
                                        disabled={
                                            loading ||
                                            productsLoading
                                        }
                                    >

                                        <option value="">
                                            Select Product
                                        </option>


                                        {products.map(
                                            (product) => (

                                                <option
                                                    key={
                                                        product.id
                                                    }
                                                    value={
                                                        product.id
                                                    }
                                                >
                                                    {
                                                        getProductName(
                                                            product
                                                        )
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                )}

                            </div>


                            {/* BRAND */}

                            <div className="dh-new-arrivals-form-group">

                                <label>
                                    Brand
                                </label>


                                <input
                                    type="text"
                                    value={
                                        getProductBrand(
                                            getSelectedProduct()
                                        )
                                    }
                                    placeholder="Brand"
                                    readOnly
                                />

                            </div>


                            {/* DATE ROW */}

                            <div className="dh-new-arrivals-date-row">

                                <div className="dh-new-arrivals-form-group">

                                    <label>
                                        Start Date
                                    </label>


                                    <input
                                        type="date"
                                        value={
                                            displayFromDate
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDisplayFromDate(
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            loading
                                        }
                                    />

                                </div>


                                <div className="dh-new-arrivals-form-group">

                                    <label>
                                        End Date
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
                                        onChange={(
                                            event
                                        ) =>
                                            setDisplayToDate(
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            loading
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            FOOTER
                        ================================================== */}

                        <div className="dh-new-arrivals-popup-footer">

                            <button
                                type="button"
                                className="dh-new-arrivals-cancel-btn"
                                onClick={closePopup}
                                disabled={loading}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="dh-new-arrivals-save-btn"
                                onClick={handleSave}
                                disabled={
                                    loading ||
                                    !productId ||
                                    !displayFromDate ||
                                    !displayToDate ||
                                    (!editingId && !image)
                                }
                            >

                                {
                                    loading
                                        ? (
                                            editingId
                                                ? "Updating..."
                                                : "Adding..."
                                        )
                                        : editingId
                                            ? "Update Product"
                                            : "Add Product"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


export default AdminManageNewArrivals;
