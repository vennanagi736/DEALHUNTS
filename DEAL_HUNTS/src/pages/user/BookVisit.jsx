import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

import {
    FiArrowLeft,
    FiCalendar,
    FiCheck,
    FiClock,
    FiMail,
    FiMapPin,
    FiPhone,
    FiShoppingBag,
    FiUser,
    FiX,
} from "react-icons/fi";

import Header from "../../components/Header";
import Sidebar from "../../components/SideBar";
import "../../styles/BookVisit.css";

const API_BASE_URL = "http://localhost:8080";

const TIME_SLOTS = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
];

/* =========================================================
   GENERAL HELPERS
========================================================= */

const firstValue = (...values) => {
    for (const value of values) {
        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {
            return value;
        }
    }

    return null;
};

const isValidPrice = (value) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return false;
    }

    const number = Number(value);

    return Number.isFinite(number) && number > 0;
};

const formatPrice = (value) => {
    if (!isValidPrice(value)) {
        return null;
    }

    return `₹${Number(value).toLocaleString("en-IN")}`;
};

/* =========================================================
   AUTHENTICATED USER ID
========================================================= */

const decodeJwtPayload = (token) => {
    try {
        if (!token) {
            return null;
        }

        const parts = token.split(".");

        if (parts.length < 2) {
            return null;
        }

        const base64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const padded =
            base64 +
            "=".repeat(
                (4 - (base64.length % 4)) % 4
            );

        const decoded = atob(padded);

        return JSON.parse(decoded);
    } catch (error) {
        console.error(
            "Unable to decode JWT:",
            error
        );

        return null;
    }
};

const getAuthenticatedUserId = () => {
    const directId = firstValue(
        localStorage.getItem("userId"),
        localStorage.getItem("userID"),
        localStorage.getItem("user_id"),
        localStorage.getItem("loggedInUserId"),
        localStorage.getItem("customerId")
    );

    if (directId !== null) {
        const numericId = Number(directId);

        if (
            Number.isFinite(numericId) &&
            numericId > 0
        ) {
            return numericId;
        }
    }

    const token =
        localStorage.getItem("userJwtToken") ||
        localStorage.getItem("jwtToken");

    const payload = decodeJwtPayload(token);

    if (!payload) {
        return null;
    }

    const jwtUserId = firstValue(
        payload.userId,
        payload.userID,
        payload.user_id,
        payload.id,
        payload.uid,
        payload.sub
    );

    if (jwtUserId === null) {
        return null;
    }

    const numericId = Number(jwtUserId);

    if (
        Number.isFinite(numericId) &&
        numericId > 0
    ) {
        return numericId;
    }

    return null;
};

/* =========================================================
   TIME HELPER
========================================================= */

const convertTimeToLocalTime = (timeLabel) => {
    if (!timeLabel) {
        return null;
    }

    const value = String(timeLabel).trim();

    if (
        /^\d{1,2}:\d{2}(:\d{2})?$/.test(value)
    ) {
        const parts = value.split(":");

        const hour = String(parts[0]).padStart(
            2,
            "0"
        );

        const minute = String(parts[1]).padStart(
            2,
            "0"
        );

        const second = String(
            parts[2] || "00"
        ).padStart(2, "0");

        return `${hour}:${minute}:${second}`;
    }

    const match = value.match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

    if (!match) {
        return null;
    }

    let hour = Number(match[1]);
    const minute = match[2];
    const period = match[3].toUpperCase();

    if (period === "AM") {
        if (hour === 12) {
            hour = 0;
        }
    } else if (period === "PM") {
        if (hour !== 12) {
            hour += 12;
        }
    }

    return `${String(hour).padStart(
        2,
        "0"
    )}:${minute}:00`;
};

/* =========================================================
   PRODUCT IMAGE HELPERS
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
            value.image
        );
    }

    return null;
};

const getImageUrl = (product) => {
    if (!product) {
        return "";
    }

    const candidates = [];

    const addCandidate = (value) => {
        if (!value) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => {
                const extracted =
                    extractImageString(item);

                if (extracted) {
                    candidates.push(extracted);
                }
            });

            return;
        }

        const extracted =
            extractImageString(value);

        if (extracted) {
            candidates.push(extracted);
        }
    };

    [
        product.image,
        product.imageUrl,
        product.productImage,
        product.productImageUrl,
        product.thumbnail,
        product.thumbnailUrl,
        product.primaryImage,
        product.primaryImageUrl,
        product.mainImage,
        product.mainImageUrl,
        product.images,
        product.productImages,
        product.imageUrls,
    ].forEach(addCandidate);

    const rawUrl = candidates.find(Boolean);

    if (!rawUrl) {
        return "";
    }

    if (
        /^https?:\/\//i.test(rawUrl) ||
        rawUrl.startsWith("data:") ||
        rawUrl.startsWith("blob:")
    ) {
        return rawUrl;
    }

    if (rawUrl.startsWith("//")) {
        return `https:${rawUrl}`;
    }

    return `${API_BASE_URL}${
        rawUrl.startsWith("/") ? "" : "/"
    }${rawUrl}`;
};

/* =========================================================
   VARIANT HELPERS
========================================================= */

const getVariantId = (variant) => {
    if (!variant) {
        return null;
    }

    return firstValue(
        variant.id,
        variant.variantId,
        variant.variantID
    );
};

const getAttributeValue = (attribute) => {
    if (!attribute) {
        return null;
    }

    if (typeof attribute === "string") {
        return attribute;
    }

    return firstValue(
        attribute.value,
        attribute.attributeValue,
        attribute.attribute_value,
        attribute.name
    );
};

