import axios from "axios";

const BASE_URL =
    "http://localhost:8080/admin/trending-deals";


// ==========================================
// GET ALL TRENDING DEALS
// ==========================================

export const getTrendingDeals = () => {

    return axios.get(BASE_URL);

};


// ==========================================
// ADD TRENDING DEAL
// ==========================================

export const addTrendingDeal = (productId) => {

    return axios.post(
        `${BASE_URL}/${productId}`
    );

};


// ==========================================
// DELETE TRENDING DEAL
// ==========================================

export const deleteTrendingDeal = (id) => {

    return axios.delete(
        `${BASE_URL}/${id}`
    );

};