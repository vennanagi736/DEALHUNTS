import axios from "axios";

const BASE_URL = "http://localhost:8080";

// ================= PRODUCTS =================

// ADD PRODUCT
export const addProduct = (product) => {
    return axios.post(
        `${BASE_URL}/admin/products/add`,
        product
    );
};

// GET ALL PRODUCTS
export const getAllProducts = () => {
    return axios.get(
        `${BASE_URL}/admin/products/all`
    );
};

// SEARCH PRODUCTS
export const searchProducts = (name) => {
    return axios.get(
        `${BASE_URL}/admin/products/search`,
        {
            params: { name }
        }
    );
};

// DELETE PRODUCT
export const deleteProduct = (id) => {
    return axios.delete(
        `${BASE_URL}/admin/products/${id}`
    );
};


// ================= CATEGORY =================

// ADD CATEGORY
export const addCategory = (category) => {
    return axios.post(
        `${BASE_URL}/admin/categories/add`,
        category
    );
};

// GET ALL CATEGORIES
export const getAllCategories = () => {
    return axios.get(
        `${BASE_URL}/admin/categories/all`
    );
};


// ================= BRAND =================

// ADD BRAND
export const addBrand = (brand) => {
    return axios.post(
        `${BASE_URL}/admin/brands/add`,
        brand
    );
};

// GET ALL BRANDS
export const getAllBrands = () => {
    return axios.get(
        `${BASE_URL}/admin/brands/all`
    );
};


// ================= COLOR =================

// ADD COLOR
export const addColor = (color) => {
    return axios.post(
        `${BASE_URL}/admin/colors/add`,
        color
    );
};

// GET ALL COLORS
export const getAllColors = () => {
    return axios.get(
        `${BASE_URL}/admin/colors/all`
    );
};


// ================= VARIANT =================

// ADD VARIANT
export const addVariant = (variant) => {
    return axios.post(
        `${BASE_URL}/admin/variants/add`,
        variant
    );
};

// GET ALL VARIANTS
export const getAllVariants = () => {
    return axios.get(
        `${BASE_URL}/admin/variants/all`
    );
};
export const getProductById = (id) => {
    return axios.get(`${BASE_URL}/admin/products/${id}`);
};
