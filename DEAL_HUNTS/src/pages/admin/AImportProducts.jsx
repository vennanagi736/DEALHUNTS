import React, { useState, useRef } from "react";
import axios from "axios";
import "../../styles/AImportProducts.css";

function AdminImportProducts() {

  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);


  const handleUpload = async () => {

    if (!file) {
      alert("Please select CSV file");
      return;
    }


    const formData = new FormData();

    formData.append("file", file);


    try {

      const response = await axios.post(
        "http://localhost:8080/admin/import/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );


      alert(response.data);

      setFile(null);


      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {

      console.error(error);

      alert("Upload failed");

    }

  };


  return (

    <div className="adminhome-container">

      <main>

        <h1 className="page-title">
          Import Products
        </h1>


        <div className="import-container">

          <h2>
            Upload Product CSV
          </h2>


          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              setFile(e.target.files[0] || null);
            }}
          />


          {file && (
            <p>
              Selected file : {file.name}
            </p>
          )}


          <button
            className="import-upload"
            disabled={!file}
            onClick={handleUpload}
          >
            Upload Products
          </button>

        </div>

      </main>

    </div>

  );

}


export default AdminImportProducts;