import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

import SideWindow from "../../components/SideBar";

import {
    addProduct,
    getAllCategories,
    getAllBrands,
    getProductById,
    updateProduct
} from "../../api/ProductApi";

import "../../styles/ProductPreview.css";


function AdminAddProduct() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const editProductId = searchParams.get("edit");

    const isEditMode = Boolean(editProductId);


    // =====================================================
    // PRODUCT DATA
    // =====================================================

    const [productData, setProductData] = useState({

        category: "",
        brand: "",
        product: "",
        description: "",

        variants: [
            {
                ram: "",
                storage: ""
            }
        ],

        processor: "",
        displaySize: "",
        battery: "",

        colors: [
            {
                name: "",
                hexCode: ""
            }
        ]

    });


    // =====================================================
    // MASTER DATA
    // =====================================================

    const [categories, setCategories] = useState([]);

    const [brands, setBrands] = useState([]);


    // =====================================================
    // LOAD CATEGORIES
    // =====================================================

    const loadCategories = async () => {

        try {

            const { data } = await getAllCategories();

            setCategories(data);

        } catch (error) {

            console.error(
                "Failed to load categories:",
                error
            );

        }

    };


    // =====================================================
    // LOAD BRANDS
    // =====================================================

    const loadBrands = async () => {

        try {

            const { data } = await getAllBrands();

            setBrands(data);

        } catch (error) {

            console.error(
                "Failed to load brands:",
                error
            );

        }

    };


    // =====================================================
    // LOAD MASTER DATA
    // =====================================================

    useEffect(() => {

        const loadData = async () => {

            await loadCategories();

            await loadBrands();

        };

        loadData();

    }, []);


    // =====================================================
    // LOAD PRODUCT FOR EDIT
    // =====================================================

    useEffect(() => {

        if (!editProductId) {
            return;
        }


        const loadProductForEdit = async () => {

            try {

                console.log(
                    "Loading product for edit:",
                    editProductId
                );


                const res =
                    await getProductById(editProductId);


                const product = res.data;


                console.log(
                    "PRODUCT FROM API:",
                    product
                );


                setProductData({

                    category:
                        product.category || "",

                    brand:
                        product.brand || "",

                    product:
                        product.name || "",

                    description:
                        product.description || "",


                    variants:
                        product.variants?.length > 0

                            ? product.variants.map(
                                variant => ({
                                    ram:
                                        variant.ram || "",

                                    storage:
                                        variant.storage || ""
                                })
                            )

                            : [
                                {
                                    ram: "",
                                    storage: ""
                                }
                            ],


                    processor:
                        product.processor || "",

                    displaySize:
                        product.displaySize || "",

                    battery:
                        product.battery || "",

colors:
    product.colors?.length > 0
        ? product.colors.map(color => ({
            id: color.id,
            name: color.name || "",
            hexCode: color.hexCode || ""
        }))
        : [
            {
                id: null,
                name: "",
                hexCode: ""
            }
        ]

                });


            } catch (error) {

                console.error(
                    "Failed to load product:",
                    error
                );

                console.error(
                    "ERROR DATA:",
                    error.response?.data
                );

                alert(
                    "Failed to load product."
                );

            }

        };


        loadProductForEdit();

    }, [editProductId]);


    // =====================================================
    // NORMAL INPUT CHANGE
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setProductData(prev => ({

            ...prev,

            [name]: value

        }));

    };


    // =====================================================
    // VARIANT CHANGE
    // =====================================================

    const handleVariantChange = (
        index,
        field,
        value
    ) => {

        setProductData(prev => {

            const updatedVariants =
                [...prev.variants];


            updatedVariants[index] = {

                ...updatedVariants[index],

                [field]: value

            };


            return {

                ...prev,

                variants: updatedVariants

            };

        });

    };


    // =====================================================
    // ADD VARIANT
    // =====================================================

    const addVariant = () => {

        setProductData(prev => ({

            ...prev,

            variants: [

                ...prev.variants,

                {
                    ram: "",
                    storage: ""
                }

            ]

        }));

    };


    // =====================================================
    // REMOVE VARIANT
    // =====================================================

    const removeVariant = (index) => {

        if (
            productData.variants.length === 1
        ) {

            alert(
                "At least one variant is required"
            );

            return;

        }


        setProductData(prev => ({

            ...prev,

            variants:
                prev.variants.filter(
                    (_, i) => i !== index
                )

        }));

    };


    // =====================================================
    // COLOR CHANGE
    // =====================================================

    const handleColorChange = (
        index,
        field,
        value
    ) => {

        setProductData(prev => {

            const updatedColors =
                [...prev.colors];


            updatedColors[index] = {

                ...updatedColors[index],

                [field]: value

            };


            return {

                ...prev,

                colors: updatedColors

            };

        });

    };


    // =====================================================
    // ADD COLOR
    // =====================================================

    const addColor = () => {

    setProductData(prev => ({

        ...prev,

        colors: [

            ...prev.colors,

            {
                id: null,
                name: "",
                hexCode: ""
            }

        ]

    }));

};
    // =====================================================
    // REMOVE COLOR
    // =====================================================

    const removeColor = (index) => {

        if (
            productData.colors.length === 1
        ) {

            alert(
                "At least one color is required"
            );

            return;

        }


        setProductData(prev => ({

            ...prev,

            colors:
                prev.colors.filter(
                    (_, i) => i !== index
                )

        }));

    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        console.log(
            "========== SUBMIT STARTED =========="
        );

        console.log(
            "EDIT MODE:",
            isEditMode
        );

        console.log(
            "EDIT PRODUCT ID:",
            editProductId
        );

        console.log(
            "CURRENT PRODUCT DATA:",
            productData
        );


        // =================================================
        // REQUIRED FIELDS
        // =================================================

        if (
            !productData.category.trim() ||
            !productData.brand.trim() ||
            !productData.product.trim()
        ) {

            alert(
                "Please fill all required fields."
            );

            return;

        }


        // =================================================
        // SPECIFICATIONS
        // =================================================

        if (
            !productData.processor.trim() ||
            !productData.displaySize.trim() ||
            !productData.battery.trim()
        ) {

            alert(
                "Please complete all specifications."
            );

            return;

        }


        // =================================================
        // VARIANT VALIDATION
        // =================================================

        for (
            let i = 0;
            i < productData.variants.length;
            i++
        ) {

            const variant =
                productData.variants[i];


            if (
                !variant.ram.trim() ||
                !variant.storage.trim()
            ) {

                alert(
                    `Please complete Variant ${i + 1}.`
                );

                return;

            }

        }


        // =================================================
        // COLOR VALIDATION
        // =================================================

        const hexColorRegex =
            /^#[0-9A-Fa-f]{6}$/;


        for (
            let i = 0;
            i < productData.colors.length;
            i++
        ) {

            const color =
                productData.colors[i];


            const colorName =
                color.name.trim();


            const hexCode =
                color.hexCode.trim();


            console.log(
                "HEX VALIDATION:",
                {
                    colorNumber: i + 1,
                    name: colorName,
                    hex: hexCode,
                    length: hexCode.length,
                    valid: hexColorRegex.test(hexCode)
                }
            );


            // Color name

            if (!colorName) {

                alert(
                    `Please enter a name for Color ${i + 1}.`
                );

                return;

            }


            // HEX code

            if (!hexColorRegex.test(hexCode)) {

                alert(
                    `Invalid HEX code for Color ${i + 1}.\n\n` +
                    `Current value: ${hexCode}\n\n` +
                    `Use exactly 6 hexadecimal digits.\n` +
                    `Example: #2563EB`
                );

                return;

            }

        }


        // =================================================
        // CREATE REQUEST OBJECT
        // =================================================

        const product = {

            name:
                productData.product.trim(),

            brand:
                productData.brand.trim(),

            category:
                productData.category.trim(),

            description:
                productData.description.trim(),

            processor:
                productData.processor.trim(),

            displaySize:
                productData.displaySize.trim(),

            battery:
                productData.battery.trim(),


            variants:
                productData.variants.map(
                    variant => ({

                        ram:
                            variant.ram.trim(),

                        storage:
                            variant.storage.trim()

                    })
                ),


           colors:
    productData.colors.map(
        color => ({
            id: color.id || null,

            name:
                color.name.trim(),

            hexCode:
                color.hexCode.trim().toUpperCase()
        })
    )

        };


        // =================================================
        // FINAL DEBUG
        // =================================================

        console.log(
            "========== FINAL REQUEST =========="
        );

        console.log(
            JSON.stringify(
                product,
                null,
                2
            )
        );

        console.log(
            "===================================="
        );


        // =================================================
        // ADD / UPDATE
        // =================================================

        try {

            if (isEditMode) {

                console.log(
                    "========== UPDATE PRODUCT =========="
                );

                console.log(
                    "PRODUCT ID:",
                    editProductId
                );

                console.log(
                    "UPDATE DATA:",
                    JSON.stringify(
                        product,
                        null,
                        2
                    )
                );


                await updateProduct(
                    editProductId,
                    product
                );


                console.log(
                    "PRODUCT UPDATE SUCCESS"
                );


                alert(
                    "Product updated successfully."
                );


               navigate("/admin/manage-products");


            } else {

                console.log(
                    "========== ADD PRODUCT =========="
                );


                await addProduct(
                    product
                );


                console.log(
                    "PRODUCT ADD SUCCESS"
                );


                alert(
                    "Product Added Successfully"
                );


                navigate(
                    "/admin/products"
                );

            }


        } catch (error) {

            console.error(
                "========== PRODUCT API ERROR =========="
            );

            console.error(
                "FULL ERROR:",
                error
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            console.error(
                "DATA:",
                error.response?.data
            );

            console.error(
                "URL:",
                error.config?.url
            );

            console.error(
                "METHOD:",
                error.config?.method
            );

            console.error(
                "REQUEST DATA:",
                error.config?.data
            );

            console.error(
                "========================================"
            );


            alert(

                isEditMode

                    ? "Failed to update product."

                    : "Failed to add product."

            );

        }

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <>

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="header">

                <div className="left-section">

                    <SideWindow />

                </div>


                <div className="logo">

                    <span className="Gold">
                        DEAL
                    </span>

                    <span className="Black">
                        HUNTS
                    </span>

                    <span className="Admin">
                        Admin
                    </span>

                </div>


                <div>

                    <button
                        className="options-btn"
                        onClick={() =>
                            navigate(
                                "/admin/master-data"
                            )
                        }
                    >
                        Master Data
                    </button>

                </div>


                <div
                    className="back-btn"
                    onClick={() =>
                        navigate(-1)
                    }
                >
                    &#8592;
                </div>

            </header>


            {/* =================================================
                PAGE TITLE
            ================================================= */}

            <h1 className="page-title">

                {
                    isEditMode
                        ? "Edit Product"
                        : "New Product"
                }

            </h1>


            <div className="master-layout">


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    className="master-form-section"
                    onSubmit={handleSubmit}
                >


                    {/* PRODUCT DETAILS */}

                    <h2>
                        Product Details
                    </h2>


                    <label>
                        Category
                    </label>


                    <select
                        name="category"
                        value={productData.category}
                        onChange={handleChange}
                    >

                        <option value="">
                            Select Category
                        </option>


                        {
                            categories.map(
                                category => (

                                    <option
                                        key={category.id}
                                        value={category.name}
                                    >
                                        {category.name}
                                    </option>

                                )
                            )
                        }

                    </select>


                    <label>
                        Brand
                    </label>


                    <select
                        name="brand"
                        value={productData.brand}
                        onChange={handleChange}
                    >

                        <option value="">
                            Select Brand
                        </option>


                        {
                            brands.map(
                                brand => (

                                    <option
                                        key={brand.id}
                                        value={brand.name}
                                    >
                                        {brand.name}
                                    </option>

                                )
                            )
                        }

                    </select>


                    <label>
                        Product Name
                    </label>


                    <input
                        type="text"
                        name="product"
                        placeholder="Enter Product Name"
                        value={productData.product}
                        onChange={handleChange}
                    />


                    <label>
                        Description
                    </label>


                    <textarea
                        name="description"
                        placeholder="Enter Product Description"
                        maxLength={1000}
                        value={productData.description}
                        onChange={handleChange}
                    />


                    {/* =================================================
                        VARIANTS
                    ================================================= */}

                    <h2>
                        Variant Details
                    </h2>


                    {
                        productData.variants.map(
                            (variant, index) => (

                                <div key={index}>

                                    <label>
                                        RAM
                                    </label>


                                    <input
                                        type="text"
                                        name="ram"
                                        value={variant.ram}
                                        onChange={
                                            e =>
                                                handleVariantChange(
                                                    index,
                                                    "ram",
                                                    e.target.value
                                                )
                                        }
                                    />


                                    <label>
                                        Storage
                                    </label>


                                    <input
                                        type="text"
                                        name="storage"
                                        value={variant.storage}
                                        onChange={
                                            e =>
                                                handleVariantChange(
                                                    index,
                                                    "storage",
                                                    e.target.value
                                                )
                                        }
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeVariant(index)
                                        }
                                    >
                                        Remove
                                    </button>

                                </div>

                            )
                        )
                    }


                    <button
                        type="button"
                        onClick={addVariant}
                    >
                        + Add Variant
                    </button>


                    {/* =================================================
                        SPECIFICATIONS
                    ================================================= */}

                    <label>
                        Processor
                    </label>


                    <input
                        type="text"
                        name="processor"
                        placeholder="Example: Snapdragon"
                        value={productData.processor}
                        onChange={handleChange}
                    />


                    <label>
                        Display Size
                    </label>


                    <input
                        type="text"
                        name="displaySize"
                        placeholder="Example: 6.9 inch"
                        value={productData.displaySize}
                        onChange={handleChange}
                    />


                    <label>
                        Battery
                    </label>


                    <input
                        type="text"
                        name="battery"
                        placeholder="Example: 5000 mAh"
                        value={productData.battery}
                        onChange={handleChange}
                    />


                    {/* =================================================
                        COLORS
                    ================================================= */}

                    <h2>
                        Color Details
                    </h2>


                    {
                        productData.colors.map(
                            (color, index) => (

                                <div key={index}>

                                    <label>
                                        Color Name
                                    </label>


                                    <input
                                        type="text"
                                        name="color"
                                        value={color.name}
                                        onChange={
                                            e =>
                                                handleColorChange(
                                                    index,
                                                    "name",
                                                    e.target.value
                                                )
                                        }
                                    />


                                    <label>
                                        Hex Code
                                    </label>


                                    <input
                                        type="text"
                                        name="hexCode"
                                        value={color.hexCode}
                                        placeholder="#000000"
                                        maxLength={7}
                                        onChange={
                                            e =>
                                                handleColorChange(
                                                    index,
                                                    "hexCode",
                                                    e.target.value
                                                )
                                        }
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeColor(index)
                                        }
                                    >
                                        Remove
                                    </button>

                                </div>

                            )
                        )
                    }


                    <button
                        type="button"
                        onClick={addColor}
                    >
                        + Add Color
                    </button>


                    {/* =================================================
                        SUBMIT
                    ================================================= */}

                    <button
                        className="add-product-btn"
                        type="submit"
                    >

                        {
                            isEditMode
                                ? "Save Changes"
                                : "Save Product"
                        }

                    </button>


                </form>


                {/* =================================================
                    LIVE PREVIEW
                ================================================= */}

                <div className="master-preview-section">

                    <h2>
                        Live Preview Details
                    </h2>


                    <div className="master-preview-card">


                        <div className="preview-item">

                            <label>
                                Category
                            </label>

                            <input
                                readOnly
                                value={
                                    productData.category
                                }
                            />

                        </div>


                        <div className="preview-item">

                            <label>
                                Brand
                            </label>

                            <input
                                readOnly
                                value={
                                    productData.brand
                                }
                            />

                        </div>


                        <div className="preview-item">

                            <label>
                                Product
                            </label>

                            <input
                                readOnly
                                value={
                                    productData.product
                                }
                            />

                        </div>


                        <div className="preview-item">

                            <label>
                                Description
                            </label>

                            <textarea
                                readOnly
                                value={
                                    productData.description
                                }
                            />

                        </div>


                        <div className="preview-item">

                            <label>
                                Processor
                            </label>

                            <input
                                readOnly
                                value={
                                    productData.processor
                                }
                            />

                        </div>


                        <div className="preview-item">

                            <label>
                                Display
                            </label>

                            <input
                                readOnly
                                value={
                                    productData.displaySize
                                }
                            />

                        </div>


                        <div className="preview-item">

                            <label>
                                Battery
                            </label>

                            <input
                                readOnly
                                value={
                                    productData.battery
                                }
                            />

                        </div>


                        {/* VARIANTS PREVIEW */}

                        <h3>
                            Variants
                        </h3>


                        {
                            productData.variants.map(
                                (variant, index) => (

                                    <div
                                        className="preview-item"
                                        key={index}
                                    >

                                        <label>
                                            Variant {index + 1}
                                        </label>


                                        <input
                                            readOnly
                                            value={
                                                `${variant.ram} | ${variant.storage}`
                                            }
                                        />

                                    </div>

                                )
                            )
                        }


                        {/* COLORS PREVIEW */}

                        <h3>
                            Colors
                        </h3>


                        {
                            productData.colors.map(
                                (color, index) => (

                                    <div
                                        className="preview-item"
                                        key={index}
                                    >

                                        <label>
                                            Color {index + 1}
                                        </label>


                                        <input
                                            readOnly
                                            value={
                                                `${color.name} (${color.hexCode})`
                                            }
                                        />

                                    </div>

                                )
                            )
                        }

                    </div>

                </div>

            </div>

        </>

    );

}


export default AdminAddProduct;