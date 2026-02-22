import axios from "axios";

const BASE_URL = "http://localhost:3000/"; //change url

export const loginUser = (email, password) => {
  return axios.post(`${BASE_URL}login`, { email, password });
};

export const registerUser = (firstName,lastName,email, password) => {
  return axios.post(`${BASE_URL}register`, {
    FullName: `${firstName} ${lastName}`,
    email,
    password
   });
};
export const vendorUser = (email, password) => {
  return axios.post(`${BASE_URL}vendor`, { email, password });
};