import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import {
    FiShoppingCart,
    FiArrowLeft,
    FiArrowRight,
    FiCheckCircle,
    FiTruck,
    FiX,
    FiMapPin,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";

import "../../styles/UProductComparison.css";

/* ============================================================
   API
============================================================ */

const API_BASE_URL = "http://localhost:8080";

/* ============================================================
   FORMAT / SAFE READ HELPERS
============================================================ */

function formatINR(amount) {
    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {
        return "—";
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
        return "—";
    }

    return `₹${numericAmount.toLocaleString("en-IN")}`;
}

function displayValue(value, fallback = "—") {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return fallback;
    }

    if (typeof value === "object") {
        return (
            value?.name ||
            value?.title ||
            value?.label ||
            value?.value ||
            value?.shopName ||
            fallback
        );
    }

    return String(value);
}

/* ============================================================
   IMAGE URL HANDLER
============================================================ */

function toImageUrl(entry) {
    if (!entry) {
        return "";
    }

    if (typeof entry === "string") {
        return entry;
    }

    return (
        entry?.thumbnailUrl ||
        entry?.imageUrl ||
        entry?.image ||
        entry?.url ||
        entry?.src ||
        entry?.cloudinaryUrl ||
        ""
    );
}

/* ============================================================
   COLLECT PRODUCT IMAGES
============================================================ */

function collectImages(product) {
    if (!product) {
        return [];
    }

    const rawImages = [];

    if (Array.isArray(product.images)) {
        rawImages.push(...product.images);
    }

    if (Array.isArray(product.productImages)) {
        rawImages.push(...product.productImages);
    }

    if (product.image) {
        rawImages.push(product.image);
    }

    if (product.imageUrl) {
        rawImages.push(product.imageUrl);
    }

    if (product.thumbnailUrl) {
        rawImages.push(product.thumbnailUrl);
    }

    const urls = rawImages
        .map(toImageUrl)
        .filter(Boolean);

    return Array.from(new Set(urls));
}

/* ============================================================
   NORMALIZE ATTRIBUTE VALUE
============================================================ */

function getAttributeName(attributeValue) {
    if (!attributeValue) {
        return "";
    }

    if (attributeValue?.attribute) {
        return (
            attributeValue.attribute.name ||
            attributeValue.attribute.title ||
            ""
        );
    }

    return (
        attributeValue?.name ||
        attributeValue?.attributeName ||
        ""
    );
}

function getAttributeValue(attributeValue) {
    if (!attributeValue) {
        return "";
    }

    if (
        attributeValue?.value !== undefined &&
        attributeValue?.value !== null
    ) {
        return displayValue(
            attributeValue.value,
            ""
        );
    }

    return displayValue(
        attributeValue,
        ""
    );
}

/* ============================================================
   GET VARIANT ATTRIBUTES
============================================================ */

function getVariantAttributes(variant) {
    if (!variant) {
        return [];
    }

    if (
        Array.isArray(
            variant.attributeValues
        )
    ) {
        return variant.attributeValues
            .map((item) => ({
                name: getAttributeName(item),
                value: getAttributeValue(item),
            }))
            .filter(
                (item) =>
                    item.name &&
                    item.value
            );
    }

    if (
        Array.isArray(
            variant.attributes
        )
    ) {
        return variant.attributes
            .map((item) => ({
                name: getAttributeName(item),
                value: getAttributeValue(item),
            }))
            .filter(
                (item) =>
                    item.name &&
                    item.value
            );
    }

    if (
        variant.attributes &&
        typeof variant.attributes === "object"
    ) {
        return Object.entries(
            variant.attributes
        )
            .map(
                ([name, value]) => ({
                    name,
                    value: displayValue(
                        value,
                        ""
                    ),
                })
            )
            .filter(
                (item) =>
                    item.name &&
                    item.value
            );
    }

    return [];
}

/* ============================================================
   GET VARIANT COLORS
============================================================ */

function getVariantColors(variant) {
    if (!variant) {
        return [];
    }

    if (
        !Array.isArray(
            variant.colors
        )
    ) {
        return [];
    }

    return variant.colors
        .map((color) => ({
            id:
                color?.id ??
                color?.colorId ??
                null,
            name:
                color?.name ||
                color?.colorName ||
                "",
            hexCode:
                color?.hexCode ||
                color?.hex ||
                "",
            price:
                color?.price ?? null,
        }))
        .filter(
            (color) =>
                color.name
        );
}

/* ============================================================
   BUILD VARIANT GROUPS
============================================================ */

function buildVariantGroups(variants) {
    if (
        !Array.isArray(variants) ||
        variants.length === 0
    ) {
        return [];
    }

    const groupOrder = [];
    const groupValues = {};

    variants.forEach((variant) => {
        const attributes =
            getVariantAttributes(
                variant
            );

        attributes.forEach(
            ({
                name,
                value,
            }) => {
                const key =
                    name
                        .trim()
                        .toLowerCase();

                if (
                    !key ||
                    !value
                ) {
                    return;
                }

                if (
                    !groupValues[
                        key
                    ]
                ) {
                    groupValues[
                        key
                    ] = {
                        label: name,
                        options: [],
                    };

                    groupOrder.push(
                        key
                    );
                }

                if (
                    !groupValues[
                        key
                    ].options.includes(
                        value
                    )
                ) {
                    groupValues[
                        key
                    ].options.push(
                        value
                    );
                }
            }
        );
    });

    return groupOrder.map(
        (key) => ({
            key,
            label:
                groupValues[key]
                    .label,
            options:
                groupValues[key]
                    .options,
        })
    );
}

/* ============================================================
   BUILD COLOR OPTIONS
============================================================ */

function buildColorOptions(variants) {
    if (
        !Array.isArray(variants)
    ) {
        return [];
    }

    const colors = [];

    variants.forEach(
        (variant) => {
            const variantColors =
                getVariantColors(
                    variant
                );

            variantColors.forEach(
                (color) => {
                    const exists =
                        colors.some(
                            (item) =>
                                (
                                    item.id &&
                                    color.id &&
                                    item.id ===
                                        color.id
                                ) ||
                                (
                                    item.name
                                        .toLowerCase() ===
                                    color.name
                                        .toLowerCase()
                                )
                        );

                    if (!exists) {
                        colors.push(
                            color
                        );
                    }
                }
            );
        }
    );

    return colors;
}

