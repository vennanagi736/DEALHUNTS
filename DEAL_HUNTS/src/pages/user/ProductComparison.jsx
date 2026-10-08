import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

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
    FiStar,
} from "react-icons/fi";

import "../../styles/UProductComparison.css";

/* ============================================================
   API
============================================================ */

const API_BASE_URL =
    "http://localhost:8080";

/* ============================================================
   FORMAT / SAFE HELPERS
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

function displayValue(
    value,
    fallback = "—"
) {
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
            value?.storeName ||
            value?.vendorName ||
            fallback
        );
    }

    return String(value);
}

/* ============================================================
   IMAGE HELPERS
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

function collectImages(product) {
    if (!product) {
        return [];
    }

    if (
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {
        const productImages =
            product.images
                .map((image) =>
                    toImageUrl(image)
                )
                .filter(Boolean);

        return Array.from(
            new Set(productImages)
        );
    }

    if (product.thumbnailUrl) {
        return [
            product.thumbnailUrl,
        ];
    }

    if (product.imageUrl) {
        return [
            product.imageUrl,
        ];
    }

    if (product.image) {
        return [
            product.image,
        ];
    }

    return [];
}

/* ============================================================
   VARIANT NORMALIZATION
============================================================ */

function getProductVariants(product) {
    if (!product) {
        return [];
    }

    if (
        Array.isArray(
            product.variants
        )
    ) {
        return product.variants;
    }

    if (
        Array.isArray(
            product.productVariants
        )
    ) {
        return product.productVariants;
    }

    if (
        Array.isArray(
            product.variantList
        )
    ) {
        return product.variantList;
    }

    if (
        product.variant &&
        typeof product.variant ===
            "object"
    ) {
        return [
            product.variant,
        ];
    }

    return [];
}

/* ============================================================
   ATTRIBUTE HELPERS
============================================================ */

function getAttributeName(
    attributeValue
) {
    if (!attributeValue) {
        return "";
    }

    if (attributeValue?.attribute) {
        return (
            attributeValue.attribute
                .name ||
            attributeValue.attribute
                .title ||
            ""
        );
    }

    return (
        attributeValue?.name ||
        attributeValue?.attributeName ||
        attributeValue?.attribute?.name ||
        ""
    );
}

