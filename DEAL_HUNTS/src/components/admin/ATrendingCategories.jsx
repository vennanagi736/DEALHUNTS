import React, { useEffect, useState } from "react";
import axios from "axios";

function ATrendingCategories() {

    const [categories, setCategories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // =====================================================
    // FETCH TRENDING CATEGORIES
    // =====================================================

    useEffect(() => {

        const fetchTrendingCategories = async () => {

            try {

                const response = await axios.get(
                    "http://localhost:8080/admin/trending-categories"
                );

                console.log(
                    "Trending Categories:",
                    response.data
                );

                setCategories(response.data);

            } catch (error) {

                console.error(
                    "Failed to fetch trending categories:",
                    error
                );

            }

        };

        fetchTrendingCategories();

    }, []);

    // =====================================================
    // AUTO SLIDE
    // =====================================================

    useEffect(() => {

        if (categories.length <= 1) {
            return;
        }

        const interval = setInterval(() => {

            setCurrentIndex((prev) =>
                (prev + 1) % categories.length
            );

        }, 4000);

        return () => clearInterval(interval);

    }, [categories]);

    // =====================================================
    // EMPTY
    // =====================================================

    if (categories.length === 0) {

        return (
            <div className="admin-trending-carousel-atc">

                <div className="admin-trending-title-atc">
                    <h3>Trending Categories</h3>
                </div>

                <div className="admin-trending-empty-atc">
                    No Trending Categories
                </div>

            </div>
        );

    }

    const trending = categories[currentIndex];

    const category = trending.category;

    return (

        <div className="admin-trending-carousel-atc">

            {/* TITLE */}

            <div className="admin-trending-title-atc">

                <h3>
                    Trending Categories
                </h3>

            </div>


            {/* CATEGORY CONTENT */}

            <div className="admin-trending-category-content-atc">

                {/* CATEGORY IMAGE */}

                <div className="admin-trending-image-wrapper-atc">

                    <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="admin-trending-image-atc"
                    />

                </div>


                {/* CATEGORY NAME */}

                <div className="admin-trending-details-atc">

                    <h4>
                        {category.name}
                    </h4>

                </div>

            </div>


            {/* DOTS */}

            {categories.length > 1 && (

                <div className="admin-trending-dots-atc">

                    {categories.map((_, index) => (

                        <span
                            key={index}
                            className={
                                index === currentIndex
                                    ? "active-atc"
                                    : ""
                            }
                            onClick={() =>
                                setCurrentIndex(index)
                            }
                        />

                    ))}

                </div>

            )}

        </div>
    );
}

export default ATrendingCategories;