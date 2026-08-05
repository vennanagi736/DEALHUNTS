import React from "react";
import "../styles/TrendingPanel.css";


function TrendingPanel({items=[]}){


    return(
        <div className="trending-panel">
            {
                items.map(item=>(

                    <img

                        key={item.id}

                        src={item.imageUrl}

                        alt={item.title}

                        className="panel-image"

                    />

                ))
            }
        </div>

    );

}


export default TrendingPanel;