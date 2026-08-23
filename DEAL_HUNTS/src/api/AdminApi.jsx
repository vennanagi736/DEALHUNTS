import axios from "axios";

const BASE_URL = "http://localhost:8080";

export const adminLogin = (email,password) =>{
    return axios.post(`${BASE_URL}/admin/login`,
        {email,
            password});
        };

export const getAllVendors = () => {
    return axios.get(`${BASE_URL}/admin/manage-vendors`,{
        headers: {
            Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
        },
    });
}

export const getUserCount = () => {
    return axios.get(`${BASE_URL}/user/count`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
        },
    });
};

export const getVendorCount = () => {
    return axios.get(`${BASE_URL}/vendor/count`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
        },
    });
};

export const getProductCount = () => {
    return axios.get(`${BASE_URL}/admin/products/count`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
        },
    });
};

// export const getOrderCount = () => {
//     return axios.get(`${BASE_URL}/order/count`, {
//         headers: {
//             Authorization: `Bearer ${localStorage.getItem("adminJwtToken")}`,
//         },
//     });
// };

export const getLowStockAlertsCount = () => {
    return axios.get(
        `${BASE_URL}/admin/inventory/low-stock/count`
    );
};