import axios from "axios";

export const getTrendingItems = async () => {

    try {

        const res = await axios.get(
            "http://localhost:8080/admin/promotions/trending"
        );

        console.log("Trending API:", res.data);

        return res.data;

    } catch(error) {

        console.log(
            "Trending API Error:",
            error
        );

        return [];

    }

};