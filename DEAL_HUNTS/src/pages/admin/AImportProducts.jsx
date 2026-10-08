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

      if (error.response?.data) {
        alert(error.response.data);
      } else {
        alert("Upload failed");
      }

    }

  };

  return (

    <div className="adminhome-container">

      <main className="import-products-page">

        <h1 className="page-title">
          Import Products
        </h1>


        <div className="import-container">

          {/* =====================================================
              UPLOAD SECTION
          ====================================================== */}

          <div className="import-header">

            <div>

              <h2>
                Upload Product CSV
              </h2>

            </div>

          </div>


          <div className="upload-section">

            <label className="file-label">
              Select CSV File
            </label>


            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                setFile(e.target.files[0] || null);
              }}
            />


            {file && (

              <div className="selected-file">

                <span className="file-icon">
                  CSV
                </span>


                <div className="file-details">

                  <strong>
                    {file.name}
                  </strong>

                  <span>
                    CSV file selected successfully
                  </span>

                </div>

              </div>

            )}


            <button
              className="import-upload"
              disabled={!file}
              onClick={handleUpload}
            >
              Upload Products
            </button>

          </div>


          {/* =====================================================
              CSV HEADER
          ====================================================== */}

          <div className="csv-format-section">

            <div className="csv-header-preview">

              <div className="preview-title">
                CSV Header
              </div>


              <div className="csv-header-code">
                category,brand,name,description,basePrice,ram,storage,processor,displaySize,battery,color,hexCode
              </div>

            </div>


            <div className="csv-note">

              <strong>
                Important:
              </strong>

              <span>
                &nbsp; Make sure the column names match exactly, especially basePrice.
              </span>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

}

export default AdminImportProducts;