import axios from "axios";

export const getTrendingItems = async () => {
  try {
    const res = await axios.get("http://localhost:8080/vendor/register");
    return res.data; // array of {image, url}
  } catch (err) {
    console.error("Failed to fetch trending items:", err);
    return [];
  }
};