import { useNavigate } from "react-router-dom";
import { useState, useRef} from "react";
import "../../styles/Admin.css";
import SideWindow from "../../components/SideBar";
import Popup from "../../components/Popup";

import {
    getAllCategories,
    getAllBrands,
    getAllColors,
    getAllVariants,
    addCategory,
    addBrand,
    addColor,
    addVariant,
    updateBrand,
    updateCategory,
    updateColor,
    updateVariant,
    deleteBrand,
    deleteCategory,
    deleteColor,
    deleteVariant
} from "../../api/ProductApi";

function AdminMasterData() {


  const [popupType, setPopupType] = useState("");

  const deleteRef = useRef(null);

  const navigate = useNavigate();

  const [masterData, setMasterData] = useState([]);
  const [ram,setRam] = useState("");
  const [newValue,setNewValue] = useState("");
  const [storage,setStorage] = useState("");
  const [colorName, setColorName] = useState("");
  const [hexCode, setHexCode] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  const [editId, setEditId] = useState(null);
  
  const loadMasterData = async (type) => {

    try {

        let response;

        switch (type) {

            case "category":
                response = await getAllCategories();
                break;

            case "brand":
                response = await getAllBrands();
                break;

            case "color":
                response = await getAllColors();
                break;

            case "variant":
                response = await getAllVariants();
                break;

            default:
                return;
        }

        setMasterData(response.data);

    } catch (error) {

        console.error(error);

    }

};

const openPopup = async (type) => {
    setPopupType(type);
    setNewValue("");
    setRam("");
    setStorage("");
    setColorName("");
    setHexCode("");
    await loadMasterData(type);
};

  const handleAdd = async () => {

    if (popupType === "category" && !newValue.trim()) {
    alert("Enter Category");
    return;
}

if (popupType === "brand" && !newValue.trim()) {
    alert("Enter Brand");
    return;
}

if (popupType === "variant" && (!ram.trim() || !storage.trim())) {
    alert("Enter RAM and Storage");
    return;
}

if (popupType === "color" && (!colorName.trim() || !hexCode.trim())) {
    alert("Enter Color Name and Hex Code");
    return;
}
    try {

        switch (popupType) {

            case "category":
                await addCategory({ name: newValue.trim() });
                break;

            case "brand":
                await addBrand({ name: newValue.trim() });
                break;

            case "color":
                await addColor({ 
                  name: colorName.trim(),
                  hexCode: hexCode.trim()
                 });
                break;

            case "variant":
                await addVariant({ 
                  name: `${ram} + ${storage}`,
                  ram,
                  storage
                 });
                break;

            default:
                return;
        }
        await loadMasterData(popupType);
        setNewValue("");
        setRam("");
        setStorage("");
        setColorName("");
        setHexCode("");

        alert("Added Successfully");

    } catch (error) {

        console.error(error);

        alert("Failed");

    }
}
    const handleDelete = async (id) => {

    try {

        switch (popupType) {

            case "category":
                await deleteCategory(id);
                break;

            case "brand":
                await deleteBrand(id);
                break;

            case "variant":
                await deleteVariant(id);
                break;

            case "color":
                await deleteColor(id);
                break;
        }

        await loadMasterData(popupType);

    } catch (error) {
        console.error(error);
    }
}
   const handleDeleteSelected = async () => {

    if (selectedItems.length === 0) {
        alert("Select at least one item");
        return;
    }

    try {

        for (const id of selectedItems) {

            switch (popupType) {

                case "category":
                    await deleteCategory(id);
                    break;

                case "brand":
                    await deleteBrand(id);
                    break;

                case "variant":
                    await deleteVariant(id);
                    break;

                case "color":
                    await deleteColor(id);
                    break;
            }
        }

        await loadMasterData(popupType);
        setSelectedItems([]);

        alert("Deleted Successfully");

    } catch (error) {
        console.error(error);
        alert("Delete Failed");
    }
}; 
const handleEdit = (item) => {
    setEditId(item.id);
    if (popupType === "category" || popupType === "brand") {
        setNewValue(item.name);
    }
    if (popupType === "variant") {
        setRam(item.ram);
        setStorage(item.storage);
    }
    if (popupType === "color") {
        setColorName(item.name);
        setHexCode(item.hexCode);
    }
};
const handleUpdate = async () => {
    try {
        switch(popupType){
            case "category":
                await updateCategory(editId,{
                    name:newValue
                });
                break;

            case "brand":
                await updateBrand(editId,{
                    name:newValue
                });
                break;

            case "variant":
                await updateVariant(editId,{
                    name:`${ram} + ${storage}`,
                    ram,
                    storage
                });
                break;

            case "color":
                await updateColor(editId,{
                    name:colorName,
                    hexCode
                });
                break;
        }

        await loadMasterData(popupType);

        setEditId(null);
        setNewValue("");
        setRam("");
        setStorage("");
        setColorName("");
        setHexCode("");
        alert("Updated Successfully");
    } catch(error){
        console.error(error);
        alert("Update Failed");
    }
};
   
return (
    <div className="adminhome-container">
      {/* HEADER */}
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
        <div
          className="back-btn"
          onClick={()=>navigate(-1)}
        >
          &#8592;
        </div>
      </header>
      <main>
        {/* <h1 className="page-title">
          Master Data Management
        </h1> */}
         <h1 className="page-title">
              Manage Product Options
            </h1>
        <div className="master-layout">
          <div className="master-form-section">
            <button
              className="master-action-btn"
              onClick={ ()=>  openPopup("category")}
            >
              Manage Category
            </button>
            <button
              className="master-action-btn"
              onClick={ ()=> openPopup("brand")}
            >
              Manage Brand
            </button>
           <button
    className="master-action-btn"
    onClick={() => openPopup("variant")}
>
    Manage Variant
</button>

<button
    className="master-action-btn"
    onClick={() => openPopup("color")}
>
    Manage Color
</button>
          </div>
        </div>
      </main>

      <Popup
  open= {popupType !== ""}
  title= {
    popupType === "category"
    ? "Manage Categories"
    : popupType === "brand"
    ? "Manage Brands"
    : popupType === "variant"
    ? "Manage Variants"
    : "Manage Colors"
  }
  onClose={() => {
    setPopupType("");
    setNewValue("");
    setMasterData([]);
    setSelectedItems([]);
  }}
>
{popupType === "category" && (
    <input
        type="text"
        placeholder="Enter Category"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
    />
)}

{popupType === "brand" && (
    <input
        type="text"
        placeholder="Enter Brand"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
    />
)}
{popupType === "variant" && (
    <>
        <input
            type="text"
            placeholder="Enter RAM (e.g. 8GB)"
            value={ram}
            onChange={(e) => setRam(e.target.value)}
        />

        <input
            type="text"
            placeholder="Enter Storage (e.g. 128GB)"
            value={storage}
            onChange={(e) => setStorage(e.target.value)}
        />
    </>
)}

{popupType === "color" && (
    <>
        <input
            type="text"
            placeholder="Enter Color Name"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
        />

        <input
            type="text"
            placeholder="Enter Hex Code (e.g. #000000)"
            value={hexCode}
            onChange={(e) => setHexCode(e.target.value)}
        />
    </>
)}
  <button className="save-master-btn"
  onClick={editId ? handleUpdate : handleAdd}
  >
    Save
  </button>

  <hr />

  <h3>Existing {
  popupType === "category" 
  ? "Categories"
  : popupType === "brand"
  ? "Brands"
  : popupType === "variant"
  ? "Variants"
  : "Colors"
}
  </h3>
  <div className="category-row">

    <span className="count">
      Total: {masterData.length}
    </span>
    <span className="category-name">
        Select All
    </span>
     <input
        type="checkbox"
        className="category-checkbox"
        checked={
            masterData.length > 0 && 
            selectedItems.length === masterData.length
        }
        onChange={(e) => {
            if(e.target.checked){
                setSelectedItems(masterData.map(item=> item.id));
            }else{
                setSelectedItems([]);
            }
        }}
    />

</div>
<div className="master-list-container">
  {masterData.map(item => (

    <div
        key={item.id}
        className="category-row"
    >
        <span className="category-name">
            {item.name}
        </span>

        <div className="category-actions">

            <button className="edit-master-btn"
            onClick={() => handleEdit(item)}>
                ✏
            </button>

            <button className="delete-master-btn"
            onClick={() => handleDelete(item.id)}>
                🗑 
            </button>


        </div>
          {/* <input
         type="checkbox"
         checked={selectedItems.includes(item.id)}
         onChange={(e) => {
            if(e.target.checked){
                setSelectedItems(prev => [...prev, item.id]);
            }else{
                setSelectedItems(prev => 
                    prev.filter(id => id !== item.id)
                );
            }
         }}
        /> */}

    </div>

))}
</div>
  
  <div ref={deleteRef}>

<button className="delete-selected-btn"
onClick={handleDeleteSelected}>
    🗑 Delete Selected
</button>

</div>

</Popup>

    </div>
  );
}
export default AdminMasterData;