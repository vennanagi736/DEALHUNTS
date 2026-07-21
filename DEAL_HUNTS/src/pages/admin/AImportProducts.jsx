import React ,{useState} from "react";
import axios from "axios";
import "../../styles/AProduct.css";
import SideWindow from "../../components/SideBar";
import { useNavigate } from "react-router-dom";

function AdminImportProducts() {

    const navigate = useNavigate();
    const [file, setFile] = useState(null);

    const handleUpload = async () => {

    if(!file){
        alert("Please select CSV file");
        return;
    }

    const formData = new FormData();
    formData.append("file",file);
    try{
        const response = await axios.post("http://localhost:8080/admin/import/products",
            formData,
            {
                headers:{
                    "Content-Type" :"multipart/form-data"
                }
            }
        );
        alert(response.data);
    }catch(error){
        console.error(error);
        alert("Upload failed");
    }

};

  return (
    <div className="adminhome-container">

      <header className="header">

        <div className="left-section">
          <SideWindow />
        </div>

        <div className="logo">
          <span className="Gold">DEAL</span>
          <span className="Black">HUNTS</span>
          <span className="Admin">Admin</span>
        </div>
        <div className="back-btn" onClick={() => navigate(-1)}>
            &#8592;
      </div>

      </header>


      <main>
        <h1 className="page-title">
          Import Products
        </h1>


        <div className="import-container">
            <h2>Upload Product CSV</h2>
            <input type="file"
            accept=".csv"
            onChange={(e) => {

                setFile(e.target.files[0]);
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