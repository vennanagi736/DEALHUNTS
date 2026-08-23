import axios from "axios";

const BASE_URL = "http://localhost:8080";

// ================= ADD INVENTORY =================
export const addInventory = (inventoryData) => {

    const token = localStorage.getItem("vendorJwtToken");

     console.log("========== ADD INVENTORY ==========");
    console.log("vendorJwtToken:", token);
    console.log("inventoryData:", inventoryData);
    console.log("===================================");


    if (!token) {
        throw new Error("Vendor authentication token not found");
    }

    return axios.post(
        `${BASE_URL}/inventory/add`,
        inventoryData,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }
    );
};
// ================= GET ALL INVENTORY =================

export const getAllInventory = () => {
    return axios.get(
        `${BASE_URL}/inventory/all`
    );
};

// ================= GET VENDOR INVENTORY =================

export const getVendorInventory = (vendorId) => {
    return axios.get(
        `${BASE_URL}/inventory/vendor/${vendorId}`
    );
};

// ================= DELETE INVENTORY =================

export const deleteInventory = (id) => {
    return axios.delete(
        `${BASE_URL}/inventory/${id}`
    );
};