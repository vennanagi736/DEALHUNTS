import React, { useEffect, useState } from "react";

import { getTrendingDeals } from "../../api/TrendingDealApi";
import { getProductImages } from "../../api/ProductApi";


function ATrendingDeals() {

    const [deals, setDeals] = useState([]);
    const [productImages, setProductImages] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);


    // =====================================================
    // FETCH TRENDING PRODUCTS
    // =====================================================

    useEffect(() => {

        const fetchTrendingDeals = async () => {

            try {

                const response =
                    await getTrendingDeals();

                console.log(
                    "Dashboard Trending Products:",
                    response.data
                );

                const trendingDeals =
                    response.data || [];

                setDeals(trendingDeals);


                // =====================================================
                // FETCH IMAGES
                // =====================================================

                const imageMap = {};

                for (const deal of trendingDeals) {

                    const product =
                        deal.product;

                    if (!product?.id) {
                        continue;
                    }

                    try {

                        const imageResponse =
                            await getProductImages(product.id);

                        console.log(
                            "Images for product:",
                            product.id,
                            imageResponse.data
                        );


                        if (
                            Array.isArray(imageResponse.data) &&
                            imageResponse.data.length > 0
                        ) {

                            const firstImage =
                                imageResponse.data[0];

                            imageMap[product.id] =
                                firstImage.thumbnailUrl ||
                                firstImage.imageUrl ||
                                firstImage.url;

                        }

                    } catch (imageError) {

                        console.error(
                            `Failed to fetch images for product ${product.id}:`,
                            imageError
                        );

                    }

                }


                console.log(
                    "TRENDING IMAGE MAP:",
                    imageMap
                );

                setProductImages(imageMap);

            } catch (error) {

                console.error(
                    "Failed to fetch trending products:",
                    error
                );

            }

        };


        fetchTrendingDeals();

    }, []);


    // =====================================================
    // AUTO CAROUSEL — 5 SECONDS
    // =====================================================

    useEffect(() => {

        if (deals.length <= 1) {
            return;
        }

        const interval = setInterval(() => {

            setCurrentIndex((previousIndex) =>
                (previousIndex + 1) % deals.length
            );

        }, 5000);


        return () => {
            clearInterval(interval);
        };

    }, [deals.length]);


    // =====================================================
    // MANUAL NAVIGATION
    // =====================================================

    const goTo = (index) => {

        if (deals.length === 0) {
            return;
        }

        setCurrentIndex(
            (index + deals.length) % deals.length
        );

    };


    // =====================================================
    // EMPTY STATE
    // =====================================================

    if (deals.length === 0) {

        return (

            <div className="admin-trending-products-atd">

                <div className="admin-trending-products-title-atd">

                    <h3>
                        Trending Products
                    </h3>

                </div>

                <div className="admin-trending-products-empty-atd">

                    <p>
                        No trending products right now.
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="admin-trending-products-atd">


            {/* =================================================
                TITLE
            ================================================= */}

            <div className="admin-trending-products-title-atd">

                <h3>
                    Trending Products
                </h3>

            </div>


            {/* =================================================
                VIEWPORT
            ================================================= */}

            <div className="admin-trending-products-viewport-atd">

                {/* =================================================
                    TRACK
                ================================================= */}

                <div
                    className="admin-trending-products-track-atd"
                    style={{
                        width: `${deals.length * 100}%`,
                        transform:
                            `translateX(-${currentIndex * (100 / deals.length)}%)`
                    }}
                >

                    {deals.map((deal, index) => {

                        const product =
                            deal.product;

                        const image =
                            product?.id
                                ? productImages[product.id]
                                : null;


                        return (

                            <div
                                key={deal.id ?? index}
                                className="admin-trending-products-slide-atd"
                                style={{
                                    width: `${100 / deals.length}%`
                                }}
                            >


                                {/* =================================
                                    IMAGE BOX
                                ================================= */}

                                <div className="admin-trending-products-image-box-atd">

                                    {image ? (

                                        <img
                                            src={image}
                                            alt={
                                                product?.name ||
                                                "Trending Product"
                                            }
                                            className="admin-trending-products-image-atd"
                                        />

                                    ) : (

                                        <div className="admin-trending-products-no-image-atd">

                                            No Image

                                        </div>

                                    )}

                                </div>


                                {/* =================================
                                    PRODUCT DETAILS
                                ================================= */}

                                <div className="admin-trending-products-details-atd">

                                    <h4>
                                        {product?.name ||
                                            "Trending Product"}
                                    </h4>

                                    <p>
                                        {product?.brand?.name || ""}
                                    </p>

                                    <span>
                                        Position {deal.position}
                                    </span>

                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>


            {/* =================================================
                DOTS
            ================================================= */}

            {deals.length > 1 && (

                <div className="admin-trending-products-dots-atd">

                    {deals.map((_, index) => (

                        <span
                            key={index}
                            className={
                                index === currentIndex
                                    ? "active-atd"
                                    : ""
                            }
                            onClick={() => goTo(index)}
                        />

                    ))}

                </div>

            )}


            {/* =================================================
                NAVIGATION
            ================================================= */}

            {deals.length > 1 && (

                <div className="admin-trending-products-navigation-atd">

                    <button
                        type="button"
                        onClick={() =>
                            goTo(currentIndex - 1)
                        }
                        aria-label="Previous product"
                    >
                        ‹
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            goTo(currentIndex + 1)
                        }
                        aria-label="Next product"
                    >
                        ›
                    </button>

                </div>

            )}

        </div>

    );

}


export default ATrendingDeals;