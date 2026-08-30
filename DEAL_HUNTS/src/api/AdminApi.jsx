import axios from "axios";

const BASE_URL = "http://localhost:8080";


/* ============================================================
   ADMIN LOGIN
============================================================ */

export const adminLogin = (email, password) => {
    return axios.post(
        `${BASE_URL}/admin/login`,
        {
            email,
            password,
        }
    );
};


/* ============================================================
   VENDORS
============================================================ */

export const getAllVendors = () => {
    return axios.get(
        `${BASE_URL}/admin/manage-vendors`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
            },
        }
    );
};


/* ============================================================
   USERS COUNT
============================================================ */

export const getUserCount = () => {
    return axios.get(
        `${BASE_URL}/user/count`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
            },
        }
    );
};


/* ============================================================
   VENDORS COUNT
============================================================ */

export const getVendorCount = () => {
    return axios.get(
        `${BASE_URL}/vendor/count`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
            },
        }
    );
};


/* ============================================================
   PRODUCTS COUNT
============================================================ */

export const getProductCount = () => {
    return axios.get(
        `${BASE_URL}/admin/products/count`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
            },
        }
    );
};


/* ============================================================
   ORDERS COUNT
============================================================ */

export const getOrderCount = () => {
    return axios.get(
        `${BASE_URL}/order/count`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
            },
        }
    );
};


/* ============================================================
   CATEGORIES COUNT
============================================================ */

export const getCategoryCount = () => {
    return axios.get(
        `${BASE_URL}/admin/categories/count`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
            },
        }
    );
};


/* ============================================================
   ACTIVE PROMOTIONS COUNT
============================================================ */

export const getPromotionCount = () => {
    return axios.get(
        `${BASE_URL}/admin/promotions/active/count`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
            },
        }
    );
};


/* ============================================================
   COMPLAINTS COUNT
============================================================ */

export const getComplaintsCount = () => {
    return axios.get(
        `${BASE_URL}/admin/complaints/count`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
            },
        }
    );
};


/* ============================================================
   FEEDBACK COUNT
============================================================ */

export const getFeedbackCount = () => {
    return axios.get(
        `${BASE_URL}/admin/feedback/count`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
            },
        }
    );
};


/* ============================================================
   LOW STOCK ALERTS COUNT
============================================================ */

export const getLowStockAlertsCount = () => {
    return axios.get(
        `${BASE_URL}/admin/inventory/low-stock/count`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
            },
        }
    );
};