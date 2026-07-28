import { useState } from "react";
import axios from "axios";

function CsvUpload({
  endpoint,
  buttonText = "Upload CSV",
  onSuccess
}) {

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {

    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      setUploading(true);

      await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("File uploaded successfully.");

      setFile(null);

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {

      console.error(error);
      alert("Upload failed.");

    } finally {

      setUploading(false);

    }

  };

  return (
    <div className="csv-upload">

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />

      {file && (
        <p>
          Selected File: <b>{file.name}</b>
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : buttonText}
      </button>

    </div>
  );
}

export default CsvUpload;