import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";


import {
    addProduct,
    getAllCategories,
    getAllBrands,
    getProductById,
    updateProduct
} from "../../api/ProductApi";

import {
    getAttributesByCategory
} from "../../api/AttributeDefinitionApi";

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

        category: {
            id: null,
            name: ""
        },

        brand: {
            id: null,
            name: ""
        },

        product: "",

        description: "",

        variants: [
            {
                id: null,
                ram: "",
                storage: "",
                colors: [
                    {
                        id: null,
                        name: "",
                        hexCode: "",
                        price: ""
                    }
                ]
            }
        ],

        specifications: {}

    });


    // =====================================================
    // MASTER DATA
    // =====================================================

    const [categories, setCategories] = useState([]);

    const [brands, setBrands] = useState([]);


    // =====================================================
    // CATEGORY ATTRIBUTES
    // =====================================================

    const [
        selectedSpecifications,
        setSelectedSpecifications
    ] = useState([]);


    // =====================================================
    // LOADING
    // =====================================================

    const [loading, setLoading] = useState(false);

    const [
        attributesLoading,
        setAttributesLoading
    ] = useState(false);


    // =====================================================
    // CATEGORY
    // =====================================================

    const categoryName =
        productData.category?.name || "";

    const categoryId =
        productData.category?.id || null;


    // =====================================================
    // MOBILE CATEGORY
    // =====================================================

    const isMobileCategory =
        categoryName.trim().toLowerCase() === "mobile phones";


    // =====================================================
    // HELPERS
    // =====================================================

    const createEmptyColor = () => ({
        id: null,
        name: "",
        hexCode: "",
        price: ""
    });


    const createEmptyVariant = () => ({
        id: null,
        ram: "",
        storage: "",
        colors: [
            createEmptyColor()
        ]
    });


    /*
     * RAM and ROM/Storage are Variant data for mobile phones.
     *
     * Therefore they must NOT appear again inside
     * Product Specifications.
     */

    const isVariantSpecification = (specification) => {

        if (!isMobileCategory) {
            return false;
        }


        const name =
            specification?.name
                ?.trim()
                .toLowerCase()
                .replace(/[\s_-]/g, "");


        const label =
            specification?.label
                ?.trim()
                .toLowerCase()
                .replace(/[\s_-]/g, "");


        return (
            name === "ram" ||
            name === "rom" ||
            name === "storage" ||
            label === "ram" ||
            label === "rom" ||
            label === "storage"
        );

    };


    /*
     * Only real product specifications are displayed.
     *
     * For mobile:
     * RAM + ROM/Storage are removed because they belong
     * to Variant.
     */

    const visibleSpecifications =
        selectedSpecifications.filter(
            specification =>
                !isVariantSpecification(
                    specification
                )
        );


    // =====================================================
    // LOAD CATEGORIES
    // =====================================================

    useEffect(() => {

        const loadCategories = async () => {

            try {

                const response =
                    await getAllCategories();


                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : [];


                setCategories(data);

            } catch (error) {

                console.error(
                    "Failed to load categories:",
                    error
                );


                setCategories([]);

            }

        };


        loadCategories();

    }, []);


    // =====================================================
    // LOAD BRANDS
    // =====================================================

    useEffect(() => {

        const loadBrands = async () => {

            try {

                const response =
                    await getAllBrands();


                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : [];


                setBrands(data);

            } catch (error) {

                console.error(
                    "Failed to load brands:",
                    error
                );


                setBrands([]);

            }

        };


        loadBrands();

    }, []);


    // =====================================================
    // LOAD CATEGORY SPECIFICATIONS
    // =====================================================

    useEffect(() => {

        console.log(
            "CATEGORY ID:",
            categoryId
        );


        console.log(
            "CATEGORY NAME:",
            categoryName
        );


        if (!categoryId) {

            setSelectedSpecifications([]);

            return;

        }


        const loadSpecifications = async () => {

            try {

                setAttributesLoading(true);


                console.log(
                    "REQUESTING:",
                    `http://localhost:8080/attributes/category/${categoryId}`
                );


                const response =
                    await getAttributesByCategory(
                        categoryId
                    );


                console.log(
                    "ATTRIBUTE RESPONSE:",
                    response.data
                );


                const attributes =
                    Array.isArray(response.data)
                        ? response.data
                        : [];


                setSelectedSpecifications(
                    attributes
                );


            } catch (error) {

                console.error(
                    "Failed to load category specifications:",
                    error
                );


                console.error(
                    "ERROR RESPONSE:",
                    error.response?.data
                );


                setSelectedSpecifications([]);

            } finally {

                setAttributesLoading(false);

            }

        };


        loadSpecifications();

    }, [categoryId, categoryName]);


    // =====================================================
    // LOAD PRODUCT FOR EDIT
    // =====================================================

    useEffect(() => {

        if (!editProductId) {
            return;
        }


        if (
            categories.length === 0 ||
            brands.length === 0
        ) {

            return;

        }


        const loadProductForEdit = async () => {

            try {

                const response =
                    await getProductById(
                        editProductId
                    );


                const product =
                    response.data;


                // =================================================
                // CATEGORY
                // =================================================

                let category = {
                    id: null,
                    name: ""
                };


                if (product.category) {

                    if (
                        typeof product.category ===
                        "object"
                    ) {

                        const categoryIdFromProduct =
                            product.category.id ?? null;


                        const matchedCategory =
                            categories.find(
                                item =>
                                    Number(item.id) ===
                                    Number(
                                        categoryIdFromProduct
                                    )
                            );


                        category = {

                            id:
                                matchedCategory?.id ??
                                categoryIdFromProduct,

                            name:
                                matchedCategory?.name ??
                                product.category.name ??
                                ""

                        };

                    } else {

                        const matchedCategory =
                            categories.find(
                                item =>
                                    item.name
                                        ?.trim()
                                        .toLowerCase() ===
                                    String(
                                        product.category
                                    )
                                        .trim()
                                        .toLowerCase()
                            );


                        category = {

                            id:
                                matchedCategory?.id ??
                                null,

                            name:
                                matchedCategory?.name ??
                                String(
                                    product.category
                                )

                        };

                    }

                }


                // =================================================
                // BRAND
                // =================================================

                let brand = {
                    id: null,
                    name: ""
                };


                if (product.brand) {

                    if (
                        typeof product.brand ===
                        "object"
                    ) {

                        const brandIdFromProduct =
                            product.brand.id ?? null;


                        const matchedBrand =
                            brands.find(
                                item =>
                                    Number(item.id) ===
                                    Number(
                                        brandIdFromProduct
                                    )
                            );


                        brand = {

                            id:
                                matchedBrand?.id ??
                                brandIdFromProduct,

                            name:
                                matchedBrand?.name ??
                                product.brand.name ??
                                ""

                        };

                    } else {

                        const matchedBrand =
                            brands.find(
                                item =>
                                    item.name
                                        ?.trim()
                                        .toLowerCase() ===
                                    String(
                                        product.brand
                                    )
                                        .trim()
                                        .toLowerCase()
                            );


                        brand = {

                            id:
                                matchedBrand?.id ??
                                null,

                            name:
                                matchedBrand?.name ??
                                String(
                                    product.brand
                                )

                        };

                    }

                }


                // =================================================
                // SPECIFICATIONS
                // =================================================

                const specifications = {
                    ...(product.specifications || {})
                };


                /*
                 * Backward compatibility.
                 */

                if (
                    product.processor !== undefined &&
                    product.processor !== null &&
                    specifications.processor === undefined
                ) {

                    specifications.processor =
                        product.processor;

                }


                if (
                    product.displaySize !== undefined &&
                    product.displaySize !== null &&
                    specifications.displaySize === undefined
                ) {

                    specifications.displaySize =
                        product.displaySize;

                }


                if (
                    product.battery !== undefined &&
                    product.battery !== null &&
                    specifications.battery === undefined
                ) {

                    specifications.battery =
                        product.battery;

                }


                /*
                 * Mobile RAM / ROM must stay inside variants.
                 *
                 * Remove them from specifications if they
                 * exist in an old product response.
                 */

                const editIsMobile =
                    category.name
                        ?.trim()
                        .toLowerCase() ===
                    "mobile phones";


                if (editIsMobile) {

                    delete specifications.ram;

                    delete specifications.RAM;

                    delete specifications.rom;

                    delete specifications.ROM;

                    delete specifications.storage;

                    delete specifications.Storage;

                }


                // =================================================
                // VARIANTS
                // =================================================

                let variants = [];


                if (
                    Array.isArray(product.variants) &&
                    product.variants.length > 0
                ) {

                    variants =
                        product.variants.map(
                            variant => {

                                const attributeValues =
                                    variant.attributeValues ||
                                    {};


                                const ram =
                                    variant.ram ??
                                    attributeValues.RAM ??
                                    attributeValues.ram ??
                                    "";


                                const storage =
                                    variant.storage ??
                                    variant.rom ??
                                    attributeValues.Storage ??
                                    attributeValues.storage ??
                                    attributeValues.ROM ??
                                    attributeValues.rom ??
                                    "";


                                return {

                                    id:
                                        variant.id ??
                                        null,


                                    ram:
                                        ram,


                                    storage:
                                        storage,


                                    colors:

                                        Array.isArray(
                                            variant.colors
                                        ) &&
                                        variant.colors.length > 0

                                            ? variant.colors.map(
                                                color => ({

                                                    id:
                                                        color.id ??
                                                        null,

                                                    name:
                                                        color.name ??
                                                        "",

                                                    hexCode:
                                                        color.hexCode ??
                                                        "",

                                                    price:
                                                        color.price ??
                                                        ""

                                                })
                                            )

                                            : [
                                                createEmptyColor()
                                            ]

                                };

                            }
                        );

                } else {

                    /*
                     * No variant in database:
                     * provide one default variant.
                     */

                    variants = [
                        createEmptyVariant()
                    ];

                }


                // =================================================
                // SET PRODUCT
                // =================================================

                setProductData({

                    category,

                    brand,

                    product:
                        product.name ??
                        "",

                    description:
                        product.description ??
                        "",

                    variants,

                    specifications

                });


            } catch (error) {

                console.error(
                    "Failed to load product:",
                    error
                );


                alert(
                    "Failed to load product."
                );

            }

        };


        loadProductForEdit();

    }, [
        editProductId,
        categories,
        brands
    ]);


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
    // SPECIFICATION CHANGE
    // =====================================================

    const handleSpecificationChange = (
        name,
        value
    ) => {

        setProductData(prev => ({

            ...prev,

            specifications: {

                ...prev.specifications,

                [name]: value

            }

        }));

    };


    // =====================================================
    // CATEGORY CHANGE
    // =====================================================

    const handleCategoryChange = (e) => {

        const selectedCategoryId =
            Number(e.target.value);


        const selectedCategory =
            categories.find(
                category =>
                    Number(category.id) ===
                    selectedCategoryId
            );


        console.log(
            "Selected category:",
            selectedCategory
        );


        setSelectedSpecifications([]);


        setProductData(prev => ({

            ...prev,

            category:

                selectedCategory
                    ? {

                        id:
                            selectedCategory.id,

                        name:
                            selectedCategory.name

                    }
                    : {

                        id: null,

                        name: ""

                    },


            /*
             * Clear old category specifications.
             */

            specifications: {},


            /*
             * Every newly selected category starts
             * with one default variant.
             */

            variants: [
                createEmptyVariant()
            ]

        }));

    };


    // =====================================================
    // BRAND CHANGE
    // =====================================================

    const handleBrandChange = (e) => {

        const selectedBrandId =
            Number(e.target.value);


        const selectedBrand =
            brands.find(
                brand =>
                    Number(brand.id) ===
                    selectedBrandId
            );


        setProductData(prev => ({

            ...prev,

            brand:

                selectedBrand
                    ? {

                        id:
                            selectedBrand.id,

                        name:
                            selectedBrand.name

                    }
                    : {

                        id: null,

                        name: ""

                    }

        }));

    };


    // =====================================================
    // VARIANT CHANGE
    // =====================================================

    const handleVariantChange = (
        variantIndex,
        field,
        value
    ) => {

        setProductData(prev => {

            const updatedVariants =
                [...prev.variants];


            updatedVariants[
                variantIndex
            ] = {

                ...updatedVariants[
                    variantIndex
                ],

                [field]: value

            };


            return {

                ...prev,

                variants:
                    updatedVariants

            };

        });

    };


    // =====================================================
    // ADD VARIANT
    // =====================================================

    const addVariant = () => {

        if (!isMobileCategory) {

            alert(
                "Only mobile phones can have multiple variants."
            );

            return;

        }

        setProductData(prev => ({

            ...prev,

            variants: [

                ...prev.variants,

                createEmptyVariant()

            ]

        }));

    };


    // =====================================================
    // REMOVE VARIANT
    // =====================================================

    const removeVariant = (index) => {

        /*
         * Never allow zero variants.
         */

        if (
            productData.variants.length <= 1
        ) {

            return;

        }


        setProductData(prev => ({

            ...prev,

            variants:
                prev.variants.filter(
                    (_, i) =>
                        i !== index
                )

        }));

    };


    // =====================================================
    // COLOR CHANGE
    // =====================================================

    const handleColorChange = (
        variantIndex,
        colorIndex,
        field,
        value
    ) => {

        setProductData(prev => {

            const updatedVariants =
                [...prev.variants];


            const updatedColors = [
                ...updatedVariants[
                    variantIndex
                ].colors
            ];


            updatedColors[
                colorIndex
            ] = {

                ...updatedColors[
                    colorIndex
                ],

                [field]: value

            };


            updatedVariants[
                variantIndex
            ] = {

                ...updatedVariants[
                    variantIndex
                ],

                colors:
                    updatedColors

            };


            return {

                ...prev,

                variants:
                    updatedVariants

            };

        });

    };


    // =====================================================
    // ADD COLOR
    // =====================================================

    const addColor = (variantIndex) => {

        setProductData(prev => {

            const updatedVariants =
                [...prev.variants];


            updatedVariants[
                variantIndex
            ] = {

                ...updatedVariants[
                    variantIndex
                ],

                colors: [

                    ...updatedVariants[
                        variantIndex
                    ].colors,

                    createEmptyColor()

                ]

            };


            return {

                ...prev,

                variants:
                    updatedVariants

            };

        });

    };


    // =====================================================
    // REMOVE COLOR
    // =====================================================

    const removeColor = (
        variantIndex,
        colorIndex
    ) => {

        setProductData(prev => {

            const updatedVariants =
                [...prev.variants];


            const currentColors =
                updatedVariants[
                    variantIndex
                ].colors;


            /*
             * Never allow zero colors.
             */

            if (
                currentColors.length <= 1
            ) {

                return prev;

            }


            updatedVariants[
                variantIndex
            ] = {

                ...updatedVariants[
                    variantIndex
                ],

                colors:
                    currentColors.filter(
                        (_, i) =>
                            i !== colorIndex
                    )

            };


            return {

                ...prev,

                variants:
                    updatedVariants

            };

        });

    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // =================================================
        // BASIC VALIDATION
        // =================================================

        const selectedCategoryId =
            productData.category?.id;


        const selectedBrandId =
            productData.brand?.id;


        if (!selectedCategoryId) {

            alert(
                "Please select a category."
            );

            return;

        }


        if (!selectedBrandId) {

            alert(
                "Please select a brand."
            );

            return;

        }


        if (
            !productData.product?.trim()
        ) {

            alert(
                "Please enter product name."
            );

            return;

        }


        // =================================================
        // SPECIFICATION VALIDATION
        // =================================================

        for (
            const specification
            of visibleSpecifications
        ) {

            const value =
                productData
                    .specifications?.[
                        specification.name
                    ];


            if (
                specification.required === true &&
                (
                    value === undefined ||
                    value === null ||
                    String(value).trim() === ""
                )
            ) {

                alert(
                    `Please enter ${specification.label}.`
                );

                return;

            }

        }


        // =================================================
        // VARIANT VALIDATION
        // =================================================

        const variantsToValidate =
            Array.isArray(
                productData.variants
            ) &&
            productData.variants.length > 0

                ? productData.variants

                : [
                    createEmptyVariant()
                ];


        const hexColorRegex =
            /^#[0-9A-Fa-f]{6}$/;


        const mobileVariantKeys =
            new Set();


        for (
            let i = 0;
            i < variantsToValidate.length;
            i++
        ) {

            const variant =
                variantsToValidate[i];


            // =================================================
            // MOBILE RAM + ROM/STORAGE
            // =================================================

            if (isMobileCategory) {

                const ram =
                    variant.ram?.trim() || "";


                const storage =
                    variant.storage?.trim() || "";


                if (!ram || !storage) {

                    alert(
                        `Please complete RAM and Storage for Variant ${i + 1}.`
                    );

                    return;

                }


                const variantKey =
                    `${ram.toLowerCase()}-${storage.toLowerCase()}`;


                if (
                    mobileVariantKeys.has(
                        variantKey
                    )
                ) {

                    alert(
                        `Duplicate RAM + Storage combination found in Variant ${i + 1}.`
                    );

                    return;

                }


                mobileVariantKeys.add(
                    variantKey
                );

            }


            // =================================================
            // COLORS
            // =================================================

            if (
                !Array.isArray(
                    variant.colors
                ) ||
                variant.colors.length === 0
            ) {

                alert(
                    `Please add at least one color for Variant ${i + 1}.`
                );

                return;

            }


            // =================================================
            // COLOR VALIDATION
            // =================================================

            for (
                let j = 0;
                j < variant.colors.length;
                j++
            ) {

                const color =
                    variant.colors[j];


                const colorName =
                    color.name?.trim() || "";


                const hexCode =
                    color.hexCode?.trim() || "";


                const price =
                    Number(color.price);


                if (!colorName) {

                    alert(
                        `Please enter Color Name ${j + 1} in Variant ${i + 1}.`
                    );

                    return;

                }


                if (
                    !hexColorRegex.test(
                        hexCode
                    )
                ) {

                    alert(
                        `Invalid HEX code for Color ${j + 1} in Variant ${i + 1}. Example: #FF0000`
                    );

                    return;

                }


                if (
                    !Number.isFinite(price) ||
                    price <= 0
                ) {

                    alert(
                        `Please enter a valid price for ${colorName}.`
                    );

                    return;

                }

            }

        }


        // =================================================
        // SPECIFICATIONS
        // =================================================

        const specifications =
            Object.fromEntries(

                visibleSpecifications.map(
                    specification => {

                        const value =
                            productData
                                .specifications?.[
                                    specification.name
                                ];


                        return [

                            specification.name,

                            value === undefined ||
                            value === null

                                ? ""

                                : String(
                                    value
                                ).trim()

                        ];

                    }
                )

            );


        // =================================================
        // MOBILE VARIANT ATTRIBUTES
        // =================================================

        /*
         * Mobile RAM and Storage are stored in the backend
         * through VariantAttributeValue.
         *
         * From the Mobile Phones category response:
         *
         * RAM     -> id 20
         * Storage -> id 21
         *
         * We find them dynamically from selectedSpecifications
         * instead of hardcoding the IDs.
         */

        const ramAttribute =
            selectedSpecifications.find(
                attribute =>
                    attribute?.name
                        ?.trim()
                        .toLowerCase() ===
                    "ram"
            );


        const storageAttribute =
            selectedSpecifications.find(
                attribute =>
                    attribute?.name
                        ?.trim()
                        .toLowerCase() ===
                    "storage"
            );


        if (
            isMobileCategory &&
            (
                !ramAttribute?.id ||
                !storageAttribute?.id
            )
        ) {

            alert(
                "RAM and Storage attributes are not configured correctly for Mobile Phones."
            );

            return;

        }


        // =================================================
        // VARIANTS
        // =================================================

        const variants =
            variantsToValidate.map(
                variant => {

                    const ram =
                        variant.ram?.trim() || "";


                    const storage =
                        variant.storage?.trim() || "";


                    return {

                        /*
                         * Preserve existing variant ID during edit.
                         */

                        id:
                            variant.id || null,


                        /*
                         * Variant name.
                         */

                        name:
                            isMobileCategory
                                ? `${ram} / ${storage}`
                                : "Default Variant",


                        /*
                         * Mobile RAM + Storage must be sent
                         * as VariantAttributeValue records.
                         */

                        ...(isMobileCategory
                            ? {

                                attributeValues: [

                                    {
                                        attribute: {
                                            id:
                                                ramAttribute.id
                                        },

                                        value:
                                            ram
                                    },

                                    {
                                        attribute: {
                                            id:
                                                storageAttribute.id
                                        },

                                        value:
                                            storage
                                    }

                                ]

                            }
                            : {}),


                        colors:
                            variant.colors.map(
                                color => ({

                                    /*
                                     * Preserve existing color ID.
                                     */

                                    id:
                                        color.id ||
                                        null,


                                    name:
                                        color.name
                                            ?.trim() ||
                                        "",


                                    hexCode:
                                        color.hexCode
                                            ?.trim()
                                            .toUpperCase() ||
                                        "",


                                    price:
                                        Number(
                                            color.price
                                        )

                                })
                            )

                    };

                }
            );


        // =================================================
        // BASE PRICE
        // =================================================

        const allPrices =
            variants.flatMap(
                variant =>
                    variant.colors
                        .map(
                            color =>
                                Number(
                                    color.price
                                )
                        )
                        .filter(
                            price =>
                                Number.isFinite(
                                    price
                                ) &&
                                price > 0
                        )
            );


        if (
            allPrices.length === 0
        ) {

            alert(
                "At least one valid product price is required."
            );

            return;

        }


        const basePrice =
            Math.min(
                ...allPrices
            );


        // =================================================
        // FINAL PRODUCT
        // =================================================

        const product = {

            name:
                productData.product.trim(),


            brand: {

                id:
                    selectedBrandId

            },


            category: {

                id:
                    selectedCategoryId

            },


            description:
                productData.description
                    ?.trim() || "",


            basePrice:
                basePrice,


            specifications:
                specifications,


            variants:
                variants

        };


        // =================================================
        // DEBUG
        // =================================================

        console.log(
            "========== FINAL PRODUCT REQUEST =========="
        );


        console.log(
            JSON.stringify(
                product,
                null,
                2
            )
        );


        console.log(
            "============================================"
        );


        // =================================================
        // API REQUEST
        // =================================================

        try {

            setLoading(true);


            if (isEditMode) {

                await updateProduct(
                    editProductId,
                    product
                );


                alert(
                    "Product updated successfully."
                );

            } else {

                await addProduct(
                    product
                );


                alert(
                    "Product added successfully."
                );

            }


            navigate(-1);


        } catch (error) {

            console.error(
                "PRODUCT API ERROR:",
                error
            );


            console.error(
                "STATUS:",
                error.response?.status
            );


            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );


            alert(

                error.response?.data?.message ||

                error.response?.data?.error ||

                (
                    isEditMode
                        ? "Failed to update product."
                        : "Failed to add product."
                )

            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <>
{/* =================================================
                TITLE
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

                    <h2>
                        Product Details
                    </h2>


                    {/* =================================================
                        CATEGORY
                    ================================================= */}

                    <label>
                        Category
                    </label>


                    <select
                        name="category"
                        value={
                            productData.category?.id ?? ""
                        }
                        onChange={
                            handleCategoryChange
                        }
                        required
                    >

                        <option value="">
                            Select Category
                        </option>


                        {
                            categories.map(
                                category => (

                                    <option
                                        key={
                                            category.id
                                        }
                                        value={
                                            category.id
                                        }
                                    >
                                        {
                                            category.name
                                        }
                                    </option>

                                )
                            )
                        }

                    </select>


                    {/* =================================================
                        BRAND
                    ================================================= */}

                    <label>
                        Brand
                    </label>


                    <select
                        name="brand"
                        value={
                            productData.brand?.id ?? ""
                        }
                        onChange={
                            handleBrandChange
                        }
                        required
                    >

                        <option value="">
                            Select Brand
                        </option>


                        {
                            brands.map(
                                brand => (

                                    <option
                                        key={
                                            brand.id
                                        }
                                        value={
                                            brand.id
                                        }
                                    >
                                        {
                                            brand.name
                                        }
                                    </option>

                                )
                            )
                        }

                    </select>


                    {/* =================================================
                        PRODUCT NAME
                    ================================================= */}

                    <label>
                        Product Name
                    </label>


                    <input
                        type="text"
                        name="product"
                        placeholder="Enter Product Name"
                        value={
                            productData.product
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />


                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <label>
                        Description
                    </label>


                    <textarea
                        name="description"
                        placeholder="Enter Product Description"
                        maxLength={1000}
                        value={
                            productData.description
                        }
                        onChange={
                            handleChange
                        }
                    />


                    {/* =================================================
                        SPECIFICATIONS
                    ================================================= */}

                    <h2>
                        Specifications
                    </h2>


                    {
                        !categoryId

                            ? (

                                <p>
                                    Select a category to see
                                    its specifications.
                                </p>

                            )

                            : attributesLoading

                                ? (

                                    <p>
                                        Loading specifications...
                                    </p>

                                )

                                : visibleSpecifications.length === 0

                                    ? (

                                        <p>
                                            No specifications are configured
                                            for this category.
                                        </p>

                                    )

                                    : (

                                        visibleSpecifications.map(
                                            specification => {

                                                const inputType =
                                                    specification.dataType
                                                        ?.toUpperCase() ===
                                                    "INTEGER"

                                                        ? "number"

                                                        : "text";


                                                return (

                                                    <div
                                                        key={
                                                            specification.id ||
                                                            `specification-${specification.name}`
                                                        }
                                                        className="specification-field"
                                                    >

                                                        <label>

                                                            {
                                                                specification.label
                                                            }

                                                            {
                                                                specification.unit
                                                                    ? ` (${specification.unit})`
                                                                    : ""
                                                            }

                                                            {
                                                                specification.required
                                                                    ? " *"
                                                                    : ""
                                                            }

                                                        </label>


                                                        <input
                                                            type={
                                                                inputType
                                                            }

                                                            placeholder={
                                                                specification.placeholder ||
                                                                `Enter ${specification.label}`
                                                            }

                                                            value={
                                                                productData
                                                                    .specifications?.[
                                                                        specification.name
                                                                    ] ?? ""
                                                            }

                                                            onChange={
                                                                e =>
                                                                    handleSpecificationChange(
                                                                        specification.name,
                                                                        e.target.value
                                                                    )
                                                            }

                                                            required={
                                                                specification.required === true
                                                            }

                                                        />

                                                    </div>

                                                );

                                            }
                                        )

                                    )
                    }


                    {/* =================================================
                        VARIANTS
                    ================================================= */}

                    <h2>
                        Variant Details
                    </h2>


                    {
                        productData.variants.map(
                            (
                                variant,
                                index
                            ) => (

                                <div
                                    key={
                                        variant.id ||
                                        `variant-${index}`
                                    }
                                >

                                    <h3>
                                        Variant {index + 1}
                                    </h3>


                                    {/* =================================================
                                        MOBILE RAM
                                    ================================================= */}

                                    {
                                        isMobileCategory && (

                                            <>

                                                <label>
                                                    RAM
                                                </label>


                                                <input
                                                    type="text"
                                                    placeholder="Example: 8GB"
                                                    value={
                                                        variant.ram
                                                    }
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
                                                    ROM / Storage
                                                </label>


                                                <input
                                                    type="text"
                                                    placeholder="Example: 256GB"
                                                    value={
                                                        variant.storage
                                                    }
                                                    onChange={
                                                        e =>
                                                            handleVariantChange(
                                                                index,
                                                                "storage",
                                                                e.target.value
                                                            )
                                                    }
                                                />

                                            </>

                                        )
                                    }


                                    {/* =================================================
                                        COLORS
                                    ================================================= */}

                                    <h4>
                                        Colors & Prices
                                    </h4>


                                    {
                                        variant.colors.map(
                                            (
                                                color,
                                                colorIndex
                                            ) => (

                                                <div
                                                    key={
                                                        color.id ||
                                                        `variant-${index}-color-${colorIndex}`
                                                    }
                                                >

                                                    <label>
                                                        Color Name
                                                    </label>


                                                    <input
                                                        type="text"
                                                        placeholder="Example: Orange"
                                                        value={
                                                            color.name
                                                        }
                                                        onChange={
                                                            e =>
                                                                handleColorChange(
                                                                    index,
                                                                    colorIndex,
                                                                    "name",
                                                                    e.target.value
                                                                )
                                                        }
                                                    />


                                                    <label>
                                                        HEX Code
                                                    </label>


                                                    <input
                                                        type="text"
                                                        placeholder="#000000"
                                                        maxLength={7}
                                                        value={
                                                            color.hexCode
                                                        }
                                                        onChange={
                                                            e =>
                                                                handleColorChange(
                                                                    index,
                                                                    colorIndex,
                                                                    "hexCode",
                                                                    e.target.value
                                                                )
                                                        }
                                                    />


                                                    <label>
                                                        Price
                                                    </label>


                                                    <input
                                                        type="number"
                                                        placeholder="Enter Price"
                                                        min="0"
                                                        step="0.01"
                                                        value={
                                                            color.price
                                                        }
                                                        onChange={
                                                            e =>
                                                                handleColorChange(
                                                                    index,
                                                                    colorIndex,
                                                                    "price",
                                                                    e.target.value
                                                                )
                                                        }
                                                    />


                                                    {/* =================================================
                                                        REMOVE COLOR
                                                    ================================================= */}

                                                    {
                                                        variant.colors.length > 1 && (

                                                            <button
                                                                type="button"
                                                                className="variant-action-btn"
                                                                onClick={() =>
                                                                    removeColor(
                                                                        index,
                                                                        colorIndex
                                                                    )
                                                                }
                                                            >
                                                                Remove Color
                                                            </button>

                                                        )
                                                    }

                                                </div>

                                            )
                                        )
                                    }


                                    {/* =================================================
                                        ADD COLOR
                                    ================================================= */}

                                    <button
                                        type="button"
                                        className="variant-action-btn"
                                        onClick={() =>
                                            addColor(index)
                                        }
                                    >
                                        + Add Color
                                    </button>


                                    {/* =================================================
                                        REMOVE VARIANT
                                    ================================================= */}

                                    {
                                        productData.variants.length > 1 && (

                                            <button
                                                type="button"
                                                className="variant-action-btn"
                                                onClick={() =>
                                                    removeVariant(
                                                        index
                                                    )
                                                }
                                            >
                                                Remove Variant
                                            </button>

                                        )
                                    }

                                </div>

                            )
                        )
                    }


                    {/* =================================================
                        ADD VARIANT
                    ================================================= */}

                    <button
                        type="button"
                        className="variant-action-btn"
                        onClick={addVariant}
                    >
                        + Add Variant
                    </button>


                    {/* =================================================
                        SAVE
                    ================================================= */}

                    <button
                        className="add-product-btn"
                        type="submit"
                        disabled={loading}
                    >

                        {
                            loading
                                ? "Saving..."
                                : isEditMode
                                    ? "Save Changes"
                                    : "Save Product"
                        }

                    </button>

                </form>


                {/* =================================================
                    PREVIEW
                ================================================= */}

                <div className="master-preview-section">

                    {
                        !categoryName ? (

                            /* =================================================
                                EMPTY PREVIEW
                            ================================================= */

                            <div className="master-empty-preview">

                                <img
                                    src="images/admin-reference.png"
                                    alt="Loading..."
                                    className="master-empty-preview-image-admin"
                                />

                                <h2>
                                    Hey, I hope you are doing well?
                                </h2>

                            </div>

                        ) : (

                            /* =================================================
                                LIVE PREVIEW
                            */

                            <>

                                <h2>
                                    Live Preview Details
                                </h2>


                                <div className="master-preview-card">


                                    {/* =================================================
                                        BASIC DETAILS
                                    ================================================= */}

                                    <div className="preview-item">

                                        <label>
                                            Category
                                        </label>

                                        <input
                                            readOnly
                                            value={
                                                categoryName
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
                                                productData.brand?.name || ""
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
                                                productData.product || ""
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
                                                productData.description || ""
                                            }
                                        />

                                    </div>


                                    {/* =================================================
                                        SPECIFICATIONS PREVIEW
                                    ================================================= */}

                                    <h3>
                                        Specifications
                                    </h3>


                                    {
                                        visibleSpecifications.length === 0 ? (

                                            <p>
                                                No specifications.
                                            </p>

                                        ) : (

                                            visibleSpecifications.map(
                                                specification => (

                                                    <div
                                                        className="preview-item"
                                                        key={
                                                            specification.id ||
                                                            `preview-specification-${specification.name}`
                                                        }
                                                    >

                                                        <label>

                                                            {
                                                                specification.label
                                                            }

                                                            {
                                                                specification.unit
                                                                    ? ` (${specification.unit})`
                                                                    : ""
                                                            }

                                                        </label>


                                                        <input
                                                            readOnly
                                                            value={
                                                                productData
                                                                    .specifications?.[
                                                                        specification.name
                                                                    ] ?? ""
                                                            }
                                                        />

                                                    </div>

                                                )
                                            )

                                        )
                                    }


                                    {/* =================================================
                                        VARIANTS PREVIEW
                                    ================================================= */}

                                    <h3>
                                        Variants
                                    </h3>


                                    {
                                        productData.variants?.map(
                                            (
                                                variant,
                                                index
                                            ) => (

                                                <div
                                                    className="preview-item"
                                                    key={
                                                        variant.id ||
                                                        `preview-variant-${index}`
                                                    }
                                                >

                                                    {/* =================================================
                                                        MOBILE RAM / STORAGE
                                                    ================================================= */}

                                                    {
                                                        isMobileCategory && (

                                                            <>

                                                                <label>
                                                                    Variant {index + 1}
                                                                </label>


                                                                <input
                                                                    readOnly
                                                                    value={
                                                                        `${variant.ram || ""} | ${variant.storage || ""}`
                                                                    }
                                                                />

                                                            </>

                                                        )
                                                    }


                                                    {/* =================================================
                                                        COLORS
                                                    ================================================= */}

                                                    {
                                                        variant.colors?.map(
                                                            (
                                                                color,
                                                                colorIndex
                                                            ) => (

                                                                <div
                                                                    key={
                                                                        color.id ||
                                                                        `preview-color-${index}-${colorIndex}`
                                                                    }
                                                                >

                                                                    <label>
                                                                        Color {
                                                                            colorIndex + 1
                                                                        }
                                                                    </label>


                                                                    <input
                                                                        readOnly
                                                                        value={
                                                                            color.name
                                                                                ? `${color.name} (${color.hexCode})`
                                                                                : ""
                                                                        }
                                                                    />


                                                                    <label>
                                                                        Price
                                                                    </label>


                                                                    <input
                                                                        readOnly
                                                                        value={
                                                                            color.price !== ""
                                                                                ? `₹${Number(
                                                                                    color.price
                                                                                ).toFixed(2)}`
                                                                                : ""
                                                                        }
                                                                    />

                                                                </div>

                                                            )
                                                        )
                                                    }

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                            </>

                        )
                    }

                </div>

            </div>

        </>

    );

}

export default AdminAddProduct;