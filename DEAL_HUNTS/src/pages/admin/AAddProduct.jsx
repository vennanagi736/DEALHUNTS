import { useNavigate } from "react-router-dom";
import { useState, useEffect} from "react";
import "../../styles/Admin.css";
import SideWindow from "../../components/SideBar";

import {
  addProduct,
  getAllCategories,
  getAllBrands
} from "../../api/ProductApi";


function AdminAddProduct() {

  const navigate = useNavigate();

  const [productData, setProductData] = useState({

  category: "",
  brand: "",
  product: "",
  description: "",
  image: "",

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

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(
      !productData.category ||
      !productData.brand ||
      !productData.product.trim()
    ){
      alert("Please fill all required fields");
      return;
    }
    try{
    const product={

name:productData.product,
brand:productData.brand,
category:productData.category,
description:productData.description,
image:productData.image,

processor:productData.processor,
displaySize:productData.displaySize,
battery:productData.battery,

variants:productData.variants,

colors:productData.colors

};
      console.log(product);

      await addProduct(product);
      alert("Product Added Successfully");
      setProductData({
        category:"",
        brand:"",
        product:"",
        description:"",
        image:"",
        variants: [
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

    }catch(error){
      console.error(error);
      alert("Failed to Add Product");
    }
  };
    return (

<div className="adminhome-container">


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
<main>
<h1 className="page-title">
Add New Market Product
</h1>
<div className="master-layout">





<div className="master-form-section">



<form onSubmit={handleSubmit}>


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

value={productData.description}

onChange={handleChange}

/>






<label>
Product Image
</label>


<input

type="text"

name="image"

placeholder="Enter Image URL"

value={productData.image}

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
className="save-master-btn"
type="submit"
>
Save Product
</button>
</form>
</div>
<div className="preview-section-aap">
<h2>
Added Details
</h2>

<div className="preview-box-aap">
{
Object.entries(productData).map(([key,value])=>(
<div
className="preview-item"
key={key}
>
<label>
{key}
</label>
<input
type="text"
value={value}
readOnly
/>
</div>
))
}
</div>   
</div>  
</div>
</main>
</div>   
  );

}

export default AdminAddProduct;