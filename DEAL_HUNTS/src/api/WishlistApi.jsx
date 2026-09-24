import axios from "axios";

const API_BASE_URL = "http://localhost:8080";


// ============================================================
// GET AUTH TOKEN
// ============================================================

const getAuthHeaders = () => {

  const token =
    localStorage.getItem("userJwtToken");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};


// ============================================================
// GET MY WISHLIST
// ============================================================

export const getWishlist = async () => {

  const response = await axios.get(
    `${API_BASE_URL}/wishlist`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};


// ============================================================
// ADD PRODUCT TO WISHLIST
// ============================================================

export const addToWishlist = async (productId) => {

  const response = await axios.post(
    `${API_BASE_URL}/wishlist/add/${productId}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};


// ============================================================
// REMOVE PRODUCT FROM WISHLIST
// ============================================================

export const removeFromWishlist = async (productId) => {

  const response = await axios.delete(
    `${API_BASE_URL}/wishlist/remove/${productId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};


// ============================================================
// CHECK PRODUCT IN WISHLIST
// ============================================================

export const checkWishlist = async (productId) => {

  const response = await axios.get(
    `${API_BASE_URL}/wishlist/check/${productId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};