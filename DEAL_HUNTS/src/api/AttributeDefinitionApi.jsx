import axios from "axios";


// =====================================================
// BASE URL
// =====================================================

const API_URL = "http://localhost:8080";


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
