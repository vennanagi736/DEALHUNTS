import React, { useState, useEffect } from "react";
import SideWindow from "../../components/SideBar";
import { useNavigate } from "react-router-dom";
import { getAllProducts,getProductById } from "../../api/ProductApi";
import { addInventory } from "../../api/InventoryApi";
import "../../styles/ProductPreview.css";

function VendorProductPage() {

  const navigate = useNavigate();
  const [inventory,setInventory] = useState({

    product:"",
    variantId:"",
    colorId:"",

    sellingPrice:"",
    stock:"",
    discount:"",

    warranty:"",
    condition:"",
    deliveryTime:"",

    homeDelivery:false,
    storePickup:false,

    cod:false,
    emi:false,
    exchange:false,

    offerTitle:"",
    offerDescription:"",

    returnPolicy:"",
});
  const [productInfo,setProductInfo] = useState(null);

  const [products,setProducts] = useState([]);
  const [variants,setVariants] = useState([]);
  const [colors,setColors] = useState([]);

  
const selectedVariant =
    variants.find(
        v => v.id === Number(inventory.variantId)
    ) || null;

const selectedColor =
    colors.find(
        c => c.id === Number(inventory.colorId)
    ) || null;


  // LOAD PRODUCTS FROM ADMIN PRODUCT TABLE
useEffect(() => {

    async function fetchProducts(){

        try{

            const response = await getAllProducts();

            setProducts(response.data);

        }
        catch(error){

            console.error("Error loading products:", error);

        }

    }

    fetchProducts();

}, []);
  // CHANGE HANDLER

  const handleChange = async (e) => {

    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    if (name !== "product") {
        setInventory(prev => ({
            ...prev,
            [name]: val
        }));
        return;
    }

    setInventory(prev => ({
        ...prev,
        product: value
    }));
    
    if(name==="product"){
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


try{

const response = await getProductById(value);
if (!response.data){
  return;
}

const product = response.data;

setProductInfo(product);
setInventory(prev => ({
    ...prev,
    variantId:"",
    colorId:"",
    sellingPrice:"",
    stock:"",
    discount:"",
    warranty:"",
    condition:"",
    deliveryTime:"",
    homeDelivery:false,
    storePickup:false,
    cod:false,
    emi:false,
    exchange:false,
    offerTitle:"",
    offerDescription:"",
    returnPolicy:""
}));
setVariants(product.variants || []);
setColors(product.colors || []);
}catch(error){

setProductInfo(null);
setVariants([]);
setColors([]);

setInventory(prev=>({

    ...prev,

    variantId:"",
    colorId:""

}));

console.error(error);

}

}

};


  const handleSubmit = async (e)=>{
    e.preventDefault();

    try{

      const inventoryData = {

    productId: Number(inventory.product),

    variantId: Number(inventory.variantId),

    colorId: Number(inventory.colorId),

    sellingPrice: Number(inventory.sellingPrice),

    stock: Number(inventory.stock),

    discount: Number(inventory.discount),

    condition: inventory.condition,

    warranty: inventory.warranty,

    deliveryTime: inventory.deliveryTime,

    homeDelivery: inventory.homeDelivery,

    storePickup: inventory.storePickup,

    cod: inventory.cod,

    emi: inventory.emi,

    exchange: inventory.exchange,

    offerTitle: inventory.offerTitle,

    offerDescription: inventory.offerDescription,

    returnPolicy: inventory.returnPolicy
};

const response = await addInventory(inventoryData);
      console.log(response.data);

      alert("Inventory Added Successfully");

setInventory({
    product:"",
    variantId:"",
    colorId:"",
    sellingPrice:"",
    stock:"",
    discount:"",
    warranty:"",
    condition:"",
    deliveryTime:"",
    homeDelivery:false,
    storePickup:false,
    cod:false,
    emi:false,
    exchange:false,
    offerTitle:"",
    offerDescription:"",
    returnPolicy:""
});

setProductInfo(null);
setVariants([]);
setColors([]);

    }
    catch(error){

      console.error(error);

      alert("Failed to add inventory");

    }
};

const isProductReady = () => {

  return Boolean(
    inventory.product &&
    inventory.variantId &&
    inventory.colorId &&
    inventory.sellingPrice &&
    inventory.stock &&
    inventory.condition
  );

};
return(
   <>


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
        <div 
          className="back-btn"
          onClick={()=>navigate(-1)}
        >

          ←

        </div>
      </header>
      <h1 className="page-title">
        New Product 
      </h1>

      <div className="master-layout">


        <form 
          className="master-form-section" 
          onSubmit={handleSubmit}
        >
          <h2>
            Product Details
          </h2>
          {/* PRODUCT */}
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

            {
              products.map((p)=>(
                <option 
                  key={p.id}
                  value={p.id}
                >

                  {p.name}

                </option>

              ))

            }
          </select>
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
          {/* VARIANT */}
          <h3>
            Variant
          </h3>

          <select

            name="variantId"

            value={inventory.variantId}

            onChange={handleChange}

            required

          >

            <option value="">
              Select Variant
            </option>



            {
variants.map((v)=>(
<option
key={v.id}
value={v.id}
>
{v.name}
</option>
))
}


          </select>
          {/* COLOR */}
          <h3>
            Color
          </h3>

          <select

            name="colorId"

            value={inventory.colorId}

            onChange={handleChange}

            required

          >

            <option value="">
              Select Color
            </option>

           {
colors.map((c)=>(
<option
key={c.id}
value={c.id}
>
{c.name}
</option>
))
}

          </select>
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
/>
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

/>
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

/>



<label>
Offer Description
</label>

<textarea

name="offerDescription"

value={inventory.offerDescription}

onChange={handleChange}

/>
<h3>
Return Policy
</h3>


<textarea

name="returnPolicy"

value={inventory.returnPolicy}

onChange={handleChange}

/>
<button 
type="submit"
className="add-product-btn"
disabled={!isProductReady()}
>
  Add Product
  </button>

</form>
<div className="master-preview-section">

    <h2>
        Live Product Preview
    </h2>

    <div className="master-preview-card">
        <div className="preview-item">
    <label>Product</label>
    <input
        readOnly
        value={productInfo?.name || ""}
    />
</div>

        <div className="preview-item">
            <label>Brand</label>
            <input
                readOnly
                value={productInfo?.brand || ""}
            />
        </div>

        <div className="preview-item">
            <label>Processor</label>
            <input
                readOnly
                value={productInfo?.processor || ""}
            />
        </div>

        <div className="preview-item">
            <label>Display</label>
            <input
                readOnly
                value={productInfo?.displaySize || ""}
            />
        </div>

        <div className="preview-item">
            <label>Battery</label>
            <input
                readOnly
                value={productInfo?.battery || ""}
            />
        </div>
        <div className="preview-item">
    <label>RAM</label>
    <input
        readOnly
        value={selectedVariant?.ram || ""}
    />
</div>

<div className="preview-item">
    <label>Storage</label>
    <input
        readOnly
        value={selectedVariant ? selectedVariant.storage :""}
    />
</div>
      
        <div className="preview-item">
    <label>Color</label>
    <input
        readOnly
        value={selectedColor ? selectedColor.name : ""}
    />
</div>

<div className="preview-item">
    <label>Hex Code</label>
    <input
        readOnly
        value={selectedColor?.hexCode || ""}
    />
</div>
        <div className="preview-item">
            <label>Selling Price</label>
            <input
                readOnly
                value={inventory.sellingPrice}
            />
        </div>

        <div className="preview-item">
            <label>Stock</label>
            <input
                readOnly
                value={inventory.stock}
            />
        </div>

        <div className="preview-item">
            <label>Discount</label>
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
            <label>Warranty</label>
            <input
                readOnly
                value={inventory.warranty}
            />
        </div>

        <div className="preview-item">
            <label>Condition</label>
            <input
                readOnly
                value={inventory.condition}
            />
        </div>

        <div className="preview-item">
            <label>Delivery</label>
            <input
                readOnly
                value={inventory.deliveryTime}
            />
        </div>

        <div className="preview-item">
            <label>Offer</label>
            <input
                readOnly
                value={inventory.offerTitle}
            />
        </div>

        <div className="preview-item">
            <label>Return Policy</label>
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