/* ============================================================
   GET VARIANT PRICE
============================================================ */

function getVariantPrice(variant) {
    if (!variant) {
        return 0;
    }

    return (
        Number(
            variant.price
        ) ||
        Number(
            variant.sellingPrice
        ) ||
        Number(
            variant.basePrice
        ) ||
        0
    );
}

/* ============================================================
   GET PRODUCT BASE PRICE
============================================================ */

function getProductPrice(product) {
    if (!product) {
        return 0;
    }

    return (
        Number(
            product.basePrice
        ) ||
        Number(
            product.price
        ) ||
        Number(
            product.sellingPrice
        ) ||
        0
    );
}

/* ============================================================
   FIND SELECTED VARIANT
============================================================ */

function resolveSelectedVariant(
    variants,
    selection
) {
    if (
        !Array.isArray(variants) ||
        variants.length === 0
    ) {
        return null;
    }

    const selectedKeys =
        Object.keys(
            selection
        );

    if (
        selectedKeys.length ===
        0
    ) {
        return variants[0];
    }

    const exact =
        variants.find(
            (variant) => {
                const attributes =
                    getVariantAttributes(
                        variant
                    );

                return selectedKeys.every(
                    (key) => {
                        const attribute =
                            attributes.find(
                                (
                                    item
                                ) =>
                                    item.name
                                        .trim()
                                        .toLowerCase() ===
                                    key
                                        .trim()
                                        .toLowerCase()
                            );

                        return (
                            attribute &&
                            String(
                                attribute.value
                            ) ===
                                String(
                                    selection[
                                        key
                                    ]
                                )
                        );
                    }
                );
            }
        );

    return (
        exact ||
        variants[0]
    );
}

/* ============================================================
   STAR RATING
============================================================ */

function StarRating({
    value = 0,
}) {
    const rating =
        Number(value) || 0;

    return (
        <span className="dh-product-comparison-stars-user">
            {Array.from({
                length: 5,
            }).map(
                (_, index) => (
                    <span
                        key={index}
                        className={
                            index <
                            Math.round(
                                rating
                            )
                                ? "dh-product-comparison-star-user dh-product-comparison-active-user"
                                : "dh-product-comparison-star-user"
                        }
                    >
                        ★
                    </span>
                )
            )}
        </span>
    );
}

/* ============================================================
   VENDOR / RANK CARD
============================================================ */

