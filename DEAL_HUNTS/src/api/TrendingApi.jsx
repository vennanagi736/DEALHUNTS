
import axios from "axios";
import { API_BASE_URL } from "./config.js";

export const getTrendingItems = async () => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/admin/promotions/trending`
        );

        console.log("Trending API:", res.data);

        return res.data;
    } catch (error) {
        console.log("Trending API Error:", error);
        return [];
    }
};
