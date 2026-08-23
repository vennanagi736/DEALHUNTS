import axios from "axios";

const BASE_URL = "http://localhost:8080";


// =====================================================
// GET ALL TRENDING CATEGORIES
// =====================================================

export const getTrendingCategories = () => {

    return axios.get(
        `${BASE_URL}/admin/trending-categories`
    );

};


// =====================================================
// ADD TRENDING CATEGORY
// =====================================================

export const addTrendingCategory = (categoryId) => {

    return axios.post(
        `${BASE_URL}/admin/trending-categories/${categoryId}`
    );

};


// =====================================================
// DELETE TRENDING CATEGORY
// =====================================================

export const deleteTrendingCategory = (id) => {

    return axios.delete(
        `${BASE_URL}/admin/trending-categories/${id}`
    );

};