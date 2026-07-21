import React, { useState } from "react";

function ProductMaster({masterData, setMasterData}) {

    const [product, setProduct] = useState({
        category: "",
        brand: "",
        name: "",
        description: "",
        image: ""
    });


    const handleChange = (e) => {

        const { name, value } = e.target;

        setProduct((prev) => ({
            ...prev,
            [name]: value
        }));

        const fieldMap = {
    category: "category",
    brand: "brand",
    name: "product",
    description: "description",
    image: "image"
};
 setMasterData({
    ...masterData,
    [fieldMap[name]]: value
});

    };


    const handleSubmit = (e) => {

        e.preventDefault();

        console.log(product);

        setProduct({
            category: "",
            brand: "",
            name: "",
            description: "",
            image: ""
        });

    };


    return (
        <div>

            <h2>Product Management</h2>


            <form onSubmit={handleSubmit}>


                {/* CATEGORY */}
                <label>Category</label>

                <select
                    name="category"
                    value={product.category}
                    onChange={handleChange}
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



                {/* BRAND */}
                <label>Brand</label>

                <select
                    name="brand"
                    value={product.brand}
                    onChange={handleChange}
                >

                    <option value="">
                        Select Brand
                    </option>

                    <option value="Samsung">
                        Samsung
                    </option>

                    <option value="Apple">
                        Apple
                    </option>

                </select>



                {/* PRODUCT NAME */}
                <label>Product Name</label>

                <input
                    type="text"
                    name="name"
                    placeholder="Enter Product Name"
                    value={product.name}
                    onChange={handleChange}
                />



                {/* DESCRIPTION */}
                <label>Description</label>

                <textarea
                    name="description"
                    placeholder="Enter Product Description"
                    value={product.description}
                    onChange={handleChange}
                />



                {/* IMAGE */}
                <label>Product Image</label>

                <input
                    type="text"
                    name="image"
                    placeholder="Enter Image URL"
                    value={product.image}
                    onChange={handleChange}
                />



                <button type="submit">
                    Add Product
                </button>


            </form>


        </div>
    );
}


export default ProductMaster;