import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import {
    FiCalendar,
    FiCheck,
    FiClock,
    FiMapPin,
    FiPhone,
    FiRefreshCw,
    FiSearch,
    FiShoppingBag,
    FiUser,
    FiX,
} from "react-icons/fi";

import Header from "../../components/Header";
import Sidebar from "../../components/SideBar";

import "../../styles/VBookVisitRequests.css";

const API_BASE_URL = "http://localhost:8080";

/* =========================================================
   HELPERS
========================================================= */

const firstValue = (...values) => {
    for (const value of values) {
        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== "" &&
            String(value).trim().toLowerCase() !== "null" &&
            String(value).trim().toLowerCase() !== "undefined"
        ) {
            return value;
        }
    }

    return null;
};

const safeString = (value, fallback = "") => {
    if (
        value === undefined ||
        value === null
    ) {
        return fallback;
    }

    const text = String(value).trim();

    if (
        !text ||
        text.toLowerCase() === "null" ||
        text.toLowerCase() === "undefined"
    ) {
        return fallback;
    }

    return text;
};

const getRequestArray = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    if (!data || typeof data !== "object") {
        return [];
    }

    const possibleArrays = [
        data.requests,
        data.visits,
        data.bookings,
        data.visitRequests,
        data.content,
        data.results,
        data.data,
    ];

    for (const value of possibleArrays) {
        if (Array.isArray(value)) {
            return value;
        }
    }

    if (
        data.id ||
        data.bookingId ||
        data.visitId ||
        data.requestId
    ) {
        return [data];
    }

    return [];
};

/* =========================================================
   STATUS
========================================================= */

const normalizeStatus = (value) => {
    const status = String(value || "PENDING")
        .trim()
        .toUpperCase();

    if (status === "ACCEPTED") {
        return "ACCEPTED";
    }

    if (status === "REJECTED") {
        return "REJECTED";
    }

    if (status === "COMPLETED") {
        return "COMPLETED";
    }

    if (
        status === "CANCELLED" ||
        status === "CANCELED"
    ) {
        return "CANCELLED";
    }

    return "PENDING";
};

/* =========================================================
   REQUEST ID
========================================================= */

const getRequestId = (request) => {
    return firstValue(
        request?.id,
        request?.visitId,
        request?.requestId,
        request?.bookingId
    );
};

/* =========================================================
   PRODUCT
========================================================= */

const getProductObject = (request) => {
    const candidates = [
        request?.product,
        request?.productDetails,
        request?.productInfo,
        request?.selectedProduct,
    ];

    for (const candidate of candidates) {
        if (
            candidate &&
            typeof candidate === "object"
        ) {
            return candidate;
        }
    }

    return null;
};

const getProductId = (request) => {
    const product = getProductObject(request);

    return firstValue(
        request?.productId,
        request?.productID,
        request?.product_id,
        product?.id,
        product?.productId,
        product?.productID
    );
};

const getProductName = (request) => {
    const product = getProductObject(request);

    return safeString(
        firstValue(
            request?.productName,
            request?.productTitle,
            request?.product_name,
            request?.product?.name,
            request?.product?.productName,
            request?.product?.title,
            request?.productDetails?.name,
            request?.productDetails?.productName,
            request?.productInfo?.name,
            request?.selectedProduct?.name,
            product?.name,
            product?.productName,
            product?.title
        ),
        ""
    );
};

const getProductBrand = (request) => {
    const product = getProductObject(request);

    return safeString(
        firstValue(
            request?.brandName,
            request?.brand,
            request?.product?.brandName,
            request?.product?.brand?.name,
            request?.productDetails?.brandName,
            request?.productDetails?.brand?.name,
            product?.brandName,
            product?.brand?.name
        ),
        ""
    );
};

/* =========================================================
   PRODUCT IMAGE
========================================================= */

