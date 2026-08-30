import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import "../../styles/ShopDetails.css";

import ShopHeader from "../../components/shop/ShopHeader";
import ShopLocationCard from "../../components/shop/ShopLocationCard";
import ShopContactCard from "../../components/shop/ShopContactCard";
import ShopInfoCard from "../../components/shop/ShopInfoCard";
import ShopActionBar from "../../components/shop/ShopActionBar";

function ShopDetails() {

  const navigate = useNavigate();
  const { vendorId } = useParams();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchVendor = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://localhost:8080/vendor/${vendorId}`
        );

        console.log("Vendor Details:", response.data);

        setVendor(response.data);

      } catch (error) {

        console.error(
          "Failed to load vendor:",
          error
        );

        setError("Unable to load shop details.");

      } finally {

        setLoading(false);

      }

    };

    if (vendorId) {
      fetchVendor();
    }

  }, [vendorId]);


  const handleBack = () => {
    navigate(-1);
  };


  if (loading) {

    return (
      <div className="sd-shell">
        <main className="sd-main">
          <p>Loading shop details...</p>
        </main>
      </div>
    );

  }


  if (error || !vendor) {

    return (
      <div className="sd-shell">
        <main className="sd-main">

          <p>
            {error || "Vendor not found."}
          </p>

          <button onClick={handleBack}>
            Go Back
          </button>

        </main>
      </div>
    );

  }


  return (

    <div className="sd-shell">

      <main className="sd-main">

        <ShopHeader
          vendor={vendor}
          onBack={handleBack}
        />

        <div className="sd-grid">

          <ShopLocationCard
            vendor={vendor}
          />

          <ShopContactCard
            vendor={vendor}
          />

        </div>

        <ShopInfoCard
          vendor={vendor}
        />

      </main>

      <ShopActionBar
        vendor={vendor}
      />

    </div>

  );
}

export default ShopDetails;