const getVariantLabel = (variant) => {
    if (!variant) {
        return "Standard";
    }

    const directLabel = firstValue(
        variant.name,
        variant.variantName,
        variant.label,
        variant.variant
    );

    if (directLabel) {
        return String(directLabel);
    }

    const attributes =
        variant.attributeValues ||
        variant.attributes ||
        variant.variantAttributes ||
        [];

    if (
        Array.isArray(attributes) &&
        attributes.length > 0
    ) {
        const values = attributes
            .map(getAttributeValue)
            .filter(Boolean);

        if (values.length > 0) {
            return values.join(" / ");
        }
    }

    return "Standard";
};

const getVariantPrice = (variant) => {
    if (!variant) {
        return null;
    }

    return firstValue(
        variant.sellingPrice,
        variant.finalPrice,
        variant.price,
        variant.basePrice
    );
};

const getColors = (variant) => {
    if (!variant) {
        return [];
    }

    if (Array.isArray(variant.colors)) {
        return variant.colors;
    }

    if (Array.isArray(variant.colours)) {
        return variant.colours;
    }

    return [];
};

const getColorId = (color) => {
    if (!color) {
        return null;
    }

    return firstValue(
        color.id,
        color.colorId,
        color.colorID
    );
};

const getColorName = (color) => {
    if (!color) {
        return "Color";
    }

    return String(
        firstValue(
            color.name,
            color.colorName,
            color.label,
            color.color,
            "Color"
        )
    );
};

const getColorHex = (color) => {
    if (!color) {
        return "#d9d9d9";
    }

    return (
        firstValue(
            color.hexCode,
            color.hex,
            color.code,
            color.colorCode
        ) || "#d9d9d9"
    );
};

const getColorPrice = (color) => {
    if (!color) {
        return null;
    }

    return firstValue(
        color.price,
        color.sellingPrice,
        color.finalPrice
    );
};

/* =========================================================
   VENDOR / STORE NORMALIZATION
========================================================= */

const getVendorArray = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    if (
        !data ||
        typeof data !== "object"
    ) {
        return [];
    }

    const possibleArrays = [
        data.vendors,
        data.stores,
        data.shops,
        data.vendorList,
        data.storeList,
        data.inventory,
        data.items,
        data.results,
        data.content,
        data.data,
    ];

    for (const value of possibleArrays) {
        if (Array.isArray(value)) {
            return value;
        }
    }

    if (
        data.vendor ||
        data.store ||
        data.shop ||
        data.seller ||
        data.vendorId ||
        data.storeId ||
        data.shopId ||
        data.id
    ) {
        return [data];
    }

    return [];
};

const normalizeVendor = (
    item,
    index
) => {
    if (
        !item ||
        typeof item !== "object"
    ) {
        return null;
    }

    const source =
        item.vendor ||
        item.store ||
        item.shop ||
        item.seller ||
        item;

    const nested =
        source?.vendor ||
        source?.store ||
        source?.shop ||
        source;

    const id = firstValue(
        nested?.id,
        nested?.vendorId,
        nested?.vendorID,
        nested?.storeId,
        nested?.shopId,
        source?.vendorId,
        source?.vendorID,
        source?.storeId,
        source?.shopId,
        item?.vendorId,
        item?.vendorID,
        item?.storeId,
        item?.shopId,
        item?.id
    );

    const name = String(
        firstValue(
            nested?.shopName,
            nested?.storeName,
            nested?.vendorName,
            nested?.businessName,
            nested?.business_name,
            nested?.name,
            source?.shopName,
            source?.storeName,
            source?.vendorName,
            source?.businessName,
            item?.shopName,
            item?.storeName,
            item?.vendorName,
            item?.businessName,
            item?.name,
            "Local Store"
        )
    );

    const address = String(
        firstValue(
            nested?.address,
            nested?.shopAddress,
            nested?.storeAddress,
            nested?.businessAddress,
            nested?.location,
            source?.address,
            source?.shopAddress,
            source?.storeAddress,
            item?.address,
            item?.shopAddress,
            item?.storeAddress,
            ""
        )
    );

    const city = String(
        firstValue(
            nested?.city,
            source?.city,
            item?.city,
            ""
        )
    );

    const state = String(
        firstValue(
            nested?.state,
            source?.state,
            item?.state,
            ""
        )
    );

    const pincode = firstValue(
        nested?.pincode,
        source?.pincode,
        item?.pincode,
        ""
    );

    const phone = String(
        firstValue(
            nested?.phoneNo,
            nested?.phone,
            nested?.phoneNumber,
            nested?.mobile,
            nested?.mobileNumber,
            nested?.contactNumber,
            source?.phoneNo,
            source?.phone,
            source?.phoneNumber,
            source?.mobile,
            source?.mobileNumber,
            item?.phoneNo,
            item?.phone,
            item?.phoneNumber,
            item?.mobile,
            item?.mobileNumber,
            ""
        )
    );

    const finalAddress = [
        address,
        city,
        state,
        pincode,
    ]
        .filter(
            (value) =>
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
        )
        .join(", ");

    return {
        id:
            id !== null &&
            id !== undefined
                ? id
                : `vendor-${index}`,

        name,

        address: finalAddress,

        phone,

        phoneNo: phone,

        city,

        state,

        pincode,

        raw: item,
    };
};

