import React, { useEffect, useState } from "react";
import { getTrendingItems } from "../api/TrendingApi";
import "../styles/TrendingPreview.css";


function TrendingPreview(){

    const [items,setItems] = useState([]);

    const [currentIndex,setCurrentIndex] = useState(0);



    // Load promotions
    useEffect(()=>{

        const loadTrending = async()=>{

            const data = await getTrendingItems();

            console.log("Preview Data:",data);

            setItems(data);

        };


        loadTrending();

    },[]);



    // Change banner every 15 seconds
    useEffect(()=>{

        if(items.length <= 1)
            return;


        const interval = setInterval(()=>{

            setCurrentIndex(prev =>
                (prev + 1) % items.length
            );


        },15000);


        return ()=>clearInterval(interval);


    },[items]);



    if(items.length === 0){

        return (
            <p>
                No promotions
            </p>
        );
    }

return (
    <div className="trending-preview">

        <img
            src={items[currentIndex].imageUrl}
            alt={items[currentIndex].title}
            className="preview-image"
        />
        <div className="carousel-dots">

    {
        items.map((item,index)=>(

            <span
                key={index}

                className={
                    currentIndex === index
                    ? "dot active"
                    : "dot"
                }
                onClick={() =>
                    setCurrentIndex(index)
                }
            ></span>
        ))
    }
</div>

    </div>

);
}
export default TrendingPreview;