function getAttributeValue(
    attributeValue
) {
    if (!attributeValue) {
        return "";
    }

    if (
        attributeValue?.value !==
            undefined &&
        attributeValue?.value !==
            null
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

function getVariantAttributes(
    variant
) {
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
                name:
                    getAttributeName(
                        item
                    ),
                value:
                    getAttributeValue(
                        item
                    ),
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
                name:
                    getAttributeName(
                        item
                    ),
                value:
                    getAttributeValue(
                        item
                    ),
            }))
            .filter(
                (item) =>
                    item.name &&
                    item.value
            );
    }

    if (
        variant.attributes &&
        typeof variant.attributes ===
            "object" &&
        !Array.isArray(
            variant.attributes
        )
    ) {
        return Object.entries(
            variant.attributes
        )
            .map(
                ([name, value]) => ({
                    name,
                    value:
                        displayValue(
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

    const directFields = [];

    const ignoredKeys =
        new Set([
            "id",
            "variantId",
            "price",
            "sellingPrice",
            "finalPrice",
            "basePrice",
            "mrp",
            "originalPrice",
            "stock",
            "quantity",
            "colors",
            "colours",
            "images",
            "image",
            "imageUrl",
            "thumbnailUrl",
            "sku",
            "active",
            "enabled",
        ]);

    Object.entries(
        variant
    ).forEach(
        ([key, value]) => {
            if (
                ignoredKeys.has(key)
            ) {
                return;
            }

            if (
                value === null ||
                value ===
                    undefined ||
                value === ""
            ) {
                return;
            }

            if (
                typeof value ===
                "object"
            ) {
                return;
            }

            directFields.push({
                name: key,
                value: String(value),
            });
        }
    );

    return directFields;
}

/* ============================================================
   COLOR HELPERS
============================================================ */

function getVariantColors(
    variant
) {
    if (!variant) {
        return [];
    }

    const rawColors =
        Array.isArray(
            variant.colors
        )
            ? variant.colors
            : Array.isArray(
                  variant.colours
              )
            ? variant.colours
            : [];

    return rawColors
        .map((color) => ({
            id:
                color?.id ??
                color?.colorId ??
                null,

            name:
                color?.name ||
                color?.colorName ||
                color?.colourName ||
                "",

            hexCode:
                color?.hexCode ||
                color?.hex ||
                color?.colourCode ||
                "",

            price:
                color?.price ??
                color?.sellingPrice ??
                null,

            originalPrice:
                color?.originalPrice ??
                color?.mrp ??
                null,
        }))
        .filter(
            (color) =>
                color.name
        );
}

/* ============================================================
   VARIANT PRICE
============================================================ */

function getVariantPrice(
    variant
) {
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
            variant.finalPrice
        ) ||
        Number(
            variant.basePrice
        ) ||
        0
    );
}

function getVariantOriginalPrice(
    variant
) {
    if (!variant) {
        return 0;
    }

    return (
        Number(
            variant.originalPrice
        ) ||
        Number(
            variant.mrp
        ) ||
        Number(
            variant.basePrice
        ) ||
        0
    );
}

function getProductPrice(
    product
) {
    if (!product) {
        return 0;
    }

    return (
        Number(
            product.basePrice
        ) ||
        Number(product.price) ||
        Number(
            product.sellingPrice
        ) ||
        Number(
            product.finalPrice
        ) ||
        0
    );
}

/* ============================================================
   BUILD VARIANT GROUPS
============================================================ */

function buildVariantGroups(
    variants
) {
    if (
        !Array.isArray(variants) ||
        variants.length === 0
    ) {
        return [];
    }

    const groupOrder = [];
    const groupValues = {};

    variants.forEach(
        (variant) => {
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
                        String(
                            name
                        )
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
                            label:
                                name,
                            options:
                                [],
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
        }
    );

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

function buildColorOptions(
    variants
) {
    if (
        !Array.isArray(variants)
    ) {
        return [];
    }

    const colors = [];

    variants.forEach(
        (variant) => {
            getVariantColors(
                variant
            ).forEach(
                (color) => {
                    const exists =
                        colors.some(
                            (item) =>
                                (
                                    item.id &&
                                    color.id &&
                                    String(
                                        item.id
                                    ) ===
                                        String(
                                            color.id
                                        )
                                ) ||
                                (
                                    item.name &&
                                    color.name &&
                                    item.name
                                        .toLowerCase() ===
                                        color.name
                                            .toLowerCase()
                                )
                        );

                    if (
                        !exists
                    ) {
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
   MATCH COLOR TO VARIANT
============================================================ */

function variantMatchesColor(
    variant,
    selectedColor
) {
    if (!selectedColor) {
        return true;
    }

    const colors =
        getVariantColors(
            variant
        );

    if (
        colors.length === 0
    ) {
        return true;
    }

    return colors.some(
        (color) =>
            (
                color.id &&
                selectedColor.id &&
                String(
                    color.id
                ) ===
                    String(
                        selectedColor.id
                    )
            ) ||
            (
                color.name &&
                selectedColor.name &&
                color.name
                    .toLowerCase() ===
                    selectedColor.name
                        .toLowerCase()
            )
    );
}

/* ============================================================
   RESOLVE SELECTED VARIANT
============================================================ */

function resolveSelectedVariant(
    variants,
    selection,
    selectedColor
) {
    if (
        !Array.isArray(variants) ||
        variants.length === 0
    ) {
        return null;
    }

    if (
        variants.length === 1
    ) {
        return variants[0];
    }

    const selectedEntries =
        Object.entries(
            selection || {}
        );

    const exact =
        variants.find(
            (variant) => {
                const attributes =
                    getVariantAttributes(
                        variant
                    );

                const attributesMatch =
                    selectedEntries.every(
                        ([
                            key,
                            selectedValue,
                        ]) => {
                            const attribute =
                                attributes.find(
                                    (
                                        item
                                    ) =>
                                        String(
                                            item.name
                                        )
                                            .trim()
                                            .toLowerCase() ===
                                        String(
                                            key
                                        )
                                            .trim()
                                            .toLowerCase()
                                );

                            return (
                                attribute &&
                                String(
                                    attribute.value
                                ) ===
                                    String(
                                        selectedValue
                                    )
                            );
                        }
                    );

                if (
                    !attributesMatch
                ) {
                    return false;
                }

                return variantMatchesColor(
                    variant,
                    selectedColor
                );
            }
        );

    if (exact) {
        return exact;
    }

    const attributeMatch =
        variants.find(
            (variant) => {
                const attributes =
                    getVariantAttributes(
                        variant
                    );

                return selectedEntries.every(
                    ([
                        key,
                        selectedValue,
                    ]) => {
                        const attribute =
                            attributes.find(
                                (
                                    item
                                ) =>
                                    String(
                                        item.name
                                    )
                                        .trim()
                                        .toLowerCase() ===
                                    String(
                                        key
                                    )
                                        .trim()
                                        .toLowerCase()
                            );

                        return (
                            attribute &&
                            String(
                                attribute.value
                            ) ===
                                String(
                                    selectedValue
                                )
                        );
                    }
                );
            }
        );

    if (
        attributeMatch
    ) {
        return attributeMatch;
    }

    return variants[0];
}

/* ============================================================
   GET SELECTED COLOR PRICE
============================================================ */

function getSelectedColorPrice(
    variant,
    selectedColor
) {
    if (
        !variant ||
        !selectedColor
    ) {
        return 0;
    }

    const colors =
        getVariantColors(
            variant
        );

    const matchingColor =
        colors.find(
            (color) =>
                (
                    color.id &&
                    selectedColor.id &&
                    String(
                        color.id
                    ) ===
                        String(
                            selectedColor.id
                        )
                ) ||
                (
                    color.name &&
                    selectedColor.name &&
                    color.name
                        .toLowerCase() ===
                        selectedColor.name
                            .toLowerCase()
                )
        );

    return (
        Number(
            matchingColor?.price
        ) || 0
    );
}

function getSelectedColorOriginalPrice(
    variant,
    selectedColor
) {
    if (
        !variant ||
        !selectedColor
    ) {
        return 0;
    }

    const colors =
        getVariantColors(
            variant
        );

    const matchingColor =
        colors.find(
            (color) =>
                (
                    color.id &&
                    selectedColor.id &&
                    String(
                        color.id
                    ) ===
                        String(
                            selectedColor.id
                        )
                ) ||
                (
                    color.name &&
                    selectedColor.name &&
                    color.name
                        .toLowerCase() ===
                        selectedColor.name
                            .toLowerCase()
                )
        );

    return (
        Number(
            matchingColor?.originalPrice
        ) || 0
    );
}

/* ============================================================
   VENDOR NORMALIZATION
============================================================ */

function normalizeVendorResponse(
    responseData
) {
    if (
        Array.isArray(
            responseData
        )
    ) {
        return responseData;
    }

    if (
        Array.isArray(
            responseData?.content
        )
    ) {
        return responseData.content;
    }

    if (
        Array.isArray(
            responseData?.vendors
        )
    ) {
        return responseData.vendors;
    }

    if (
        Array.isArray(
            responseData?.data
        )
    ) {
        return responseData.data;
    }

    if (
        Array.isArray(
            responseData?.inventory
        )
    ) {
        return responseData.inventory;
    }

    if (
        Array.isArray(
            responseData?.inventories
        )
    ) {
        return responseData.inventories;
    }

    if (
        responseData &&
        typeof responseData ===
            "object" &&
        (
            responseData.vendorId ||
            responseData.vendorName ||
            responseData.shopName ||
            responseData.storeName ||
            responseData.inventoryId
        )
    ) {
        return [
            responseData,
        ];
    }

    return [];
}

function getVendorName(
    vendor
) {
    return displayValue(
        vendor?.vendorName ||
            vendor?.shopName ||
            vendor?.storeName ||
            vendor?.businessName ||
            vendor?.shop?.name ||
            vendor?.store?.name ||
            vendor?.vendor?.name ||
            vendor?.vendor?.shopName ||
            vendor?.name,
        "Local Shop"
    );
}

function getVendorPrice(
    vendor
) {
    return (
        Number(
            vendor?.sellingPrice
        ) ||
        Number(
            vendor?.price
        ) ||
        Number(
            vendor?.finalPrice
        ) ||
        Number(
            vendor?.dealPrice
        ) ||
        0
    );
}

function getVendorOriginalPrice(
    vendor
) {
    return (
        Number(
            vendor?.originalPrice
        ) ||
        Number(
            vendor?.mrp
        ) ||
        Number(
            vendor?.basePrice
        ) ||
        0
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
   PRODUCT COMPARISON
============================================================ */

function ProductComparison() {
    const {
        productId: id,
    } = useParams();

    const navigate =
        useNavigate();

    const [product, setProduct] =
        useState(null);

    const [vendors, setVendors] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [
        activeImageIndex,
        setActiveImageIndex,
    ] = useState(0);

    const [
        selectedAttributes,
        setSelectedAttributes,
    ] = useState({});

    const [
        selectedColorKey,
        setSelectedColorKey,
    ] = useState("");

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
                    setLoading(true);
                    setError("");

                    const response =
                        await axios.get(
                            `${API_BASE_URL}/admin/products/${id}`
                        );

                    const data =
                        response?.data
                            ?.content ??
                        response?.data ??
                        null;

                    setProduct(data);

                    const variants =
                        getProductVariants(
                            data
                        );

                    const groups =
                        buildVariantGroups(
                            variants
                        );

                    const defaults = {};

                    groups.forEach(
                        (group) => {
                            if (
                                group
                                    .options
                                    ?.length >
                                0
                            ) {
                                defaults[
                                    group.key
                                ] =
                                    group.options[0];
                            }
                        }
                    );

                    setSelectedAttributes(
                        defaults
                    );

                    const initialColors =
                        buildColorOptions(
                            variants
                        );

                    if (
                        initialColors.length >
                        0
                    ) {
                        setSelectedColorKey(
                            String(
                                initialColors[0]
                                    .id ??
                                    initialColors[0]
                                        .name
                            )
                        );
                    } else {
                        setSelectedColorKey(
                            ""
                        );
                    }

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
                        fetchError?.response
                            ?.data
                    );

                    setError(
                        "Unable to load this product. Please try again."
                    );
                } finally {
                    setLoading(false);
                }
            };

        if (id) {
            fetchProduct();
        } else {
            setLoading(false);

            setError(
                "Product ID is missing."
            );
        }
    }, [id]);

    /* ==========================================================
       FETCH VENDORS / LOCAL SHOPS
    ========================================================== */

    useEffect(() => {
        const fetchVendors =
            async () => {
                try {
                    const response =
                        await axios.get(
                            `${API_BASE_URL}/inventory/product/${id}/vendors`
                        );

                    console.log(
                        "Product vendor response:",
                        response?.data
                    );

                    const list =
                        normalizeVendorResponse(
                            response?.data
                        );

                    const validVendors =
                        list.filter(
                            (vendor) =>
                                vendor &&
                                typeof vendor ===
                                    "object"
                        );

                    const sorted =
                        [
                            ...validVendors,
                        ].sort(
                            (
                                a,
                                b
                            ) => {
                                const priceA =
                                    getVendorPrice(
                                        a
                                    ) ||
                                    Number.MAX_SAFE_INTEGER;

                                const priceB =
                                    getVendorPrice(
                                        b
                                    ) ||
                                    Number.MAX_SAFE_INTEGER;

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
                    } else {
                        setSelectedVendorId(
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
                        "Vendor API response:",
                        fetchError?.response
                            ?.data
                    );

                    setVendors([]);
                    setSelectedVendorId(
                        null
                    );
                }
            };

        if (id) {
            fetchVendors();
        }
    }, [id]);

    /* ==========================================================
       IMAGES
    ========================================================== */

    const images =
        useMemo(
            () =>
                collectImages(
                    product
                ),
            [product]
        );

    useEffect(() => {
        setActiveImageIndex(
            (previous) => {
                if (
                    images.length ===
                    0
                ) {
                    return 0;
                }

                return Math.min(
                    previous,
                    images.length -
                        1
                );
            }
        );
    }, [images.length]);

    useEffect(() => {
        if (
            images.length <= 1
        ) {
            return undefined;
        }

        const timer =
            setInterval(
                () => {
                    setActiveImageIndex(
                        (previous) =>
                            previous >=
                            images.length -
                                1
                                ? 0
                                : previous +
                                  1
                    );
                },
                5000
            );

        return () =>
            clearInterval(
                timer
            );
    }, [images.length]);

    /* ==========================================================
       VARIANTS
    ========================================================== */

    const productVariants =
        useMemo(
            () =>
                getProductVariants(
                    product
                ),
            [product]
        );

    const variantGroups =
        useMemo(
            () =>
                buildVariantGroups(
                    productVariants
                ),
            [productVariants]
        );

    const colorOptions =
        useMemo(
            () =>
                buildColorOptions(
                    productVariants
                ),
            [productVariants]
        );

    const hasConfiguration =
        productVariants.length >
            0 ||
        colorOptions.length > 0;

    const selectedColor =
        useMemo(
            () =>
                colorOptions.find(
                    (color) =>
                        String(
                            color.id ??
                                color.name
                        ) ===
                        String(
                            selectedColorKey
                        )
                ) ||
                colorOptions[0] ||
                null,
            [
                colorOptions,
                selectedColorKey,
            ]
        );

    const selectedVariant =
        useMemo(
            () =>
                resolveSelectedVariant(
                    productVariants,
                    selectedAttributes,
                    selectedColor
                ),
            [
                productVariants,
                selectedAttributes,
                selectedColor,
            ]
        );

    /* ==========================================================
       SELECTED VARIANT PRICE
    ========================================================== */

    const variantPrice =
        getVariantPrice(
            selectedVariant
        );

    const selectedColorPrice =
        getSelectedColorPrice(
            selectedVariant,
            selectedColor
        );

    const productBasePrice =
        getProductPrice(
            product
        );

    const displayPrice =
        selectedColorPrice > 0
            ? selectedColorPrice
            : variantPrice > 0
            ? variantPrice
            : productBasePrice;

    const variantOriginalPrice =
        getVariantOriginalPrice(
            selectedVariant
        );

    const selectedColorOriginalPrice =
        getSelectedColorOriginalPrice(
            selectedVariant,
            selectedColor
        );

    const displayOriginalPrice =
        selectedColorOriginalPrice >
        displayPrice
            ? selectedColorOriginalPrice
            : variantOriginalPrice >
              displayPrice
            ? variantOriginalPrice
            : Number(
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

    /* ==========================================================
       BOOK VISIT
    ========================================================== */

    const handleBookVisit =
        () => {
            const token =
                localStorage.getItem(
                    "userJwtToken"
                ) ||
                localStorage.getItem(
                    "jwtToken"
                );

            const bookVisitState = {
                productId:
                    product?.id ??
                    id,

                variantId:
                    selectedVariant?.id ??
                    selectedVariant?.variantId ??
                    null,

                colorId:
                    selectedColor?.id ??
                    selectedColor?.colorId ??
                    null,

                variant:
                    selectedVariant
                        ? getVariantAttributes(
                              selectedVariant
                          )
                              .map(
                                  (
                                      item
                                  ) =>
                                      item.value
                              )
                              .filter(
                                  Boolean
                              )
                              .join(
                                  " / "
                              )
                        : null,

                color:
                    selectedColor?.name ??
                    null,

                price:
                    displayPrice,
            };

            if (!token) {
                navigate(
                    "/login",
                    {
                        state: {
                            from:
                                "/book-visit",
                            bookVisitState,
                        },
                    }
                );

                return;
            }

            navigate(
                "/book-visit",
                {
                    state:
                        bookVisitState,
                }
            );
        };

    /* ==========================================================
       VENDORS
    ========================================================== */

    const top5Vendors =
        vendors.slice(0, 5);

    const selectedVendor =
        useMemo(() => {
            if (
                !Array.isArray(
                    vendors
                ) ||
                vendors.length === 0
            ) {
                return null;
            }

            return (
                vendors.find(
                    (vendor) =>
                        String(
                            vendor?.inventoryId ??
                                vendor?.id
                        ) ===
                        String(
                            selectedVendorId
                        )
                ) ||
                vendors[0]
            );
        }, [
            vendors,
            selectedVendorId,
        ]);

    /* ==========================================================
       SELECTED VARIANT TEXT
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
                (item) =>
                    item.value
            )
            .filter(Boolean)
            .join(" / ") ||
        (
            productVariants.length ===
            1
                ? "Single available variant"
                : "Standard"
        );

    /* ==========================================================
       ATTRIBUTE SELECTION
    ========================================================== */

    const handleAttributeSelect =
        (
            groupKey,
            value
        ) => {
            setSelectedAttributes(
                (previous) => ({
                    ...previous,
                    [groupKey]:
                        value,
                })
            );
        };

    /* ==========================================================
       COLOR SELECTION
    ========================================================== */

    const handleColorSelect =
        (color) => {
            if (!color) {
                return;
            }

            const colorKey =
                String(
                    color.id ??
                        color.name ??
                        ""
                );

            setSelectedColorKey(
                colorKey
            );

            const matchingVariant =
                productVariants.find(
                    (variant) =>
                        variantMatchesColor(
                            variant,
                            color
                        )
                );

            if (
                matchingVariant
            ) {
                const attributes =
                    getVariantAttributes(
                        matchingVariant
                    );

                const nextAttributes =
                    {};

                attributes.forEach(
                    ({
                        name,
                        value,
                    }) => {
                        nextAttributes[
                            String(
                                name
                            )
                                .trim()
                                .toLowerCase()
                        ] = value;
                    }
                );

                setSelectedAttributes(
                    (previous) => ({
                        ...previous,
                        ...nextAttributes,
                    })
                );
            }
        };

    /* ==========================================================
       VENDOR SELECTION
    ========================================================== */

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
                (previous) =>
                    previous === 0
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
                (previous) =>
                    previous ===
                    images.length - 1
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
                    "Please select a shop before adding this product to cart."
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

                if (
                    cartError
                        ?.response
                        ?.status ===
                        401 ||
                    cartError
                        ?.response
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

                const message =
                    typeof cartError
                        ?.response
                        ?.data ===
                    "string"
                        ? cartError
                              .response
                              .data
                        : cartError
                              ?.response
                              ?.data
                              ?.message ||
                          "Unable to add product to cart.";

                alert(message);
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
                    "Please select a shop before continuing."
                );

                return;
            }

            navigate(
                "/checkout",
                {
                    state: {
                        productId:
                            product?.id ??
                            id,

                        inventoryId,

                        variantId:
                            selectedVariant?.id ??
                            selectedVariant?.variantId ??
                            null,

                        colorId:
                            selectedColor?.id ??
                            selectedColor?.colorId ??
                            null,

                        price:
                            displayPrice,
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

    const description =
        product.description ||
        product.productDescription ||
        "Explore this product, compare local shop prices, and choose the deal that works best for you.";

    const activeImage =
        images[
            activeImageIndex
        ] || "";

    /* ==========================================================
       PRODUCT DETAILS
    ========================================================== */

    const productDetailFields =
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
        ]
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

    /* ==========================================================
       SPECIFICATIONS
    ========================================================== */

    let specificationEntries =
        [];

    if (
        product?.specifications &&
        typeof product.specifications ===
            "object" &&
        !Array.isArray(
            product.specifications
        )
    ) {
        specificationEntries =
            Object.entries(
                product.specifications
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
    } else if (
        Array.isArray(
            product?.attributeValues
        )
    ) {
        specificationEntries =
            product.attributeValues
                .map(
                    (item) => [
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

    /* ==========================================================
       PRODUCT RATING
    ========================================================== */

    const productRating =
        Number(
            product?.rating
        ) || 0;

    const reviewCount =
        Number(
            product?.reviewCount
        ) || 0;

    return (
        <div className="dh-product-comparison-page-user">

            <main className="dh-product-comparison-main-user dh-pc-modern-main-user">

                {/* =====================================================
                    PAGE HEADING
                ===================================================== */}

                <div className="dh-pc-page-heading-user">

                    <div className="dh-pc-page-heading-content-user">

                    </div>

                </div>

                {/* =====================================================
                    WORKSPACE
                ===================================================== */}

                <div className="dh-pc-workspace-user">

                    {/* =================================================
                        LEFT PRODUCT AREA
                    ================================================= */}

                    <aside className="dh-pc-left-fixed-user">

                        <div className="dh-pc-gallery-card-user">

                            {/* BACK */}
                            <button
                                type="button"
                                className="dh-pc-product-back-button-user"
                                onClick={() =>
                                    navigate(
                                        -1
                                    )
                                }
                                aria-label="Go back"
                                title="Go back"
                            >
                                <FiArrowLeft />
                            </button>

                            {/* SMALL BRAND LABEL */}
                            <div className="dh-pc-gallery-label-user">
                                {brandName ||
                                    "DEALHUNTS"}
                            </div>

                            {/* PRODUCT INTRO */}
                            <div className="dh-pc-gallery-intro-user">
                            </div>

                            {/* IMAGE */}
                            <div className="dh-pc-gallery-main-user">

                                {activeImage ? (
                                    <img
                                        key={
                                            activeImage
                                        }
                                        src={
                                            activeImage
                                        }
                                        alt={
                                            productName
                                        }
                                    />
                                ) : (
                                    <div className="dh-product-comparison-gallery-placeholder-user">
                                        No product image
                                        available
                                    </div>
                                )}

                                {/* IMAGE NAVIGATION */}
                                {images.length >
                                    1 && (
                                    <>
                                        <button
                                            type="button"
                                            className="dh-pc-gallery-arrow-user dh-pc-gallery-prev-user"
                                            onClick={
                                                showPreviousImage
                                            }
                                            aria-label="Previous image"
                                        >
                                            <FiChevronLeft />
                                        </button>

                                        <button
                                            type="button"
                                            className="dh-pc-gallery-arrow-user dh-pc-gallery-next-user"
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
                                <div className="dh-pc-gallery-thumbs-user">

                                    {images.map(
                                        (
                                            image,
                                            index
                                        ) => (
                                            <button
                                                type="button"
                                                key={`${image}-${index}`}
                                                className={`dh-pc-gallery-thumb-user ${
                                                    activeImageIndex ===
                                                    index
                                                        ? "is-active"
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
                                                    alt={`${productName} ${
                                                        index +
                                                        1
                                                    }`}
                                                />
                                            </button>
                                        )
                                    )}

                                </div>
                            )}

                            {/* PRODUCT NAME */}
                            <div className="dh-pc-gallery-caption-user">

                                <span className="dh-pc-product-kicker-user">
                                    {brandName ||
                                        "DEALHUNTS PRODUCT"}
                                </span>

                                <h2>
                                    {
                                        productName
                                    }
                                </h2>

                                <p>
                                    {
                                        description
                                    }
                                </p>

                            </div>

                        </div>

                    </aside>

                    {/* =================================================
                        RIGHT SCROLL AREA
                    ================================================= */}

                    <section className="dh-pc-right-scroll-user">

                        {/* =================================================
                            RIGHT SECTION LABEL
                        ================================================= */}

                        <div className="dh-pc-right-topbar-user">

                            <div className="dh-pc-right-title-user">

                                <span className="dh-pc-eyebrow-user">
                                    PRODUCT CONFIGURATION
                                </span>

                            </div>

                        </div>

                        {/* =================================================
                            CONFIGURATION
                        ================================================= */}

                        {hasConfiguration && (
                            <section className="dh-pc-content-card-user">

                                <div className="dh-pc-section-heading-user">

                                    <div>

                                        <h2>
                                            Select your
                                            configuration
                                        </h2>

                                        <p>
                                            Choose the
                                            available options
                                            and colour. The
                                            displayed price
                                            updates with your
                                            selection.
                                        </p>

                                    </div>

                                </div>

                                {/* VARIANT OPTIONS */}

                                {variantGroups.length >
                                    0 ? (
                                    <div className="dh-pc-configuration-groups-user">

                                        {variantGroups.map(
                                            (
                                                group
                                            ) => (
                                                <div
                                                    className="dh-pc-configuration-group-user"
                                                    key={
                                                        group.key
                                                    }
                                                >

                                                    <div className="dh-pc-option-label-user">
                                                        {
                                                            group.label
                                                        }
                                                    </div>

                                                    <div className="dh-pc-option-grid-user">

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
                                                                        className={`dh-pc-option-button-user ${
                                                                            active
                                                                                ? "is-selected"
                                                                                : ""
                                                                        }`}
                                                                        onClick={() =>
                                                                            handleAttributeSelect(
                                                                                group.key,
                                                                                option
                                                                            )
                                                                        }
                                                                    >

                                                                        <span>
                                                                            {
                                                                                option
                                                                            }
                                                                        </span>

                                                                        {active && (
                                                                            <FiCheckCircle />
                                                                        )}

                                                                    </button>
                                                                );
                                                            }
                                                        )}

                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>
                                ) : productVariants.length >
                                  0 ? (
                                    <div className="dh-pc-configuration-groups-user">

                                        <div className="dh-pc-configuration-group-user">

                                            <div className="dh-pc-option-label-user">
                                                Variant
                                            </div>

                                            <div className="dh-pc-option-grid-user">

                                                <button
                                                    type="button"
                                                    className="dh-pc-option-button-user is-selected"
                                                >

                                                    <span>
                                                        {
                                                            selectedVariantText
                                                        }
                                                    </span>

                                                    <FiCheckCircle />

                                                </button>

                                            </div>

                                        </div>

                                    </div>
                                ) : null}

                                {/* COLOURS */}

                                {colorOptions.length >
                                    0 && (
                                    <div className="dh-pc-color-section-user">

                                        <div className="dh-pc-option-label-user">
                                            Colour
                                        </div>

                                        <div className="dh-pc-color-grid-user">

                                            {colorOptions.map(
                                                (
                                                    color,
                                                    index
                                                ) => {
                                                    const colorKey =
                                                        String(
                                                            color.id ??
                                                                color.name
                                                        );

                                                    const active =
                                                        colorKey ===
                                                        String(
                                                            selectedColorKey
                                                        );

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={
                                                                colorKey ||
                                                                `${color.name}-${index}`
                                                            }
                                                            className={`dh-pc-color-button-user ${
                                                                active
                                                                    ? "is-selected"
                                                                    : ""
                                                            }`}
                                                            onClick={() =>
                                                                handleColorSelect(
                                                                    color
                                                                )
                                                            }
                                                            aria-pressed={
                                                                active
                                                            }
                                                            title={
                                                                color.name
                                                            }
                                                        >

                                                            <span
                                                                className="dh-pc-color-swatch-user"
                                                                style={{
                                                                    backgroundColor:
                                                                        color.hexCode ||
                                                                        "#d1d1d1",
                                                                }}
                                                            />

                                                            <span className="dh-pc-color-name-user">
                                                                {
                                                                    color.name
                                                                }
                                                            </span>

                                                            {active && (
                                                                <span className="dh-pc-color-check-user">
                                                                    <FiCheckCircle />
                                                                </span>
                                                            )}

                                                        </button>
                                                    );
                                                }
                                            )}

                                        </div>

                                        {selectedColor && (
                                            <div className="dh-pc-selected-color-user">

                                                <span>
                                                    Selected colour
                                                </span>

                                                <strong>
                                                    {
                                                        selectedColor.name
                                                    }
                                                </strong>

                                            </div>
                                        )}

                                    </div>
                                )}

                                {/* SELECTED CONFIGURATION */}

                                <div className="dh-pc-selected-config-user">

                                    <div>
                                        <span>
                                            Selected
                                            configuration
                                        </span>

                                        <strong>
                                            {
                                                selectedVariantText
                                            }
                                        </strong>
                                    </div>

                                    <div className="dh-pc-selected-config-price-user">

                                        <span>
                                            Current price
                                        </span>

                                        <strong>
                                            {formatINR(
                                                displayPrice
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </section>
                        )}

                        {/* =================================================
                            PRICE + ACTIONS
                        ================================================= */}

                        <section className="dh-pc-content-card-user dh-pc-purchase-card-user">

                            <div className="dh-pc-price-summary-user">

                                <div>

                                    <span className="dh-pc-eyebrow-user">
                                        CURRENT DEAL
                                    </span>

                                    <div className="dh-pc-price-row-user">

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
                                            <span className="dh-pc-save-badge-user">
                                                SAVE{" "}
                                                {
                                                    savePercent
                                                }
                                                %
                                            </span>
                                        )}

                                    </div>

                                    <p>
                                        Price shown for the
                                        currently selected
                                        configuration.
                                    </p>

                                </div>

                                <div className="dh-pc-price-trust-user">

                                    <FiCheckCircle />

                                    <span>
                                        Local shop
                                        availability
                                    </span>

                                </div>

                            </div>

                            {/* ACTION BUTTONS */}

                            <div className="dh-pc-action-grid-user">

                                <button
                                    type="button"
                                    className="dh-pc-action-button-user dh-pc-action-cart-user"
                                    onClick={() =>
                                        handleAddToCart(
                                            selectedVendor
                                        )
                                    }
                                >

                                    <FiShoppingCart />

                                    <span>
                                        Add to Cart
                                    </span>

                                </button>

                                <button
                                    type="button"
                                    className="dh-pc-action-button-user dh-pc-action-buy-user"
                                    onClick={() =>
                                        handleBuyNow(
                                            selectedVendor
                                        )
                                    }
                                >

                                    <span>
                                        Buy Now
                                    </span>

                                    <FiArrowRight />

                                </button>

                                <button
                                    type="button"
                                    className="dh-pc-action-button-user dh-pc-action-visit-user"
                                    onClick={
                                        handleBookVisit
                                    }
                                >

                                    <FiTruck />

                                    <span>
                                        Book Visit
                                    </span>

                                </button>

                            </div>

                        </section>

                        {/* =================================================
                            SELECTED LOCAL SHOP
                        ================================================= */}

                        {selectedVendor && (
                            <section className="dh-pc-selected-vendor-card-user">

                                <div>

                                    <span>
                                        Selected local
                                        shop
                                    </span>

                                    <strong>
                                        {getVendorName(
                                            selectedVendor
                                        )}
                                    </strong>

                                </div>

                                <div className="dh-pc-selected-vendor-price-user">

                                    {formatINR(
                                        getVendorPrice(
                                            selectedVendor
                                        ) ||
                                            displayPrice
                                    )}

                                </div>

                            </section>
                        )}

                        {/* =================================================
                            AVAILABLE LOCAL SHOPS SUMMARY
                        ================================================= */}

                        <section className="dh-pc-local-availability-card-user">

                            <div className="dh-pc-local-availability-icon-user">
                                <FiMapPin />
                            </div>

                            <div>

                                <span className="dh-pc-eyebrow-user">
                                    LOCAL AVAILABILITY
                                </span>

                                <h3>
                                    {vendors.length >
                                    0
                                        ? `${vendors.length} local shop${
                                              vendors.length >
                                              1
                                                  ? "s"
                                                  : ""
                                          } found`
                                        : "Checking local shops"}
                                </h3>

                                <p>
                                    {vendors.length >
                                    0
                                        ? "This product is available through local inventory. Compare the shops to see their prices and availability."
                                        : "We are currently checking the local inventory for this product."}
                                </p>

                            </div>

                            {vendors.length >
                                0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowVendorComparison(
                                            true
                                        )
                                    }
                                >
                                    Compare

                                    <FiArrowRight />
                                </button>
                            )}

                        </section>

                        {/* =================================================
                            SPECIFICATIONS
                        ================================================= */}

                        <section className="dh-pc-content-card-user">

                            <div className="dh-pc-section-heading-user">

                                <div>

                                    <span className="dh-pc-eyebrow-user">
                                        PRODUCT INFORMATION
                                    </span>

                                    <h2>
                                        Specifications
                                    </h2>

                                </div>

                            </div>

                            {specificationEntries.length >
                            0 ? (
                                <div className="dh-pc-data-grid-user">

                                    {specificationEntries.map(
                                        (
                                            [
                                                label,
                                                value,
                                            ],
                                            index
                                        ) => (
                                            <div
                                                className="dh-pc-data-row-user"
                                                key={`${label}-${index}`}
                                            >

                                                <span>
                                                    {
                                                        label
                                                    }
                                                </span>

                                                <strong>
                                                    {displayValue(
                                                        value,
                                                        "—"
                                                    )}
                                                </strong>

                                            </div>
                                        )
                                    )}

                                </div>
                            ) : (
                                <div className="dh-pc-empty-user">
                                    No specifications
                                    available.
                                </div>
                            )}

                        </section>

                        {/* =================================================
                            PRODUCT DETAILS
                        ================================================= */}

                        <section className="dh-pc-content-card-user">

                            <div className="dh-pc-section-heading-user">

                                <div>

                                    <span className="dh-pc-eyebrow-user">
                                        DETAILS
                                    </span>

                                    <h2>
                                        Product details
                                    </h2>

                                </div>

                            </div>

                            {productDetailFields.length >
                            0 ? (
                                <div className="dh-pc-data-grid-user">

                                    {productDetailFields.map(
                                        (
                                            row,
                                            index
                                        ) => (
                                            <div
                                                className="dh-pc-data-row-user"
                                                key={`${row.label}-${index}`}
                                            >

                                                <span>
                                                    {
                                                        row.label
                                                    }
                                                </span>

                                                <strong>
                                                    {displayValue(
                                                        row.value,
                                                        "—"
                                                    )}
                                                </strong>

                                            </div>
                                        )
                                    )}

                                </div>
                            ) : (
                                <div className="dh-pc-empty-user">
                                    No product details
                                    available.
                                </div>
                            )}

                        </section>

                        {/* =================================================
                            RATING / REVIEWS
                        ================================================= */}

                        <section className="dh-pc-rating-right-card-user">

                            <div className="dh-pc-rating-right-main-user">

                                <span className="dh-pc-eyebrow-user">
                                    CUSTOMER FEEDBACK
                                </span>

                                <h3>
                                    What customers say
                                </h3>

                                <div className="dh-pc-rating-right-score-user">

                                    <strong>
                                        {productRating >
                                        0
                                            ? productRating.toFixed(
                                                  1
                                              )
                                            : "—"}
                                    </strong>

                                    <div>

                                        <StarRating
                                            value={
                                                productRating
                                            }
                                        />

                                        <span>
                                            {reviewCount >
                                            0
                                                ? `${reviewCount} reviews`
                                                : "No reviews yet"}
                                        </span>

                                    </div>

                                </div>

                                <div className="dh-pc-rating-right-note-user">

                                    <FiStar />

                                    <span>
                                        Product rating
                                        from the available
                                        customer feedback.
                                    </span>

                                </div>

                            </div>

                        </section>

                        {/* =================================================
                            VENDOR COMPARISON CTA
                        ================================================= */}

                        <section className="dh-pc-compare-card-user">

                            <div>

                                <span className="dh-pc-eyebrow-user">
                                    DEALHUNTS
                                </span>

                                <h2>
                                    Compare local shops
                                    before you buy
                                </h2>

                                <p>
                                    See which nearby shops
                                    have this product,
                                    compare their prices,
                                    check availability,
                                    and select the shop
                                    that you want to use.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowVendorComparison(
                                        true
                                    )
                                }
                            >

                                Compare shops

                                <FiArrowRight />

                            </button>

                        </section>

                    </section>

                    {/* =================================================
                        RIGHT EDGE COMPARISON TAB

                        This stays between the right content section
                        and the outer page edge. Only the arrow is
                        shown so it does not occupy the right section.
                    ================================================= */}

                    <button
                        type="button"
                        className="dh-pc-edge-compare-user"
                        onClick={() =>
                            setShowVendorComparison(
                                true
                            )
                        }
                        aria-label="Open top 5 vendor comparison"
                        title="Compare Top 5 Deals"
                    >
                        <FiArrowLeft />
                    </button>

                </div>

            </main>

            {/* =====================================================
                VENDOR COMPARISON DRAWER
            ===================================================== */}

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

                        <div className="dh-pc-vendor-drawer-header-user">

                            <div>

                                <span className="dh-pc-vendor-drawer-eyebrow-user">
                                    DEALHUNTS LOCAL
                                    COMPARISON
                                </span>

                                <h2>
                                    Top 5 Vendors
                                </h2>

                                <p>
                                    Compare available
                                    local shops, prices,
                                    stock and ratings for
                                    this product.
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

                        <div className="dh-pc-vendor-drawer-body-user">

                            {top5Vendors.length >
                            0 ? (
                                top5Vendors.map(
                                    (
                                        vendor,
                                        index
                                    ) => {
                                        const vendorPrice =
                                            getVendorPrice(
                                                vendor
                                            );

                                        const vendorOriginalPrice =
                                            getVendorOriginalPrice(
                                                vendor
                                            );

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
                                            String(
                                                selectedId
                                            ) ===
                                                String(
                                                    currentVendorId
                                                );

                                        const stock =
                                            Number(
                                                vendor?.stock ??
                                                    vendor?.quantity ??
                                                    0
                                            );

                                        const available =
                                            stock >
                                                0 ||
                                            vendor?.available ===
                                                true ||
                                            vendor?.inStock ===
                                                true;

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

                                                <div className="dh-product-comparison-rank-top-row-user">

                                                    <span className="dh-product-comparison-rank-number-user">
                                                        #
                                                        {index +
                                                            1}
                                                    </span>

                                                    {index ===
                                                        0 && (
                                                        <span className="dh-product-comparison-best-badge-user">
                                                            BEST PRICE
                                                        </span>
                                                    )}

                                                </div>

                                                <div className="dh-product-comparison-rank-shop-user">
                                                    {getVendorName(
                                                        vendor
                                                    )}
                                                </div>

                                                <div className="dh-product-comparison-rank-meta-user">

                                                    {vendor?.rating
                                                        ? `★ ${Number(
                                                              vendor.rating
                                                          ).toFixed(
                                                              1
                                                          )}`
                                                        : "Verified local shop"}

                                                </div>

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

                                                {vendorOriginalPrice >
                                                    vendorPrice && (
                                                    <div className="dh-product-comparison-rank-old-price-user">

                                                        {formatINR(
                                                            vendorOriginalPrice
                                                        )}

                                                    </div>
                                                )}

                                                <div className="dh-product-comparison-rank-stock-user">

                                                    {available ? (
                                                        <>
                                                            <FiCheckCircle />

                                                            {stock >
                                                            0
                                                                ? `${stock} available`
                                                                : "In stock"}
                                                        </>
                                                    ) : (
                                                        "Currently unavailable"
                                                    )}

                                                </div>

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

                                                    {isSelected
                                                        ? "Selected"
                                                        : "Select shop"}

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
                                        No local shop
                                        inventory found
                                    </h3>

                                    <p>
                                        This product exists
                                        in the DEALHUNTS
                                        catalogue, but
                                        there is currently
                                        no local inventory
                                        record available
                                        for it.
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