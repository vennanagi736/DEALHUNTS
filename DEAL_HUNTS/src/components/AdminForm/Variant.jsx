import React, { useState } from "react";

function Variant({masterData, setMasterData}) {

    const [variant, setVariant] = useState({
        category: "",
        brand: "",
        product: "",
        variantName: "",
        ram: "",
        storage: "",
        processor: "",
        displaySize: "",
        battery: ""
    });


    const handleChange = (e) => {

        const { name, value } = e.target;

        setVariant((prev) => ({
            ...prev,
            [name]: value
        }));
        const fieldMap = {
    category: "category",
    brand: "brand",
    product: "product",
    variantName: "variant",
    ram: "ram",
    storage: "storage",
    processor: "processor",
    displaySize: "displaySize",
    battery: "battery"
};

setMasterData({
    ...masterData,
    [fieldMap[name]]: value
});

    };


    const handleSubmit = (e) => {

        e.preventDefault();

        console.log(variant);

        setVariant({
            category: "",
            brand: "",
            product: "",
            variantName: "",
            ram: "",
            storage: "",
            processor: "",
            displaySize: "",
            battery: ""
        });

    };


    return (
        <div>

            <h2>Variant Management</h2>


            <form onSubmit={handleSubmit}>


                {/* CATEGORY */}
                <label>Category</label>

                <select
                    name="category"
                    value={variant.category}
                    onChange={handleChange}
                >
                    <option value="">
                        Select Category
                    </option>

                    <option value="Smartphone">
                        Smartphone
                    </option>

                </select>



                {/* BRAND */}
                <label>Brand</label>

                <select
                    name="brand"
                    value={variant.brand}
                    onChange={handleChange}
                >

                    <option value="">
                        Select Brand
                    </option>

                    <option value="Samsung">
                        Samsung
                    </option>

                </select>



                {/* PRODUCT */}
                <label>Product</label>

                <select
                    name="product"
                    value={variant.product}
                    onChange={handleChange}
                >

                    <option value="">
                        Select Product
                    </option>

                    <option value="Galaxy S25 Ultra">
                        Galaxy S25 Ultra
                    </option>

                </select>



                {/* VARIANT NAME */}
                <label>Variant Name</label>

                <input
                    type="text"
                    name="variantName"
                    placeholder="Example: 12GB + 256GB"
                    value={variant.variantName}
                    onChange={handleChange}
                />



                {/* RAM */}
                <label>RAM</label>

                <input
                    type="text"
                    name="ram"
                    placeholder="Example: 12GB"
                    value={variant.ram}
                    onChange={handleChange}
                />



                {/* STORAGE */}
                <label>Storage</label>

                <input
                    type="text"
                    name="storage"
                    placeholder="Example: 256GB"
                    value={variant.storage}
                    onChange={handleChange}
                />



                {/* PROCESSOR */}
                <label>Processor</label>

                <input
                    type="text"
                    name="processor"
                    placeholder="Example: Snapdragon 8 Elite"
                    value={variant.processor}
                    onChange={handleChange}
                />



                {/* DISPLAY */}
                <label>Display Size</label>

                <input
                    type="text"
                    name="displaySize"
                    placeholder="Example: 6.9 inch"
                    value={variant.displaySize}
                    onChange={handleChange}
                />



                {/* BATTERY */}
                <label>Battery</label>

                <input
                    type="text"
                    name="battery"
                    placeholder="Example: 5000 mAh"
                    value={variant.battery}
                    onChange={handleChange}
                />



                <button type="submit">
                    Add Variant
                </button>


            </form>

        </div>
    );
}


export default Variant;