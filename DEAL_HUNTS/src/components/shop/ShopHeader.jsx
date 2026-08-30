import React from "react";
import {
  BackIcon,
  VerifiedIcon,
  ShopFallbackIcon,
} from "./ShopIcons";

/* =========================================================================
   ShopHeader.jsx
   Displays real vendor information from the backend.
   ========================================================================= */

function ShopHeader({ vendor, onBack }) {

  const {
    shopName,
    fullName,
    status,
  } = vendor;

  const isVerified =
    status?.toUpperCase() === "APPROVED";

  return (
    <section className="sd-header-card">

      {/* BACK */}
      <button
        className="sd-back-link"
        onClick={onBack}
      >
        <BackIcon />
        Back to comparison
      </button>


      {/* HEADER */}
      <div className="sd-header-row">

        {/* SHOP AVATAR */}
        <div className="sd-avatar-box">
          <ShopFallbackIcon />
        </div>


        {/* SHOP INFORMATION */}
        <div className="sd-header-info">

          <div className="sd-name-row">

            <h1 className="sd-shop-name">
              {shopName || "Shop"}
            </h1>

            {isVerified && (
              <span className="sd-verified-badge">
                <VerifiedIcon />
                Verified Vendor
              </span>
            )}

          </div>


          {/* OWNER */}
          {fullName && (
            <p className="sd-description">
              Owner: {fullName}
            </p>
          )}

        </div>

      </div>

    </section>
  );
}

export default ShopHeader;