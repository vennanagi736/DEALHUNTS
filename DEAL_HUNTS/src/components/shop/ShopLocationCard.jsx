import React from "react";
import { PinIcon, DirectionsIcon } from "./ShopIcons";

/* =========================================================================
   ShopLocationCard.jsx
   Displays the vendor's real address and Google Maps location.
   ========================================================================= */

function ShopLocationCard({ vendor }) {

  const {
    address,
    city,
    state,
    pincode,
    locationLink,
  } = vendor;

  const handleDirections = () => {

    if (locationLink) {
      window.open(
        locationLink,
        "_blank",
        "noopener,noreferrer"
      );
    }

  };

  return (

    <section className="sd-card">

      <h2 className="sd-card-title">
        Location
      </h2>

      <div className="sd-location-row">

        <div className="sd-address-block">

          <p className="sd-address-line">
            {address || "Address not available"}
          </p>

          <p className="sd-address-sub">

            {city || ""}

            {state
              ? `, ${state}`
              : ""
            }

            {pincode
              ? ` – ${pincode}`
              : ""
            }

          </p>

        </div>


        <div
          className="sd-map-preview"
          onClick={handleDirections}
          role="button"
          tabIndex={0}
        >

          <div className="sd-map-pattern" />

          <div className="sd-map-pin">
            <PinIcon
              width={22}
              height={22}
            />
          </div>

          <span className="sd-map-preview-label">

            <DirectionsIcon
              width={14}
              height={14}
            />

            View on Google Maps

          </span>

        </div>

      </div>

    </section>

  );
}

export default ShopLocationCard;