const normalizeVendors = (data) => {
    const array =
        getVendorArray(data);

    const normalized = array
        .map((item, index) =>
            normalizeVendor(
                item,
                index
            )
        )
        .filter(Boolean);

    const seen = new Set();

    return normalized.filter(
        (vendor) => {
            const key =
                vendor.id !== null &&
                vendor.id !== undefined
                    ? `id-${vendor.id}`
                    : `name-${vendor.name}-${vendor.address}`;

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);

            return true;
        }
    );
};

/* =========================================================
   DATE HELPERS
========================================================= */

const createVisitDates = () => {
    const dates = [];
    const today = new Date();

    for (
        let i = 0;
        i < 7;
        i += 1
    ) {
        const date = new Date(today);

        date.setDate(
            today.getDate() + i
        );

        const year =
            date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const dayNumber = String(
            date.getDate()
        ).padStart(2, "0");

        dates.push({
            value: `${year}-${month}-${dayNumber}`,

            day: date.toLocaleDateString(
                "en-IN",
                {
                    weekday: "short",
                }
            ),

            date: date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                }
            ),

            month: date.toLocaleDateString(
                "en-IN",
                {
                    month: "short",
                }
            ),
        });
    }

    return dates;
};

/* =========================================================
   COMPONENT
========================================================= */

