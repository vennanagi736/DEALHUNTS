import React, { useState } from "react";

function Brand({ masterData, setMasterData }) {

    const [brandName, setBrandName] = useState("");
    const [category, setCategory] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log({
            category,
            brandName
        });

        setCategory("");
        setBrandName("");
    };

    return (
        <div>

            <h2>Brand Management</h2>

            <form onSubmit={handleSubmit}>

                {/* CATEGORY */}
                <label>Category</label>

                <select
                    value={category}
                    onChange={(e) => {

                        setCategory(e.target.value);

                        setMasterData({
                            ...masterData,
                            category: e.target.value
                        });

                    }}
                >
                    <option value="">
                        Select Category
                    </option>

                    <option value="Smartphone">
                        Smartphone
                    </option>

                    <option value="Laptop">
                        Laptop
                    </option>

                </select>

                {/* BRAND NAME */}
                <label>Brand Name</label>

                <input
                    type="text"
                    placeholder="Enter Brand Name"
                    value={brandName}
                    onChange={(e) => {

                        setBrandName(e.target.value);

                        setMasterData({
                            ...masterData,
                            brand: e.target.value
                        });

                    }}
                />

                <button type="submit">
                    Add Brand
                </button>

            </form>

        </div>
    );
}

export default Brand;