function RankCard({
    rank,
    vendor,
    isBest,
    isSelected,
    lowestPrice,
    onSelect,
    onViewDeal,
}) {
    const price =
        Number(
            vendor?.price
        ) ||
        Number(
            vendor?.sellingPrice
        ) ||
        Number(
            vendor?.finalPrice
        ) ||
        0;

    const originalPrice =
        Number(
            vendor?.originalPrice
        ) ||
        Number(
            vendor?.mrp
        ) ||
        Number(
            vendor?.basePrice
        ) ||
        0;

    const difference =
        Math.max(
            0,
            price -
                lowestPrice
        );

    const vendorName =
        displayValue(
            vendor?.vendorName ??
                vendor?.shopName ??
                vendor?.storeName ??
                vendor?.name,
            "Vendor"
        );

    const vendorRating =
        Number(
            vendor?.rating
        ) || 0;

    const stock =
        Number(
            vendor?.stock
        ) || 0;

    return (
        <div
            className={[
                "dh-product-comparison-rank-card-user",
                isBest
                    ? "dh-product-comparison-best-user"
                    : "",
                isSelected
                    ? "dh-product-comparison-selected-user"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
            onClick={() =>
                onSelect(
                    vendor
                )
            }
        >
            <div className="dh-product-comparison-rank-top-row-user">
                <span className="dh-product-comparison-rank-number-user">
                    #{rank}
                </span>

                {isBest && (
                    <span className="dh-product-comparison-best-badge-user">
                        Best Price
                    </span>
                )}
            </div>

            <div
                className="dh-product-comparison-rank-shop-user"
                title={vendorName}
            >
                {vendorName}
            </div>

            <div className="dh-product-comparison-rank-meta-user">
                ★{" "}
                {vendorRating
                    ? vendorRating.toFixed(
                          1
                      )
                    : "New"}
            </div>

            <div className="dh-pc-vendor-price-box-user">
                <span>
                    DEAL PRICE
                </span>

                <strong>
                    {formatINR(
                        price
                    )}
                </strong>
            </div>

            {originalPrice >
                price && (
                <span className="dh-product-comparison-rank-old-price-user">
                    {formatINR(
                        originalPrice
                    )}
                </span>
            )}

            <span
                className={[
                    "dh-product-comparison-rank-difference-user",
                    isBest
                        ? "dh-product-comparison-best-user"
                        : "dh-product-comparison-more-user",
                ].join(" ")}
            >
                {isBest
                    ? "Lowest price found"
                    : `+${formatINR(
                          difference
                      )} more`}
            </span>

            <span className="dh-product-comparison-rank-stock-user">
                {stock > 0 ||
                vendor?.available ? (
                    <>
                        <FiCheckCircle />
                        {stock > 0
                            ? `${stock} available`
                            : "In stock"}
                    </>
                ) : (
                    "Out of stock"
                )}
            </span>

            <button
                type="button"
                className="dh-product-comparison-rank-button-user"
                onClick={(
                    event
                ) => {
                    event.stopPropagation();

                    onViewDeal(
                        vendor
                    );
                }}
            >
                View Deal
                <FiArrowRight />
            </button>
        </div>
    );
}

/* ============================================================
   PRODUCT COMPARISON PAGE
============================================================ */

function ProductComparison() {
    const {
        productId: id,
    } = useParams();

    const navigate =
        useNavigate();

    const [isLoggedIn] =
        useState(
            !!localStorage.getItem(
                "userJwtToken"
            )
        );

    const [
        product,
        setProduct,
    ] = useState(null);

    const [
        vendors,
        setVendors,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        activeImageIndex,
        setActiveImageIndex,
    ] = useState(0);

    const [
        selectedAttributes,
        setSelectedAttributes,
    ] = useState({});

    const [
        selectedVendorId,
        setSelectedVendorId,
    ] = useState(null);

    const [
        showVendorComparison,
        setShowVendorComparison,
    ] = useState(false);

    /* ==========================================================
       FETCH PRODUCT
    ========================================================== */

    useEffect(() => {
        const fetchProduct =
            async () => {
                try {
                    setLoading(
                        true
                    );

                    setError("");

                    const response =
                        await axios.get(
                            `${API_BASE_URL}/admin/products/${id}`
                        );

                    const data =
                        response
                            .data
                            ?.content ??
                        response.data ??
                        null;

                    setProduct(
                        data
                    );

                    const groups =
                        buildVariantGroups(
                            data?.variants
                        );

                    const defaults =
                        {};

                    groups.forEach(
                        (
                            group
                        ) => {
                            if (
                                group
                                    .options
                                    .length >
                                0
                            ) {
                                defaults[
                                    group.key
                                ] =
                                    group
                                        .options[0];
                            }
                        }
                    );

                    setSelectedAttributes(
                        defaults
                    );

                    setActiveImageIndex(
                        0
                    );
                } catch (
                    fetchError
                ) {
                    console.error(
                        "Failed to fetch product:",
                        fetchError
                    );

                    console.error(
                        "Backend response:",
                        fetchError
                            .response
                            ?.data
                    );

                    setError(
                        "Unable to load this product. Please try again."
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            };

        if (id) {
            fetchProduct();
        } else {
            setLoading(
                false
            );

            setError(
                "Product ID is missing."
            );
        }
    }, [id]);

    /* ==========================================================
       FETCH VENDORS
    ========================================================== */

    useEffect(() => {
        const fetchVendors =
            async () => {
                try {
                    const response =
                        await axios.get(
                            `${API_BASE_URL}/inventory/product/${id}/vendors`
                        );

                    const list =
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : [];

                    const sorted =
                        [
                            ...list,
                        ].sort(
                            (
                                a,
                                b
                            ) => {
                                const priceA =
                                    Number(
                                        a?.price
                                    ) ||
                                    Number(
                                        a?.sellingPrice
                                    ) ||
                                    Number(
                                        a?.finalPrice
                                    ) ||
                                    0;

                                const priceB =
                                    Number(
                                        b?.price
                                    ) ||
                                    Number(
                                        b?.sellingPrice
                                    ) ||
                                    Number(
                                        b?.finalPrice
                                    ) ||
                                    0;

                                return (
                                    priceA -
                                    priceB
                                );
                            }
                        );

                    setVendors(
                        sorted
                    );

                    if (
                        sorted.length >
                        0
                    ) {
                        setSelectedVendorId(
                            sorted[0]
                                ?.inventoryId ??
                                sorted[0]
                                    ?.id ??
                                null
                        );
                    }
                } catch (
                    fetchError
                ) {
                    console.error(
                        "Failed to fetch vendors:",
                        fetchError
                    );

                    console.error(
                        "Backend response:",
                        fetchError
                            .response
                            ?.data
                    );

                    setVendors(
                        []
                    );
                }
            };

        if (id) {
            fetchVendors();
        }
    }, [id]);

    /* ==========================================================
       DERIVED DATA
    ========================================================== */

    const images =
        useMemo(
            () =>
                collectImages(
                    product
                ),
            [product]
        );

    const variantGroups =
        useMemo(
            () =>
                buildVariantGroups(
                    product?.variants
                ),
            [product]
        );

    const colorOptions =
        useMemo(
            () =>
                buildColorOptions(
                    product?.variants
                ),
            [product]
        );

    const selectedVariant =
        useMemo(
            () =>
                resolveSelectedVariant(
                    product?.variants,
                    selectedAttributes
                ),
            [
                product,
                selectedAttributes,
            ]
        );

    const selectedVendor =
        useMemo(() => {
            if (
                !Array.isArray(
                    vendors
                ) ||
                vendors.length ===
                    0
            ) {
                return null;
            }

            return (
                vendors.find(
                    (
                        vendor
                    ) =>
                        (
                            vendor?.inventoryId ??
                            vendor?.id
                        ) ===
                        selectedVendorId
                ) ||
                vendors[0]
            );
        }, [
            vendors,
            selectedVendorId,
        ]);

    /* ==========================================================
       PRICE
    ========================================================== */

    const variantPrice =
        getVariantPrice(
            selectedVariant
        );

    const productBasePrice =
        getProductPrice(
            product
        );

    const displayPrice =
        variantPrice >
        0
            ? variantPrice
            : productBasePrice;

    const displayOriginalPrice =
        Number(
            selectedVariant?.originalPrice
        ) ||
        Number(
            selectedVariant?.mrp
        ) ||
        Number(
            product?.originalPrice
        ) ||
        Number(
            product?.mrp
        ) ||
        0;

    const savePercent =
        displayOriginalPrice >
            displayPrice &&
        displayPrice > 0
            ? Math.round(
                  ((displayOriginalPrice -
                      displayPrice) /
                      displayOriginalPrice) *
                      100
              )
            : 0;

    const top5Vendors =
        vendors.slice(
            0,
            5
        );

    const lowestPrice =
        top5Vendors.length >
        0
            ? Number(
                  top5Vendors[0]
                      ?.price
              ) ||
              Number(
                  top5Vendors[0]
                      ?.sellingPrice
              ) ||
              Number(
                  top5Vendors[0]
                      ?.finalPrice
              ) ||
              displayPrice
            : displayPrice;

    /* ==========================================================
       PRODUCT DETAILS
    ========================================================== */

    const productDetailFields =
        useMemo(() => {
            if (!product) {
                return [];
            }

            const candidates =
                [
                    [
                        "Brand",
                        product.brand,
                    ],
                    [
                        "Category",
                        product.category,
                    ],
                    [
                        "Model",
                        product.model ??
                            product.modelNumber,
                    ],
                    [
                        "Availability",
                        product.active ===
                            false ||
                        product.available ===
                            false
                            ? "Unavailable"
                            : "Available",
                    ],
                    [
                        "Rating",
                        product.rating
                            ? `${Number(
                                  product.rating
                              ).toFixed(
                                  1
                              )} / 5 (${
                                  product.reviewCount ??
                                  0
                              } reviews)`
                            : null,
                    ],
                    [
                        "Warranty",
                        product.warranty,
                    ],
                    [
                        "SKU",
                        product.sku,
                    ],
                    [
                        "Country of Origin",
                        product.countryOfOrigin,
                    ],
                ];

            return candidates
                .map(
                    ([
                        label,
                        value,
                    ]) => ({
                        label,
                        value:
                            displayValue(
                                value,
                                null
                            ),
                    })
                )
                .filter(
                    (row) =>
                        row.value !==
                        null
                );
        }, [product]);

    /* ==========================================================
       SPECIFICATIONS
    ========================================================== */

    const specificationEntries =
        useMemo(() => {
            if (!product) {
                return [];
            }

            const specs =
                product.specifications;

            if (
                specs &&
                typeof specs ===
                    "object" &&
                !Array.isArray(
                    specs
                )
            ) {
                return Object.entries(
                    specs
                )
                    .filter(
                        ([, value]) =>
                            value !==
                                null &&
                            value !==
                                undefined &&
                            value !==
                                ""
                    )
                    .map(
                        ([
                            label,
                            value,
                        ]) => [
                            label,
                            displayValue(
                                value
                            ),
                        ]
                    );
            }

            if (
                Array.isArray(
                    product.attributeValues
                )
            ) {
                return product.attributeValues
                    .map(
                        (
                            item
                        ) => [
                            getAttributeName(
                                item
                            ),
                            getAttributeValue(
                                item
                            ),
                        ]
                    )
                    .filter(
                        ([
                            label,
                            value,
                        ]) =>
                            label &&
                            value
                    );
            }

            return [];
        }, [product]);

    /* ==========================================================
       VARIANT SUMMARY
    ========================================================== */

    const selectedVariantAttributes =
        useMemo(() => {
            if (
                !selectedVariant
            ) {
                return [];
            }

            return getVariantAttributes(
                selectedVariant
            );
        }, [
            selectedVariant,
        ]);

    const selectedVariantText =
        selectedVariantAttributes
            .map(
                (
                    item
                ) =>
                    item.value
            )
            .filter(Boolean)
            .join(
                " / "
            ) ||
        "Standard";

    /* ==========================================================
       ACTIONS
    ========================================================== */

    const handleAttributeSelect =
        (
            groupKey,
            value
        ) => {
            setSelectedAttributes(
                (
                    previous
                ) => ({
                    ...previous,
                    [groupKey]:
                        value,
                })
            );
        };

    const handleSelectVendor =
        (vendor) => {
            const vendorId =
                vendor?.inventoryId ??
                vendor?.id ??
                null;

            setSelectedVendorId(
                vendorId
            );
        };

    /* ==========================================================
       IMAGE NAVIGATION
    ========================================================== */

    const showPreviousImage =
        () => {
            if (
                images.length ===
                0
            ) {
                return;
            }

            setActiveImageIndex(
                (
                    previous
                ) =>
                    previous ===
                    0
                        ? images.length -
                          1
                        : previous - 1
            );
        };

    const showNextImage =
        () => {
            if (
                images.length ===
                0
            ) {
                return;
            }

            setActiveImageIndex(
                (
                    previous
                ) =>
                    previous ===
                    images.length -
                    1
                        ? 0
                        : previous + 1
            );
        };

    /* ==========================================================
       ADD TO CART
    ========================================================== */

    const handleAddToCart =
        async (
            vendorOverride = null
        ) => {
            const token =
                localStorage.getItem(
                    "userJwtToken"
                );

            if (!token) {
                alert(
                    "Please login to add products to your cart."
                );

                navigate(
                    "/login"
                );

                return;
            }

            const vendor =
                vendorOverride ||
                selectedVendor;

            const inventoryId =
                vendor?.inventoryId ??
                vendor?.id ??
                null;

            if (!inventoryId) {
                alert(
                    "Please select a vendor before adding this product to cart."
                );

                return;
            }

            try {
                await axios.post(
                    `${API_BASE_URL}/cart/add`,
                    {
                        inventoryId,
                        quantity: 1,
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                            "Content-Type":
                                "application/json",
                        },
                    }
                );

                alert(
                    "Product added to cart!"
                );
            } catch (
                cartError
            ) {
                console.error(
                    "Failed to add to cart:",
                    cartError
                );

                console.error(
                    "Backend response:",
                    cartError
                        .response
                        ?.data
                );

                if (
                    cartError
                        .response
                        ?.status ===
                        401 ||
                    cartError
                        .response
                        ?.status ===
                        403
                ) {
                    localStorage.removeItem(
                        "userJwtToken"
                    );

                    alert(
                        "Your session has expired. Please login again."
                    );

                    navigate(
                        "/login"
                    );

                    return;
                }

                let message =
                    "Unable to add product to cart.";

                if (
                    typeof cartError
                        .response
                        ?.data ===
                    "string"
                ) {
                    message =
                        cartError
                            .response
                            .data;
                } else if (
                    cartError
                        .response
                        ?.data
                        ?.message
                ) {
                    message =
                        cartError
                            .response
                            .data
                            .message;
                }

                alert(
                    message
                );
            }
        };

    /* ==========================================================
       BUY NOW
    ========================================================== */

    const handleBuyNow =
        async (
            vendorOverride = null
        ) => {
            const token =
                localStorage.getItem(
                    "userJwtToken"
                );

            if (!token) {
                alert(
                    "Please login to continue."
                );

                navigate(
                    "/login"
                );

                return;
            }

            const vendor =
                vendorOverride ||
                selectedVendor;

            const inventoryId =
                vendor?.inventoryId ??
                vendor?.id ??
                null;

            if (!inventoryId) {
                alert(
                    "Please select a vendor before continuing."
                );

                return;
            }

            navigate(
                "/checkout",
                {
                    state: {
                        productId:
                            product?.id,
                        inventoryId,
                    },
                }
            );
        };

    /* ==========================================================
       BOOK VISIT
    ========================================================== */

    const handleBookVisit =
        () => {
            navigate(
                "/book-visit",
                {
                    state: {
                        productId:
                            product?.id,
                    },
                }
            );
        };

    /* ==========================================================
       CLOSE COMPARISON
    ========================================================== */

    const handleCloseVendorComparison =
        () => {
            setShowVendorComparison(
                false
            );
        };

    /* ==========================================================
       LOADING
    ========================================================== */

    if (loading) {
        return (
            <div className="dh-product-comparison-page-user">
                <div className="dh-product-comparison-loading-user">
                    <div className="dh-product-comparison-loading-spinner-user" />

                    <p>
                        Loading product...
                    </p>
                </div>
            </div>
        );
    }

    /* ==========================================================
       ERROR
    ========================================================== */

    if (
        error ||
        !product
    ) {
        return (
            <div className="dh-product-comparison-page-user">
                <div className="dh-product-comparison-not-found-user">
                    <h2>
                        {error
                            ? "Something went wrong"
                            : "Product not found"}
                    </h2>

                    <p>
                        {error ||
                            "We couldn't find the product you're looking for."}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/products"
                            )
                        }
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    /* ==========================================================
       BASIC PRODUCT DATA
    ========================================================== */

    const productName =
        displayValue(
            product.name,
            "Unnamed Product"
        );

    const brandName =
        displayValue(
            product.brand,
            ""
        );

    const categoryName =
        displayValue(
            product.category,
            "Products"
        );

    const description =
        product.description ||
        product.productDescription ||
        "No description available for this product.";

    const activeImage =
        images[
            activeImageIndex
        ] || "";

    return (
        <div className="dh-product-comparison-page-user">

            {/* =====================================================
                PAGE SCROLL AREA
            ===================================================== */}

            <div className="dh-product-comparison-scroll-area-user">

                <main className="dh-product-comparison-main-user">

                    {/* =================================================
                        BACK
                    ================================================= */}

                    <button
                        type="button"
                        className="dh-product-comparison-back-button-user"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        <FiArrowLeft />
                        <span>
                            Back
                        </span>
                    </button>

                    {/* =================================================
                        BREADCRUMB
                    ================================================= */}

                    <div className="dh-product-comparison-breadcrumb-user">
                        {categoryName}

                        <span>
                            {" "}
                            / Comparison
                        </span>
                    </div>

                    {/* =================================================
                        MAIN TOP RIGHT GOLD HANDLE
                    ================================================= */}

                    <button
                        type="button"
                        className="dh-pc-vendor-handle-user"
                        onClick={() =>
                            setShowVendorComparison(
                                true
                            )
                        }
                        aria-label="Open vendor comparison"
                    >
                        <span className="dh-pc-vendor-handle-arrow-user">
                            &lt;────────
                        </span>

                        <span className="dh-pc-vendor-handle-label-user">
                            Compare
                        </span>
                    </button>

                    {/* =================================================
                        MAIN 40 / 60 LAYOUT
                    ================================================= */}

                    <div className="dh-product-comparison-layout-user">

                        {/* =================================================
                            LEFT 40%
                        ================================================= */}

                        <section className="dh-product-comparison-left-user">

                            <div className="dh-product-comparison-overview-user">

                                {/* BRAND */}

                                {brandName && (
                                    <div className="dh-product-comparison-brand-pill-user">
                                        {brandName}
                                    </div>
                                )}

                                {/* PRODUCT TITLE */}

                                <h1 className="dh-product-comparison-product-title-user">
                                    {productName}
                                </h1>

                                {/* RATING */}

                                <div className="dh-product-comparison-rating-row-user">

                                    <StarRating
                                        value={
                                            product?.rating
                                        }
                                    />

                                    {product?.rating !==
                                        null &&
                                        product?.rating !==
                                            undefined &&
                                        product?.rating !==
                                            "" && (
                                            <span className="dh-product-comparison-rating-value-user">
                                                {Number(
                                                    product.rating
                                                ).toFixed(
                                                    1
                                                )}
                                            </span>
                                        )}

                                    {product?.reviewCount !==
                                        null &&
                                        product?.reviewCount !==
                                            undefined && (
                                            <span className="dh-product-comparison-rating-count-user">
                                                (
                                                {
                                                    product.reviewCount
                                                }{" "}
                                                reviews)
                                            </span>
                                        )}

                                </div>

                                {/* =================================================
                                    PRODUCT IMAGE
                                ================================================= */}

                                <div className="dh-product-comparison-gallery-user">

                                    <div className="dh-product-comparison-gallery-main-user">

                                        {activeImage ? (
                                            <img
                                                src={
                                                    activeImage
                                                }
                                                alt={
                                                    productName
                                                }
                                            />
                                        ) : (
                                            <div className="dh-product-comparison-gallery-placeholder-user">
                                                <span>
                                                    No product image available
                                                </span>
                                            </div>
                                        )}

                                        {images.length >
                                            1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="dh-product-comparison-gallery-arrow-user dh-product-comparison-gallery-prev-user"
                                                    onClick={
                                                        showPreviousImage
                                                    }
                                                    aria-label="Previous image"
                                                >
                                                    <FiChevronLeft />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="dh-product-comparison-gallery-arrow-user dh-product-comparison-gallery-next-user"
                                                    onClick={
                                                        showNextImage
                                                    }
                                                    aria-label="Next image"
                                                >
                                                    <FiChevronRight />
                                                </button>
                                            </>
                                        )}

                                    </div>

                                    {/* THUMBNAILS */}

                                    {images.length >
                                        1 && (
                                        <div className="dh-product-comparison-gallery-thumbs-user">

                                            {images.map(
                                                (
                                                    image,
                                                    index
                                                ) => (
                                                    <button
                                                        type="button"
                                                        key={`${image}-${index}`}
                                                        className={`dh-product-comparison-gallery-thumb-user ${
                                                            activeImageIndex ===
                                                            index
                                                                ? "dh-product-comparison-active-user"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            setActiveImageIndex(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <img
                                                            src={
                                                                image
                                                            }
                                                            alt={`${productName} ${index + 1}`}
                                                        />
                                                    </button>
                                                )
                                            )}

                                        </div>
                                    )}

                                </div>

                                {/* =================================================
                                    PRODUCT SPECIFICATION
                                ================================================= */}

                                <div className="dh-product-comparison-section-user">

                                    <div className="dh-product-comparison-section-heading-user">

                                        <div>
                                            <h2>
                                                Product Specification
                                            </h2>

                                            <p>
                                                Technical specifications of this product
                                            </p>
                                        </div>

                                    </div>

                                    <div className="dh-product-comparison-specifications-panel-user">

                                        {specificationEntries.length >
                                        0 ? (
                                            <div className="dh-product-comparison-specifications-grid-user">

                                                {specificationEntries.map(
                                                    (
                                                        [
                                                            label,
                                                            value,
                                                        ],
                                                        index
                                                    ) => (
                                                        <div
                                                            className="dh-product-comparison-spec-row-user"
                                                            key={`${label}-${index}`}
                                                        >
                                                            <span>
                                                                {label}
                                                            </span>

                                                            <span>
                                                                {displayValue(
                                                                    value,
                                                                    "—"
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}

                                            </div>
                                        ) : (
                                            <div className="dh-product-comparison-empty-user">
                                                No specifications available.
                                            </div>
                                        )}

                                    </div>

                                </div>

                                {/* =================================================
                                    PRODUCT DETAILS
                                ================================================= */}

                                <div className="dh-product-comparison-section-user">

                                    <div className="dh-product-comparison-section-heading-user">

                                        <div>
                                            <h2>
                                                Product Details
                                            </h2>

                                            <p>
                                                General information about this product
                                            </p>
                                        </div>

                                    </div>

                                    <div className="dh-product-comparison-details-panel-user">

                                        {productDetailFields.length >
                                        0 ? (
                                            <div className="dh-product-comparison-details-grid-user">

                                                {productDetailFields.map(
                                                    (
                                                        row,
                                                        index
                                                    ) => (
                                                        <div
                                                            className="dh-product-comparison-details-row-user"
                                                            key={`${row.label}-${index}`}
                                                        >
                                                            <span>
                                                                {
                                                                    row.label
                                                                }
                                                            </span>

                                                            <span>
                                                                {displayValue(
                                                                    row.value,
                                                                    "—"
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}

                                            </div>
                                        ) : (
                                            <div className="dh-product-comparison-empty-user">
                                                No product details available.
                                            </div>
                                        )}

                                    </div>

                                </div>

                                {/* =================================================
                                    FEEDBACK
                                ================================================= */}

                                <div className="dh-product-comparison-section-user">

                                    <div className="dh-product-comparison-section-heading-user">

                                        <div>
                                            <h2>
                                                Feedback
                                            </h2>

                                            <p>
                                                Customer feedback and product rating
                                            </p>
                                        </div>

                                    </div>

                                    <div className="dh-product-comparison-feedback-user">

                                        <div className="dh-product-comparison-feedback-score-user">

                                            <strong>
                                                {product?.rating
                                                    ? Number(
                                                          product.rating
                                                      ).toFixed(
                                                          1
                                                      )
                                                    : "—"}
                                            </strong>

                                            <StarRating
                                                value={
                                                    product?.rating
                                                }
                                            />

                                        </div>

                                        <div className="dh-product-comparison-feedback-text-user">

                                            <strong>
                                                Customer reviews
                                            </strong>

                                            <span>
                                                {product?.reviewCount
                                                    ? `${product.reviewCount} customer reviews`
                                                    : "No customer reviews yet"}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </section>

                        {/* =================================================
                            RIGHT 60%
                        ================================================= */}

                        <section className="dh-product-comparison-right-user">

                            {/* =================================================
                                PRODUCT INFORMATION
                            ================================================= */}

                            <div className="dh-product-comparison-section-user">

                                <div className="dh-product-comparison-section-heading-user">

                                    <div>
                                        <span className="dh-product-comparison-section-eyebrow-user">
                                            PRODUCT OVERVIEW
                                        </span>

                                        <h2>
                                            {productName}
                                        </h2>

                                        <p>
                                            Product information and available configurations.
                                        </p>
                                    </div>

                                </div>

                                <div className="dh-product-comparison-description-panel-user">

                                    <p>
                                        {description}
                                    </p>

                                </div>

                            </div>

                            {/* =================================================
                                VARIANTS
                            ================================================= */}

                            {variantGroups.length >
                                0 && (
                                <div className="dh-product-comparison-section-user">

                                    <div className="dh-product-comparison-section-heading-user">

                                        <div>
                                            <span className="dh-product-comparison-section-eyebrow-user">
                                                CONFIGURATION
                                            </span>

                                            <h2>
                                                Choose Variant
                                            </h2>

                                            <p>
                                                Select the configuration you want to compare.
                                            </p>
                                        </div>

                                    </div>

                                    <div className="dh-product-comparison-variants-panel-user">

                                        {variantGroups.map(
                                            (
                                                group
                                            ) => (
                                                <div
                                                    className="dh-product-comparison-variant-group-user"
                                                    key={
                                                        group.key
                                                    }
                                                >

                                                    <span className="dh-product-comparison-variant-group-label-user">
                                                        {
                                                            group.label
                                                        }
                                                    </span>

                                                    <div className="dh-product-comparison-variant-options-user">

                                                        {group.options.map(
                                                            (
                                                                option
                                                            ) => {
                                                                const active =
                                                                    selectedAttributes[
                                                                        group.key
                                                                    ] ===
                                                                    option;

                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        key={`${group.key}-${option}`}
                                                                        className={`dh-product-comparison-variant-chip-user ${
                                                                            active
                                                                                ? "dh-product-comparison-active-user"
                                                                                : ""
                                                                        }`}
                                                                        onClick={() =>
                                                                            handleAttributeSelect(
                                                                                group.key,
                                                                                option
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            option
                                                                        }
                                                                    </button>
                                                                );
                                                            }
                                                        )}

                                                    </div>

                                                </div>
                                            )
                                        )}

                                        {/* SELECTED VARIANT */}

                                        <div className="dh-product-comparison-variant-summary-user">

                                            <div>

                                                <span className="dh-product-comparison-variant-summary-label-user">
                                                    Selected configuration
                                                </span>

                                                <div className="dh-product-comparison-variant-summary-name-user">
                                                    {
                                                        selectedVariantText
                                                    }
                                                </div>

                                            </div>

                                            <div className="dh-product-comparison-variant-summary-price-user">

                                                <strong>
                                                    {formatINR(
                                                        displayPrice
                                                    )}
                                                </strong>

                                                {displayOriginalPrice >
                                                    displayPrice && (
                                                    <del>
                                                        {formatINR(
                                                            displayOriginalPrice
                                                        )}
                                                    </del>
                                                )}

                                                {savePercent >
                                                    0 && (
                                                    <span className="dh-product-comparison-variant-save-badge-user">
                                                        SAVE{" "}
                                                        {
                                                            savePercent
                                                        }
                                                        %
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* =================================================
                                COLOR OPTIONS
                            ================================================= */}

                            {colorOptions.length >
                                0 && (
                                <div className="dh-product-comparison-section-user">

                                    <div className="dh-product-comparison-section-heading-user">

                                        <div>
                                            <span className="dh-product-comparison-section-eyebrow-user">
                                                COLOR
                                            </span>

                                            <h2>
                                                Available Colors
                                            </h2>
                                        </div>

                                    </div>

                                    <div className="dh-product-comparison-color-options-user">

                                        {colorOptions.map(
                                            (
                                                color,
                                                index
                                            ) => (
                                                <div
                                                    className="dh-product-comparison-color-option-user"
                                                    key={
                                                        color.id ??
                                                        `${color.name}-${index}`
                                                    }
                                                >

                                                    <span
                                                        className="dh-product-comparison-color-swatch-user"
                                                        style={{
                                                            backgroundColor:
                                                                color.hexCode ||
                                                                "#cccccc",
                                                        }}
                                                    />

                                                    <span>
                                                        {
                                                            color.name
                                                        }
                                                    </span>

                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                            {/* =================================================
                                PRICE SUMMARY
                            ================================================= */}

                            <div className="dh-product-comparison-price-card-user">

                                <div className="dh-product-comparison-price-content-user">

                                    <span>
                                        Current best price
                                    </span>

                                    <strong>
                                        {formatINR(
                                            lowestPrice ||
                                                displayPrice
                                        )}
                                    </strong>

                                    {displayOriginalPrice >
                                        displayPrice && (
                                        <del>
                                            {formatINR(
                                                displayOriginalPrice
                                            )}
                                        </del>
                                    )}

                                </div>

                                <div className="dh-product-comparison-price-note-user">

                                    <FiCheckCircle />

                                    <span>
                                        Compare prices from multiple vendors
                                    </span>

                                </div>

                            </div>

                            {/* =================================================
                                ACTION BUTTONS
                            ================================================= */}

                            <div className="dh-product-comparison-product-actions-user">

                                <button
                                    type="button"
                                    className="dh-product-comparison-action-button-user dh-product-comparison-action-button-cart-user"
                                    onClick={() =>
                                        handleAddToCart(
                                            selectedVendor
                                        )
                                    }
                                >
                                    <FiShoppingCart />
                                    Add to Cart
                                </button>

                                <button
                                    type="button"
                                    className="dh-product-comparison-action-button-user dh-product-comparison-action-button-buy-user"
                                    onClick={() =>
                                        handleBuyNow(
                                            selectedVendor
                                        )
                                    }
                                >
                                    Buy Now
                                    <FiArrowRight />
                                </button>

                                <button
                                    type="button"
                                    className="dh-product-comparison-action-button-user dh-product-comparison-action-button-visit-user"
                                    onClick={
                                        handleBookVisit
                                    }
                                >
                                    <FiTruck />
                                    Book Visit
                                </button>

                            </div>

                            {/* =================================================
                                VIEW DETAILED COMPARISON
                            ================================================= */}

                            <div className="dh-product-comparison-reveal-wrap-user">

                                <button
                                    type="button"
                                    className="dh-product-comparison-reveal-button-user"
                                    onClick={() =>
                                        setShowVendorComparison(
                                            true
                                        )
                                    }
                                >
                                    <span>
                                        View Detailed Comparison
                                    </span>

                                    <FiArrowRight />
                                </button>

                            </div>

                            {/* =================================================
                                SELECTED VENDOR
                            ================================================= */}

                            {selectedVendor && (
                                <div className="dh-product-comparison-selected-vendor-user">

                                    <div className="dh-product-comparison-selected-vendor-heading-user">

                                        <span>
                                            Selected vendor
                                        </span>

                                        <FiCheckCircle />

                                    </div>

                                    <strong>
                                        {displayValue(
                                            selectedVendor.vendorName ||
                                                selectedVendor.shopName ||
                                                selectedVendor.storeName ||
                                                selectedVendor.name,
                                            "Vendor"
                                        )}
                                    </strong>

                                    <div className="dh-product-comparison-selected-vendor-price-user">
                                        {formatINR(
                                            selectedVendor.sellingPrice ??
                                                selectedVendor.price ??
                                                selectedVendor.finalPrice ??
                                                displayPrice
                                        )}
                                    </div>

                                </div>
                            )}

                        </section>

                    </div>

                </main>

            </div>

            {/* =============================================================
                GOLD TOP-RIGHT DRAWER HANDLE
            ============================================================= */}

            <button
                type="button"
                className="dh-pc-vendor-handle-user"
                onClick={() =>
                    setShowVendorComparison(
                        true
                    )
                }
                aria-label="Open vendor comparison"
            >
                <span className="dh-pc-vendor-handle-arrow-user">
                    &lt;────────
                </span>

                <span className="dh-pc-vendor-handle-label-user">
                    Compare
                </span>
            </button>

            {/* =============================================================
                VENDOR COMPARISON DRAWER
            ============================================================= */}

            {showVendorComparison && (
                <>
                    <button
                        type="button"
                        className="dh-pc-drawer-overlay-user"
                        onClick={
                            handleCloseVendorComparison
                        }
                        aria-label="Close vendor comparison"
                    />

                    <aside className="dh-pc-vendor-drawer-user">

                        {/* =================================================
                            DRAWER HEADER
                        ================================================= */}

                        <div className="dh-pc-vendor-drawer-header-user">

                            <div>

                                <span className="dh-pc-vendor-drawer-eyebrow-user">
                                    PRICE COMPARISON
                                </span>

                                <h2>
                                    Top 5 Vendors
                                </h2>

                                <p>
                                    Compare the best available prices for this product.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="dh-pc-vendor-drawer-close-user"
                                onClick={
                                    handleCloseVendorComparison
                                }
                                aria-label="Close comparison"
                            >
                                <FiX />
                            </button>

                        </div>

                        {/* =================================================
                            DRAWER BODY
                        ================================================= */}

                        <div className="dh-pc-vendor-drawer-body-user">

                            {top5Vendors.length >
                            0 ? (
                                top5Vendors.map(
                                    (
                                        vendor,
                                        index
                                    ) => {
                                        const vendorPrice =
                                            Number(
                                                vendor?.sellingPrice
                                            ) ||
                                            Number(
                                                vendor?.price
                                            ) ||
                                            Number(
                                                vendor?.finalPrice
                                            ) ||
                                            0;

                                        const vendorOriginalPrice =
                                            Number(
                                                vendor?.originalPrice
                                            ) ||
                                            Number(
                                                vendor?.mrp
                                            ) ||
                                            Number(
                                                vendor?.basePrice
                                            ) ||
                                            0;

                                        const vendorId =
                                            vendor?.inventoryId ??
                                            vendor?.id ??
                                            vendor?.vendorId ??
                                            index;

                                        const selectedId =
                                            selectedVendor?.inventoryId ??
                                            selectedVendor?.id ??
                                            null;

                                        const currentVendorId =
                                            vendor?.inventoryId ??
                                            vendor?.id ??
                                            vendor?.vendorId ??
                                            null;

                                        const isSelected =
                                            selectedId !==
                                                null &&
                                            selectedId ===
                                                currentVendorId;

                                        return (
                                            <div
                                                key={
                                                    vendorId
                                                }
                                                className={`dh-product-comparison-rank-card-user ${
                                                    index ===
                                                    0
                                                        ? "dh-product-comparison-best-user"
                                                        : ""
                                                } ${
                                                    isSelected
                                                        ? "dh-product-comparison-selected-user"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleSelectVendor(
                                                        vendor
                                                    )
                                                }
                                            >

                                                {/* RANK */}

                                                <div className="dh-product-comparison-rank-top-row-user">

                                                    <span className="dh-product-comparison-rank-number-user">
                                                        #
                                                        {
                                                            index +
                                                            1
                                                        }
                                                    </span>

                                                    {index ===
                                                        0 && (
                                                        <span className="dh-product-comparison-best-badge-user">
                                                            BEST PRICE
                                                        </span>
                                                    )}

                                                </div>

                                                {/* VENDOR */}

                                                <div className="dh-product-comparison-rank-shop-user">

                                                    {displayValue(
                                                        vendor?.vendorName ||
                                                            vendor?.shopName ||
                                                            vendor?.storeName ||
                                                            vendor?.name,
                                                        "Vendor"
                                                    )}

                                                </div>

                                                {/* RATING */}

                                                <div className="dh-product-comparison-rank-meta-user">

                                                    {vendor?.rating
                                                        ? `★ ${Number(
                                                              vendor.rating
                                                          ).toFixed(
                                                              1
                                                          )}`
                                                        : "Verified vendor"}

                                                </div>

                                                {/* GOLD PRICE BOX */}

                                                <div className="dh-pc-vendor-price-box-user">

                                                    <span>
                                                        DEAL PRICE
                                                    </span>

                                                    <strong>
                                                        {formatINR(
                                                            vendorPrice
                                                        )}
                                                    </strong>

                                                </div>

                                                {/* OLD PRICE */}

                                                {vendorOriginalPrice >
                                                    vendorPrice && (
                                                    <div className="dh-product-comparison-rank-old-price-user">

                                                        {formatINR(
                                                            vendorOriginalPrice
                                                        )}

                                                    </div>
                                                )}

                                                {/* STOCK */}

                                                <div className="dh-product-comparison-rank-stock-user">

                                                    {Number(
                                                        vendor?.stock ??
                                                            0
                                                    ) >
                                                        0 ||
                                                    vendor?.available ? (
                                                        <>
                                                            <FiCheckCircle />

                                                            {Number(
                                                                vendor?.stock ??
                                                                    0
                                                            ) >
                                                            0
                                                                ? `${vendor.stock} available`
                                                                : "In stock"}
                                                        </>
                                                    ) : (
                                                        "Currently unavailable"
                                                    )}

                                                </div>

                                                {/* SELECT VENDOR */}

                                                <button
                                                    type="button"
                                                    className="dh-product-comparison-rank-button-user"
                                                    onClick={(
                                                        event
                                                    ) => {
                                                        event.stopPropagation();

                                                        handleSelectVendor(
                                                            vendor
                                                        );
                                                    }}
                                                >
                                                    Select Vendor
                                                    <FiArrowRight />
                                                </button>

                                            </div>
                                        );
                                    }
                                )
                            ) : (
                                <div className="dh-pc-vendor-empty-user">

                                    <div className="dh-pc-vendor-empty-icon-user">
                                        <FiMapPin />
                                    </div>

                                    <h3>
                                        No vendors available
                                    </h3>

                                    <p>
                                        There are no vendor prices available for this product right now.
                                    </p>

                                </div>
                            )}

                        </div>

                    </aside>
                </>
            )}

        </div>
    );
}

export default ProductComparison;