import { useNavigate } from "react-router-dom";
import { useState, useEffect} from "react";
import SideWindow from "../../components/SideBar";
import {
  addProduct,
  getAllCategories,
  getAllBrands
} from "../../api/ProductApi";
import "../../styles/ProductPreview.css";



function AdminAddProduct() {

  const navigate = useNavigate();

  const [productData, setProductData] = useState({

  category: "",
  brand: "",
  product: "",
  description: "",

  variants:[
    {
      ram:"",
      storage:""
    }
  ],

  processor:"",
  displaySize:"",
  battery:"",

  colors:[
    {
      name:"",
      hexCode:""
    }
  ]

});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const loadCategories = async () => {

    try {

      const {data} = await getAllCategories();

      setCategories(data);

    } catch(error){

      console.error(error);

    }

  };



  const loadBrands = async () => {

    try {

      const {data} = await getAllBrands();

      setBrands(data);

    } catch(error){

      console.error(error);

    }

  };

  useEffect(()=>{

 const loadData = async()=>{
   await loadCategories();
   await loadBrands();

 };

 loadData();

},[]);
  // ADD CATEGORY
const handleChange=(e)=>{
const {name,value}=e.target;
    setProductData(prev=>({
      ...prev,
      [name]:value
    }));
  };

  const handleVariantChange = (index, field, value)=>{

  const updatedVariants = [...productData.variants];

  updatedVariants[index][field] = value;

  setProductData(prev=>({
    ...prev,
    variants: updatedVariants
  }));

};


const addVariant = ()=>{

  setProductData(prev=>({

    ...prev,

    variants:[
      ...prev.variants,
      {
        ram:"",
        storage:""
      }
    ]
  }));
};

const removeVariant = (index)=>{

  if(productData.variants.length === 1){
    alert("At least one variant is required");
    return;
  }

  const updatedVariants = productData.variants.filter(
    (_,i)=> i !== index
  );

  setProductData(prev=>({
    ...prev,
    variants: updatedVariants
  }));

};

const handleColorChange = (index, field, value)=>{

  const updatedColors = [...productData.colors];

  updatedColors[index][field] = value;

  setProductData(prev=>({

    ...prev,

    colors: updatedColors

  }));

};



const addColor = ()=>{

  setProductData(prev=>({

    ...prev,

    colors:[
      ...prev.colors,
      {
        name:"",
        hexCode:""
      }
    ]
  }));
};

const removeColor = (index)=>{

  if(productData.colors.length === 1){
    alert("At least one color is required");
    return;
  }

  const updatedColors = productData.colors.filter(
    (_,i)=> i !== index
  );

  setProductData(prev=>({
    ...prev,
    colors: updatedColors
  }));

};
const handleSubmit = async (e) => {

    e.preventDefault();

    // Required fields
    if (
        !productData.category ||
        !productData.brand ||
        !productData.product.trim()
    ) {
        alert("Please fill all required fields");
        return;
    }

    // Specifications
    if (
        !productData.processor ||
        !productData.displaySize ||
        !productData.battery
    ) {
        alert("Please complete all specifications.");
        return;
    }

    // Variants
    if (
        productData.variants.some(
            variant => !variant.ram || !variant.storage
        )
    ) {
        alert("Please complete all variants.");
        return;
    }

    // Colors
    if (
        productData.colors.some(
            color => !color.name || !color.hexCode
        )
    ) {
        alert("Please complete all colors.");
        return;
    }

    try {

        const product = {

            name: productData.product,
            brand: productData.brand,
            category: productData.category,
            description: productData.description,

            processor: productData.processor,
            displaySize: productData.displaySize,
            battery: productData.battery,

            variants: productData.variants,
            colors: productData.colors

        };

        console.log(product);
        await addProduct(product);
        alert("Product Added Successfully");
        navigate("/admin/product-images");
    }
    catch (error) {
        console.error(error);
        alert("Failed to Add Product");
    }

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

<span className="Admin">
Admin
</span>
</div>
<div>
  <button
className="options-btn"
onClick={() => navigate("/admin/master-data")}
>
Master Data
</button>
</div>
<div
className="back-btn"
onClick={()=>navigate(-1)}
>
&#8592;
</div>
</header>
<h1 className="page-title">
New Product
</h1>
<div className="master-layout">

<form 
className="master-form-section"
onSubmit={handleSubmit}>

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
categories.map(category=>(


<option

key={category.id}

value={category.name}

>

{category.name}

</option>


))
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
brands.map(brand=>(


<option

key={brand.id}

value={brand.name}

>

{brand.name}

</option>


))
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

<h2>
Variant Details
</h2>

{
productData.variants.map((variant,index)=>(

<div key={index}>


<label>
RAM
</label>

<input

type="text"
name = "ram"
value={variant.ram}
onChange={(e)=>
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
onChange={(e)=>
handleVariantChange(
index,
"storage",
e.target.value
)
}
/>

<button
type="button"
onClick={()=>removeVariant(index)}
>
Remove
</button>
</div>
))
}

<button
type="button"
onClick={addVariant}
>
+ Add Variant
</button>

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
<h2>
Color Details
</h2>

{
productData.colors.map((color,index)=>(

<div key={index}>


<label>
Color Name
</label>

<input

type="text"
name="color"
value={color.name}
onChange={(e)=>
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
onChange={(e)=>
handleColorChange(
index,
"hexCode",
e.target.value
)
}
/>

<button
type="button"
onClick={()=>removeColor(index)}
>
Remove
</button>
</div>
))
}

<button
type="button"
onClick={addColor}
>
+ Add Color
</button>
<button
className="add-product-btn"
type="submit"
>
Save Product
</button>
</form>

<div className="master-preview-section">

    <h2>Live Preview Details</h2>

    <div className="master-preview-card">

        <div className="preview-item">
            <label>Category</label>
            <input readOnly value={productData.category} />
        </div>

        <div className="preview-item">
            <label>Brand</label>
            <input readOnly value={productData.brand} />
        </div>

        <div className="preview-item">
            <label>Product</label>
            <input readOnly value={productData.product} />
        </div>

        <div className="preview-item">
            <label>Description</label>
            <textarea readOnly value={productData.description} />
        </div>

        <div className="preview-item">
            <label>Processor</label>
            <input readOnly value={productData.processor} />
        </div>

        <div className="preview-item">
            <label>Display</label>
            <input readOnly value={productData.displaySize} />
        </div>

        <div className="preview-item">
            <label>Battery</label>
            <input readOnly value={productData.battery} />
        </div>

        <h3>Variants</h3>

        {productData.variants.map((variant,index)=>(

            <div
                className="preview-item"
                key={index}
            >

                <label>
                    Variant {index+1}
                </label>

                <input
                    readOnly
                    value={`${variant.ram} | ${variant.storage}`}
                />

            </div>

        ))}

        <h3>Colors</h3>

        {productData.colors.map((color,index)=>(

            <div
                className="preview-item"
                key={index}
            >

                <label>
                    Color {index+1}
                </label>

                <input
                    readOnly
                    value={`${color.name} (${color.hexCode})`}
                />
            </div>
        ))}
    </div>
</div>
</div>
</>
  );

}

export default AdminAddProduct;