const extractImageString = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value === "string") {
        return value.trim() || null;
    }

    if (typeof value === "object") {
        return firstValue(
            value.url,
            value.imageUrl,
            value.src,
            value.secureUrl,
            value.secure_url,
            value.path,
            value.fileUrl,
            value.image,
            value.thumbnailUrl,
            value.thumbnail
        );
    }

    return null;
};

const getProductImage = (request) => {
    const product = getProductObject(request);

    const candidates = [
        request?.productImage,
        request?.productImageUrl,
        request?.image,
        request?.imageUrl,

        request?.product?.image,
        request?.product?.imageUrl,
        request?.product?.productImage,
        request?.product?.productImageUrl,
        request?.product?.thumbnail,
        request?.product?.thumbnailUrl,

        request?.productDetails?.image,
        request?.productDetails?.imageUrl,
        request?.productDetails?.thumbnailUrl,

        product?.image,
        product?.imageUrl,
        product?.productImage,
        product?.productImageUrl,
        product?.thumbnail,
        product?.thumbnailUrl,
    ];

    for (const candidate of candidates) {
        const image = extractImageString(candidate);

        if (!image) {
            continue;
        }

        if (
            /^https?:\/\//i.test(image) ||
            image.startsWith("data:") ||
            image.startsWith("blob:")
        ) {
            return image;
        }

        if (image.startsWith("//")) {
            return `https:${image}`;
        }

        return `${API_BASE_URL}${
            image.startsWith("/") ? "" : "/"
        }${image}`;
    }

    return "";
};

/* =========================================================
   CUSTOMER
========================================================= */

const getCustomerName = (request) => {
    return safeString(
        firstValue(
            request?.customerName,
            request?.customer?.name,
            request?.customer?.fullName,
            request?.userName,
            request?.user?.name,
            request?.user?.fullName,
            request?.name
        ),
        "Customer"
    );
};

const getCustomerPhone = (request) => {
    return safeString(
        firstValue(
            request?.customerPhone,
            request?.customer?.phone,
            request?.customer?.phoneNo,
            request?.customer?.phoneNumber,
            request?.customer?.mobile,
            request?.customer?.mobileNumber,
            request?.userPhone,
            request?.user?.phone,
            request?.user?.phoneNo,
            request?.user?.phoneNumber,
            request?.user?.mobile,
            request?.user?.mobileNumber,
            request?.phone,
            request?.phoneNo,
            request?.phoneNumber,
            request?.mobile
        ),
        ""
    );
};

const getCustomerEmail = (request) => {
    return safeString(
        firstValue(
            request?.customerEmail,
            request?.customer?.email,
            request?.userEmail,
            request?.user?.email,
            request?.email
        ),
        ""
    );
};

/* =========================================================
   VENDOR
========================================================= */

const getVendorName = (request) => {
    return safeString(
        firstValue(
            request?.vendorName,
            request?.vendor?.shopName,
            request?.vendor?.name,
            request?.vendor?.businessName,
            request?.shopName
        ),
        ""
    );
};

const getVendorPhone = (request) => {
    return safeString(
        firstValue(
            request?.vendorPhone,
            request?.vendor?.phoneNo,
            request?.vendor?.phone,
            request?.vendor?.phoneNumber,
            request?.vendor?.mobile,
            request?.vendor?.mobileNumber
        ),
        ""
    );
};

const getVendorLocation = (request) => {
    const vendor = request?.vendor;

    const address = safeString(
        firstValue(
            request?.vendorAddress,
            request?.shopAddress,
            request?.storeAddress,
            request?.location,
            vendor?.address,
            vendor?.shopAddress,
            vendor?.storeAddress
        ),
        ""
    );

    const city = safeString(
        firstValue(
            request?.vendorCity,
            request?.shopCity,
            vendor?.city
        ),
        ""
    );

    const state = safeString(
        firstValue(
            request?.vendorState,
            vendor?.state
        ),
        ""
    );

    const pincode = safeString(
        firstValue(
            request?.vendorPincode,
            request?.pincode,
            vendor?.pincode
        ),
        ""
    );

    return [
        address,
        city,
        state,
        pincode,
    ]
        .filter(Boolean)
        .join(", ");
};

