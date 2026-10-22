import React from "react";
import { useState } from "react";


function Category({masterData,setMasterData}){
    const [categoryName, setCategoryName] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        setCategoryName("");
    };

return(
    <div>
        <h2>Category Management</h2>
        <form onSubmit={handleSubmit}>
            <label>Category Name</label>
            <input type="text" 
            value={categoryName}
            onChange={(e) => {
             setCategoryName(e.target.value);

             setMasterData({
             ...masterData,
             category: e.target.value
            });
          }}
             placeholder="Enter Category Name"/>
            <button type="submit">
                Add Category
                </button>
        </form>


    </div>

)
}

export default Category;