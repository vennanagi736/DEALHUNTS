import React, { useState } from "react";

function Color({masterData, setMasterData}) {

    const [color, setColor] = useState({
        category: "",
        brand: "",
        product: "",
        variant: "",
        name: "",
        hexCode: ""
    });


  const handleChange = (e) => {

    const { name, value } = e.target;

    setColor((prev) => ({
        ...prev,
        [name]: value
    }));

    const fieldMap = {
        category: "category",
        brand: "brand",
        product: "product",
        variant: "variant",
        name: "color",
        hexCode: "hexCode"
    };

    setMasterData({
        ...masterData,
        [fieldMap[name]]: value
    });

};

    const handleSubmit = (e) => {

        e.preventDefault();

        console.log(color);

        setColor({
            category: "",
            brand: "",
            product: "",
            variant: "",
            name: "",
            hexCode: ""
        });

    };


    return (
        <div>

            <h2>Color Management</h2>


            <form onSubmit={handleSubmit}>


                {/* CATEGORY */}
                <label>Category</label>

                <select
                    name="category"
                    value={color.category}
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
                    value={color.brand}
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
                    value={color.product}
                    onChange={handleChange}
                >

                    <option value="">
                        Select Product
                    </option>

                    <option value="Galaxy S25 Ultra">
                        Galaxy S25 Ultra
                    </option>

                </select>



                {/* VARIANT */}
                <label>Variant</label>

                <select
                    name="variant"
                    value={color.variant}
                    onChange={handleChange}
                >

                    <option value="">
                        Select Variant
                    </option>

                    <option value="12GB + 256GB">
                        12GB + 256GB
                    </option>

                </select>



                {/* COLOR NAME */}
                <label>Color Name</label>

                <input
                    type="text"
                    name="name"
                    placeholder="Example: Titanium Black"
                    value={color.name}
                    onChange={handleChange}
                />



                {/* HEX CODE */}
                <label>Hex Code</label>

                <input
                    type="text"
                    name="hexCode"
                    placeholder="Example: #000000"
                    value={color.hexCode}
                    onChange={handleChange}
                />



                <button type="submit">
                    Add Color
                </button>


            </form>


        </div>
    );
}


export default Color;