/* =========================================================
   CUSTOMER ADDRESS
========================================================= */

const getAddress = (request) => {
    const directAddress = safeString(
        firstValue(
            request?.customerAddress,
            request?.customer?.address,
            request?.user?.address
        ),
        ""
    );

    if (directAddress) {
        return directAddress;
    }

    const city = safeString(
        firstValue(
            request?.customerCity,
            request?.customer?.city,
            request?.user?.city
        ),
        ""
    );

    const state = safeString(
        firstValue(
            request?.customerState,
            request?.customer?.state,
            request?.user?.state
        ),
        ""
    );

    const pincode = safeString(
        firstValue(
            request?.customerPincode,
            request?.customer?.pincode,
            request?.user?.pincode
        ),
        ""
    );

    return [
        city,
        state,
        pincode,
    ]
        .filter(Boolean)
        .join(", ");
};

/* =========================================================
   DATE / TIME
========================================================= */

const getVisitDate = (request) => {
    return safeString(
        firstValue(
            request?.visitDate,
            request?.date,
            request?.appointmentDate
        ),
        ""
    );
};

const getVisitTime = (request) => {
    return safeString(
        firstValue(
            request?.visitTime,
            request?.time,
            request?.appointmentTime
        ),
        ""
    );
};

/* =========================================================
   VARIANT
========================================================= */

const getVariant = (request) => {
    return safeString(
        firstValue(
            request?.variant,
            request?.variantName,
            request?.selectedVariant,
            request?.variant?.name,
            request?.variant?.value
        ),
        "Standard"
    );
};

/* =========================================================
   COLOR
========================================================= */

const getColor = (request) => {
    return safeString(
        firstValue(
            request?.color,
            request?.colorName,
            request?.selectedColor,
            request?.color?.name,
            request?.color?.value
        ),
        ""
    );
};

/* =========================================================
   DATE FORMAT
========================================================= */

