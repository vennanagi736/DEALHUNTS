
import axios from "axios";
import { API_BASE_URL } from "./config.js";

export const getTrendingItems = async () => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/admin/promotions/trending`
        );

        return res.data;
    } catch (error) {
        return [];
    }
};
