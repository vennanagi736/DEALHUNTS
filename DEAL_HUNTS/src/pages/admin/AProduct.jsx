import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import ProductManagementPopup from "../../components/ProductPopupManagement";
// import Popup from "../../components/Popup";
import SideWindow from "../../components/SideBar";

import "../../styles/AProduct.css";

import {
    getAllProducts,
    deleteProduct,
    restoreProduct,
    uploadImages,
    getProductImages,
    getProductVariant,
    deleteProductImage,
    changeProductImage
} from "../../api/ProductApi";


function AdminProducts() {

    const navigate = useNavigate();

    // =====================================================
    // PRODUCTS
    // =====================================================
    const [products, setProducts] = useState([]);
    const [productView, setProductView] = useState("available");
    const [productVariantMap, setProductVariantMap] = useState({});
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);


    // =====================================================
    // PRODUCT POPUP
    // =====================================================

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [showPopup, setShowPopup] = useState(false);


    // =====================================================
    // IMAGE MANAGEMENT
    // =====================================================

    const [productImages, setProductImages] = useState([]);

    const [productVariants, setProductVariants] = useState([]);

    const [selectedFiles, setSelectedFiles] = useState([]);

    const [selectedImages, setSelectedImages] = useState([]);

    const [previewImage, setPreviewImage] = useState(null);

    const [changeImageId, setChangeImageId] = useState(null);


    // =====================================================
    // AVAILABLE / UNAVAILABLE PRODUCTS
    // =====================================================

    const availableProducts = products.filter(
        product => product.active
    );

    const unavailableProducts = products.filter(
        product => !product.active
    );


    const displayedProducts =
        productView === "available"
            ? availableProducts
            : unavailableProducts;


    // =====================================================
    // FETCH PRODUCTS
    // =====================================================

    const fetchProducts = async () => {
    try {
        const res = await getAllProducts();

        setProducts(res.data);

        const variantMap = {};

        for (const product of res.data) {
            const variantRes = await getProductVariant(product.id);

            variantMap[product.id] = variantRes.data;
        }

        setProductVariantMap(variantMap);

        console.log("PRODUCTS:", res.data);
        console.log("VARIANT MAP:", variantMap);

    } catch (error) {
        console.error(
            "Failed to fetch products:",
            error
        );
    }
};

