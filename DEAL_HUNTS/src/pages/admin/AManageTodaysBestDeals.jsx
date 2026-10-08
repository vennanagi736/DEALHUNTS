import axios from "axios";
import { useEffect, useState } from "react";

import "../../styles/AManageTodaysBestDeals.css";

import Popup from "../../components/Popup";

function AdminManageTodaysBestDeals() {

    // ============================================================
    // STATE
    // ============================================================

    const [productId, setProductId] = useState("");
    const [productName, setProductName] = useState("");
    const [dealTitle, setDealTitle] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [dealPrice, setDealPrice] = useState("");
    const [priority, setPriority] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [deals, setDeals] = useState([]);
    const [products, setProducts] = useState([]);

    const [showPopup, setShowPopup] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedDealId, setSelectedDealId] = useState(null);

    const [showDealsPanel, setShowDealsPanel] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);


    // ============================================================
    // FETCH PRODUCTS
    // ============================================================

    const fetchProducts = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/admin/products/active"
            );

            const activeProducts = Array.isArray(response.data)
                ? response.data.filter(
                    (product) =>
                        product?.id != null &&
                        product?.name
                )
                : [];

            setProducts(activeProducts);

            return activeProducts;

        } catch (error) {

            console.error(
                "Error fetching active products:",
                error
            );

            setProducts([]);

            return [];
        }
    };


    // ============================================================
    // EXTRACT DEAL LIST
    // ============================================================

    const extractDealList = (data) => {

        if (Array.isArray(data)) {
            return data;
        }

        if (data && Array.isArray(data.deals)) {
            return data.deals;
        }

        if (data && Array.isArray(data.content)) {
            return data.content;
        }

        if (data && Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    };


    // ============================================================
    // GET PRODUCT IMAGE
    // ============================================================

    const getProductImage = (deal, productList = products) => {

        if (deal?.imageUrl) {
            return deal.imageUrl;
        }

        if (deal?.productImage) {
            return deal.productImage;
        }

        if (deal?.thumbnailUrl) {
            return deal.thumbnailUrl;
        }

        if (deal?.product?.thumbnailUrl) {
            return deal.product.thumbnailUrl;
        }

        const dealProductId =
            deal?.productId ??
            deal?.product?.id;

        const matchedProduct = productList.find(
            (product) =>
                String(product.id) === String(dealProductId)
        );

        return matchedProduct?.thumbnailUrl || "";
    };


    // ============================================================
    // FETCH TODAY'S BEST DEALS
    // ============================================================

    const fetchDeals = async (productList = products) => {

        try {

            const response = await axios.get(
                "http://localhost:8080/admin/todays-best-deals/all"
            );

            const dealList = extractDealList(response.data);

            const normalizedDeals = dealList.map((deal) => {

                const dealProductId =
                    deal?.productId ??
                    deal?.product?.id;

                const matchedProduct = productList.find(
                    (product) =>
                        String(product.id) ===
                        String(dealProductId)
                );

                return {
                    ...deal,

                    productId: dealProductId,

                    productName:
                        deal?.productName ??
                        deal?.product?.name ??
                        matchedProduct?.name ??
                        "",

                    imageUrl: getProductImage(
                        deal,
                        productList
                    )
                };
            });

            setDeals(normalizedDeals);

            return normalizedDeals;

        } catch (error) {

            console.error(
                "Error fetching Today's Best Deals:",
                error
            );

            setDeals([]);

            return [];
        }
    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        const loadData = async () => {

            const loadedProducts =
                await fetchProducts();

            await fetchDeals(
                loadedProducts
            );
        };

        loadData();

    }, []);


    // ============================================================
    // RESET FORM
    // ============================================================

    const resetForm = () => {

        setProductId("");
        setProductName("");
        setDealTitle("");
        setOriginalPrice("");
        setDiscount("");
        setDealPrice("");
        setPriority(1);
        setStartDate("");
        setEndDate("");

        setSelectedDealId(null);
        setIsEdit(false);
    };


    // ============================================================
    // OPEN ADD POPUP
    // IMPORTANT:
    // POPUP OPENS IMMEDIATELY
    // PRODUCTS REFRESH IN BACKGROUND
    // ============================================================

    const openAddPopup = () => {

        resetForm();

        // Open popup immediately.
        setShowPopup(true);

        // Refresh products without blocking popup opening.
        fetchProducts();
    };


    // ============================================================
    // PRODUCT CHANGE
    // ============================================================

    const handleProductChange = (e) => {

        const selectedId = e.target.value;

        setProductId(selectedId);

        const selectedProduct = products.find(
            (product) =>
                String(product.id) ===
                String(selectedId)
        );

        if (selectedProduct) {

            setProductName(
                selectedProduct.name
            );

            if (
                selectedProduct.basePrice !== undefined &&
                selectedProduct.basePrice !== null
            ) {

                setOriginalPrice(
                    selectedProduct.basePrice
                );
            }

        } else {

            setProductName("");
            setOriginalPrice("");
        }
    };


    // ============================================================
    // CALCULATE DEAL PRICE
    // ============================================================

    useEffect(() => {

        const original =
            Number(originalPrice);

        const discountValue =
            Number(discount);

        if (
            original > 0 &&
            discountValue >= 0 &&
            discountValue <= 100
        ) {

            const calculatedPrice =
                original -
                (original * discountValue) / 100;

            setDealPrice(
                calculatedPrice.toFixed(2)
            );

        } else {

            setDealPrice("");
        }

    }, [
        originalPrice,
        discount
    ]);


    // ============================================================
    // SAVE DEAL
    // ============================================================

    const handleSaveDeal = async (e) => {

        e.preventDefault();

        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!productId) {

            alert(
                "Please select a product."
            );

            return;
        }

        if (!dealTitle.trim()) {

            alert(
                "Please enter a deal title."
            );

            return;
        }

        if (
            originalPrice === "" ||
            Number(originalPrice) <= 0
        ) {

            alert(
                "Please enter a valid original price."
            );

            return;
        }

        if (
            discount === "" ||
            Number(discount) < 0 ||
            Number(discount) > 100
        ) {

            alert(
                "Please enter a valid discount between 0 and 100."
            );

            return;
        }

        if (
            dealPrice === "" ||
            Number(dealPrice) < 0
        ) {

            alert(
                "Please enter a valid deal price."
            );

            return;
        }

        if (!startDate) {

            alert(
                "Please select a start date."
            );

            return;
        }

        if (!endDate) {

            alert(
                "Please select an end date."
            );

            return;
        }

        if (
            new Date(endDate) <
            new Date(startDate)
        ) {

            alert(
                "End date cannot be before start date."
            );

            return;
        }


        // --------------------------------------------------------
        // REQUEST DATA
        // --------------------------------------------------------

        const dealData = {

            productId:
                Number(productId),

            productName:
                productName.trim(),

            dealTitle:
                dealTitle.trim(),

            originalPrice:
                Number(originalPrice),

            discount:
                Number(discount),

            dealPrice:
                Number(dealPrice),

            priority:
                Number(priority) || 1,

            startDate,

            endDate
        };


        // --------------------------------------------------------
        // SAVE
        // --------------------------------------------------------

        try {

            if (
                isEdit &&
                selectedDealId
            ) {

                await axios.put(
                    `http://localhost:8080/admin/todays-best-deals/${selectedDealId}`,
                    dealData
                );

                alert(
                    "Today's Best Deal updated successfully."
                );

            } else {

                await axios.post(
                    "http://localhost:8080/admin/todays-best-deals/add",
                    dealData
                );

                alert(
                    "Today's Best Deal added successfully."
                );
            }


            // ----------------------------------------------------
            // REFRESH PRODUCTS + DEALS
            // ----------------------------------------------------

            const loadedProducts =
                products.length > 0
                    ? products
                    : await fetchProducts();

            await fetchDeals(
                loadedProducts
            );


            // ----------------------------------------------------
            // CLOSE POPUP
            // ----------------------------------------------------

            setShowPopup(false);

            resetForm();

            setSelectedDeal(null);

        } catch (error) {

            console.error(
                "Error saving Today's Best Deal:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Failed to save Today's Best Deal."
            );
        }
    };


    // ============================================================
    // OPEN DEAL DETAILS PANEL
    // ============================================================

    const openDealDetails = (deal) => {

        setSelectedDeal(deal);

        setShowDealsPanel(true);
    };


    // ============================================================
    // EDIT DEAL
    // ============================================================

    const handleEditDeal = (deal) => {

        if (!deal) {
            return;
        }

        const dealProductId =
            deal.productId ??
            deal.product?.id;


        setProductId(
            dealProductId != null
                ? String(dealProductId)
                : ""
        );


        setProductName(
            deal.productName ??
            deal.product?.name ??
            ""
        );


        setDealTitle(
            deal.dealTitle ??
            ""
        );


        setOriginalPrice(
            deal.originalPrice != null
                ? String(deal.originalPrice)
                : ""
        );


        setDiscount(
            deal.discount != null
                ? String(deal.discount)
                : ""
        );


        setDealPrice(
            deal.dealPrice != null
                ? String(deal.dealPrice)
                : ""
        );


        setPriority(
            deal.priority != null
                ? Number(deal.priority)
                : 1
        );


        setStartDate(
            deal.startDate ??
            ""
        );


        setEndDate(
            deal.endDate ??
            ""
        );


        setSelectedDealId(
            deal.id
        );


        setIsEdit(true);

        setShowDealsPanel(false);

        setShowPopup(true);

        // Refresh product list in case product data changed.
        fetchProducts();
    };


    // ============================================================
    // DELETE DEAL
    // ============================================================

    const handleDeleteDeal = async (deal) => {

        if (!deal?.id) {

            alert(
                "Invalid deal selected."
            );

            return;
        }


        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${deal.productName || "this deal"}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            await axios.delete(
                `http://localhost:8080/admin/todays-best-deals/${deal.id}`
            );


            alert(
                "Today's Best Deal deleted successfully."
            );


            const loadedProducts =
                products.length > 0
                    ? products
                    : await fetchProducts();


            await fetchDeals(
                loadedProducts
            );


            setShowDealsPanel(false);

            setSelectedDeal(null);

        } catch (error) {

            console.error(
                "Error deleting Today's Best Deal:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Failed to delete Today's Best Deal."
            );
        }
    };


    // ============================================================
    // CLOSE FORM POPUP
    // ============================================================

    const closePopup = () => {

        setShowPopup(false);

        resetForm();
    };


    // ============================================================
    // CLOSE DETAILS PANEL
    // ============================================================

    const closeDealsPanel = () => {

        setShowDealsPanel(false);

        setSelectedDeal(null);
    };


    // ============================================================
    // DEAL STATUS
    // ============================================================

    const getDealStatus = (deal) => {

        if (
            !deal?.startDate ||
            !deal?.endDate
        ) {

            return "UNKNOWN";
        }


        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        const start =
            new Date(
                deal.startDate
            );

        const end =
            new Date(
                deal.endDate
            );


        start.setHours(
            0,
            0,
            0,
            0
        );

        end.setHours(
            23,
            59,
            59,
            999
        );


        if (today < start) {
            return "UPCOMING";
        }


        if (today > end) {
            return "EXPIRED";
        }


        return "ACTIVE";
    };


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return date;
        }


        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    // ============================================================
    // CALCULATE STATS
    // ============================================================

    const activeDeals =
        deals.filter(
            (deal) =>
                getDealStatus(deal) ===
                "ACTIVE"
        ).length;


    const upcomingDeals =
        deals.filter(
            (deal) =>
                getDealStatus(deal) ===
                "UPCOMING"
        ).length;


    const expiredDeals =
        deals.filter(
            (deal) =>
                getDealStatus(deal) ===
                "EXPIRED"
        ).length;


    // ============================================================
    // JSX
    // ============================================================

    return (

        <div className="admin-manage-todays-best-deals">


            {/* ====================================================
                PAGE HEADER
            ==================================================== */}

            <div className="todays-best-deals-page-header">

                <div>

                    <h1>
                        Today's Best Deals
                    </h1>

                    <p>
                        Manage and highlight your best deals
                        for customers.
                    </p>

                </div>


                <button
                    type="button"
                    className="todays-best-deals-add-btn"
                    onClick={openAddPopup}
                >
                    + Add Best Deal
                </button>

            </div>


            {/* ====================================================
                DEAL DISPLAY
            ==================================================== */}

            <div className="todays-best-deals-display-section">

                <div className="todays-best-deals-section-header">

                    <div>

                        <h2>
                            Current Best Deals
                        </h2>

                        <p>
                            Click a deal to view its details.
                        </p>

                    </div>


                    <span className="todays-best-deals-count">
                        {deals.length} Deals
                    </span>

                </div>


                {deals.length === 0 ? (

                    <div className="todays-best-deals-empty">

                        <div className="todays-best-deals-empty-icon">
                            🏷️
                        </div>

                        <h3>
                            No Today's Best Deals
                        </h3>

                        <p>
                            Add a deal to display it here.
                        </p>

                    </div>

                ) : (

                    <div className="todays-best-deals-display-grid">

                        {deals.map((item) => {

                            const status =
                                getDealStatus(item);

                            return (

                                <div
                                    key={item.id}
                                    className="todays-best-deal-display-card"
                                    onClick={() =>
                                        openDealDetails(item)
                                    }
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {

                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {

                                            e.preventDefault();

                                            openDealDetails(item);
                                        }
                                    }}
                                >


                                    {/* PRODUCT IMAGE */}

                                    <div className="todays-best-deal-display-product">

                                        {item.imageUrl ? (

                                            <img
                                                src={
                                                    item.imageUrl
                                                }
                                                alt={
                                                    item.productName ||
                                                    "Product"
                                                }
                                                className="todays-best-deal-display-product-image"
                                                onError={(e) => {

                                                    e.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />

                                        ) : (

                                            <div className="todays-best-deal-display-product-icon">
                                                🛍️
                                            </div>

                                        )}

                                    </div>


                                    {/* DEAL CONTENT */}

                                    <div className="todays-best-deal-display-content">

                                        <div className="todays-best-deal-display-top">

                                            <span
                                                className={`todays-best-deal-status ${status.toLowerCase()}`}
                                            >
                                                {status}
                                            </span>


                                            <span className="todays-best-deal-priority">

                                                Priority{" "}

                                                {item.priority || 1}

                                            </span>

                                        </div>


                                        <h3>
                                            {item.productName ||
                                                "Unnamed Product"}
                                        </h3>


                                        <p className="todays-best-deal-title">

                                            {item.dealTitle ||
                                                "Today's Best Deal"}

                                        </p>


                                        <div className="todays-best-deal-pricing">

                                            <span className="todays-best-deal-original-price">

                                                ₹
                                                {Number(
                                                    item.originalPrice ||
                                                    0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </span>


                                            <span className="todays-best-deal-price">

                                                ₹
                                                {Number(
                                                    item.dealPrice ||
                                                    0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </span>


                                            <span className="todays-best-deal-discount">

                                                {Number(
                                                    item.discount ||
                                                    0
                                                )}
                                                % OFF

                                            </span>

                                        </div>


                                        <div className="todays-best-deal-validity">

                                            <span>
                                                {formatDate(
                                                    item.startDate
                                                )}
                                            </span>


                                            <span>
                                                →
                                            </span>


                                            <span>
                                                {formatDate(
                                                    item.endDate
                                                )}
                                            </span>

                                        </div>


                                        {/* NO EDIT / DELETE ON CARD */}

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>


            {/* ====================================================
                STATS
            ==================================================== */}

            <div className="todays-best-deals-stats">

                <div className="todays-best-deals-stat-card">

                    <span>
                        Total Deals
                    </span>

                    <strong>
                        {deals.length}
                    </strong>

                </div>


                <div className="todays-best-deals-stat-card">

                    <span>
                        Active
                    </span>

                    <strong>
                        {activeDeals}
                    </strong>

                </div>


                <div className="todays-best-deals-stat-card">

                    <span>
                        Upcoming
                    </span>

                    <strong>
                        {upcomingDeals}
                    </strong>

                </div>


                <div className="todays-best-deals-stat-card">

                    <span>
                        Expired
                    </span>

                    <strong>
                        {expiredDeals}
                    </strong>

                </div>

            </div>


            {/* ====================================================
                ADD / EDIT POPUP
            ==================================================== */}

            {showPopup && (

                <Popup
                    open={showPopup}
                    title={
                        isEdit
                            ? "Edit Today's Best Deal"
                            : "Add Today's Best Deal"
                    }
                    onClose={closePopup}
                >

                    <form
                        className="todays-best-deals-form"
                        onSubmit={handleSaveDeal}
                    >


                        {/* PRODUCT */}

                        <div className="todays-best-deals-form-group">

                            <label>
                                Product
                            </label>


                            <select
                                value={productId}
                                onChange={handleProductChange}
                                required
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
                                            {product.name}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* PRODUCT NAME */}

                        <div className="todays-best-deals-form-group">

                            <label>
                                Product Name
                            </label>


                            <input
                                type="text"
                                value={productName}
                                readOnly
                                placeholder="Product name"
                            />

                        </div>


                        {/* DEAL TITLE */}

                        <div className="todays-best-deals-form-group">

                            <label>
                                Deal Title
                            </label>


                            <input
                                type="text"
                                value={dealTitle}
                                onChange={(e) =>
                                    setDealTitle(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter deal title"
                                required
                            />

                        </div>


                        {/* PRICES */}

                        <div className="todays-best-deals-form-row">


                            <div className="todays-best-deals-form-group">

                                <label>
                                    Original Price
                                </label>

                            <input
                                type="number"
                                value={originalPrice}
                                readOnly
                                className="todays-best-deals-readonly-field"
                            />

                            </div>


                            <div className="todays-best-deals-form-group">

                                <label>
                                    Discount (%)
                                </label>


                                <input
                                    type="number"
                                    value={
                                        discount
                                    }
                                    onChange={(e) =>
                                        setDiscount(
                                            e.target.value
                                        )
                                    }
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    required
                                />

                            </div>

                        </div>


                        {/* DEAL PRICE */}

                        <div className="todays-best-deals-form-group">

                            <label>
                                Deal Price
                            </label>


                        <input
                            type="number"
                            value={dealPrice}
                            readOnly
                            className="todays-best-deals-readonly-field"
                        />    
                        </div>


                        {/* PRIORITY */}

                        <div className="todays-best-deals-form-group">

                            <label>
                                Priority
                            </label>


                            <input
                                type="number"
                                value={
                                    priority
                                }
                                onChange={(e) =>
                                    setPriority(
                                        e.target.value
                                    )
                                }
                                min="1"
                            />

                        </div>


                        {/* DATES */}

                        <div className="todays-best-deals-form-row">


                            <div className="todays-best-deals-form-group">

                                <label>
                                    Start Date
                                </label>


                                <input
                                    type="date"
                                    value={
                                        startDate
                                    }
                                    onChange={(e) =>
                                        setStartDate(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <div className="todays-best-deals-form-group">

                                <label>
                                    End Date
                                </label>


                                <input
                                    type="date"
                                    value={
                                        endDate
                                    }
                                    onChange={(e) =>
                                        setEndDate(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="todays-best-deals-form-actions">

                            <button
                                type="button"
                                className="todays-best-deals-cancel-btn"
                                onClick={
                                    closePopup
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="todays-best-deals-save-btn"
                            >

                                {isEdit
                                    ? "Update Deal"
                                    : "Save Deal"}

                            </button>

                        </div>

                    </form>

                </Popup>
            )}


            {/* ====================================================
                DEAL DETAILS DRAWER / POPUP
                EDIT + DELETE ONLY HERE
            ==================================================== */}

            {showDealsPanel &&
                selectedDeal && (

                    <div
                        className="todays-best-deals-panel-overlay"
                        onClick={
                            closeDealsPanel
                        }
                    >

                        <div
                            className="todays-best-deals-panel"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >


                            {/* PANEL HEADER */}

                            <div className="todays-best-deals-panel-header">

                                <div>

                                    <h2>
                                        Deal Details
                                    </h2>

                                    <p>
                                        View and manage this deal.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="todays-best-deals-panel-close"
                                    onClick={
                                        closeDealsPanel
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {/* PRODUCT IMAGE */}

                            <div className="todays-best-deals-panel-image">

                                {selectedDeal.imageUrl ? (

                                    <img
                                        src={
                                            selectedDeal.imageUrl
                                        }
                                        alt={
                                            selectedDeal.productName ||
                                            "Product"
                                        }
                                        onError={(e) => {

                                            e.currentTarget.style.display =
                                                "none";
                                        }}
                                    />

                                ) : (

                                    <div>
                                        🛍️
                                    </div>

                                )}

                            </div>


                            {/* PRODUCT */}

                            <div className="todays-best-deals-panel-section">

                                <span>
                                    PRODUCT
                                </span>

                                <strong>
                                    {selectedDeal.productName ||
                                        "Unnamed Product"}
                                </strong>

                            </div>


                            {/* DEAL TITLE */}

                            <div className="todays-best-deals-panel-section">

                                <span>
                                    DEAL TITLE
                                </span>

                                <strong>
                                    {selectedDeal.dealTitle ||
                                        "Today's Best Deal"}
                                </strong>

                            </div>


                            {/* PRICING */}

                            <div className="todays-best-deals-panel-pricing">


                                <div>

                                    <span>
                                        Original Price
                                    </span>

                                    <strong>
                                        ₹
                                        {Number(
                                            selectedDeal.originalPrice ||
                                            0
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Deal Price
                                    </span>

                                    <strong>
                                        ₹
                                        {Number(
                                            selectedDeal.dealPrice ||
                                            0
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Discount
                                    </span>

                                    <strong>
                                        {Number(
                                            selectedDeal.discount ||
                                            0
                                        )}
                                        %
                                    </strong>

                                </div>

                            </div>


                            {/* PRIORITY */}

                            <div className="todays-best-deals-panel-section">

                                <span>
                                    PRIORITY
                                </span>

                                <strong>
                                    {
                                        selectedDeal.priority ||
                                        1
                                    }
                                </strong>

                            </div>


                            {/* VALIDITY */}

                            <div className="todays-best-deals-panel-section">

                                <span>
                                    VALIDITY
                                </span>

                                <strong>

                                    {formatDate(
                                        selectedDeal.startDate
                                    )}

                                    {" → "}

                                    {formatDate(
                                        selectedDeal.endDate
                                    )}

                                </strong>

                            </div>


                            {/* STATUS */}

                            <div className="todays-best-deals-panel-section">

                                <span>
                                    STATUS
                                </span>


                                <strong
                                    className={`todays-best-deal-status ${getDealStatus(
                                        selectedDeal
                                    ).toLowerCase()}`}
                                >
                                    {
                                        getDealStatus(
                                            selectedDeal
                                        )
                                    }
                                </strong>

                            </div>


                            {/* ====================================================
                                EDIT + DELETE ONLY INSIDE THIS PANEL
                            ==================================================== */}

                            <div className="todays-best-deals-panel-actions">

                                <button
                                    type="button"
                                    className="todays-best-deals-edit-btn"
                                    onClick={() =>
                                        handleEditDeal(
                                            selectedDeal
                                        )
                                    }
                                >
                                    Edit Deal
                                </button>


                                <button
                                    type="button"
                                    className="todays-best-deals-delete-btn"
                                    onClick={() =>
                                        handleDeleteDeal(
                                            selectedDeal
                                        )
                                    }
                                >
                                    Delete Deal
                                </button>

                            </div>

                        </div>

                    </div>
                )}


            {/* ====================================================
                FOOTER
            ==================================================== */}

            <div className="todays-best-deals-footer">

                <p>
                    Today's Best Deals are displayed to
                    customers based on their priority and
                    validity period.
                </p>

            </div>

        </div>
    );
}

export default AdminManageTodaysBestDeals;