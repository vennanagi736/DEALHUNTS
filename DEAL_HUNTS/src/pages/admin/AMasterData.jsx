import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

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

    const navigate = useNavigate();

    const deleteRef = useRef(null);


    // =====================================================
    // STATES
    // =====================================================

    const [popupType, setPopupType] = useState("");

    const [masterData, setMasterData] = useState([]);

    const [newValue, setNewValue] = useState("");

    const [ram, setRam] = useState("");

    const [storage, setStorage] = useState("");

    const [colorName, setColorName] = useState("");

    const [hexCode, setHexCode] = useState("");

    const [selectedItems, setSelectedItems] = useState([]);

    const [editId, setEditId] = useState(null);

    // New category image
    const [categoryImage, setCategoryImage] = useState(null);

    // Existing category image while editing
    const [existingCategoryImage, setExistingCategoryImage] =
        useState("");


    // =====================================================
    // LOAD MASTER DATA
    // =====================================================

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

            console.error(
                "Failed to load master data:",
                error
            );

        }

    };


    // =====================================================
    // OPEN POPUP
    // =====================================================

    const openPopup = async (type) => {

        setPopupType(type);

        setNewValue("");

        setRam("");

        setStorage("");

        setColorName("");

        setHexCode("");

        setCategoryImage(null);

        setExistingCategoryImage("");

        setEditId(null);

        setSelectedItems([]);

        await loadMasterData(type);

    };


    // =====================================================
    // ADD
    // =====================================================

    const handleAdd = async () => {


        // -------------------------------------------------
        // CATEGORY VALIDATION
        // -------------------------------------------------

        if (popupType === "category") {

            if (!newValue.trim()) {

                alert("Enter Category");

                return;

            }

            if (!categoryImage) {

                alert("Select Category Image");

                return;

            }

        }


        // -------------------------------------------------
        // BRAND VALIDATION
        // -------------------------------------------------

        if (
            popupType === "brand" &&
            !newValue.trim()
        ) {

            alert("Enter Brand");

            return;

        }


        // -------------------------------------------------
        // VARIANT VALIDATION
        // -------------------------------------------------

        if (
            popupType === "variant" &&
            (!ram.trim() || !storage.trim())
        ) {

            alert("Enter RAM and Storage");

            return;

        }


        // -------------------------------------------------
        // COLOR VALIDATION
        // -------------------------------------------------

        if (
            popupType === "color" &&
            (!colorName.trim() || !hexCode.trim())
        ) {

            alert(
                "Enter Color Name and Hex Code"
            );

            return;

        }


        try {

            switch (popupType) {

                // =========================================
                // CATEGORY
                // =========================================

                case "category":

                    await addCategory(
                        newValue.trim(),
                        categoryImage
                    );

                    break;


                // =========================================
                // BRAND
                // =========================================

                case "brand":

                    await addBrand({
                        name: newValue.trim()
                    });

                    break;


                // =========================================
                // COLOR
                // =========================================

                case "color":

                    await addColor({
                        name: colorName.trim(),
                        hexCode: hexCode.trim()
                    });

                    break;


                // =========================================
                // VARIANT
                // =========================================

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


            // Reload data

            await loadMasterData(popupType);


            // Clear fields

            setNewValue("");

            setRam("");

            setStorage("");

            setColorName("");

            setHexCode("");

            setCategoryImage(null);

            setExistingCategoryImage("");


            alert("Added Successfully");


        } catch (error) {

            console.error(
                "Add failed:",
                error
            );

            alert("Failed to add");

        }

    };


    // =====================================================
    // DELETE SINGLE
    // =====================================================

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

                default:
                    return;
            }


            await loadMasterData(popupType);


        } catch (error) {

            console.error(
                "Delete failed:",
                error
            );

        }

    };


    // =====================================================
    // DELETE SELECTED
    // =====================================================

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

                    default:
                        break;
                }

            }


            await loadMasterData(popupType);

            setSelectedItems([]);


            alert("Deleted Successfully");


        } catch (error) {

            console.error(
                "Delete selected failed:",
                error
            );

            alert("Delete Failed");

        }

    };


    // =====================================================
    // EDIT
    // =====================================================

    const handleEdit = (item) => {

        setEditId(item.id);


        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------

        if (popupType === "category") {

            setNewValue(item.name);

            setExistingCategoryImage(
                item.imageUrl || ""
            );

            setCategoryImage(null);

        }


        // -------------------------------------------------
        // BRAND
        // -------------------------------------------------

        if (popupType === "brand") {

            setNewValue(item.name);

        }


        // -------------------------------------------------
        // VARIANT
        // -------------------------------------------------

        if (popupType === "variant") {

            setRam(item.ram);

            setStorage(item.storage);

        }


        // -------------------------------------------------
        // COLOR
        // -------------------------------------------------

        if (popupType === "color") {

            setColorName(item.name);

            setHexCode(item.hexCode);

        }

    };


    // =====================================================
    // UPDATE
    // =====================================================

    const handleUpdate = async () => {

        try {

            switch (popupType) {

                // =========================================
                // CATEGORY
                // =========================================

                case "category":

                    await updateCategory(
                        editId,
                        newValue.trim(),
                        categoryImage
                    );

                    break;


                // =========================================
                // BRAND
                // =========================================

                case "brand":

                    await updateBrand(
                        editId,
                        {
                            name: newValue.trim()
                        }
                    );

                    break;


                // =========================================
                // VARIANT
                // =========================================

                case "variant":

                    await updateVariant(
                        editId,
                        {
                            name: `${ram} + ${storage}`,
                            ram,
                            storage
                        }
                    );

                    break;


                // =========================================
                // COLOR
                // =========================================

                case "color":

                    await updateColor(
                        editId,
                        {
                            name: colorName.trim(),
                            hexCode: hexCode.trim()
                        }
                    );

                    break;


                default:
                    return;
            }


            await loadMasterData(popupType);


            // Clear edit state

            setEditId(null);

            setNewValue("");

            setRam("");

            setStorage("");

            setColorName("");

            setHexCode("");

            setCategoryImage(null);

            setExistingCategoryImage("");


            alert("Updated Successfully");


        } catch (error) {

            console.error(
                "Update failed:",
                error
            );

            alert("Update Failed");

        }

    };


    // =====================================================
    // CLOSE POPUP
    // =====================================================

    const closePopup = () => {

        setPopupType("");

        setNewValue("");

        setMasterData([]);

        setSelectedItems([]);

        setCategoryImage(null);

        setExistingCategoryImage("");

        setEditId(null);

        setRam("");

        setStorage("");

        setColorName("");

        setHexCode("");

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="adminhome-container">


            {/* =================================================
                HEADER
            ================================================= */}

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
                    onClick={() => navigate(-1)}
                >
                    &#8592;
                </div>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main>

                <h1 className="page-title">
                    Manage Product Options
                </h1>


                <div className="master-layout">

                    <div className="master-form-section">


                        {/* CATEGORY */}

                        <button
                            className="master-action-btn"
                            onClick={() =>
                                openPopup("category")
                            }
                        >
                            Manage Category
                        </button>


                        {/* BRAND */}

                        <button
                            className="master-action-btn"
                            onClick={() =>
                                openPopup("brand")
                            }
                        >
                            Manage Brand
                        </button>


                        {/* VARIANT */}

                        <button
                            className="master-action-btn"
                            onClick={() =>
                                openPopup("variant")
                            }
                        >
                            Manage Variant
                        </button>


                        {/* COLOR */}

                        <button
                            className="master-action-btn"
                            onClick={() =>
                                openPopup("color")
                            }
                        >
                            Manage Color
                        </button>

                    </div>

                </div>

            </main>


            {/* =================================================
                POPUP
            ================================================= */}

            <Popup

                open={popupType !== ""}

                title={

                    popupType === "category"
                        ? "Manage Categories"

                        : popupType === "brand"
                            ? "Manage Brands"

                            : popupType === "variant"
                                ? "Manage Variants"

                                : "Manage Colors"

                }

                onClose={closePopup}

            >


                {/* =================================================
                    CATEGORY FORM
                ================================================= */}

                {popupType === "category" && (

                    <>

                        <input
                            type="text"
                            placeholder="Enter Category"
                            value={newValue}
                            onChange={(e) =>
                                setNewValue(
                                    e.target.value
                                )
                            }
                        />


                        {/* EXISTING IMAGE */}

                        {editId &&
                            existingCategoryImage && (

                                <div>

                                    <p>
                                        Current Image
                                    </p>

                                    <img
                                        src={
                                            existingCategoryImage
                                        }
                                        alt="Current category"
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "contain"
                                        }}
                                    />

                                </div>

                            )}


                        {/* NEW IMAGE */}

                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) =>
                                setCategoryImage(
                                    e.target.files[0]
                                )
                            }
                        />


                        {categoryImage && (

                            <p>
                                Selected:{" "}
                                {categoryImage.name}
                            </p>

                        )}

                    </>

                )}


                {/* =================================================
                    BRAND FORM
                ================================================= */}

                {popupType === "brand" && (

                    <input
                        type="text"
                        placeholder="Enter Brand"
                        value={newValue}
                        onChange={(e) =>
                            setNewValue(
                                e.target.value
                            )
                        }
                    />

                )}


                {/* =================================================
                    VARIANT FORM
                ================================================= */}

                {popupType === "variant" && (

                    <>

                        <input
                            type="text"
                            placeholder="Enter RAM (e.g. 8GB)"
                            value={ram}
                            onChange={(e) =>
                                setRam(
                                    e.target.value
                                )
                            }
                        />


                        <input
                            type="text"
                            placeholder="Enter Storage (e.g. 128GB)"
                            value={storage}
                            onChange={(e) =>
                                setStorage(
                                    e.target.value
                                )
                            }
                        />

                    </>

                )}


                {/* =================================================
                    COLOR FORM
                ================================================= */}

                {popupType === "color" && (

                    <>

                        <input
                            type="text"
                            placeholder="Enter Color Name"
                            value={colorName}
                            onChange={(e) =>
                                setColorName(
                                    e.target.value
                                )
                            }
                        />


                        <input
                            type="text"
                            placeholder="Enter Hex Code (e.g. #000000)"
                            value={hexCode}
                            onChange={(e) =>
                                setHexCode(
                                    e.target.value
                                )
                            }
                        />

                    </>

                )}


                {/* =================================================
                    SAVE BUTTON
                ================================================= */}

                <button
                    className="save-master-btn"
                    onClick={
                        editId
                            ? handleUpdate
                            : handleAdd
                    }
                >
                    {editId
                        ? "Update"
                        : "Save"}
                </button>


                <hr />


                {/* =================================================
                    EXISTING DATA TITLE
                ================================================= */}

                <h3>

                    Existing{" "}

                    {popupType === "category"
                        ? "Categories"

                        : popupType === "brand"
                            ? "Brands"

                            : popupType === "variant"
                                ? "Variants"

                                : "Colors"}

                </h3>


                {/* =================================================
                    SELECT ALL
                ================================================= */}

                <div className="category-row">

                    <span className="count">
                        Total:{" "}
                        {masterData.length}
                    </span>


                    <span className="category-name">
                        Select All
                    </span>


                    <input
                        type="checkbox"
                        className="category-checkbox"
                        checked={
                            masterData.length > 0 &&
                            selectedItems.length ===
                            masterData.length
                        }
                        onChange={(e) => {

                            if (e.target.checked) {

                                setSelectedItems(
                                    masterData.map(
                                        item =>
                                            item.id
                                    )
                                );

                            } else {

                                setSelectedItems([]);

                            }

                        }}
                    />

                </div>


                {/* =================================================
                    MASTER DATA LIST
                ================================================= */}

                <div className="master-list-container">

                    {masterData.map(item => (

                        <div
                            key={item.id}
                            className="category-row"
                        >


                            {/* CATEGORY IMAGE */}

                            {popupType === "category" &&
                                item.imageUrl && (

                                    <img
                                        src={
                                            item.imageUrl
                                        }
                                        alt={
                                            item.name
                                        }
                                        style={{
                                            width: "45px",
                                            height: "45px",
                                            objectFit: "contain",
                                            marginRight: "10px"
                                        }}
                                    />

                                )}


                            <span className="category-name">

                                {item.name}

                            </span>


                            <div className="category-actions">


                                {/* EDIT */}

                                <button
                                    className="edit-master-btn"
                                    onClick={() =>
                                        handleEdit(item)
                                    }
                                >
                                    ✏
                                </button>


                                {/* DELETE */}

                                <button
                                    className="delete-master-btn"
                                    onClick={() =>
                                        handleDelete(
                                            item.id
                                        )
                                    }
                                >
                                    🗑
                                </button>


                            </div>

                        </div>

                    ))}

                </div>


                {/* =================================================
                    DELETE SELECTED
                ================================================= */}

                <div ref={deleteRef}>

                    <button
                        className="delete-selected-btn"
                        onClick={
                            handleDeleteSelected
                        }
                    >
                        🗑 Delete Selected
                    </button>

                </div>


            </Popup>

        </div>

    );

}


export default AdminMasterData;