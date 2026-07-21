import React, { useState, useEffect } from "react";
import "../../styles/Product.css";
import SideWindow from "../../components/SideBar";
import { useNavigate } from "react-router-dom";
import Popup from "../../components/Popup";
import { getAllProducts } from "../../api/ProductApi";
import { addInventory } from "../../api/InventoryApi";
import { getProductById } from "../../api/ProductApi";


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


const [productDetails,setProductDetails] = useState({

brand:"",
processor:"",
displaySize:"",
battery:"",
variant:"",
ram:"",
storage:"",
color:"",
hexCode:""

});


  const [products,setProducts] = useState([]);
  const [variants,setVariants] = useState([]);
  const [colors,setColors] = useState([]);
  const [images,setImages] = useState([]);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [previewImages,setPreviewImages] = useState([]);
  const [tempImages,setTempImages] = useState([]);
  
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

  const handleChange = async(e)=>{

    const {name,value,type,checked}=e.target;


    const val = type==="checkbox" ? checked : value;


    setInventory(prev=>({

      ...prev,
      [name]:val

    }));

    if(name==="product"){


try{

const response = await getProductById(value);

const product=response.data;
console.log(product);
setInventory(prev=>({
    ...prev,
    variantId:"",
    colorId:""
}));

setProductDetails({

brand: product.brand,
processor: product.processor,
displaySize: product.displaySize,
battery: product.battery,

variant: product.variant,
ram: product.ram,
storage: product.storage,

color: product.color,
hexCode: product.hexCode

});


// create dropdown data

setVariants([
{
 id: product.id,
 name: product.variant
}
]);


setColors([
{
 id: product.id,
 name: product.color
}
]);

}
catch(error){

console.error(
"Product loading failed",
error
);

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

    }
    catch(error){

      console.error(error);

      alert("Failed to add inventory");

    }
}
  const handleAddImage=(e)=>{

const file=e.target.files[0];

if(!file)
return;

const exists = tempImages.some(
(img)=>img.name === file.name
);

if(exists){

alert("Image already added");

return;

}


// maximum 5 images

if(tempImages.length >=5){

alert("Maximum 5 images allowed");

return;

}


// size validation

if(file.size > 2 * 1024 * 1024){

alert("Image size should be below 2MB");

return;

}


// type validation

const allowedTypes=[
"image/jpeg",
"image/png",
"image/webp"
];


if(!allowedTypes.includes(file.type)){

alert("Only JPG PNG WEBP allowed");

return;

}



setTempImages(prev=>[

...prev,

file

]);


};

const removeTempImage=(index)=>{


setTempImages(prev=>

prev.filter(
(_,i)=>i!==index
)
);
};

const replaceImage=(index,e)=>{

const file=e.target.files[0];

if(!file)
return;


const exists=tempImages.some(
(img,i)=>img.name === file.name && i !== index
);

if(exists){

alert("Image already exists");

return;

}


if(file.size > 2 * 1024 * 1024){

alert("Image size should be below 2MB");

return;

}


const allowedTypes=[
"image/jpeg",
"image/png",
"image/webp"
];

if(!allowedTypes.includes(file.type)){

alert("Only JPG PNG WEBP allowed");

return;

}

setTempImages(prev=>{
const updated=[...prev];
updated[index]=file;
return updated;
});
};

const isProductReady = () => {

  return (
    inventory.product &&
    inventory.variantId &&
    inventory.colorId &&
    inventory.sellingPrice &&
    inventory.stock &&
    inventory.condition &&
    images.length >= 3
  );

};

const confirmImages = () => {


if(tempImages.length < 3){

alert("Minimum 3 images required");

return;

}


if(tempImages.length > 5){

alert("Maximum 5 images allowed");

return;

}


setImages(tempImages);


setPreviewImages(
tempImages.map(file =>
URL.createObjectURL(file)
)
);

setShowImagePopup(false);
};
const openImagePopup = () => {

setTempImages(images);

setShowImagePopup(true);
};

return (

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

      <div className="product-form-page">


        <form 
          className="product-form"
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

value={productDetails.brand}

readOnly

/>



<label>
Processor
</label>

<input

type="text"

value={productDetails.processor}

readOnly

/>



<label>
Display
</label>

<input

type="text"

value={productDetails.displaySize}

readOnly

/>



<label>
Battery
</label>

<input

type="text"

value={productDetails.battery}

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

/>


<label>
Stock Quantity
</label>

<input

type="number"

name="stock"

value={inventory.stock}

onChange={handleChange}

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
<h3>Images</h3>

<div className="image-section">


<div className="preview-container">


{
previewImages.map((img,index)=>(

<div 
className="preview-item"
key={index}
>

<img
src={img}
alt="preview"
/>


<button
type="button"
onClick={openImagePopup}
>
Edit
</button>


</div>

))
}


{
images.length < 5 &&

<button
type="button"
className="add-image-btn"
onClick={openImagePopup}
>
+
</button>

}
</div>

</div>
<button 
type="submit"
className="add-product-btn"
disabled={!isProductReady()}
>
  Add Product
  </button>

</form>
<Popup

open={showImagePopup}

title="Product Images"

onClose={()=>{

setTempImages(images);

setShowImagePopup(false);

}}

width="600px"

>
<div className="add-image-container">
  <div className="popup-preview">

{

tempImages.map((img,index)=>(

<div key={index}>


<img

src={URL.createObjectURL(img)}

alt="preview"

/>



<button

type="button"

onClick={()=>removeTempImage(index)}

>

X

</button>



<label>
Edit


<input

type="file"

hidden

accept="image/*"

onChange={(e)=>
replaceImage(index,e)
}

/>


</label>


</div>

))

}


</div>

<label className="add-image-popup-btn">
+

<input
type="file"
hidden
accept="image/*"
onChange={handleAddImage}
/>
</label>
</div>



<p>
Images Added : {tempImages.length}/5
</p>



<button className="popup-btn"

type="button"

onClick={confirmImages}

>

Add Images

</button>


</Popup>



</div>
    </>

  );
}


export default VendorProductPage;