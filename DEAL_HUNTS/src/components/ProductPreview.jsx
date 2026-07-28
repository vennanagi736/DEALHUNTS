import "../styles/ProductPreview.css";

function ProductPreview({
    productName,
    productDetails,
    inventory,
    previewImages
}) {

    return (
        <div className="product-preview-section">

            <h2>Added Details</h2>

            <div className="product-preview-card">

                {/* Product Name */}
                <div className="preview-item">
                    <label>Product Name</label>
                    <input
                        type="text"
                        value={productName || ""}
                        readOnly
                    />
                </div>

                {/* Product Details */}
                {Object.entries(productDetails || {}).map(([key, value]) => (
                    <div
                        className="preview-item"
                        key={`product-${key}`}
                    >
                        <label>{key}</label>
                        <input
                            type="text"
                            value={value ?? ""}
                            readOnly
                        />
                    </div>
                ))}

                {/* Inventory Details */}
                {Object.entries(inventory || {}).map(([key, value]) => (
                    <div
                        className="preview-item"
                        key={`inventory-${key}`}
                    >
                        <label>{key}</label>

                        <input
                            type="text"
                            value={
                                typeof value === "boolean"
                                    ? (value ? "Yes" : "No")
                                    : value ?? ""
                            }
                            readOnly
                        />
                    </div>
                ))}

                {/* Images */}
                {previewImages?.length > 0 && (
                    <div className="preview-item">
                        <label>Images</label>
                        <div className="product-preview-images">
                            {previewImages.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Preview ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductPreview;