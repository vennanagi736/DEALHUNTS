import React from "react";
import {
  PhoneIcon,
  DirectionsIcon,
} from "./ShopIcons";

/* =========================================================================
   ShopActionBar.jsx
   Contact Vendor + Get Directions using real backend vendor data.
   ========================================================================= */

function ShopActionBar({ vendor }) {

  const {
    phoneNo,
    locationLink,
  } = vendor;


  const handleContact = () => {

    if (phoneNo) {
      window.location.href = `tel:${phoneNo}`;
    }

  };


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

    <div className="sd-action-bar">

      <button
        className="sd-action-btn sd-action-secondary"
        onClick={handleContact}
        disabled={!phoneNo}
      >

        <PhoneIcon
          width={17}
          height={17}
        />

        Contact Vendor

      </button>


      <button
        className="sd-action-btn sd-action-primary"
        onClick={handleDirections}
        disabled={!locationLink}
      >
        <DirectionsIcon
          width={17}
          height={17}
        />
        Get Directions
      </button>
    </div>
  );
}

export default ShopActionBar;