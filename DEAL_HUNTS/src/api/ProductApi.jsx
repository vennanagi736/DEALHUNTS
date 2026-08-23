import axios from "axios";

const BASE_URL = "http://localhost:8080";


// =====================================================
// PRODUCTS
// =====================================================

// ADD PRODUCT
export const addProduct = (product) => {

    return axios({
        method: "POST",
        url: `${BASE_URL}/admin/products/add`,
        data: JSON.stringify(product),
        headers: {
            "Content-Type": "application/json"
        }
    });

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
            params: {
                name
            }
        }
    );

};


// DELETE PRODUCT
export const deleteProduct = (id) => {

    return axios.delete(
        `${BASE_URL}/admin/products/${id}`
    );

};


// GET PRODUCT BY ID
export const getProductById = (id) => {

    return axios.get(
        `${BASE_URL}/admin/products/${id}`
    );

};


// UPDATE PRODUCT
export const updateProduct = (id, product) => {

    return axios.put(
        `${BASE_URL}/admin/products/${id}`,
        product
    );

};


// RESTORE PRODUCT
export const restoreProduct = (id) => {

    return axios.put(
        `${BASE_URL}/admin/products/restore/${id}`
    );

};


// =====================================================
// CATEGORY
// =====================================================

// ADD CATEGORY WITH IMAGE
export const addCategory = (name, image) => {

    const formData = new FormData();

    formData.append(
        "name",
        name
    );

    formData.append(
        "image",
        image
    );

    return axios.post(
        `${BASE_URL}/admin/categories/add`,
        formData
    );

};


// GET ALL CATEGORIES
export const getAllCategories = () => {

    return axios.get(
        `${BASE_URL}/admin/categories/all`
    );

};


// UPDATE CATEGORY
export const updateCategory = (id, name, image) => {

    const formData = new FormData();

    formData.append(
        "name",
        name
    );

    if (image) {

        formData.append(
            "image",
            image
        );

    }

    console.log(
        "UPDATE CATEGORY URL:",
        `${BASE_URL}/admin/categories/${id}`
    );

    return axios.put(
        `${BASE_URL}/admin/categories/${id}`,
        formData
    );

};


// DELETE CATEGORY
export const deleteCategory = (id) => {

    console.log(
        "DELETE CATEGORY URL:",
        `${BASE_URL}/admin/categories/${id}`
    );

    return axios.delete(
        `${BASE_URL}/admin/categories/${id}`
    );

};


// =====================================================
// BRAND
// =====================================================

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


// UPDATE BRAND
export const updateBrand = (id, data) => {

    return axios.put(
        `${BASE_URL}/admin/products/brand/${id}`,
        data
    );

};


// DELETE BRAND
export const deleteBrand = (id) => {

    return axios.delete(
        `${BASE_URL}/admin/products/brand/${id}`
    );

};


// =====================================================
// COLOR
// =====================================================

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


// UPDATE COLOR
export const updateColor = (id, data) => {

    return axios.put(
        `${BASE_URL}/admin/products/color/${id}`,
        data
    );

};


// DELETE COLOR
export const deleteColor = (id) => {

    return axios.delete(
        `${BASE_URL}/admin/products/color/${id}`
    );

};


// =====================================================
// VARIANT
// =====================================================

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


// UPDATE VARIANT
export const updateVariant = (id, data) => {

    return axios.put(
        `${BASE_URL}/admin/products/variant/${id}`,
        data
    );

};


// DELETE VARIANT
export const deleteVariant = (id) => {

    return axios.delete(
        `${BASE_URL}/admin/products/variant/${id}`
    );

};


// =====================================================
// PRODUCT IMAGES
// =====================================================

// UPLOAD IMAGES
export const uploadImages = (formData) => {

    return axios.post(
        `${BASE_URL}/admin/products/upload-images`,
        formData
    );

};


// GET PRODUCT IMAGES
export const getProductImages = (productId) => {

    return axios.get(
        `${BASE_URL}/admin/products/${productId}/images`
    );

};


// DELETE PRODUCT IMAGE
export const deleteProductImage = (imageId) => {

    return axios.delete(
        `${BASE_URL}/admin/products/images/${imageId}`
    );

};


// CHANGE PRODUCT IMAGE
export const changeProductImage = (imageId, file) => {

    const formData = new FormData();

    formData.append(
        "image",
        file
    );

    return axios.put(
        `${BASE_URL}/admin/products/images/${imageId}`,
        formData
    );

};


// =====================================================
// PRODUCT VARIANTS
// =====================================================

export const getProductVariant = (productId) => {

    return axios.get(
        `${BASE_URL}/admin/products/${productId}/variants`
    );

};