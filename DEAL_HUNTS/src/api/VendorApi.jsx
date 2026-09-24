import axios from "axios";

const BASE_URL = "http://localhost:8080/vendor";

const getVendorToken = () => {
    const token = localStorage.getItem("vendorJwtToken");

    if (!token) {
        throw new Error("No Vendor JWT token found. Please login.");
    }

    return token;
};

export const getActiveProducts = () => {
    const token = getVendorToken();

    const vendorId = localStorage.getItem("vendorId");

    if (!vendorId) {
        throw new Error("No Vendor ID found. Please login again.");
    }

    console.log("========== GET ACTIVE PRODUCTS ==========");
    console.log("Vendor ID:", vendorId);
    console.log("Token exists:", !!token);
    console.log(
        "Request URL:",
        `${BASE_URL}/products/active`
    );

    return axios.get(
        `${BASE_URL}/products/active`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                vendorId: Number(vendorId),
            },
        }
    );
};
// ============================================================
// FETCH ACTIVE PRODUCTS FOR LOGGED-IN VENDOR
// ============================================================

// export const getActiveProducts = (vendorId) => {

//     const token = getVendorToken();

//     if (!vendorId) {
//         throw new Error(
//             "No Vendor ID found. Please login again."
//         );
//     }

//     console.log("========== GET ACTIVE PRODUCTS ==========");
//     console.log("Vendor ID:", vendorId);
//     console.log("Token exists:", !!token);
//     console.log("Request URL:", `${BASE_URL}/products/active`);

//     return axios.get(
//         `${BASE_URL}/products/active`,
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//             params: {
//                 vendorId: Number(vendorId),
//             },
//         }
//     );
// };


// ============================================================
// VENDOR LOGIN
// ============================================================

export const vendorLogin = (email, password) => {
    return axios.post(
        `${BASE_URL}/login`,
        {
            email: email.trim().toLowerCase(),
            password,
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
};

// ============================================================
// ADD PRODUCT
// ============================================================

export const vendorProduct = (product, images) => {
    const formData = new FormData();

    formData.append("name", product.name);
    formData.append("brand", product.brand);
    formData.append("category", product.category);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    formData.append(
        "description",
        product.description || ""
    );

    images.forEach((img) => {
        formData.append("images", img);
    });

    const token = getVendorToken();

    return axios.post(
        `${BASE_URL}/addProduct`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
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
    const payload = {
        fullName,
        shopName,
        state,
        city,
        pincode,
        latitude: location?.lat || null,
        longitude: location?.lon || null,
        address,
        phoneNo,
        email: email.trim().toLowerCase(),
        password,
        role: "VENDOR",
    };

    return axios.post(
        `${BASE_URL}/register`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
};

// ============================================================
// FETCH PRODUCTS
// ============================================================

export const fetchProductNames = (query = "") => {
    const token = getVendorToken();

    return axios.get(
        `${BASE_URL}/allProducts`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: query
                ? { name: query }
                : {},
        }
    );
};

// ============================================================
// FETCH PRODUCT SUGGESTIONS
// ============================================================

export const fetchProductSuggestions = (name) => {
    const token = getVendorToken();

    return axios.get(
        `${BASE_URL}/product-suggestions`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                name,
            },
        }
    );
};


// ============================================================
// FETCH AVAILABLE CATEGORIES
// ============================================================

export const getVendorCategories = () => {
    const token = getVendorToken();

    return axios.get(
        "http://localhost:8080/admin/categories/all",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

// ============================================================
// FETCH AVAILABLE BRANDS
// ============================================================

export const getVendorBrands = () => {
    const token = getVendorToken();

    return axios.get(
        "http://localhost:8080/admin/brands/all",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};