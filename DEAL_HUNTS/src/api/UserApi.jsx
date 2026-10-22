import axios from "axios";
import { API_BASE_URL } from "./config.js";

const BASE_URL = `${API_BASE_URL}/user`;

export const loginUser = (email, password) => {
  return axios.post(
    `${BASE_URL}/login`,
    { email, password }, // exact field names
    { headers: { "Content-Type": "application/json" } }
  );
};

export const registerUser = (firstName, lastName, email, password, confirmPassword) => {
  return axios.post(`${BASE_URL}/register`, {
    firstName,
    lastName,
    email: email.trim().toLowerCase(),
    password,
    confirmPassword
  });
  
};