useEffect(() => {
    fetchProducts();
}, []);
    // =====================================================
    // SELECT PRODUCT
    // =====================================================

    const handleProductCheck = (productId) => {

        setShowPopup(false);
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // =====================================================
    // SELECT ALL
    // =====================================================

    const handleSelectionMode = () => {

    setSelectionMode(true);
    setShowPopup(false);
    setSelectedProducts([]);

};

    // =====================================================
    // CLEAR SELECTION
    // =====================================================

    const handleClearSelection = async () => {

        setSelectedProducts([]);

        setSelectionMode(false);

        // Refresh products
        await fetchProducts();

    };


    // =====================================================
    // DELETE / MAKE UNAVAILABLE
    // =====================================================

    const handleDeleteSelected = async () => {

        if (selectedProducts.length === 0) {

            alert(
                "Please select at least one product."
            );

            return;

        }

        const confirmed = window.confirm(

            `Are you sure you want to remove ${selectedProducts.length} product(s)?`

        );


        if (!confirmed) return;


        try {

            for (const productId of selectedProducts) {

                await deleteProduct(productId);

            }


            alert(
                "Selected products marked as unavailable successfully."
            );


            setSelectedProducts([]);

            setSelectionMode(false);


            await fetchProducts();


        } catch (error) {

            console.error(
                "Failed to update products:",
                error
            );


            alert(
                "Failed to update selected products."
            );

        }

    };


    // =====================================================
    // RESTORE PRODUCTS
    // =====================================================

    const handleRestoreSelected = async () => {

        if (selectedProducts.length === 0) {

            alert(
                "Please select at least one unavailable product."
            );

            return;

        }


        const confirmed = window.confirm(

            `Are you sure you want to restore ${selectedProducts.length} product(s)?`

        );


        if (!confirmed) return;


        try {

            for (const productId of selectedProducts) {

                await restoreProduct(productId);

            }


            alert(
                "Selected products restored successfully."
            );


            setSelectedProducts([]);

            setSelectionMode(false);


            await fetchProducts();


        } catch (error) {

            console.error(
                "Failed to restore products:",
                error
            );


            alert(
                "Failed to restore selected products."
            );

        }

    };


    // =====================================================
    // OPEN PRODUCT POPUP
    // =====================================================

    const handleOpenProductPopup = async (product) => {

        try {

            setSelectedProduct(product);


            const imageRes =
                await getProductImages(product.id);

            setProductImages(imageRes.data);


            const variantRes = await getProductVariant(product.id);
            
            console.log("Product id:",product.id); 
           
            console.log("Variant api response:",variantRes);
            
                console.log("Variants from api:",variantRes.data);

            setProductVariants(variantRes.data);


            setSelectedImages([]);

            setSelectedFiles([]);

            setPreviewImage(null);

            setShowPopup(true);


        } catch (error) {

            console.error(
                "Failed to fetch product information:",
                error
            );


            setProductImages([]);

            setProductVariants([]);

            setShowPopup(true);

        }

    };


    // =====================================================
    // REFRESH SELECTED PRODUCT
    // =====================================================

    const handleRefreshProduct = async () => {

        try {

            const res =
                await getAllProducts();

            setProducts(res.data);


            if (selectedProduct) {

                const updated =
                    res.data.find(
                        p =>
                            p.id ===
                            selectedProduct.id
                    );


                if (updated) {

                    setSelectedProduct(updated);

                }

            }

        } catch (error) {

            console.error(
                "Failed to refresh products:",
                error
            );

        }

    };


    // =====================================================
    // IMAGE SELECT
    // =====================================================

    const handleImageSelect = (e) => {

        const files =
            Array.from(e.target.files);


        if (files.length === 0) return;


        let newFiles = [];


        files.forEach(file => {

            const existingDuplicate =
                productImages.some(img =>
                    img.thumbnailUrl
                        ?.split("/")
                        .pop()
                        .toLowerCase() ===
                    file.name.toLowerCase()
                );


            const selectedDuplicate =
                selectedFiles.some(existing =>
                    existing.name === file.name &&
                    existing.size === file.size &&
                    existing.lastModified ===
                        file.lastModified
                );


            if (
                existingDuplicate ||
                selectedDuplicate
            ) {

                alert(
                    `${file.name} already exists`
                );

                return;

            }


            newFiles.push(file);

        });


        const totalImages =

            productImages.length +

            selectedFiles.length +

            newFiles.length;


        if (totalImages > 5) {

            alert(
                "Maximum 5 images allowed."
            );

            return;

        }


        setSelectedFiles(prev => [

            ...prev,

            ...newFiles

        ]);


        e.target.value = "";

    };


    // =====================================================
    // UPLOAD IMAGES
    // =====================================================

    const handleUploadImages = async () => {

        if (
            !selectedProduct ||
            selectedFiles.length === 0
        ) {

            return;

        }


        try {

            const formData =
                new FormData();


            selectedFiles.forEach(file => {

                formData.append(
                    "images",
                    file
                );

            });


            formData.append(
                "productId",
                selectedProduct.id
            );


            await uploadImages(formData);


            alert(
                "Images uploaded successfully."
            );


            const res =
                await getProductImages(
                    selectedProduct.id
                );


            setProductImages(res.data);

            setSelectedFiles([]);

            setSelectedImages([]);


            await handleRefreshProduct();


        } catch (error) {

            console.error(
                "Failed to upload images:",
                error
            );


            alert(
                "Failed to upload images."
            );

        }

    };


    // =====================================================
    // SELECT IMAGE
    // =====================================================

    const handleImageCheck = (imageId) => {

        setSelectedImages(prev =>

            prev.includes(imageId)

                ? prev.filter(
                    id => id !== imageId
                )

                : [...prev, imageId]

        );

    };


    // =====================================================
    // SELECT ALL IMAGES
    // =====================================================

    const handleSelectAllImages = (e) => {

        if (e.target.checked) {

            setSelectedImages(

                productImages.map(
                    image => image.id
                )

            );

        } else {

            setSelectedImages([]);

        }

    };


    // =====================================================
    // DELETE IMAGES
    // =====================================================

    const handleDeleteSelectedImages = async () => {

        if (selectedImages.length === 0) {

            alert(
                "Please select images to delete."
            );

            return;

        }


        const confirmed = window.confirm(

            `Are you sure you want to delete ${selectedImages.length} image(s)?`

        );


        if (!confirmed) return;


        try {

            for (
                const imageId of selectedImages
            ) {

                await deleteProductImage(
                    imageId
                );

            }


            alert(
                "Selected images deleted successfully."
            );


            const res =
                await getProductImages(
                    selectedProduct.id
                );


            setProductImages(res.data);

            setSelectedImages([]);


            await handleRefreshProduct();


        } catch (error) {

            console.error(
                "Failed to delete images:",
                error
            );


            alert(
                "Failed to delete selected images."
            );

        }

    };


    // =====================================================
    // CHANGE IMAGE
    // =====================================================

    const handleChangeImageSelect = async (e) => {

        const file =
            e.target.files[0];


        if (
            !file ||
            !changeImageId
        ) {

            return;

        }


        try {

            await changeProductImage(

                changeImageId,

                file

            );


            alert(
                "Image changed successfully."
            );


            const res =
                await getProductImages(
                    selectedProduct.id
                );


            setProductImages(res.data);

            setChangeImageId(null);

            setSelectedImages([]);


        } catch (error) {

            console.error(
                "Failed to change image:",
                error
            );


            alert(
                "Failed to change image."
            );

        }


        e.target.value = "";

    };


    // =====================================================
    // CLOSE POPUP
    // =====================================================

    const handleClosePopup = () => {

        setShowPopup(false);

        setSelectedProduct(null);

        setProductImages([]);

        setProductVariants([]);

        setSelectedFiles([]);

        setSelectedImages([]);

        setPreviewImage(null);

        setChangeImageId(null);

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="adminhome-container">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="header">

                <div className="left-section">

                    <SideWindow />

                </div>


                <div className="logo-container">

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

                </div>


                <nav className="admin-nav-links">

                    <NavLink
                        to="/admin/manage-promotions"
                    >
                        Manage Promotions
                    </NavLink>


                    <NavLink
                        to="/adminAddProduct"
                    >
                        Add Product
                    </NavLink>


                    <div className="search-box">

                        <input
                            type="text"
                            placeholder="Search"
                        />

                        <span className="icon">
                            🔍
                        </span>

                    </div>


                    <div
                        className="back-btn"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        &#8592;
                    </div>

                </nav>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="main">

                <h1 className="mainheading">
                    Manage Products
                </h1>


                {/* =================================================
                    AVAILABLE / UNAVAILABLE TABS
                ================================================= */}

                <div className="product-status-tabs">

                    <button
                        className={
                            productView ===
                            "available"
                                ? "product-tab active-tab"
                                : "product-tab"
                        }
                        onClick={() => {

                            setProductView(
                                "available"
                            );

                            setSelectedProducts([]);

                            setSelectionMode(false);

                        }}
                    >
                        Available
                    </button>


                    <button
                        className={
                            productView ===
                            "unavailable"
                                ? "product-tab unavailable-tab"
                                : "product-tab"
                        }
                        onClick={() => {

                            setProductView(
                                "unavailable"
                            );

                            setSelectedProducts([]);

                            setSelectionMode(false);

                        }}
                    >
                        Unavailable
                    </button>

                </div>


                {/* =================================================
                    ACTION BAR
                ================================================= */}

<div className="manage-product-actions">

    {!selectionMode ? (

        <button
            className="select-products"
            onClick={handleSelectionMode}
            disabled={selectionMode}    
        >
           ✓ Select
        </button>

    ) : (

        <>
            <label className="select-all-products">

                <input
                    type="checkbox"
                    checked={
                        displayedProducts.length > 0 &&
                        selectedProducts.length === displayedProducts.length
                    }
                    onChange={(e) => {

                        if (e.target.checked) {

                            setSelectedProducts(
                                displayedProducts.map(
                                    product => product.id
                                )
                            );

                        } else {

                            setSelectedProducts([]);

                        }

                    }}
                />

                Select All

            </label>

            <span
                className="clear-selection"
                onClick={handleClearSelection}
            >
                × Clear
            </span>
        </>

    )}

</div>

                {/* =================================================
                    PRODUCT TABLE
                ================================================= */}

                <table className="manage-product-table">

                    <thead>

                        <tr>

                            <th>
                                ID
                            </th>

                            <th>
                                Name
                            </th>

                            <th>
                                Brand
                            </th>

                            <th>
                                Category
                            </th>
                            <th>
                                Variant
                            </th>

                            <th>
                                Status
                            </th>


                            {selectionMode && (

                                <th>
                                    Select
                                </th>

                            )}

                        </tr>

                    </thead>


                    <tbody>

                        {displayedProducts.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={
                                        selectionMode
                                            ? 6
                                            : 5
                                    }
                                >
                                    No products available
                                </td>

                            </tr>

                        ) : (

                            displayedProducts.map(
                                product => (

                                   <tr
    key={product.id}
    className={`product-row ${
        selectionMode ? "selection-active" : ""
    }`}
    onClick={() => {
        if (!selectionMode) {
            handleOpenProductPopup(product);
        }
    }}
>
                                        <td>
                                            {product.id}
                                        </td>


                                        <td>
                                            {product.name}
                                        </td>


                                        <td>
                                            {product.brand}
                                        </td>


                                        <td>
                                            {product.category}
                                        </td>
                                        <td>
    {(productVariantMap[product.id] || [])
        .map(variant => variant.name)
        .join(", ")}
</td>                                

                                        <td>

                                            <span
                                                className={
                                                    product.active
                                                        ? "status active"
                                                        : "status inactive"
                                                }
                                            >
                                                {product.active
                                                    ? "Available"
                                                    : "Unavailable"
                                                }
                                            </span>

                                        </td>


                                        {selectionMode && (

                                            <td>

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selectedProducts.includes(
                                                            product.id
                                                        )
                                                    }
                                                    onClick={e =>
                                                        e.stopPropagation()
                                                    }
                                                    onChange={() =>
                                                        handleProductCheck(
                                                            product.id
                                                        )
                                                    }
                                                />

                                            </td>

                                        )}

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>


                {/* =================================================
                    DELETE / RESTORE BUTTON
                ================================================= */}

                <div className="product-action-buttons">

                    {selectedProducts.length > 0 &&

                    productView === "available" && (

                        <button
                            className="delete-selected-btn"
                            onClick={
                                handleDeleteSelected
                            }
                        >
                            Delete Selected
                        </button>

                    )}


                    {selectedProducts.length > 0 &&

                    productView === "unavailable" && (

                        <button
                            className="restore-selected-btn"
                            onClick={
                                handleRestoreSelected
                            }
                        >
                            Restore Selected
                        </button>

                    )}

                </div>

            </main>


            {/* =================================================
                PRODUCT POPUP
                =================================================*/}
            <ProductManagementPopup
    open={showPopup}
    product={selectedProduct}
    onClose={handleClosePopup}
    navigate={navigate}

    productImages={productImages}
    selectedImages={selectedImages}
    selectedFiles={selectedFiles}
    productVariants={productVariants}

    setPreviewImage={setPreviewImage}
    handleSelectAllImages={handleSelectAllImages}
    handleImageCheck={handleImageCheck}
    handleImageSelect={handleImageSelect}
    handleUploadImages={handleUploadImages}
    handleChangeImageSelect={handleChangeImageSelect}
    handleDeleteSelectedImages={handleDeleteSelectedImages}

    setSelectedFiles={setSelectedFiles}
    setChangeImageId={setChangeImageId}
/>
           


            {/* =================================================
                IMAGE PREVIEW
            ================================================= */}

            {previewImage && (

                <div
                    className="image-preview"
                    onClick={() =>
                        setPreviewImage(null)
                    }
                >

                    <img
                        src={previewImage}
                        alt="preview"
                    />

                </div>

            )}


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="footer">

                <p>
                    © 2026 Website. All rights reserved.
                </p>

            </footer>

        </div>

    );

}


export default AdminProducts;