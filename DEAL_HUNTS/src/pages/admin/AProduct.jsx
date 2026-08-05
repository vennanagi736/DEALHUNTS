import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Popup from "../../components/Popup";
import "../../styles/AProduct.css";
import SideWindow from "../../components/SideBar";
import {getAllProducts,uploadImages} from "../../api/ProductApi";
import AdminManageTrending from "./ATrending";

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct,SetSelectedProduct] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [previewImage,setPreviewImage] = useState(null);
  const [selectedFiles,setSelectedFiles] = useState([]);
  const [selectedImages,setSelectedImages] = useState([]);
  
  useEffect(() => {

    const fetchProducts = async () => {

        try {

            const res = await getAllProducts();
            setProducts(res.data);
            console.log(res.data);
            console.log("Hello:",res.data[0]);
        } catch(err) {
            console.error(err);
        }
    };

    fetchProducts();

}, []);

const handleImageSelect = (e) => {

    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    let newFiles = [];

    files.forEach(file => {

        const existingDuplicate =
            selectedProduct.images?.some(img =>
                img.split("/").pop().toLowerCase() ===
                file.name.toLowerCase()
            );

        const selectedDuplicate =
            selectedFiles.some(existing =>
                existing.name === file.name &&
                existing.size === file.size &&
                existing.lastModified === file.lastModified
            );

        if (existingDuplicate || selectedDuplicate) {
            alert(`${file.name} already exists`);
            return;
        }

        newFiles.push(file);

    });

    const totalImages =
        (selectedProduct.images?.length ?? 0) +
        selectedFiles.length +
        newFiles.length;

    if (totalImages > 5) {
        alert("Maximum 5 images allowed.");
        return;
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);

};

const handleRefreshProduct = async () => {

    const res = await getAllProducts();

    setProducts(res.data);

    const updated = res.data.find(
        p => p.id === selectedProduct.id
    );

    SetSelectedProduct(updated);
};

const handleUploadImages = async()=>{

    try{

        const formData = new FormData();

        selectedFiles.forEach((file)=>{
            formData.append("images", file);
        });


        formData.append(
            "productId",
            selectedProduct.id
        );


        console.log("FORM DATA");

        for(let pair of formData.entries()){
            console.log(pair[0], pair[1]);
        }


        await uploadImages(formData);

        alert("Images uploaded successfully");


    }catch(error){

        console.log(error);

    }
};

const handleImageCheck = (id)=>{

    setSelectedImages(prev=>

        prev.includes(id)
        ? prev.filter(x=>x!==id)
        : [...prev,id]

    );
  };

  return (
    <div className="adminhome-container">
      {/* HEADER */}
      <header className="header">
        <div className="left-section">
          <SideWindow />
        </div>
  <div className="logo-container">
       <div className="logo">
      <span className="Gold">DEAL</span>
      <span className="Black">HUNTS</span>
      <span className="Admin">Admin</span>
    </div>
  </div>

  <nav className="admin-nav-links">
    <NavLink to="/admin/manage-promotions">Manage Promotions</NavLink>
    <NavLink to="/adminAddProduct">Add Product</NavLink>
    <NavLink>Manage Product</NavLink>
    
    <div className="search-box">
              <input
                type="text"
                placeholder="Search"
              />
              <span className="icon">🔍</span>
            </div>
    <div className="back-btn" onClick={() => navigate(-1)}>
      &#8592;
      </div>
      </nav>
</header>

      {/* MAIN SECTION */}
      <main className="main">
        <h1>Product List</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Variants</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>

{products.map((product) => (

<tr key={product.id}
onClick={() => {
  SetSelectedProduct(product);
  setShowPopup(true);
}}
className="product-row">
    <td>{product.id}</td>
    <td>{product.name}</td>
    <td>{product.brand}</td>
    <td>{product.category}</td>
    <td>
        <span>{product.variants?.length || 0} Options</span>
    </td>

    <td>
      <span
      className={
        product.status === "Active"
      ? "status active"
      : "status inactive"
        }>{product.status}
      </span>
    </td>
</tr>

))}

</tbody>
        </table>
        {
previewImage && (

<div className="image-preview">

<img
src={previewImage}
alt="preview"
/>

</div>

)
}

      </main>

      
      <Popup
open={showPopup}
title="Image Management"
onClose={()=>{
    setShowPopup(false);
    SetSelectedProduct(null);
    setSelectedFiles([]);
    setSelectedImages([]);
    setPreviewImage(null);
}}
width="750px"
>

{
selectedProduct && (

<div className="image-management-popup">


{/* PRODUCT INFO */}

<div className="popup-product-header">

<h2>
{selectedProduct.name}
</h2>


<div className="product-info-grid">

<p>
<strong>Brand</strong>
<span>{selectedProduct.brand}</span>
</p>


<p>
<strong>Category</strong>
<span>{selectedProduct.category}</span>
</p>


<p>
<strong>Variant</strong>
<span>{selectedProduct.variant}</span>
</p>


<p>
<strong>Status</strong>
<span className="status-badge">
{selectedProduct.status}
</span>
</p>

</div>

</div>




{/* IMAGE SECTION */}

<div className="images-section">

<div className="image-title">

<h3>
Product Images
</h3>


<label className="select-all">

<input
type="checkbox"
/>

Select All

</label>

</div>
<div className="images-wrapper">
<div className="image-grid">

    {/* Existing Images */}
    {selectedProduct.images?.map((img, index) => (

        <div
            className="image-card"
            key={`existing-${index}`}
        >

            <input
                type="checkbox"
                className="image-checkbox"
                checked={selectedImages.includes(img)}
                onChange={() => handleImageCheck(img)}
            />

            <img
                src={img}
                alt="product"
                onClick={() => setPreviewImage(img)}
            />

            <div className="image-name">
                Image {index + 1}
            </div>

        </div>

    ))}

    {/* Newly Selected Images */}
    {selectedFiles.map((file, index) => (

        <div
            className="image-card"
            key={`new-${index}`}
        >

            <img
                src={URL.createObjectURL(file)}
                alt="preview"
            />

            <div className="image-name">
                {file.name}
            </div>

            <button
                type="button"
                className="remove-image-btn"
                onClick={() =>
                    setSelectedFiles(prev =>
                        prev.filter((_, i) => i !== index)
                    )
                }
            >
                ✕
            </button>

        </div>

    ))}

    {/* Add Image Card */}
    {((selectedProduct.images?.length ?? 0) + selectedFiles.length) < 5 && (

        <label className="add-image-card">

            <span className="plus-icon">+</span>

            <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageSelect}
            />

        </label>

    )}

</div>
</div>
</div>

{/* ACTIONS */}
<div className="image-actions">
  <button className="upload-btn"
  disabled={selectedFiles.length==0}
  onClick={handleUploadImages}>
    Upload Images
  </button>

<button className="change-btn">
Change Images
</button>
<button className="delete-btn">
Delete Selected
</button>
</div>
</div>
)
}
</Popup>


      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 Website. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AdminProducts;