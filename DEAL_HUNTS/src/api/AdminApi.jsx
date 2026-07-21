import axios from "axios";

const BASE_URL = "http://localhost:8080/admin";

export const adminLogin = (email,password) =>{
    return axios.post(`${BASE_URL}/login`,
        {email,
            password});
        };

export const getAllVendors = () => {
    return axios.get(`${BASE_URL}/manage-vendors`,{
        headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
    });
}