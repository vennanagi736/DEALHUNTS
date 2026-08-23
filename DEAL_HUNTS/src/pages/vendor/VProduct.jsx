import React, { useState, useEffect } from "react";
import SideWindow from "../../components/SideBar";
import { useNavigate } from "react-router-dom";
import { getActiveProducts } from "../../api/VendorApi";
import { getProductById } from "../../api/ProductApi";
import { addInventory } from "../../api/InventoryApi";
import "../../styles/ProductPreview.css";
import { Link } from "react-router-dom";

function VendorProductPage() {

  const navigate = useNavigate();

  const initialInventory = {
    product: "",
    variantId: "",
    colorId: "",

    sellingPrice: "",
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

    returnPolicy: "",
  };

  const [inventory, setInventory] = useState(initialInventory);

  const [productInfo, setProductInfo] = useState(null);

  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);

  const [submitting, setSubmitting] = useState(false);


  // --------------------------------------------------
  // SELECTED VARIANT
  // --------------------------------------------------

  const selectedVariant =
    variants.find(
      v => v.id === Number(inventory.variantId)
    ) || null;


  // --------------------------------------------------
  // SELECTED COLOR
  // --------------------------------------------------

  const selectedColor =
    colors.find(
      c => c.id === Number(inventory.colorId)
    ) || null;


  // --------------------------------------------------
  // LOAD PRODUCTS
  // --------------------------------------------------

  useEffect(() => {

    async function fetchProducts() {

      try {

        const response = await getActiveProducts();

        setProducts(response.data);

      } catch (error) {

        console.error("Error loading products:", error);

      }

    }

    fetchProducts();

  }, []);


  // --------------------------------------------------
  // HANDLE INPUT CHANGES
  // --------------------------------------------------

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


    // --------------------------------------------------
    // NORMAL INPUT / CHECKBOX
    // --------------------------------------------------

    if (name !== "product") {

      setInventory(prev => ({
        ...prev,
        [name]: val
      }));

      return;
    }


    // --------------------------------------------------
    // PRODUCT CHANGE
    // --------------------------------------------------

    setInventory(prev => ({
      ...prev,
      product: value
    }));


    // --------------------------------------------------
    // PRODUCT CLEARED
    // --------------------------------------------------

    if (!value) {

      setProductInfo(null);
      setVariants([]);
      setColors([]);

      setInventory(prev => ({
        ...prev,
        product: "",
        variantId: "",
        colorId: ""
      }));

      return;
    }


    // --------------------------------------------------
    // LOAD SELECTED PRODUCT
    // --------------------------------------------------

    try {

      const response = await getProductById(value);

      if (!response.data) {
        return;
      }

      const product = response.data;

      setProductInfo(product);

      // Reset product-specific fields
      setInventory(prev => ({
        ...prev,

        variantId: "",
        colorId: "",

        sellingPrice: "",
        stock: "",
        discount: "",

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

      setVariants(product.variants || []);
      setColors(product.colors || []);

    } catch (error) {

      setProductInfo(null);
      setVariants([]);
      setColors([]);

      setInventory(prev => ({
        ...prev,
        variantId: "",
        colorId: ""
      }));

      console.error("Error loading product:", error);

    }

  };


  // --------------------------------------------------
  // VALIDATE FORM
  // --------------------------------------------------

  const validateForm = () => {

    // Product
    if (!inventory.product) {
      alert("Please select a product.");
      return false;
    }


    // Variant
    if (!inventory.variantId) {
      alert("Please select a variant.");
      return false;
    }


    // Color
    if (!inventory.colorId) {
      alert("Please select a color.");
      return false;
    }


    // Selling price
    if (
      inventory.sellingPrice === "" ||
      Number(inventory.sellingPrice) <= 0
    ) {
      alert("Please enter a valid selling price.");
      return false;
    }


    // Stock
    if (
      inventory.stock === "" ||
      Number(inventory.stock) <= 0
    ) {
      alert("Please enter a valid stock quantity.");
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
      alert("Discount must be between 0 and 100.");
      return false;
    }

    // Minimum purchase
if (
  inventory.minPurchase === "" ||
  Number(inventory.minPurchase) < 1
) {
  alert("Please enter a valid minimum purchase quantity.");
  return false;
}

// Maximum purchase
if (
  inventory.maxPurchase === "" ||
  Number(inventory.maxPurchase) < 1
) {
  alert("Please enter a valid maximum purchase quantity.");
  return false;
}

// Minimum cannot exceed maximum
if (
  Number(inventory.minPurchase) > Number(inventory.maxPurchase)
) {
  alert("Minimum purchase cannot be greater than maximum purchase.");
  return false;
}

// Maximum cannot exceed stock
if (
  Number(inventory.maxPurchase) > Number(inventory.stock)
) {
  alert("Maximum purchase cannot be greater than available stock.");
  return false;
}


    // Warranty
    if (!inventory.warranty.trim()) {
      alert("Please enter the warranty.");
      return false;
    }


    // Condition
    if (!inventory.condition) {
      alert("Please select the product condition.");
      return false;
    }


    // Delivery time
    if (!inventory.deliveryTime.trim()) {
      alert("Please enter the delivery time.");
      return false;
    }


    // Offer title
    if (!inventory.offerTitle.trim()) {
      alert("Please enter the offer title.");
      return false;
    }


    // Offer description
    if (!inventory.offerDescription.trim()) {
      alert("Please enter the offer description.");
      return false;
    }


    // Return policy
    if (!inventory.returnPolicy.trim()) {
      alert("Please enter the return policy.");
      return false;
    }


    return true;
  };


  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async (e) => {

    e.preventDefault();


    // IMPORTANT:
    // Do not depend only on the disabled button.
    // Always validate again when submitting.

    if (!validateForm()) {
      return;
    }


    if (submitting) {
      return;
    }


    setSubmitting(true);


    try {

      const inventoryData = {

        productId: Number(inventory.product),

        variantId: Number(inventory.variantId),

        colorId: Number(inventory.colorId),

        sellingPrice: Number(inventory.sellingPrice),

        stock: Number(inventory.stock),

        discount:
          inventory.discount === ""
            ? null
            : Number(inventory.discount),

        minPurchase: Number(inventory.minPurchase),

        maxPurchase: Number(inventory.maxPurchase),

        condition: inventory.condition,

        warranty: inventory.warranty.trim(),

        deliveryTime: inventory.deliveryTime.trim(),

        homeDelivery: inventory.homeDelivery,

        storePickup: inventory.storePickup,

        cod: inventory.cod,

        emi: inventory.emi,

        exchange: inventory.exchange,

        offerTitle: inventory.offerTitle.trim(),

        offerDescription:
          inventory.offerDescription.trim(),

        returnPolicy:
          inventory.returnPolicy.trim()
      };


      console.log(
        "Inventory data being sent:",
        inventoryData
      );


      const response =
        await addInventory(inventoryData);


      console.log(
        "Inventory saved:",
        response.data
      );


      alert("Inventory Added Successfully");


      // --------------------------------------------------
      // RESET FORM
      // --------------------------------------------------

      setInventory(initialInventory);

      setProductInfo(null);

      setVariants([]);

      setColors([]);


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


  // --------------------------------------------------
  // BUTTON ENABLE/DISABLE
  // --------------------------------------------------

  const isProductReady = () => {

    return Boolean(

      inventory.product &&

      inventory.variantId &&

      inventory.colorId &&

      inventory.sellingPrice &&
      Number(inventory.sellingPrice) > 0 &&

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

      inventory.returnPolicy.trim()

    );

  };


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

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

            {products.map((p) => (

              <option
                key={p.id}
                value={p.id}
              >
                {p.name}
              </option>

            ))}

          </select>


          {/* ================= PRODUCT INFORMATION ================= */}

          <h3>
            Product Information
          </h3>


          <label>
            Brand
          </label>

          <input
            type="text"
            value={productInfo?.brand || ""}
            readOnly
          />


          <label>
            Processor
          </label>

          <input
            type="text"
            value={productInfo?.processor || ""}
            readOnly
          />


          <label>
            Display
          </label>

          <input
            type="text"
            value={productInfo?.displaySize || ""}
            readOnly
          />


          <label>
            Battery
          </label>

          <input
            type="text"
            value={productInfo?.battery || ""}
            readOnly
          />


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

            {variants.map((v) => (

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

            {colors.map((c) => (

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
            Selling Price
          </label>

          <input
            type="number"
            name="sellingPrice"
            value={inventory.sellingPrice}
            onChange={handleChange}
            min="1"
            required
          />


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

          <label>Minimum Purchase Quantity</label>
          <input
          type="number"
          name="minPurchase"
          value={inventory.minPurchase}
          onChange={handleChange}
          min="1"
          required/>

          <label>Maximum Purchase Quantity</label>

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


            {/* PRODUCT */}

            <div className="preview-item">

              <label>
                Product
              </label>

              <input
                readOnly
                value={productInfo?.name || ""}
              />

            </div>


            {/* BRAND */}

            <div className="preview-item">

              <label>
                Brand
              </label>

              <input
                readOnly
                value={productInfo?.brand || ""}
              />

            </div>


            {/* PROCESSOR */}

            <div className="preview-item">

              <label>
                Processor
              </label>

              <input
                readOnly
                value={productInfo?.processor || ""}
              />

            </div>


            {/* DISPLAY */}

            <div className="preview-item">

              <label>
                Display
              </label>

              <input
                readOnly
                value={productInfo?.displaySize || ""}
              />

            </div>


            {/* BATTERY */}

            <div className="preview-item">

              <label>
                Battery
              </label>

              <input
                readOnly
                value={productInfo?.battery || ""}
              />

            </div>


            {/* RAM */}

            <div className="preview-item">

              <label>
                RAM
              </label>

              <input
                readOnly
                value={selectedVariant?.ram || ""}
              />

            </div>


            {/* STORAGE */}

            <div className="preview-item">

              <label>
                Storage
              </label>

              <input
                readOnly
                value={
                  selectedVariant
                    ? selectedVariant.storage
                    : ""
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
                  selectedColor
                    ? selectedColor.name
                    : ""
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


            {/* PRICE */}

            <div className="preview-item">

              <label>
                Selling Price
              </label>

              <input
                readOnly
                value={inventory.sellingPrice}
              />

            </div>


            {/* STOCK */}

            <div className="preview-item">

              <label>
                Stock
              </label>

              <input
                readOnly
                value={inventory.stock}
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
                  inventory.discount
                    ? `${inventory.discount}%`
                    : ""
                }
              />

            </div>
            <div className="preview-item">
              <label>MinPurchase</label>
              <input 
              readOnly
              value={inventory.minPurchase
                ? `${inventory.minPurchase}`
                : ""
              }
            />
            </div>

            <div className="preview-item">
              <label>MaxPurchase</label>
              <input 
              readOnly
              value={inventory.maxPurchase
                ? `${inventory.maxPurchase}`
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
                value={inventory.warranty}
              />

            </div>


            {/* CONDITION */}

            <div className="preview-item">

              <label>
                Condition
              </label>

              <input
                readOnly
                value={inventory.condition}
              />

            </div>


            {/* DELIVERY */}

            <div className="preview-item">

              <label>
                Delivery
              </label>

              <input
                readOnly
                value={inventory.deliveryTime}
              />

            </div>


            {/* OFFER */}

            <div className="preview-item">

              <label>
                Offer
              </label>

              <input
                readOnly
                value={inventory.offerTitle}
              />

            </div>


            {/* RETURN POLICY */}

            <div className="preview-item">

              <label>
                Return Policy
              </label>

              <input
                readOnly
                value={inventory.returnPolicy}
              />

            </div>


          </div>

        </div>
      </div>

    </>
  );
}


export default VendorProductPage;