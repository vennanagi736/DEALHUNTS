import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrendingItems } from "../api/TrendingApi";
import "../styles/TrendingCarousel.css";


const TrendingCarousel = () => {

    const [items, setItems] = useState([]);

    const [currentIndex, setCurrentIndex] = useState(0);

    const navigate = useNavigate();



    // Load banners
    useEffect(()=>{

        const loadTrending = async()=>{

            const data = await getTrendingItems();

            console.log(
                "Carousel Data:",
                data
            );

            setItems(data);

        };


        loadTrending();


    },[]);





    // Auto slide
    useEffect(()=>{

        if(items.length <= 1)
            return;


        const interval = setInterval(()=>{

            setCurrentIndex(prev =>
                (prev + 1) % items.length
            );


        },5000);


        return ()=>clearInterval(interval);


    },[items]);

    if(items.length === 0){

        return (
            <p>
                No banners available
            </p>
        );

    }
return (

    <div className="carousel-container">
        <div className="carousel-item">

            <img
                src={items[currentIndex].imageUrl}
                className="carousel-image"
                alt={items[currentIndex].title}

                onClick={() =>
                    items[currentIndex].url &&
                    navigate(items[currentIndex].url)
                }

            />
            </div>


            <div className="dots-container">

                {
                    items.map((_,index)=>(

                        <span

                            key={index}

                            className={
                                currentIndex === index
                                ?
                                "dot active"
                                :
                                "dot"
                            }

                            onClick={() =>
                                setCurrentIndex(index)
                            }
                        >
                        </span>
                    ))
                }
            </div>
        </div>
);

};


export default TrendingCarousel;