const BookVisit = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        productId,
        variantId,
        colorId,
    } = location.state || {};

    /* =====================================================
       SIDEBAR
    ===================================================== */

    const [
        isSidebarOpen,
        setIsSidebarOpen,
    ] = useState(false);

    /* =====================================================
       LOGIN CHECK
    ===================================================== */

    useEffect(() => {
        const token =
            localStorage.getItem(
                "userJwtToken"
            ) ||
            localStorage.getItem(
                "jwtToken"
            );

        if (!token) {
            navigate("/login", {
                replace: true,

                state: {
                    from: "/book-visit",

                    bookVisitState: {
                        productId,
                        variantId,
                        colorId,
                    },
                },
            });
        }
    }, [
        navigate,
        productId,
        variantId,
        colorId,
    ]);

    /* =====================================================
       STATE
    ===================================================== */

    const [
        product,
        setProduct,
    ] = useState(null);

    const [
        vendors,
        setVendors,
    ] = useState([]);

    const [
        selectedVendorId,
        setSelectedVendorId,
    ] = useState(null);

    const [
        selectedVariantId,
        setSelectedVariantId,
    ] = useState(
        variantId ?? null
    );

    const [
        selectedColorId,
        setSelectedColorId,
    ] = useState(
        colorId ?? null
    );

    const [
        selectedDate,
        setSelectedDate,
    ] = useState("");

    const [
        selectedTime,
        setSelectedTime,
    ] = useState("");

    const [
        customer,
        setCustomer,
    ] = useState({
        name: "",
        phone: "",
        email: "",
    });

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        vendorLoading,
        setVendorLoading,
    ] = useState(true);

    const [
        bookingLoading,
        setBookingLoading,
    ] = useState(false);

    const [
        cancellationLoading,
        setCancellationLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        vendorError,
        setVendorError,
    ] = useState("");

    const [
        imageFailed,
        setImageFailed,
    ] = useState(false);

    const [
        bookingStatus,
        setBookingStatus,
    ] = useState("idle");

    const [
        bookingId,
        setBookingId,
    ] = useState("");

    const visitDates = useMemo(
        () => createVisitDates(),
        []
    );

    /* =====================================================
       LOAD PRODUCT
    ===================================================== */

    useEffect(() => {
        if (!productId) {
            setError(
                "Product information is missing. Please open Book a Visit from the product page."
            );

            setLoading(false);

            return;
        }

        const loadProduct =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const response =
                        await axios.get(
                            `${API_BASE_URL}/admin/products/${productId}`
                        );

                    setProduct(
                        response.data
                    );

                    setImageFailed(
                        false
                    );
                } catch (err) {
                    console.error(
                        "Failed to load product:",
                        err
                    );

                    setError(
                        "Unable to load the selected product."
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            };

        loadProduct();
    }, [productId]);

    /* =====================================================
       LOAD STORES / VENDORS
    ===================================================== */

    useEffect(() => {
        if (!productId) {
            setVendorLoading(
                false
            );

            return;
        }

        const loadVendors =
            async () => {
                try {
                    setVendorLoading(
                        true
                    );

                    setVendorError(
                        ""
                    );

                    const response =
                        await axios.get(
                            `${API_BASE_URL}/inventory/product/${productId}/vendors`
                        );

                    const normalizedVendors =
                        normalizeVendors(
                            response.data
                        );

                    console.log(
                        "Book Visit vendor response:",
                        response.data
                    );

                    console.log(
                        "Book Visit normalized vendors:",
                        normalizedVendors
                    );

                    setVendors(
                        normalizedVendors
                    );

                    setSelectedVendorId(
                        (previousId) => {
                            if (
                                normalizedVendors.length ===
                                1
                            ) {
                                return normalizedVendors[0].id;
                            }

                            const stillExists =
                                normalizedVendors.some(
                                    (
                                        vendor
                                    ) =>
                                        String(
                                            vendor.id
                                        ) ===
                                        String(
                                            previousId
                                        )
                                );

                            return stillExists
                                ? previousId
                                : null;
                        }
                    );
                } catch (err) {
                    console.error(
                        "Failed to load stores:",
                        err
                    );

                    setVendors([]);

                    setSelectedVendorId(
                        null
                    );

                    setVendorError(
                        "Unable to load stores for this product."
                    );
                } finally {
                    setVendorLoading(
                        false
                    );
                }
            };

        loadVendors();
    }, [productId]);

    /* =====================================================
       VARIANTS
    ===================================================== */

    const variants =
        useMemo(() => {
            if (!product) {
                return [];
            }

            return Array.isArray(
                product.variants
            )
                ? product.variants
                : [];
        }, [product]);

    useEffect(() => {
        if (!variants.length) {
            setSelectedVariantId(
                null
            );

            return;
        }

        setSelectedVariantId(
            (previousId) => {
                const wantedId =
                    previousId ??
                    variantId;

                const found =
                    variants.find(
                        (variant) =>
                            String(
                                getVariantId(
                                    variant
                                )
                            ) ===
                            String(
                                wantedId
                            )
                    );

                if (found) {
                    return getVariantId(
                        found
                    );
                }

                return getVariantId(
                    variants[0]
                );
            }
        );
    }, [
        variants,
        variantId,
    ]);

    const selectedVariant =
        useMemo(() => {
            if (!variants.length) {
                return null;
            }

            return (
                variants.find(
                    (variant) =>
                        String(
                            getVariantId(
                                variant
                            )
                        ) ===
                        String(
                            selectedVariantId
                        )
                ) ||
                variants[0]
            );
        }, [
            variants,
            selectedVariantId,
        ]);

    /* =====================================================
       COLORS
    ===================================================== */

    const colors = useMemo(
        () =>
            getColors(
                selectedVariant
            ),
        [selectedVariant]
    );

    useEffect(() => {
        if (!colors.length) {
            setSelectedColorId(
                null
            );

            return;
        }

        setSelectedColorId(
            (previousId) => {
                const wantedId =
                    previousId ??
                    colorId;

                const found =
                    colors.find(
                        (color) =>
                            String(
                                getColorId(
                                    color
                                )
                            ) ===
                            String(
                                wantedId
                            )
                    );

                if (found) {
                    return getColorId(
                        found
                    );
                }

                return getColorId(
                    colors[0]
                );
            }
        );
    }, [
        colors,
        colorId,
    ]);

    const selectedColor =
        useMemo(() => {
            if (!colors.length) {
                return null;
            }

            return (
                colors.find(
                    (color) =>
                        String(
                            getColorId(
                                color
                            )
                        ) ===
                        String(
                            selectedColorId
                        )
                ) ||
                colors[0]
            );
        }, [
            colors,
            selectedColorId,
        ]);

    /* =====================================================
       PRICE
    ===================================================== */

    const selectedPrice =
        useMemo(() => {
            const candidates = [
                getColorPrice(
                    selectedColor
                ),
                getVariantPrice(
                    selectedVariant
                ),
                product?.sellingPrice,
                product?.finalPrice,
                product?.price,
                product?.basePrice,
            ];

            return (
                candidates.find(
                    isValidPrice
                ) || null
            );
        }, [
            product,
            selectedVariant,
            selectedColor,
        ]);

    /* =====================================================
       OTHER DATA
    ===================================================== */

    const selectedVendor =
        useMemo(() => {
            return (
                vendors.find(
                    (vendor) =>
                        String(
                            vendor.id
                        ) ===
                        String(
                            selectedVendorId
                        )
                ) || null
            );
        }, [
            vendors,
            selectedVendorId,
        ]);

    const productImage =
        useMemo(
            () =>
                getImageUrl(
                    product
                ),
            [product]
        );

    const selectedVariantLabel =
        getVariantLabel(
            selectedVariant
        );

    const selectedColorLabel =
        selectedColor
            ? getColorName(
                  selectedColor
              )
            : null;

    /* =====================================================
       INPUT HANDLER
    ===================================================== */

    const handleCustomerChange =
        (event) => {
            const {
                name,
                value,
            } = event.target;

            setCustomer(
                (previous) => ({
                    ...previous,
                    [name]: value,
                })
            );
        };

    /* =====================================================
       BOOK VISIT
    ===================================================== */

    const handleBookVisit =
        async (event) => {
            event.preventDefault();

            if (bookingLoading) {
                return;
            }

            setError("");

            if (!selectedVendor) {
                setError(
                    "Please choose a store."
                );

                return;
            }

            if (
                selectedVendor.id ===
                    undefined ||
                selectedVendor.id ===
                    null ||
                String(
                    selectedVendor.id
                ).startsWith(
                    "vendor-"
                )
            ) {
                setError(
                    "The selected store does not have a valid vendor ID."
                );

                return;
            }

            if (!selectedDate) {
                setError(
                    "Please select a visit date."
                );

                return;
            }

            if (!selectedTime) {
                setError(
                    "Please select a visit time."
                );

                return;
            }

            if (!customer.name.trim()) {
                setError(
                    "Please enter your name."
                );

                return;
            }

            const phone =
                customer.phone.trim();

            if (
                !/^[6-9]\d{9}$/.test(
                    phone
                )
            ) {
                setError(
                    "Please enter a valid 10-digit mobile number."
                );

                return;
            }

            const userId =
                getAuthenticatedUserId();

            if (!userId) {
                setError(
                    "Unable to identify your account. Please log in again."
                );

                return;
            }

            const backendTime =
                convertTimeToLocalTime(
                    selectedTime
                );

            if (!backendTime) {
                setError(
                    "Invalid visit time. Please select the time again."
                );

                return;
            }

            const payload = {
                userId: Number(
                    userId
                ),

                productId: Number(
                    productId
                ),

                vendorId: Number(
                    selectedVendor.id
                ),

                variantId:
                    selectedVariant
                        ? getVariantId(
                              selectedVariant
                          )
                        : null,

                colorId:
                    selectedColor
                        ? getColorId(
                              selectedColor
                          )
                        : null,

                variant:
                    selectedVariantLabel ||
                    null,

                color:
                    selectedColorLabel ||
                    null,

                visitDate:
                    selectedDate,

                visitTime:
                    backendTime,

                customerName:
                    customer.name.trim(),

                customerPhone:
                    customer.phone.trim(),

                customerEmail:
                    customer.email.trim() ||
                    null,

                status: "PENDING",
            };

            console.log(
                "Book Visit payload:",
                payload
            );

            try {
                setBookingLoading(
                    true
                );

                const token =
                    localStorage.getItem(
                        "userJwtToken"
                    ) ||
                    localStorage.getItem(
                        "jwtToken"
                    );

                const response =
                    await axios.post(
                        `${API_BASE_URL}/visits/book`,
                        payload,
                        {
                            headers: token
                                ? {
                                      Authorization: `Bearer ${token}`,
                                      "Content-Type":
                                          "application/json",
                                  }
                                : {
                                      "Content-Type":
                                          "application/json",
                                  },
                        }
                    );

                console.log(
                    "Book Visit response:",
                    response.data
                );

                const savedBookingId =
                    response.data?.id ??
                    response.data
                        ?.bookingId ??
                    response.data
                        ?.visitRequestId;

                if (
                    savedBookingId ===
                        undefined ||
                    savedBookingId ===
                        null
                ) {
                    throw new Error(
                        "The server did not return a booking ID."
                    );
                }

                setBookingId(
                    String(
                        savedBookingId
                    )
                );

                setBookingStatus(
                    "pending"
                );
            } catch (err) {
                console.error(
                    "Book visit error:",
                    err
                );

                if (err.response) {
                    console.error(
                        "Book visit server response:",
                        err.response.data
                    );

                    const serverMessage =
                        err.response.data
                            ?.message;

                    if (
                        serverMessage
                    ) {
                        setError(
                            serverMessage
                        );
                    } else if (
                        err.response
                            .status ===
                        401
                    ) {
                        setError(
                            "Your session has expired. Please log in again."
                        );
                    } else if (
                        err.response
                            .status ===
                        403
                    ) {
                        setError(
                            "You are not authorized to book a visit."
                        );
                    } else if (
                        err.response
                            .status ===
                        400
                    ) {
                        setError(
                            "Some visit details are invalid. Please check your selections."
                        );
                    } else {
                        setError(
                            "Unable to send the visit request. Please try again."
                        );
                    }
                } else if (
                    err.request
                ) {
                    setError(
                        "Unable to connect to the server. Please make sure the Spring Boot backend is running."
                    );
                } else {
                    setError(
                        err.message ||
                            "Unable to send the visit request."
                    );
                }
            } finally {
                setBookingLoading(
                    false
                );
            }
        };

    /* =====================================================
       CANCEL REQUEST
    ===================================================== */

    const handleCancelRequest =
        async () => {
            if (
                cancellationLoading ||
                !bookingId
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Are you sure you want to cancel this visit request?"
                );

            if (!confirmed) {
                return;
            }

            const userId =
                getAuthenticatedUserId();

            if (!userId) {
                setError(
                    "Unable to identify your account. Please log in again."
                );

                return;
            }

            try {
                setCancellationLoading(
                    true
                );

                setError("");

                const token =
                    localStorage.getItem(
                        "userJwtToken"
                    ) ||
                    localStorage.getItem(
                        "jwtToken"
                    );

                const response =
                    await axios.delete(
                        `${API_BASE_URL}/visits/${bookingId}`,
                        {
                            params: {
                                userId: Number(
                                    userId
                                ),
                            },

                            headers: token
                                ? {
                                      Authorization: `Bearer ${token}`,
                                  }
                                : undefined,
                        }
                    );

                console.log(
                    "Cancel visit response:",
                    response.data
                );

                setBookingStatus(
                    "cancelled"
                );
            } catch (err) {
                console.error(
                    "Cancel visit error:",
                    err
                );

                if (
                    err.response
                        ?.data?.message
                ) {
                    setError(
                        err.response.data
                            .message
                    );
                } else if (
                    err.response
                        ?.status ===
                    403
                ) {
                    setError(
                        "You are not allowed to cancel this visit request."
                    );
                } else if (
                    err.response
                        ?.status ===
                    404
                ) {
                    setError(
                        "The visit request could not be found."
                    );
                } else {
                    setError(
                        "Unable to cancel the visit request. Please try again."
                    );
                }
            } finally {
                setCancellationLoading(
                    false
                );
            }
        };

    /* =====================================================
       DATE LABEL
    ===================================================== */

    const selectedDateObject =
        visitDates.find(
            (date) =>
                date.value ===
                selectedDate
        );

    /* =====================================================
       BOOKING STATUS
    ===================================================== */

    const renderBookingStatus =
        () => {
            if (
                bookingStatus ===
                "pending"
            ) {
                return (
                    <div className="dh-book-status-page">
                        <div className="dh-book-status-card">

                            <div className="dh-status-icon dh-status-icon-pending">
                                <FiClock />
                            </div>

                            <h2>
                                Visit request sent
                            </h2>

                            <p className="dh-status-main-text">
                                Your visit request
                                is waiting for
                                vendor
                                acceptance.
                            </p>

                            <div className="dh-booking-id">
                                <span>
                                    Booking ID
                                </span>

                                <strong>
                                    {
                                        bookingId
                                    }
                                </strong>
                            </div>

                            <div className="dh-status-details">

                                <div>
                                    <span>
                                        Product
                                    </span>

                                    <strong>
                                        {
                                            product?.name ||
                                            "Selected Product"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Shop
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor?.name ||
                                            "Selected Shop"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Date
                                    </span>

                                    <strong>
                                        {selectedDateObject
                                            ? `${selectedDateObject.day}, ${selectedDateObject.date} ${selectedDateObject.month}`
                                            : selectedDate}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Time
                                    </span>

                                    <strong>
                                        {
                                            selectedTime
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Mobile
                                    </span>

                                    <strong>
                                        {
                                            customer.phone
                                        }
                                    </strong>
                                </div>

                            </div>

                            <div className="dh-status-notice">
                                <FiPhone />

                                <span>
                                    Your mobile
                                    number will
                                    be shared
                                    with the
                                    selected
                                    store so
                                    they can
                                    contact you
                                    about the
                                    visit
                                    request.
                                </span>
                            </div>

                            <button
                                type="button"
                                className="dh-cancel-request"
                                onClick={
                                    handleCancelRequest
                                }
                                disabled={
                                    cancellationLoading
                                }
                            >
                                <FiX />

                                {cancellationLoading
                                    ? "Cancelling..."
                                    : "Cancel request"}
                            </button>

                        </div>
                    </div>
                );
            }

            if (
                bookingStatus ===
                "cancelled"
            ) {
                return (
                    <div className="dh-book-status-page">
                        <div className="dh-book-status-card">

                            <div className="dh-status-icon dh-status-icon-cancelled">
                                <FiX />
                            </div>

                            <h2>
                                Request cancelled
                            </h2>

                            <p className="dh-status-main-text">
                                Your visit request
                                has been
                                cancelled.
                            </p>

                            <div className="dh-booking-id">
                                <span>
                                    Booking ID
                                </span>

                                <strong>
                                    {
                                        bookingId
                                    }
                                </strong>
                            </div>

                        </div>
                    </div>
                );
            }

            return null;
        };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="dh-book-visit-page">

            {/* =================================================
               HEADER
            ================================================= */}

            <Header
                onMenuClick={() =>
                    setIsSidebarOpen(
                        true
                    )
                }
            />

            {/* =================================================
               SIDEBAR
            ================================================= */}

            <Sidebar
                isSidebarOpen={
                    isSidebarOpen
                }
                closeSidebar={() =>
                    setIsSidebarOpen(
                        false
                    )
                }
            />

            {/* =================================================
               PAGE CONTENT
            ================================================= */}

            {loading ? (
                <main className="dh-book-visit-shell">

                    <div className="dh-book-visit-topbar">

                        <button
                            type="button"
                            className="dh-book-visit-back"
                            onClick={() =>
                                navigate(-1)
                            }
                            aria-label="Go back"
                        >
                            <FiArrowLeft />
                        </button>

                        <span className="dh-book-visit-title">
                            Book a Visit
                        </span>

                    </div>

                    <div className="dh-book-loading">
                        Loading product...
                    </div>

                </main>
            ) : (
                <main className="dh-book-visit-shell">

                    {/* =================================================
                       TOP BAR
                    ================================================= */}

                    <div className="dh-book-visit-topbar">

                        <button
                            type="button"
                            className="dh-book-visit-back"
                            onClick={() =>
                                navigate(-1)
                            }
                            aria-label="Go back"
                        >
                            <FiArrowLeft />
                        </button>

                        <span className="dh-book-visit-title">
                            Book a Visit
                        </span>

                    </div>

                    {/* =================================================
                       ERROR
                    ================================================= */}

                    {error && (
                        <div className="dh-book-error">
                            {error}
                        </div>
                    )}

                    {/* =================================================
                       BOOKING STATUS
                    ================================================= */}

                    {bookingStatus !==
                    "idle" ? (
                        renderBookingStatus()
                    ) : (
                        <div className="dh-book-layout">

                            {/* =================================================
                               LEFT SECTION
                            ================================================= */}

                            <section className="dh-book-left">

                                {/* PRODUCT */}

                                <div className="dh-product-card">

                                    <div className="dh-product-image-wrap">

                                        {productImage &&
                                        !imageFailed ? (
                                            <img
                                                src={
                                                    productImage
                                                }
                                                alt={
                                                    product?.name ||
                                                    "Product"
                                                }
                                                className="dh-product-image"
                                                onError={() =>
                                                    setImageFailed(
                                                        true
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="dh-product-image-fallback">
                                                <FiShoppingBag />
                                            </div>
                                        )}

                                    </div>

                                    <div className="dh-product-summary">

                                        <div className="dh-product-name">
                                            {product?.name ||
                                                "Product"}
                                        </div>

                                        {product?.brand
                                            ?.name && (
                                            <div className="dh-product-brand">
                                                {
                                                    product
                                                        .brand
                                                        .name
                                                }
                                            </div>
                                        )}

                                        {selectedPrice && (
                                            <div className="dh-product-price">
                                                {formatPrice(
                                                    selectedPrice
                                                )}
                                            </div>
                                        )}

                                    </div>

                                </div>

                                {/* =================================================
                                   VARIANTS
                                ================================================= */}

                                <section className="dh-book-section">

                                    <div className="dh-section-title">
                                        Choose Variant
                                    </div>

                                    {variants.length >
                                    0 ? (
                                        <div className="dh-option-grid">

                                            {variants.map(
                                                (
                                                    variant,
                                                    index
                                                ) => {
                                                    const id =
                                                        getVariantId(
                                                            variant
                                                        );

                                                    const active =
                                                        String(
                                                            id
                                                        ) ===
                                                        String(
                                                            selectedVariantId
                                                        );

                                                    return (
                                                        <button
                                                            key={
                                                                id ??
                                                                index
                                                            }
                                                            type="button"
                                                            className={`dh-variant-option ${
                                                                active
                                                                    ? "active"
                                                                    : ""
                                                            }`}
                                                            onClick={() =>
                                                                setSelectedVariantId(
                                                                    id
                                                                )
                                                            }
                                                        >
                                                            {getVariantLabel(
                                                                variant
                                                            )}
                                                        </button>
                                                    );
                                                }
                                            )}

                                        </div>
                                    ) : (
                                        <div className="dh-no-option">
                                            Standard
                                            product
                                            configuration
                                        </div>
                                    )}

                                </section>

                                {/* =================================================
                                   COLORS
                                ================================================= */}

                                <section className="dh-book-section">

                                    <div className="dh-section-title">
                                        Choose Color
                                    </div>

                                    {colors.length >
                                    0 ? (
                                        <div className="dh-color-grid">

                                            {colors.map(
                                                (
                                                    color,
                                                    index
                                                ) => {
                                                    const id =
                                                        getColorId(
                                                            color
                                                        );

                                                    const active =
                                                        String(
                                                            id
                                                        ) ===
                                                        String(
                                                            selectedColorId
                                                        );

                                                    return (
                                                        <button
                                                            key={
                                                                id ??
                                                                index
                                                            }
                                                            type="button"
                                                            className={`dh-color-option ${
                                                                active
                                                                    ? "active"
                                                                    : ""
                                                            }`}
                                                            onClick={() =>
                                                                setSelectedColorId(
                                                                    id
                                                                )
                                                            }
                                                        >
                                                            <span
                                                                className="dh-color-swatch"
                                                                style={{
                                                                    background:
                                                                        getColorHex(
                                                                            color
                                                                        ),
                                                                }}
                                                            />

                                                            <span>
                                                                {getColorName(
                                                                    color
                                                                )}
                                                            </span>
                                                        </button>
                                                    );
                                                }
                                            )}

                                        </div>
                                    ) : (
                                        <div className="dh-no-option">
                                            No color
                                            options
                                            available
                                            for this
                                            variant.
                                        </div>
                                    )}

                                </section>

                                {/* =================================================
                                   STORE
                                ================================================= */}

                                <section className="dh-book-section">

                                    <div className="dh-section-title">
                                        Choose Store
                                    </div>

                                    {vendorLoading ? (
                                        <div className="dh-store-loading">
                                            Loading
                                            stores...
                                        </div>
                                    ) : vendorError ? (
                                        <div className="dh-store-empty">
                                            {
                                                vendorError
                                            }
                                        </div>
                                    ) : vendors.length ===
                                      0 ? (
                                        <div className="dh-store-empty">
                                            There
                                            are no
                                            stores
                                            available
                                            for this
                                            product.
                                        </div>
                                    ) : (
                                        <div className="dh-store-list">

                                            {vendors.map(
                                                (
                                                    vendor
                                                ) => {
                                                    const active =
                                                        String(
                                                            vendor.id
                                                        ) ===
                                                        String(
                                                            selectedVendorId
                                                        );

                                                    return (
                                                        <button
                                                            key={`${vendor.id}`}
                                                            type="button"
                                                            className={`dh-store-option ${
                                                                active
                                                                    ? "active"
                                                                    : ""
                                                            }`}
                                                            onClick={() =>
                                                                setSelectedVendorId(
                                                                    vendor.id
                                                                )
                                                            }
                                                        >

                                                            <span className="dh-store-icon">
                                                                <FiShoppingBag />
                                                            </span>

                                                            <span className="dh-store-content">

                                                                <strong>
                                                                    {
                                                                        vendor.name
                                                                    }
                                                                </strong>

                                                                {vendor.address && (
                                                                    <span>
                                                                        <FiMapPin />

                                                                        {
                                                                            vendor.address
                                                                        }
                                                                    </span>
                                                                )}

                                                                {vendor.phone && (
                                                                    <span>
                                                                        <FiPhone />

                                                                        {
                                                                            vendor.phone
                                                                        }
                                                                    </span>
                                                                )}

                                                            </span>

                                                            <span className="dh-store-check">
                                                                {active && (
                                                                    <FiCheck />
                                                                )}
                                                            </span>

                                                        </button>
                                                    );
                                                }
                                            )}

                                        </div>
                                    )}

                                </section>

                            </section>

                            {/* =================================================
                               RIGHT SECTION
                            ================================================= */}

                            <section className="dh-book-right">

                                {/* SELECTED SHOP */}

                                <section className="dh-selected-shop-card">

                                    <div className="dh-selected-shop-label">
                                        Selected Shop
                                    </div>

                                    <div className="dh-selected-shop-name">
                                        {selectedVendor?.name ||
                                            "Choose a visit"}
                                    </div>

                                    {selectedVendor?.address && (
                                        <div className="dh-selected-shop-address">

                                            <FiMapPin />

                                            <span>
                                                {
                                                    selectedVendor.address
                                                }
                                            </span>

                                        </div>
                                    )}

                                    {selectedVendor?.phone && (
                                        <div className="dh-selected-shop-address">

                                            <FiPhone />

                                            <span>
                                                {
                                                    selectedVendor.phone
                                                }
                                            </span>

                                        </div>
                                    )}

                                </section>

                                {/* =================================================
                                   DATE
                                ================================================= */}

                                <section className="dh-book-section">

                                    <div className="dh-section-title">
                                        <FiCalendar />
                                        Select Date
                                    </div>

                                    <div className="dh-date-grid">

                                        {visitDates.map(
                                            (
                                                date
                                            ) => (
                                                <button
                                                    key={
                                                        date.value
                                                    }
                                                    type="button"
                                                    className={`dh-date-option ${
                                                        selectedDate ===
                                                        date.value
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedDate(
                                                            date.value
                                                        )
                                                    }
                                                >
                                                    <span>
                                                        {
                                                            date.day
                                                        }
                                                    </span>

                                                    <strong>
                                                        {
                                                            date.date
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            date.month
                                                        }
                                                    </small>
                                                </button>
                                            )
                                        )}

                                    </div>

                                </section>

                                {/* =================================================
                                   TIME
                                ================================================= */}

                                <section className="dh-book-section">

                                    <div className="dh-section-title">
                                        <FiClock />
                                        Select Time
                                    </div>

                                    <div className="dh-time-grid">

                                        {TIME_SLOTS.map(
                                            (
                                                time
                                            ) => (
                                                <button
                                                    key={
                                                        time
                                                    }
                                                    type="button"
                                                    className={`dh-time-option ${
                                                        selectedTime ===
                                                        time
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedTime(
                                                            time
                                                        )
                                                    }
                                                >
                                                    {
                                                        time
                                                    }
                                                </button>
                                            )
                                        )}

                                    </div>

                                </section>

                                {/* =================================================
                                   CUSTOMER
                                ================================================= */}

                                <section className="dh-book-section">

                                    <div className="dh-section-title">
                                        Customer Details
                                    </div>

                                    <div className="dh-form-grid">

                                        <label className="dh-form-field">

                                            <span>
                                                <FiUser />
                                                Name
                                            </span>

                                            <input
                                                type="text"
                                                name="name"
                                                value={
                                                    customer.name
                                                }
                                                onChange={
                                                    handleCustomerChange
                                                }
                                                placeholder="Enter your name"
                                                autoComplete="name"
                                            />

                                        </label>

                                        <label className="dh-form-field">

                                            <span>
                                                <FiPhone />
                                                Mobile Number
                                            </span>

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={
                                                    customer.phone
                                                }
                                                onChange={
                                                    handleCustomerChange
                                                }
                                                placeholder="10-digit mobile number"
                                                maxLength={
                                                    10
                                                }
                                                autoComplete="tel"
                                            />

                                        </label>

                                        <label className="dh-form-field dh-form-field-full">

                                            <span>
                                                <FiMail />
                                                Email

                                                <small>
                                                    Optional
                                                </small>
                                            </span>

                                            <input
                                                type="email"
                                                name="email"
                                                value={
                                                    customer.email
                                                }
                                                onChange={
                                                    handleCustomerChange
                                                }
                                                placeholder="Enter your email"
                                                autoComplete="email"
                                            />

                                        </label>

                                    </div>

                                    <div className="dh-mobile-notice">

                                        <FiPhone />

                                        <span>
                                            Your mobile
                                            number will
                                            be shared
                                            with the
                                            selected
                                            store for
                                            visit
                                            coordination.
                                        </span>

                                    </div>

                                </section>

                                {/* =================================================
                                   SUMMARY
                                ================================================= */}

                                <section className="dh-book-summary">

                                    <div className="dh-summary-title">
                                        Visit Summary
                                    </div>

                                    <div className="dh-summary-row">

                                        <span>
                                            Shop
                                        </span>

                                        <strong>
                                            {
                                                selectedVendor?.name ||
                                                "Not selected"
                                            }
                                        </strong>

                                    </div>

                                    <div className="dh-summary-row">

                                        <span>
                                            Variant
                                        </span>

                                        <strong>
                                            {
                                                selectedVariantLabel
                                            }
                                        </strong>

                                    </div>

                                    {selectedColorLabel && (
                                        <div className="dh-summary-row">

                                            <span>
                                                Color
                                            </span>

                                            <strong>
                                                {
                                                    selectedColorLabel
                                                }
                                            </strong>

                                        </div>
                                    )}

                                    <div className="dh-summary-row">

                                        <span>
                                            Date
                                        </span>

                                        <strong>
                                            {selectedDateObject
                                                ? `${selectedDateObject.day}, ${selectedDateObject.date} ${selectedDateObject.month}`
                                                : "Not selected"}
                                        </strong>

                                    </div>

                                    <div className="dh-summary-row">

                                        <span>
                                            Time
                                        </span>

                                        <strong>
                                            {
                                                selectedTime ||
                                                "Not selected"
                                            }
                                        </strong>

                                    </div>

                                    {selectedPrice && (
                                        <div className="dh-summary-row dh-summary-price">

                                            <span>
                                                Price
                                            </span>

                                            <strong>
                                                {formatPrice(
                                                    selectedPrice
                                                )}
                                            </strong>

                                        </div>
                                    )}

                                </section>

                                {/* =================================================
                                   BOOK BUTTON
                                ================================================= */}

                                <button
                                    type="button"
                                    className="dh-book-submit"
                                    onClick={
                                        handleBookVisit
                                    }
                                    disabled={
                                        bookingLoading
                                    }
                                >
                                    <FiCalendar />

                                    {bookingLoading
                                        ? "Sending request..."
                                        : "Request Visit"}
                                </button>

                                <div className="dh-pending-note">
                                    Your request
                                    will remain
                                    pending until
                                    the selected
                                    store accepts
                                    it.
                                </div>

                            </section>

                        </div>
                    )}

                </main>
            )}

        </div>
    );
};

export default BookVisit;