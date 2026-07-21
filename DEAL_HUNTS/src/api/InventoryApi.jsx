import axios from "axios";

const BASE_URL = "http://localhost:8080";


// ADD INVENTORY
export const addInventory = (inventory) => {

    return axios.post(
        `${BASE_URL}/inventory/add`,
        inventory
    );

};


// GET ALL INVENTORY
export const getAllInventory = () => {

    return axios.get(
        `${BASE_URL}/inventory/all`
    );

};


// GET VENDOR INVENTORY
export const getVendorInventory = (vendorId) => {

    return axios.get(
        `${BASE_URL}/inventory/vendor/${vendorId}`
    );

};


// DELETE INVENTORY
export const deleteInventory = (id) => {

    return axios.delete(
        `${BASE_URL}/inventory/${id}`
    );

};