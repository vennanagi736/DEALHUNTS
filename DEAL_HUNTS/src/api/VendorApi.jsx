import axios from "axios";

const BASE_URL = "http://localhost:8080/vendor";


// ============================================================
// GET VENDOR TOKEN
// ============================================================

const getVendorToken = () => {

    const token =
        localStorage.getItem(
            "vendorJwtToken"
        );

    if (!token) {

        throw new Error(
            "No Vendor JWT token found. Please login."
        );
    }

    return token;
};


// ============================================================
// GET ACTIVE PRODUCTS
// ============================================================

export const getActiveProducts = () => {

    const token =
        getVendorToken();

    const vendorId =
        localStorage.getItem(
            "vendorId"
        );

    if (!vendorId) {

        throw new Error(
            "No Vendor ID found. Please login again."
        );
    }

    console.log(
        "========== GET ACTIVE PRODUCTS =========="
    );

    console.log(
        "Vendor ID:",
        vendorId
    );

    console.log(
        "Token exists:",
        !!token
    );

    console.log(
        "Request URL:",
        `${BASE_URL}/products/active`
    );

    return axios.get(
        `${BASE_URL}/products/active`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },

            params: {
                vendorId:
                    Number(vendorId),
            },
        }
    );
};


// ============================================================
// VENDOR LOGIN
// ============================================================

export const vendorLogin = (
    email,
    password
) => {

    return axios.post(
        `${BASE_URL}/login`,
        {
            email:
                email
                    .trim()
                    .toLowerCase(),

            password,
        },
        {
            headers: {
                "Content-Type":
                    "application/json",
            },
        }
    );
};


// ============================================================
// VENDOR PRODUCT
// ============================================================

export const vendorProduct = (
    product,
    images
) => {

    const formData =
        new FormData();

    formData.append(
        "name",
        product.name
    );

    formData.append(
        "brand",
        product.brand
    );

    formData.append(
        "category",
        product.category
    );

    formData.append(
        "price",
        product.price
    );

    formData.append(
        "stock",
        product.stock
    );

    formData.append(
        "description",
        product.description || ""
    );

    images.forEach((img) => {

        formData.append(
            "images",
            img
        );

    });

    const token =
        getVendorToken();

    return axios.post(
        `${BASE_URL}/addProduct`,
        formData,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );
};


// ============================================================
// VENDOR REGISTER
// ============================================================

export const vendorRegister = (
    fullName,
    shopName,
    state,
    city,
    pincode,
    location,
    address,
    phoneNo,
    email,
    password
) => {

    const latitude =
        Number(
            location?.lat
        );

    const longitude =
        Number(
            location?.lon
        );


    const validLatitude =
        Number.isFinite(latitude)
            ? latitude
            : null;


    const validLongitude =
        Number.isFinite(longitude)
            ? longitude
            : null;


    let locationLink =
        typeof location?.mapUrl ===
        "string"
            ? location.mapUrl.trim()
            : "";


    if (
        !locationLink &&
        validLatitude !== null &&
        validLongitude !== null
    ) {

        locationLink =
            `https://www.google.com/maps?q=` +
            `${validLatitude},${validLongitude}`;
    }


    const payload = {

        fullName,

        shopName,

        state,

        city,

        pincode,

        latitude:
            validLatitude,

        longitude:
            validLongitude,

        address,

        phoneNo,

        email:
            email
                .trim()
                .toLowerCase(),

        password,

        role:
            "VENDOR",

        locationLink:
            locationLink || null,
    };


    console.log(
        "========== VENDOR REGISTER PAYLOAD =========="
    );

    console.log(
        "Shop:",
        payload.shopName
    );

    console.log(
        "Location Link:",
        payload.locationLink
    );

    console.log(
        "Latitude:",
        payload.latitude
    );

    console.log(
        "Longitude:",
        payload.longitude
    );


    return axios.post(
        `${BASE_URL}/register`,
        payload,
        {
            headers: {
                "Content-Type":
                    "application/json",
            },
        }
    );
};


// ============================================================
// RESOLVE GOOGLE MAPS LINK
//
// IMPORTANT:
// This endpoint is PUBLIC because the vendor is not logged in
// while registering.
//
// No Authorization header is required.
// ============================================================

export const resolveVendorMapLink = (
    mapUrl
) => {

    return axios.get(
        `${BASE_URL}/resolve-location`,
        {
            params: {
                url:
                    mapUrl.trim(),
            },
        }
    );
};


// ============================================================
// FETCH PRODUCT NAMES
// ============================================================

export const fetchProductNames = (
    query = ""
) => {

    const token =
        getVendorToken();

    return axios.get(
        `${BASE_URL}/allProducts`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },

            params: query
                ? {
                    name: query,
                }
                : {},
        }
    );
};


// ============================================================
// FETCH PRODUCT SUGGESTIONS
// ============================================================

export const fetchProductSuggestions = (
    name
) => {

    const token =
        getVendorToken();

    return axios.get(
        `${BASE_URL}/product-suggestions`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },

            params: {
                name,
            },
        }
    );
};


// ============================================================
// GET VENDOR CATEGORIES
// ============================================================

export const getVendorCategories = () => {

    const token =
        getVendorToken();

    return axios.get(
        "http://localhost:8080/admin/categories/all",
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );
};


// ============================================================
// GET VENDOR BRANDS
// ============================================================

export const getVendorBrands = () => {

    const token =
        getVendorToken();

    return axios.get(
        "http://localhost:8080/admin/brands/all",
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );
};


// ============================================================
// CHECK VENDOR EMAIL
//
// PUBLIC ENDPOINT
//
// Used during vendor registration to check whether the email
// already exists before the user submits the registration form.
//
// No Authorization header is required.
// ============================================================

export const checkVendorEmail = (
    email
) => {

    return axios.get(
        `${BASE_URL}/check-email`,
        {
            params: {
                email:
                    email
                        .trim()
                        .toLowerCase(),
            },
        }
    );
};