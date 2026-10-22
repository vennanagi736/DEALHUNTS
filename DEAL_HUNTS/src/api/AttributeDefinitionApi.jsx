import axios from "axios";
import { API_BASE_URL } from "./config.js";

// BASE URL
const API_URL = API_BASE_URL;

// =====================================================
// GET ACTIVE ATTRIBUTES BY CATEGORY
// =====================================================

export const getAttributesByCategory = (categoryId) => {

    return axios.get(
        `${API_URL}/attributes/category/${categoryId}`
    );

};


// =====================================================
// GET ALL ATTRIBUTES BY CATEGORY
// ADMIN USE
// =====================================================

export const getAllAttributesByCategory = (categoryId) => {

    return axios.get(
        `${API_URL}/attributes/category/${categoryId}/all`
    );

};
