import axios from "axios";
import { API_BASE_URL } from "./config.js";

const BASE_URL = API_BASE_URL;


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
