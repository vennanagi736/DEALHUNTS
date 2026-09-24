import React from "react";
import Popup from "./Popup";

function ProductManagementPopup({
    open,
    product,
    onClose,
    navigate,

    productImages,
    selectedImages,
    selectedFiles,
    productVariants,

    setPreviewImage,
    handleSelectAllImages,
    handleImageCheck,
    handleImageSelect,
    handleUploadImages,
    handleChangeImageSelect,
    handleDeleteSelectedImages,

    setSelectedFiles,
    setChangeImageId
}) {

    if (!product) return null;

    return (
        <Popup
            open={open}
            title="Product Management"
            onClose={onClose}
            width="750px"
        >

            <div className="image-management-popup-pp">

                {/* =================================================
                    PRODUCT INFORMATION
                ================================================= */}

                <div className="popup-product-header-pp">

                    <h2>
                        {product.name}
                    </h2>

                    <div className="product-info-grid-pp">

                        <p>
                            <strong>
                                Brand
                            </strong>

                            <span>
                                {product.brand?.name || "N/A"}
                            </span>
                        </p>

                        <p>
                            <strong>
                                Category
                            </strong>

                            <span>
                                {product.category?.name || "N/A"}
                            </span>
                        </p>

                        <p>
                            <strong>
                                Variant Options
                            </strong>

                            <span>
                                {productVariants?.length || 0}
                            </span>
                        </p>

                        <p>
                            <strong>
                                Status
                            </strong>

                            <span
                                className={
                                    product.active
                                        ? "status-pp active-pp"
                                        : "status-pp inactive-pp"
                                }
                            >
                                {product.active
                                    ? "Available"
                                    : "Unavailable"}
                            </span>
                        </p>

                    </div>

                    {/* EDIT BUTTON */}

                    <button
                        type="button"
                        className="edit-product-btn-pp"
                        onClick={() => {

                            onClose();

                            navigate(
                                `/adminAddProduct?edit=${product.id}`
                            );

                        }}
                    >
                        Edit Product
                    </button>

                </div>


                {/* =================================================
                    IMAGES
                ================================================= */}

                <div className="images-section-pp">

                    <div className="image-title-pp">

                        <h3>
                            Product Images
                        </h3>

                        <label className="select-all-pp">

                            <input
                                type="checkbox"
                                checked={
                                    productImages?.length > 0 &&
                                    selectedImages?.length ===
                                        productImages.length
                                }
                                onChange={handleSelectAllImages}
                            />

                            Select All

                        </label>

                    </div>


                    <div className="images-wrapper-pp">

                        <div className="image-grid-pp">

                            {/* EMPTY STATE */}

                            {productImages?.length === 0 &&
                                selectedFiles?.length === 0 && (

                                <div className="no-images-message-pp">

                                    <p>
                                        No images added yet
                                    </p>

                                    <span>
                                        Add product images using
                                        the + button.
                                    </span>

                                </div>

                            )}


                            {/* EXISTING IMAGES */}

                            {productImages?.map(
                                (img, index) => (

                                <div
                                    className="image-card-pp"
                                    key={`existing-${img.id}`}
                                >

                                    <input
                                        type="checkbox"
                                        className="image-checkbox-pp"
                                        checked={
                                            selectedImages?.includes(
                                                img.id
                                            )
                                        }
                                        onChange={() =>
                                            handleImageCheck(
                                                img.id
                                            )
                                        }
                                    />

                                    <img
                                        src={
                                            img.thumbnailUrl
                                        }
                                        alt="product"
                                        onClick={() =>
                                            setPreviewImage(
                                                img.thumbnailUrl
                                            )
                                        }
                                    />

                                    <div className="image-name-pp">
                                        Image {index + 1}
                                    </div>

                                </div>

                            ))}


                            {/* NEWLY SELECTED IMAGES */}

                            {selectedFiles?.map(
                                (file, index) => (

                                <div
                                    className="image-card-pp"
                                    key={`new-${index}`}
                                >

                                    <img
                                        src={
                                            URL.createObjectURL(
                                                file
                                            )
                                        }
                                        alt="preview"
                                    />

                                    <div className="image-name-pp">
                                        {file.name}
                                    </div>

                                    <button
                                        type="button"
                                        className="remove-image-btn-pp"
                                        onClick={() =>
                                            setSelectedFiles(
                                                prev =>
                                                    prev.filter(
                                                        (_, i) =>
                                                            i !==
                                                            index
                                                    )
                                            )
                                        }
                                    >
                                        ✕
                                    </button>

                                </div>

                            ))}


                            {/* ADD IMAGE */}

                            {(
                                (productImages?.length || 0) +
                                (selectedFiles?.length || 0)
                            ) < 5 && (

                                <label
                                    className="add-image-card-pp"
                                >

                                    <span className="plus-icon-pp">
                                        +
                                    </span>

                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        accept="image/*"
                                        onChange={
                                            handleImageSelect
                                        }
                                    />

                                </label>

                            )}

                        </div>

                    </div>

                </div>


                {/* =================================================
                    IMAGE ACTIONS
                ================================================= */}

                <div className="image-actions-pp">

                    <button
                        type="button"
                        className="upload-btn-pp"
                        disabled={
                            !selectedFiles ||
                            selectedFiles.length === 0
                        }
                        onClick={
                            handleUploadImages
                        }
                    >
                        Upload Images
                    </button>


                    <label
                        className="change-btn-pp"
                        style={{
                            opacity:
                                selectedImages?.length !== 1
                                    ? 0.5
                                    : 1,

                            cursor:
                                selectedImages?.length !== 1
                                    ? "not-allowed"
                                    : "pointer"
                        }}
                        onClick={e => {

                            if (
                                selectedImages?.length !== 1
                            ) {

                                e.preventDefault();

                                alert(
                                    "Select one image to change"
                                );

                                return;
                            }

                            setChangeImageId(
                                selectedImages[0]
                            );

                        }}
                    >

                        Change Image

                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={
                                handleChangeImageSelect
                            }
                            disabled={
                                selectedImages?.length !== 1
                            }
                        />

                    </label>


                    <button
                        type="button"
                        className="delete-btn-pp"
                        disabled={
                            !selectedImages ||
                            selectedImages.length === 0
                        }
                        onClick={
                            handleDeleteSelectedImages
                        }
                    >
                        Delete Selected
                    </button>

                </div>

            </div>

        </Popup>
    );
}

export default ProductManagementPopup;
