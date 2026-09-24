import axios from "axios";

const BASE_URL = "http://localhost:8080";

// =====================================================
// GET AUTH HEADERS
// =====================================================
const getAuthHeaders = () => {
    const token =
        localStorage.getItem("vendorJwtToken") ||
        localStorage.getItem("jwtToken") ||
        localStorage.getItem("userJwtToken");

    if (!token) {
        throw new Error("Authentication token not found");
    }

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};


// =====================================================
// ADD INVENTORY
// =====================================================
export const addInventory = (inventoryData) => {

    console.log("========== ADD INVENTORY ==========");
    console.log("inventoryData:", inventoryData);
    console.log("===================================");

    return axios.post(
        `${BASE_URL}/inventory/add`,
        inventoryData,
        {
            headers: getAuthHeaders(),
        }
    );
};


// =====================================================
// GET ALL INVENTORY
// =====================================================
export const getAllInventory = () => {
    return axios.get(
        `${BASE_URL}/inventory/all`,
        {
            headers: getAuthHeaders(),
        }
    );
};


// =====================================================
// GET VENDOR INVENTORY
// =====================================================
export const getVendorInventory = (vendorId) => {

    if (!vendorId) {
        throw new Error("Vendor ID is required");
    }

    return axios.get(
        `${BASE_URL}/inventory/vendor/${vendorId}`,
        {
            headers: getAuthHeaders(),
        }
    );
};


// =====================================================
// GET SINGLE INVENTORY
// =====================================================
export const getInventoryById = (inventoryId) => {

    if (!inventoryId) {
        throw new Error("Inventory ID is required");
    }

    return axios.get(
        `${BASE_URL}/inventory/${inventoryId}`,
        {
            headers: getAuthHeaders(),
        }
    );
};


// =====================================================
// UPDATE INVENTORY
// =====================================================
export const updateInventory = (inventoryId, inventoryData) => {

    if (!inventoryId) {
        throw new Error("Inventory ID is required");
    }

    console.log("========== UPDATE INVENTORY ==========");
    console.log("inventoryId:", inventoryId);
    console.log("inventoryData:", inventoryData);
    console.log("======================================");

    return axios.put(
        `${BASE_URL}/inventory/${inventoryId}`,
        inventoryData,
        {
            headers: getAuthHeaders(),
        }
    );
};


// =====================================================
// DELETE INVENTORY
// =====================================================
export const deleteInventory = (inventoryId) => {

    if (!inventoryId) {
        throw new Error("Inventory ID is required");
    }

    return axios.delete(
        `${BASE_URL}/inventory/${inventoryId}`,
        {
            headers: getAuthHeaders(),
        }
    );
};