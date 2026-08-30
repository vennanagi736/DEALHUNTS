import React from "react";
import {
  StoreIcon,
  PinIcon,
  RefreshIcon,
} from "./ShopIcons";

/* =========================================================================
   ShopInfoCard.jsx
   Displays additional vendor information available from the backend.
   ========================================================================= */

function ShopInfoCard({ vendor }) {

  const {
    fullName,
    shopName,
    status,
    city,
    state,
    pincode,
    latitude,
    longitude,
  } = vendor;


  const isApproved =
    status?.toUpperCase() === "APPROVED";


  return (

    <section className="sd-card">

      <h2 className="sd-card-title">
        Shop Information
      </h2>


      {/* BASIC INFORMATION */}

      <div className="sd-info-grid">

        <div className="sd-info-tile">

          <StoreIcon
            width={16}
            height={16}
          />

          <span>
            Shop Status
          </span>

          <span
            className={`sd-tile-tag ${
              isApproved
                ? "sd-tag-yes"
                : "sd-tag-no"
            }`}
          >
            {status || "Unknown"}
          </span>

        </div>


        <div className="sd-info-tile">

          <PinIcon
            width={16}
            height={16}
          />

          <span>
            Location
          </span>

          <span className="sd-tile-tag sd-tag-yes">
            {city || "N/A"}
          </span>

        </div>

      </div>


      {/* OWNER */}

      {fullName && (

        <div className="sd-subsection">

          <h3 className="sd-subheading">
            Shop Owner
          </h3>

          <p className="sd-return-text">
            {fullName}
          </p>

        </div>

      )}


      {/* SHOP NAME */}

      {shopName && (

        <div className="sd-subsection">

          <h3 className="sd-subheading">
            Registered Shop
          </h3>

          <p className="sd-return-text">
            {shopName}
          </p>

        </div>

      )}


      {/* ADDRESS */}

      <div className="sd-subsection">

        <h3 className="sd-subheading">
          Registered Location
        </h3>

        <p className="sd-return-text">

          {city || ""}

          {state
            ? `, ${state}`
            : ""
          }

          {pincode
            ? ` - ${pincode}`
            : ""
          }

        </p>

      </div>


      {/* COORDINATES */}

      {latitude != null &&
        longitude != null && (

        <div className="sd-subsection">

          <h3 className="sd-subheading">
            Shop Coordinates
          </h3>

          <p className="sd-return-text">

            {latitude}, {longitude}

          </p>

        </div>

      )}


      {/* FUTURE INFORMATION */}

      <div className="sd-subsection">

        <h3 className="sd-subheading">

          <RefreshIcon
            width={15}
            height={15}
          />

          More Information

        </h3>

        <p className="sd-return-text">

          Additional services, opening hours,
          payment methods and return policies
          will appear here once they are added
          to the vendor profile.

        </p>

      </div>

    </section>

  );
}

export default ShopInfoCard;