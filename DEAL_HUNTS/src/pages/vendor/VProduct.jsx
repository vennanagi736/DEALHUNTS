import React, { useState, useEffect } from "react";
import SideWindow from "../../components/SideBar";
import { useNavigate, Link } from "react-router-dom";

import { getActiveProducts } from "../../api/VendorApi";
import { getProductById } from "../../api/ProductApi";
import { addInventory } from "../../api/InventoryApi";

import "../../styles/ProductPreview.css";

function VendorProductPage() {

  const navigate = useNavigate();

  // ============================================================
  // INITIAL INVENTORY
  // ============================================================

  const initialInventory = {
    product: "",
    variantId: "",
    colorId: "",

    stock: "",
    discount: "",
    minPurchase: "",
    maxPurchase: "",

    warranty: "",
    condition: "",
    deliveryTime: "",

    homeDelivery: false,
    storePickup: false,

    cod: false,
    emi: false,
    exchange: false,

    offerTitle: "",
    offerDescription: "",

    returnPolicy: ""
  };

  // ============================================================
  // STATES
  // ============================================================

  const [inventory, setInventory] = useState(initialInventory);

  const [productInfo, setProductInfo] = useState(null);

  const [products, setProducts] = useState([]);

  const [variants, setVariants] = useState([]);

  const [colors, setColors] = useState([]);

  // Dynamic category attributes
  const [attributes, setAttributes] = useState([]);

  // Dynamic values entered by vendor
  const [attributeValues, setAttributeValues] = useState({});

  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // SELECTED VARIANT
  // ============================================================

  const selectedVariant =
    variants.find(
      v => v.id === Number(inventory.variantId)
    ) || null;

  // ============================================================
  // SELECTED COLOR
  // ============================================================

  const selectedColor =
    colors.find(
      c => c.id === Number(inventory.colorId)
    ) || null;

  // ============================================================
  // LOAD ACTIVE PRODUCTS
  // ============================================================

  useEffect(() => {

    async function fetchProducts() {

      try {

        const response = await getActiveProducts();

        setProducts(response.data || []);

      } catch (error) {

        console.error(
          "Error loading products:",
          error
        );

      }

    }

    fetchProducts();

  }, []);

  // ============================================================
  // LOAD CATEGORY ATTRIBUTES
  // ============================================================

  const loadCategoryAttributes = async (categoryId) => {

    if (!categoryId) {

      setAttributes([]);
      setAttributeValues({});

      return;

    }

    try {

      const response = await fetch(
        `http://localhost:8080/attributes/category/${categoryId}`
      );

      if (!response.ok) {

        throw new Error(
          `Failed to load attributes: ${response.status}`
        );

      }

      const data = await response.json();

      console.log(
        "Category attributes:",
        data
      );

      setAttributes(data || []);

      // Create empty values for every attribute
      const initialValues = {};

      (data || []).forEach(attribute => {

        initialValues[attribute.id] = "";

      });

      setAttributeValues(initialValues);

    } catch (error) {

      console.error(
        "Error loading category attributes:",
        error
      );

      setAttributes([]);
      setAttributeValues({});

    }

  };

  // ============================================================
  // HANDLE DYNAMIC ATTRIBUTE CHANGE
  // ============================================================

  const handleAttributeChange = (attributeId, value) => {

    setAttributeValues(prev => ({
      ...prev,
      [attributeId]: value
    }));

  };

  // ============================================================
  // HANDLE NORMAL INPUT CHANGES
  // ============================================================

  const handleChange = async (e) => {

    const {
      name,
      value,
      type,
      checked
    } = e.target;

    const val =
      type === "checkbox"
        ? checked
        : value;

    // ============================================================
    // NORMAL INPUT / CHECKBOX
    // ============================================================

    if (name !== "product") {

      setInventory(prev => ({
        ...prev,
        [name]: val
      }));

      return;

    }

    // ============================================================
    // PRODUCT CHANGE
    // ============================================================

    setInventory(prev => ({
      ...prev,
      product: value
    }));

    // ============================================================
    // PRODUCT CLEARED
    // ============================================================

    if (!value) {

      setProductInfo(null);

      setVariants([]);

      setColors([]);

      setAttributes([]);

      setAttributeValues({});

      setInventory(prev => ({
        ...prev,
        product: "",
        variantId: "",
        colorId: ""
      }));

      return;

    }

    // ============================================================
    // LOAD SELECTED PRODUCT
    // ============================================================

    try {

      const response =
        await getProductById(value);

      if (!response.data) {
        return;
      }

      const product =
        response.data;

      console.log(
        "Selected product:",
        product
      );

      setProductInfo(product);

      // ============================================================
      // GET CATEGORY ID
      // ============================================================

      const categoryId =
        product.category?.id ||
        product.categoryId;

      console.log(
        "Category ID:",
        categoryId
      );

      // ============================================================
      // LOAD DYNAMIC CATEGORY ATTRIBUTES
      // ============================================================

      await loadCategoryAttributes(
        categoryId
      );

      // ============================================================
      // RESET PRODUCT-SPECIFIC FIELDS
      // ============================================================

      setInventory(prev => ({
        ...prev,

        variantId: "",
        colorId: "",

        stock: "",
        discount: "",

        minPurchase: "",
        maxPurchase: "",

        warranty: "",
        condition: "",
        deliveryTime: "",

        homeDelivery: false,
        storePickup: false,

        cod: false,
        emi: false,
        exchange: false,

        offerTitle: "",
        offerDescription: "",

        returnPolicy: ""
      }));

      setVariants(
        product.variants || []
      );

      setColors(
        product.colors || []
      );

    } catch (error) {

      console.error(
        "Error loading product:",
        error
      );

      setProductInfo(null);

      setVariants([]);

      setColors([]);

      setAttributes([]);

      setAttributeValues({});

    }

  };

  // ============================================================
  // VALIDATE DYNAMIC ATTRIBUTES
  // ============================================================

  const validateAttributes = () => {

    for (const attribute of attributes) {

      if (
        attribute.required &&
        (
          attributeValues[attribute.id] === undefined ||
          attributeValues[attribute.id] === null ||
          String(attributeValues[attribute.id]).trim() === ""
        )
      ) {

        alert(
          `Please enter ${attribute.label || attribute.name}.`
        );

        return false;

      }

    }

    return true;

  };

  // ============================================================
  // VALIDATE FORM
  // ============================================================

  const validateForm = () => {

    // Product
    if (!inventory.product) {

      alert(
        "Please select a product."
      );

      return false;

    }

    // Variant
    if (!inventory.variantId) {

      alert(
        "Please select a variant."
      );

      return false;

    }

    // Color
    if (!inventory.colorId) {

      alert(
        "Please select a color."
      );

      return false;

    }

    // Product price
    if (
      !productInfo ||
      productInfo.price === null ||
      productInfo.price === undefined ||
      Number(productInfo.price) <= 0
    ) {

      alert(
        "Selected product has an invalid price."
      );

      return false;

    }

    // Stock
    if (
      inventory.stock === "" ||
      Number(inventory.stock) <= 0
    ) {

      alert(
        "Please enter a valid stock quantity."
      );

      return false;

    }

    // Discount
    if (
      inventory.discount !== "" &&
      (
        Number(inventory.discount) < 0 ||
        Number(inventory.discount) > 100
      )
    ) {

      alert(
        "Discount must be between 0 and 100."
      );

      return false;

    }

    // Minimum purchase
    if (
      inventory.minPurchase === "" ||
      Number(inventory.minPurchase) < 1
    ) {

      alert(
        "Please enter a valid minimum purchase quantity."
      );

      return false;

    }

    // Maximum purchase
    if (
      inventory.maxPurchase === "" ||
      Number(inventory.maxPurchase) < 1
    ) {

      alert(
        "Please enter a valid maximum purchase quantity."
      );

      return false;

    }

    // Minimum > Maximum
    if (
      Number(inventory.minPurchase) >
      Number(inventory.maxPurchase)
    ) {

      alert(
        "Minimum purchase cannot be greater than maximum purchase."
      );

      return false;

    }

    // Maximum > Stock
    if (
      Number(inventory.maxPurchase) >
      Number(inventory.stock)
    ) {

      alert(
        "Maximum purchase cannot be greater than available stock."
      );

      return false;

    }

    // Warranty
    if (
      !inventory.warranty.trim()
    ) {

      alert(
        "Please enter the warranty."
      );

      return false;

    }

    // Condition
    if (!inventory.condition) {

      alert(
        "Please select the product condition."
      );

      return false;

    }

    // Delivery
    if (
      !inventory.deliveryTime.trim()
    ) {

      alert(
        "Please enter the delivery time."
      );

      return false;

    }

    // Offer title
    if (
      !inventory.offerTitle.trim()
    ) {

      alert(
        "Please enter the offer title."
      );

      return false;

    }

    // Offer description
    if (
      !inventory.offerDescription.trim()
    ) {

      alert(
        "Please enter the offer description."
      );

      return false;

    }

    // Return policy
    if (
      !inventory.returnPolicy.trim()
    ) {

      alert(
        "Please enter the return policy."
      );

      return false;

    }

    // Dynamic attributes
    if (!validateAttributes()) {
      return false;
    }

    return true;

  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {

      // ============================================================
      // CONVERT DYNAMIC ATTRIBUTES INTO PAYLOAD
      // ============================================================

      const productAttributes =
        attributes.map(attribute => ({
          attributeId: attribute.id,
          value:
            attributeValues[attribute.id] ?? ""
        }));

      // ============================================================
      // INVENTORY DATA
      // ============================================================

      const inventoryData = {

        productId:
          Number(inventory.product),

        variantId:
          Number(inventory.variantId),

        colorId:
          Number(inventory.colorId),

        stock:
          Number(inventory.stock),

        discount:
          inventory.discount === ""
            ? null
            : Number(inventory.discount),

        minPurchase:
          Number(inventory.minPurchase),

        maxPurchase:
          Number(inventory.maxPurchase),

        condition:
          inventory.condition,

        warranty:
          inventory.warranty.trim(),

        deliveryTime:
          inventory.deliveryTime.trim(),

        homeDelivery:
          inventory.homeDelivery,

        storePickup:
          inventory.storePickup,

        cod:
          inventory.cod,

        emi:
          inventory.emi,

        exchange:
          inventory.exchange,

        offerTitle:
          inventory.offerTitle.trim(),

        offerDescription:
          inventory.offerDescription.trim(),

        returnPolicy:
          inventory.returnPolicy.trim(),

        // Dynamic attributes
        attributes:
          productAttributes
      };

      console.log(
        "Inventory data being sent:",
        inventoryData
      );

      // ============================================================
      // SEND TO BACKEND
      // ============================================================

      const response =
        await addInventory(
          inventoryData
        );

      console.log(
        "Inventory saved:",
        response.data
      );

      alert(
        "Inventory Added Successfully"
      );

      // ============================================================
      // RESET
      // ============================================================

      setInventory(
        initialInventory
      );

      setProductInfo(null);

      setVariants([]);

      setColors([]);

      setAttributes([]);

      setAttributeValues({});

    } catch (error) {

      console.error(
        "Failed to add inventory:",
        error
      );

      if (error.response) {

        console.error(
          "Backend response:",
          error.response.data
        );

      }

      alert(
        error.response?.data?.message ||
        "Failed to add inventory"
      );

    } finally {

      setSubmitting(false);

    }

  };

  // ============================================================
  // BUTTON ENABLE / DISABLE
  // ============================================================

  const isProductReady = () => {

    const requiredAttributesReady =
      attributes
        .filter(attribute => attribute.required)
        .every(attribute =>
          attributeValues[attribute.id] !== undefined &&
          attributeValues[attribute.id] !== null &&
          String(
            attributeValues[attribute.id]
          ).trim() !== ""
        );

    return Boolean(

      inventory.product &&

      inventory.variantId &&

      inventory.colorId &&

      inventory.stock &&
      Number(inventory.stock) > 0 &&

      inventory.minPurchase &&
      Number(inventory.minPurchase) > 0 &&

      inventory.maxPurchase &&
      Number(inventory.maxPurchase) > 0 &&

      inventory.warranty.trim() &&

      inventory.condition &&

      inventory.deliveryTime.trim() &&

      inventory.offerTitle.trim() &&

      inventory.offerDescription.trim() &&

      inventory.returnPolicy.trim() &&

      requiredAttributesReady

    );

  };

  // ============================================================
  // PRICE CALCULATION
  // ============================================================

  const productPrice =
    productInfo?.price
      ? Number(productInfo.price)
      : 0;

  const discountPercent =
    inventory.discount === ""
      ? 0
      : Number(inventory.discount);

  const discountAmount =
    productPrice *
    (discountPercent / 100);

  const finalPrice =
    productPrice -
    discountAmount;

  // ============================================================
  // RENDER DYNAMIC ATTRIBUTE INPUT
  // ============================================================

  const renderAttributeInput = (
    attribute
  ) => {

    const value =
      attributeValues[attribute.id] || "";

    const commonProps = {
      value: value,

      onChange: (e) =>
        handleAttributeChange(
          attribute.id,
          e.target.value
        ),

      required:
        attribute.required
    };

    // ============================================================
    // NUMBER
    // ============================================================

    if (
      attribute.dataType === "NUMBER"
    ) {

      return (
        <input
          type="number"
          {...commonProps}
        />
      );

    }

    // ============================================================
    // BOOLEAN
    // ============================================================

    if (
      attribute.dataType === "BOOLEAN"
    ) {

      return (
        <select
          value={value}
          onChange={(e) =>
            handleAttributeChange(
              attribute.id,
              e.target.value
            )
          }
          required={attribute.required}
        >

          <option value="">
            Select
          </option>

          <option value="true">
            Yes
          </option>

          <option value="false">
            No
          </option>

        </select>
      );

    }

    // ============================================================
    // DEFAULT TEXT
    // ============================================================

    return (
      <input
        type="text"
        {...commonProps}
      />
    );

  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <>

      {/* ================= HEADER ================= */}

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

          <span className="Vendor">
            Vendor
          </span>

        </div>

        <div className="navigation">

          <Link to="/vendor/manage-products">
            Manage Products
          </Link>

        </div>

        <div
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ←
        </div>

      </header>

      {/* ================= PAGE TITLE ================= */}

      <h1 className="page-title">
        New Product
      </h1>

      <div className="master-layout">

        {/* ==================================================
            LEFT SIDE - FORM
        ================================================== */}

        <form
          className="master-form-section"
          onSubmit={handleSubmit}
        >

          <h2>
            Product Details
          </h2>

          {/* ================= PRODUCT ================= */}

          <h3>
            Product Name
          </h3>

          <select
            name="product"
            value={inventory.product}
            onChange={handleChange}
            required
          >

            <option value="">
              Select Product
            </option>

            {products.map(p => (

              <option
                key={p.id}
                value={p.id}
              >
                {p.name}
              </option>

            ))}

          </select>

          {/* ==================================================
              DYNAMIC PRODUCT ATTRIBUTES
          ================================================== */}

          {attributes.length > 0 && (

            <>

              <h3>
                Product Specifications
              </h3>

              {attributes.map(attribute => (

                <div
                  className="dynamic-attribute"
                  key={attribute.id}
                >

                  <label>

                    {attribute.label ||
                      attribute.name}

                    {attribute.unit
                      ? ` (${attribute.unit})`
                      : ""}

                    {attribute.required
                      ? " *"
                      : ""}

                  </label>

                  {renderAttributeInput(
                    attribute
                  )}

                </div>

              ))}

            </>

          )}

          {/* ================= VARIANT ================= */}

          <h3>
            Variant
          </h3>

          <select
            name="variantId"
            value={inventory.variantId}
            onChange={handleChange}
            required
            disabled={!inventory.product}
          >

            <option value="">
              Select Variant
            </option>

            {variants.map(v => (

              <option
                key={v.id}
                value={v.id}
              >
                {v.name}
              </option>

            ))}

          </select>

          {/* ================= COLOR ================= */}

          <h3>
            Color
          </h3>

          <select
            name="colorId"
            value={inventory.colorId}
            onChange={handleChange}
            required
            disabled={!inventory.product}
          >

            <option value="">
              Select Color
            </option>

            {colors.map(c => (

              <option
                key={c.id}
                value={c.id}
              >
                {c.name}
              </option>

            ))}

          </select>

          {/* ================= SELLING DETAILS ================= */}

          <h3>
            Selling Details
          </h3>

          <label>
            Stock Quantity
          </label>

          <input
            type="number"
            name="stock"
            value={inventory.stock}
            onChange={handleChange}
            min="1"
            required
          />

          <label>
            Discount
          </label>

          <input
            type="number"
            name="discount"
            value={inventory.discount}
            onChange={handleChange}
            min="0"
            max="100"
          />

          <label>
            Minimum Purchase Quantity
          </label>

          <input
            type="number"
            name="minPurchase"
            value={inventory.minPurchase}
            onChange={handleChange}
            min="1"
            required
          />

          <label>
            Maximum Purchase Quantity
          </label>

          <input
            type="number"
            name="maxPurchase"
            value={inventory.maxPurchase}
            onChange={handleChange}
            min="1"
            required
          />

          {/* ================= CONDITION ================= */}

          <h3>
            Product Condition
          </h3>

          <label>
            Warranty
          </label>

          <input
            type="text"
            name="warranty"
            placeholder="Example: 1 Year"
            value={inventory.warranty}
            onChange={handleChange}
            required
          />

          <label>
            Condition
          </label>

          <select
            name="condition"
            value={inventory.condition}
            onChange={handleChange}
            required
          >

            <option value="">
              Select Condition
            </option>

            <option value="NEW">
              New
            </option>

            <option value="REFURBISHED">
              Refurbished
            </option>

          </select>

          {/* ================= DELIVERY ================= */}

          <h3>
            Delivery Details
          </h3>

          <label>
            Delivery Time
          </label>

          <input
            type="text"
            name="deliveryTime"
            placeholder="Example: 3-5 days"
            value={inventory.deliveryTime}
            onChange={handleChange}
            required
          />

          {/* ================= SERVICES ================= */}

          <h3>
            Services
          </h3>

          <label>

            <input
              type="checkbox"
              name="homeDelivery"
              checked={inventory.homeDelivery}
              onChange={handleChange}
            />

            Home Delivery

          </label>

          <label>

            <input
              type="checkbox"
              name="storePickup"
              checked={inventory.storePickup}
              onChange={handleChange}
            />

            Store Pickup

          </label>

          {/* ================= PAYMENT ================= */}

          <h3>
            Payment Options
          </h3>

          <label>

            <input
              type="checkbox"
              name="cod"
              checked={inventory.cod}
              onChange={handleChange}
            />

            Cash On Delivery

          </label>

          <label>

            <input
              type="checkbox"
              name="emi"
              checked={inventory.emi}
              onChange={handleChange}
            />

            EMI

          </label>

          <label>

            <input
              type="checkbox"
              name="exchange"
              checked={inventory.exchange}
              onChange={handleChange}
            />

            Exchange

          </label>

          {/* ================= OFFERS ================= */}

          <h3>
            Offers
          </h3>

          <label>
            Offer Title
          </label>

          <input
            type="text"
            name="offerTitle"
            value={inventory.offerTitle}
            onChange={handleChange}
            required
          />

          <label>
            Offer Description
          </label>

          <textarea
            name="offerDescription"
            value={inventory.offerDescription}
            onChange={handleChange}
            required
          />

          {/* ================= RETURN POLICY ================= */}

          <h3>
            Return Policy
          </h3>

          <textarea
            name="returnPolicy"
            value={inventory.returnPolicy}
            onChange={handleChange}
            required
          />

          {/* ================= SUBMIT ================= */}

          <button
            type="submit"
            className="add-product-btn"
            disabled={
              !isProductReady() ||
              submitting
            }
          >

            {submitting
              ? "Adding Product..."
              : "Add Product"
            }

          </button>

        </form>

        {/* ==================================================
            RIGHT SIDE - LIVE PREVIEW
        ================================================== */}

        <div className="master-preview-section">

          <h2>
            Live Product Preview
          </h2>

          <div className="master-preview-card">

            {/* PRODUCT PRICE */}

            <div className="preview-item">

              <label>
                Product Price
              </label>

              <input
                readOnly
                value={
                  productPrice > 0
                    ? `₹${productPrice.toFixed(2)}`
                    : ""
                }
              />

            </div>

            {/* FINAL PRICE */}

            <div className="preview-item">

              <label>
                Final Price
              </label>

              <input
                readOnly
                value={
                  productPrice > 0
                    ? `₹${finalPrice.toFixed(2)}`
                    : ""
                }
              />

            </div>

            {/* DYNAMIC ATTRIBUTES PREVIEW */}

            {attributes.map(attribute => (

              <div
                className="preview-item"
                key={attribute.id}
              >

                <label>
                  {attribute.label ||
                    attribute.name}
                </label>

                <input
                  readOnly
                  value={
                    attributeValues[
                      attribute.id
                    ] || ""
                  }
                />

              </div>

            ))}

            {/* VARIANT */}

            <div className="preview-item">

              <label>
                Variant
              </label>

              <input
                readOnly
                value={
                  selectedVariant?.name || ""
                }
              />

            </div>

            {/* COLOR */}

            <div className="preview-item">

              <label>
                Color
              </label>

              <input
                readOnly
                value={
                  selectedColor?.name || ""
                }
              />

            </div>

            {/* HEX CODE */}

            <div className="preview-item">

              <label>
                Hex Code
              </label>

              <input
                readOnly
                value={
                  selectedColor?.hexCode || ""
                }
              />

            </div>

            {/* STOCK */}

            <div className="preview-item">

              <label>
                Stock
              </label>

              <input
                readOnly
                value={
                  inventory.stock
                }
              />

            </div>

            {/* DISCOUNT */}

            <div className="preview-item">

              <label>
                Discount
              </label>

              <input
                readOnly
                value={
                  inventory.discount !== ""
                    ? `${inventory.discount}%`
                    : ""
                }
              />

            </div>

            {/* MIN PURCHASE */}

            <div className="preview-item">

              <label>
                Min Purchase
              </label>

              <input
                readOnly
                value={
                  inventory.minPurchase
                    ? inventory.minPurchase
                    : ""
                }
              />

            </div>

            {/* MAX PURCHASE */}

            <div className="preview-item">

              <label>
                Max Purchase
              </label>

              <input
                readOnly
                value={
                  inventory.maxPurchase
                    ? inventory.maxPurchase
                    : ""
                }
              />

            </div>

            {/* WARRANTY */}

            <div className="preview-item">

              <label>
                Warranty
              </label>

              <input
                readOnly
                value={
                  inventory.warranty
                }
              />

            </div>

            {/* CONDITION */}

            <div className="preview-item">

              <label>
                Condition
              </label>

              <input
                readOnly
                value={
                  inventory.condition
                }
              />

            </div>

            {/* DELIVERY */}

            <div className="preview-item">

              <label>
                Delivery
              </label>

              <input
                readOnly
                value={
                  inventory.deliveryTime
                }
              />

            </div>

            {/* OFFER */}

            <div className="preview-item">

              <label>
                Offer
              </label>

              <input
                readOnly
                value={
                  inventory.offerTitle
                }
              />

            </div>

            {/* RETURN POLICY */}

            <div className="preview-item">

              <label>
                Return Policy
              </label>

              <input
                readOnly
                value={
                  inventory.returnPolicy
                }
              />

            </div>

          </div>

        </div>

      </div>

    </>
  );
}

export default VendorProductPage;