const formatDate = (value) => {
    if (!value) {
        return "Not specified";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

/* =========================================================
   COMPONENT
========================================================= */

const VendorBookVisitRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [searchText, setSearchText] = useState("");
    const [processingId, setProcessingId] = useState(null);

    /* =====================================================
       SIDEBAR
    ===================================================== */

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    /* =====================================================
       VENDOR AUTH
    ===================================================== */

    const vendorToken =
        localStorage.getItem("vendorJwtToken") ||
        localStorage.getItem("jwtToken") ||
        "";

    const vendorId =
        localStorage.getItem("vendorId") ||
        localStorage.getItem("userId") ||
        "";

    /* =====================================================
       LOAD REQUESTS
    ===================================================== */

    const loadRequests = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                if (!vendorId) {
                    setRequests([]);
                    setError(
                        "Vendor information is missing. Please log in again."
                    );
                    return;
                }

                const response = await axios.get(
                    `${API_BASE_URL}/visits/vendor/${vendorId}`,
                    {
                        headers: vendorToken
                            ? {
                                  Authorization: `Bearer ${vendorToken}`,
                              }
                            : {},
                    }
                );

                const normalizedRequests =
                    getRequestArray(response.data);

                setRequests(normalizedRequests);
            } catch (err) {
                console.error(
                    "Failed to load visit requests:",
                    err
                );

                setRequests([]);

                if (
                    err?.response?.status === 401
                ) {
                    setError(
                        "Your vendor session has expired. Please log in again."
                    );
                } else if (
                    err?.response?.status === 403
                ) {
                    setError(
                        "You are not authorized to view these visit requests."
                    );
                } else {
                    setError(
                        "Unable to load visit requests."
                    );
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [
            vendorId,
            vendorToken,
        ]
    );

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    /* =====================================================
       UPDATE STATUS
    ===================================================== */

    const updateRequestStatus = async (
        requestId,
        status
    ) => {
        if (
            requestId === undefined ||
            requestId === null ||
            requestId === ""
        ) {
            return;
        }

        if (!vendorId) {
            setError(
                "Vendor information is missing. Please log in again."
            );
            return;
        }

        const actionText =
            status === "ACCEPTED"
                ? "accept"
                : status === "REJECTED"
                ? "reject"
                : status === "COMPLETED"
                ? "complete"
                : "update";

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} this visit request?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(requestId);
            setError("");

            await axios.patch(
                `${API_BASE_URL}/visits/${requestId}/status`,
                {
                    status: status,
                    vendorId: Number(vendorId),
                },
                {
                    headers: vendorToken
                        ? {
                              Authorization: `Bearer ${vendorToken}`,
                              "Content-Type":
                                  "application/json",
                          }
                        : {
                              "Content-Type":
                                  "application/json",
                          },
                }
            );

            setRequests((previous) =>
                previous.map((request) => {
                    const currentId =
                        getRequestId(request);

                    if (
                        String(currentId) !==
                        String(requestId)
                    ) {
                        return request;
                    }

                    return {
                        ...request,
                        status: status,
                    };
                })
            );
        } catch (err) {
            console.error(
                `Failed to ${actionText} visit request:`,
                err
            );

            if (
                err?.response?.status === 400
            ) {
                setError(
                    err?.response?.data?.message ||
                        `Unable to ${actionText} the visit request.`
                );
            } else if (
                err?.response?.status === 403
            ) {
                setError(
                    "You are not authorized to update this visit request."
                );
            } else if (
                err?.response?.status === 404
            ) {
                setError(
                    "Visit request was not found."
                );
            } else {
                setError(
                    `Unable to ${actionText} the visit request.`
                );
            }
        } finally {
            setProcessingId(null);
        }
    };

    /* =====================================================
       FILTERS
    ===================================================== */

    const filteredRequests = useMemo(() => {
        const query = searchText
            .trim()
            .toLowerCase();

        return requests.filter((request) => {
            const status = normalizeStatus(
                request?.status
            );

            if (
                activeFilter !== "ALL" &&
                status !== activeFilter
            ) {
                return false;
            }

            if (!query) {
                return true;
            }

            const searchableText = [
                getRequestId(request),
                getProductId(request),
                getProductName(request),
                getProductBrand(request),
                getVendorName(request),
                getVendorPhone(request),
                getCustomerName(request),
                getCustomerPhone(request),
                getCustomerEmail(request),
                getVisitDate(request),
                getVisitTime(request),
                getVariant(request),
                getColor(request),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(query);
        });
    }, [
        requests,
        activeFilter,
        searchText,
    ]);

    /* =====================================================
       COUNTS
    ===================================================== */

    const counts = useMemo(() => {
        return requests.reduce(
            (result, request) => {
                const status = normalizeStatus(
                    request?.status
                );

                result.ALL += 1;

                if (
                    Object.prototype.hasOwnProperty.call(
                        result,
                        status
                    )
                ) {
                    result[status] += 1;
                }

                return result;
            },
            {
                ALL: 0,
                PENDING: 0,
                ACCEPTED: 0,
                REJECTED: 0,
                COMPLETED: 0,
                CANCELLED: 0,
            }
        );
    }, [requests]);

    /* =====================================================
       REQUEST CARD
    ===================================================== */

    const renderRequest = (
        request,
        index
    ) => {
        const requestId =
            getRequestId(request) ??
            `request-${index}`;

        const status = normalizeStatus(
            request?.status
        );

        const productName =
            getProductName(request);

        const productId =
            getProductId(request);

        const productBrand =
            getProductBrand(request);

        const customerName =
            getCustomerName(request);

        const customerPhone =
            getCustomerPhone(request);

        const customerEmail =
            getCustomerEmail(request);

        const visitDate =
            getVisitDate(request);

        const visitTime =
            getVisitTime(request);

        const variant =
            getVariant(request);

        const color =
            getColor(request);

        const address =
            getAddress(request);

        const productImage =
            getProductImage(request);

        const vendorName =
            getVendorName(request);

        const vendorPhone =
            getVendorPhone(request);

        const vendorLocation =
            getVendorLocation(request);

        const isProcessing =
            String(processingId) ===
            String(requestId);

        return (
            <article
                className={`dh-vendor-visit-card dh-vendor-visit-card-${status.toLowerCase()}`}
                key={String(requestId)}
            >
                {/* =================================================
                    CARD HEADER
                ================================================= */}

                <div className="dh-vendor-visit-card-header">
                    <div className="dh-vendor-visit-request-id">
                        <span>
                            Request ID
                        </span>

                        <strong>
                            {requestId}
                        </strong>
                    </div>

                    <span
                        className={`dh-vendor-visit-status dh-vendor-visit-status-${status.toLowerCase()}`}
                    >
                        {status}
                    </span>
                </div>

                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <div className="dh-vendor-visit-card-body">
                    {/* =================================================
                        PRODUCT
                    ================================================= */}

                    <div className="dh-vendor-visit-product">
                        <div className="dh-vendor-visit-product-image">
                            {productImage ? (
                                <img
                                    src={productImage}
                                    alt={
                                        productName ||
                                        "Product"
                                    }
                                    onError={(event) => {
                                        event.currentTarget.style.display =
                                            "none";
                                    }}
                                />
                            ) : (
                                <FiShoppingBag />
                            )}
                        </div>

                        <div className="dh-vendor-visit-product-info">
                            <span className="dh-vendor-visit-label">
                                Product
                            </span>

                            {productName && (
                                <h3>
                                    {productName}
                                </h3>
                            )}

                            {productId && (
                                <span className="dh-vendor-visit-product-id">
                                    Product #{productId}
                                </span>
                            )}

                            {productBrand && (
                                <p>
                                    {productBrand}
                                </p>
                            )}

                            <div className="dh-vendor-visit-product-options">
                                <span>
                                    <strong>
                                        Variant:
                                    </strong>{" "}
                                    {variant}
                                </span>

                                {color && (
                                    <span>
                                        <strong>
                                            Color:
                                        </strong>{" "}
                                        {color}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        CUSTOMER
                    ================================================= */}

                    <div className="dh-vendor-visit-customer">
                        <div className="dh-vendor-visit-section-heading">
                            <FiUser />

                            <span>
                                Customer
                            </span>
                        </div>

                        <strong className="dh-vendor-customer-name">
                            {customerName}
                        </strong>

                        {customerPhone && (
                            <a
                                href={`tel:${customerPhone}`}
                                className="dh-vendor-customer-contact"
                            >
                                <FiPhone />

                                {customerPhone}
                            </a>
                        )}

                        {customerEmail && (
                            <span className="dh-vendor-customer-contact">
                                {customerEmail}
                            </span>
                        )}

                        {address && (
                            <span className="dh-vendor-customer-contact">
                                <FiMapPin />

                                {address}
                            </span>
                        )}
                    </div>

                    {/* =================================================
                        SHOP / VENDOR
                    ================================================= */}

                    {(vendorName ||
                        vendorPhone ||
                        vendorLocation) && (
                        <div className="dh-vendor-visit-customer">
                            <div className="dh-vendor-visit-section-heading">
                                <FiShoppingBag />

                                <span>
                                    Shop
                                </span>
                            </div>

                            {vendorName && (
                                <strong className="dh-vendor-customer-name">
                                    {vendorName}
                                </strong>
                            )}

                            {vendorPhone && (
                                <a
                                    href={`tel:${vendorPhone}`}
                                    className="dh-vendor-customer-contact"
                                >
                                    <FiPhone />

                                    {vendorPhone}
                                </a>
                            )}

                            {vendorLocation && (
                                <span className="dh-vendor-customer-contact">
                                    <FiMapPin />

                                    {vendorLocation}
                                </span>
                            )}
                        </div>
                    )}

                    {/* =================================================
                        VISIT
                    ================================================= */}

                    <div className="dh-vendor-visit-details">
                        <div className="dh-vendor-visit-section-heading">
                            <FiCalendar />

                            <span>
                                Visit Details
                            </span>
                        </div>

                        <div className="dh-vendor-visit-date-time">
                            <div>
                                <span>
                                    Date
                                </span>

                                <strong>
                                    {formatDate(
                                        visitDate
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Time
                                </span>

                                <strong>
                                    {visitTime ||
                                        "Not specified"}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="dh-vendor-visit-card-footer">
                    <div className="dh-vendor-visit-footer-status">
                        {status === "PENDING" && (
                            <>
                                <FiClock />

                                <span>
                                    Waiting for your
                                    response
                                </span>
                            </>
                        )}

                        {status === "ACCEPTED" && (
                            <>
                                <FiCheck />

                                <span>
                                    Visit accepted
                                </span>
                            </>
                        )}

                        {status === "REJECTED" && (
                            <>
                                <FiX />

                                <span>
                                    Request rejected
                                </span>
                            </>
                        )}

                        {status === "COMPLETED" && (
                            <>
                                <FiCheck />

                                <span>
                                    Visit completed
                                </span>
                            </>
                        )}

                        {status === "CANCELLED" && (
                            <>
                                <FiX />

                                <span>
                                    Cancelled by customer
                                </span>
                            </>
                        )}
                    </div>

                    {/* =================================================
                        PENDING ACTIONS
                    ================================================= */}

                    {status === "PENDING" && (
                        <div className="dh-vendor-visit-actions">
                            <button
                                type="button"
                                className="dh-vendor-visit-reject"
                                disabled={isProcessing}
                                onClick={() =>
                                    updateRequestStatus(
                                        requestId,
                                        "REJECTED"
                                    )
                                }
                            >
                                <FiX />

                                {isProcessing
                                    ? "Updating..."
                                    : "Reject"}
                            </button>

                            <button
                                type="button"
                                className="dh-vendor-visit-accept"
                                disabled={isProcessing}
                                onClick={() =>
                                    updateRequestStatus(
                                        requestId,
                                        "ACCEPTED"
                                    )
                                }
                            >
                                <FiCheck />

                                {isProcessing
                                    ? "Updating..."
                                    : "Accept"}
                            </button>
                        </div>
                    )}

                    {/* =================================================
                        ACCEPTED ACTION
                    ================================================= */}

                    {status === "ACCEPTED" && (
                        <button
                            type="button"
                            className="dh-vendor-visit-complete"
                            disabled={isProcessing}
                            onClick={() =>
                                updateRequestStatus(
                                    requestId,
                                    "COMPLETED"
                                )
                            }
                        >
                            <FiCheck />

                            {isProcessing
                                ? "Updating..."
                                : "Mark Completed"}
                        </button>
                    )}
                </div>
            </article>
        );
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="dh-vendor-visit-page">
                <Header
                    onMenuClick={() =>
                        setIsSidebarOpen(true)
                    }
                />

                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    closeSidebar={() =>
                        setIsSidebarOpen(false)
                    }
                />

                <main className="dh-vendor-visit-shell">
                    <div className="dh-vendor-visit-loading">
                        <FiRefreshCw />

                        <span>
                            Loading visit requests...
                        </span>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       MAIN
    ===================================================== */

    return (
        <div className="dh-vendor-visit-page">
            <Header
                onMenuClick={() =>
                    setIsSidebarOpen(true)
                }
            />

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                closeSidebar={() =>
                    setIsSidebarOpen(false)
                }
            />

            <main className="dh-vendor-visit-shell">
                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="dh-vendor-visit-page-header">
                    <div>
                        <span className="dh-vendor-visit-eyebrow">
                            VENDOR PORTAL
                        </span>

                        <h1>
                            Book Visit Requests
                        </h1>

                        <p>
                            Review customer
                            requests and
                            manage scheduled
                            store visits.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="dh-vendor-visit-refresh"
                        onClick={() =>
                            loadRequests(true)
                        }
                        disabled={refreshing}
                    >
                        <FiRefreshCw
                            className={
                                refreshing
                                    ? "is-spinning"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>
                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="dh-vendor-visit-error">
                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                loadRequests()
                            }
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="dh-vendor-visit-stats">
                    <button
                        type="button"
                        className={`dh-vendor-visit-stat ${
                            activeFilter === "ALL"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveFilter("ALL")
                        }
                    >
                        <span>
                            Total Requests
                        </span>

                        <strong>
                            {counts.ALL}
                        </strong>
                    </button>

                    <button
                        type="button"
                        className={`dh-vendor-visit-stat dh-stat-pending ${
                            activeFilter ===
                            "PENDING"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveFilter(
                                "PENDING"
                            )
                        }
                    >
                        <span>
                            Pending
                        </span>

                        <strong>
                            {counts.PENDING}
                        </strong>
                    </button>

                    <button
                        type="button"
                        className={`dh-vendor-visit-stat dh-stat-accepted ${
                            activeFilter ===
                            "ACCEPTED"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveFilter(
                                "ACCEPTED"
                            )
                        }
                    >
                        <span>
                            Accepted
                        </span>

                        <strong>
                            {counts.ACCEPTED}
                        </strong>
                    </button>

                    <button
                        type="button"
                        className={`dh-vendor-visit-stat dh-stat-completed ${
                            activeFilter ===
                            "COMPLETED"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveFilter(
                                "COMPLETED"
                            )
                        }
                    >
                        <span>
                            Completed
                        </span>

                        <strong>
                            {counts.COMPLETED}
                        </strong>
                    </button>

                    <button
                        type="button"
                        className={`dh-vendor-visit-stat dh-stat-rejected ${
                            activeFilter ===
                            "REJECTED"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveFilter(
                                "REJECTED"
                            )
                        }
                    >
                        <span>
                            Rejected
                        </span>

                        <strong>
                            {counts.REJECTED}
                        </strong>
                    </button>
                </section>

                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <section className="dh-vendor-visit-toolbar">
                    <div className="dh-vendor-visit-search">
                        <FiSearch />

                        <input
                            type="text"
                            value={searchText}
                            onChange={(event) =>
                                setSearchText(
                                    event.target.value
                                )
                            }
                            placeholder="Search product, customer, phone or request ID"
                        />

                        {searchText && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearchText("")
                                }
                                aria-label="Clear search"
                            >
                                <FiX />
                            </button>
                        )}
                    </div>

                    <div className="dh-vendor-visit-filter">
                        <span>
                            Showing
                        </span>

                        <strong>
                            {
                                filteredRequests.length
                            }
                        </strong>

                        <span>
                            requests
                        </span>
                    </div>
                </section>

                {/* =================================================
                    REQUEST LIST
                ================================================= */}

                <section className="dh-vendor-visit-list">
                    {filteredRequests.length >
                    0 ? (
                        filteredRequests.map(
                            renderRequest
                        )
                    ) : (
                        <div className="dh-vendor-visit-empty">
                            <div className="dh-vendor-visit-empty-icon">
                                <FiCalendar />
                            </div>

                            <h2>
                                No visit requests
                            </h2>

                            <p>
                                {searchText
                                    ? "No requests match your search."
                                    : activeFilter ===
                                      "ALL"
                                    ? "Customer Book Visit requests will appear here."
                                    : `There are no ${activeFilter.toLowerCase()} visit requests.`}
                            </p>

                            {(searchText ||
                                activeFilter !==
                                    "ALL") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchText(
                                            ""
                                        );

                                        setActiveFilter(
                                            "ALL"
                                        );
                                    }}
                                >
                                    Show all
                                    requests
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default VendorBookVisitRequests;