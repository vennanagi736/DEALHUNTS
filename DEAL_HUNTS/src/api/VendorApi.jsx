import axios from "axios";

const BASE_URL = "http://localhost:8080/vendor";

// ---------------- VENDOR LOGIN ----------------
export const vendorLogin = (email, password) => {
  return axios.post(
    `${BASE_URL}/login`,
    {
      email: email.trim().toLowerCase(),
      password,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// ---------------- ADD PRODUCT ----------------
export const vendorProduct = (product, images) => {
  const formData = new FormData();

  formData.append("name", product.name);
  formData.append("brand", product.brand);
  formData.append("category", product.category);
  formData.append("price", product.price);
  formData.append("stock", product.stock);
  formData.append("description", product.description || "");

  images.forEach((img) => formData.append("images", img));

  const token = localStorage.getItem("vendorJwtToken");

  if (!token) {
    throw new Error("No Vendor JWT token found. Please login.");
  }

  return axios.post(`${BASE_URL}/addProduct`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

// ---------------- VENDOR REGISTER ----------------
export const vendorRegister = (
  fullName,
  shopName,
  state,
  city,
  pincode,
  location,
  address,
  phoneNo,
  email,
  password
) => {
  const payload = {
    fullName,
    shopName,
    state,
    city,
    pincode,
    latitude: location?.lat || null,
    longitude: location?.lon || null,
    address,
    phoneNo,
    email: email.trim().toLowerCase(),
    password,
    role: "VENDOR",
  };

  return axios.post(`${BASE_URL}/register`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// ---------------- FETCH PRODUCTS ----------------
export const fetchProductNames = (query = "") => {
  const token = localStorage.getItem("vendorJwtToken");

  if (!token) {
    throw new Error("No Vendor JWT token found. Please login.");
  }

  return axios.get(`${BASE_URL}/allProducts`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    params: query ? { name: query } : {},
  });
};

// ---------------- FETCH PRODUCT SUGGESTIONS ----------------
export const fetchProductSuggestions = (name) => {
  const token = localStorage.getItem("vendorJwtToken");

  if (!token) {
    throw new Error("No Vendor JWT token found. Please login.");
  }

  return axios.get(`${BASE_URL}/product-suggestions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    params: { name },
  });
};