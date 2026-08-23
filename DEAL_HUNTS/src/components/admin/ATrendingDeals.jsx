import React, { useEffect, useState } from "react";

import { getTrendingDeals } from "../../api/TrendingDealApi";
import { getProductImages } from "../../api/ProductApi";


function ATrendingDeals() {

    const [deals, setDeals] = useState([]);

    const [productImages, setProductImages] = useState({});


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
                    response.data;

                setDeals(trendingDeals);


                // =====================================================
                // FETCH IMAGES FOR EACH PRODUCT
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
                        console.log("Image api response:",imageResponse.data);


                        if (
                            Array.isArray(imageResponse.data) &&
                            imageResponse.data.length > 0
                        ) {
                            const firstImage = imageResponse.data[0];
                            console.log("First image object:",firstImage);
                            imageMap[product.id] =
                                firstImage.thumbnailUrl;

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
    // EMPTY
    // =====================================================

    if (deals.length === 0) {

        return (

            <div className="admin-trending-products">

                <div className="admin-trending-products-title">

                    <h3>
                        Trending Products
                    </h3>

                </div>

                <div className="admin-trending-products-empty">

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

        <div className="admin-trending-products">


            {/* TITLE */}

            <div className="admin-trending-products-title">

                <h3>
                    Trending Products
                </h3>

            </div>


            {/* PRODUCT LIST */}

            <div className="admin-trending-products-list">

                {deals.map((deal) => {

                    const product =
                        deal.product;


                    // Get image using product ID
                    const image =
                        product?.id
                            ? productImages[product.id]
                            : null;


                    return (

                        <div
                            key={deal.id}
                            className="admin-trending-products-item"
                        >


                            {/* PRODUCT IMAGE */}

                            <div className="admin-trending-products-image">

                                {image ? (

                                    <img
                                        src={image}
                                        alt={
                                            product?.name ||
                                            "Trending Product"
                                        }
                                    />

                                ) : (

                                    <div className="admin-trending-products-no-image">

                                        No Image

                                    </div>

                                )}

                            </div>


                            {/* PRODUCT DETAILS */}

                            <div className="admin-trending-products-details">

                                <h4>
                                    {product?.name}
                                </h4>

                                <p>
                                    {product?.brand}
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

    );

}


export default ATrendingDeals;