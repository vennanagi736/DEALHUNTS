import axios from "axios";
import { API_BASE_URL } from "./config.js";

const BASE_URL = API_BASE_URL.replace(/\/+$/, "");

const adminApi = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
});

const getAdminConfig = () => {
    const token = localStorage.getItem("adminJwtToken");

    return {
        headers: {
            Authorization: `Bearer ${token || ""}`,
        },
    };
};

/* ============================================================
   ADMIN LOGIN
============================================================ */

export const adminLogin = (email, password) => {
    return adminApi.post("/admin/login", {
        email: email.trim(),
        password,
    });
};

/* ============================================================
   VENDORS
============================================================ */

export const getAllVendors = () =>
    adminApi.get("/admin/manage-vendors", getAdminConfig());

/* ============================================================
   USERS COUNT
============================================================ */

export const getUserCount = () =>
    adminApi.get("/user/count", getAdminConfig());

/* ============================================================
   VENDORS COUNT
============================================================ */

export const getVendorCount = () =>
    adminApi.get("/vendor/count", getAdminConfig());

/* ============================================================
   PRODUCTS COUNT
============================================================ */

export const getProductCount = () =>
    adminApi.get("/admin/products/count", getAdminConfig());

/* ============================================================
   ORDERS COUNT
============================================================ */

export const getOrderCount = () =>
    adminApi.get("/order/count", getAdminConfig());

/* ============================================================
   CATEGORIES COUNT
============================================================ */

export const getCategoryCount = () =>
    adminApi.get("/admin/categories/count", getAdminConfig());

/* ============================================================
   ACTIVE PROMOTIONS COUNT
============================================================ */

export const getPromotionCount = () =>
    adminApi.get("/admin/promotions/active/count", getAdminConfig());

/* ============================================================
   COMPLAINTS COUNT
============================================================ */

export const getComplaintsCount = () =>
    adminApi.get("/admin/complaints/count", getAdminConfig());

/* ============================================================
   FEEDBACK COUNT
============================================================ */

export const getFeedbackCount = () =>
    adminApi.get("/admin/feedback/count", getAdminConfig());

/* ============================================================
   LOW STOCK ALERTS COUNT
============================================================ */

export const getLowStockAlertsCount = () =>
    adminApi.get("/admin/inventory/low-stock/count", getAdminConfig());
