import React from "react";

function VendorRegistrationDetails({
  fullName,
  setFullName,

  state,
  setState,

  city,
  setCity,

  pincode,
  setPincode,

  shopName,
  setShopName,

  address,
  setAddress,

  location,
  setLocation,

  phone,
  setPhone,

  email,
  setEmail,

  password,
  setPassword,

  confirmPassword,
  setConfirmPassword,

  getVendorLocation,

  isLogin = false,
}) {
  return (
    <>
      {!isLogin && (
        <>
          {/* ============================================================
              FULL NAME
          ============================================================ */}

          <input
            type="text"
            placeholder="Full Name"
            value={fullName || ""}
            onChange={(e) => setFullName(e.target.value)}
          />

          {/* ============================================================
              SHOP NAME
          ============================================================ */}

          <input
            type="text"
            placeholder="Shop Name"
            value={shopName || ""}
            onChange={(e) => setShopName(e.target.value)}
          />

          {/* ============================================================
              PHONE
          ============================================================ */}

          <input
            type="tel"
            placeholder="Phone No (10 digits)"
            value={phone || ""}
            onChange={(e) => {
              const value = e.target.value;

              if (/^\d*$/.test(value) && value.length <= 10) {
                setPhone(value);
              }
            }}
          />

          {/* ============================================================
              STATE
          ============================================================ */}

          <select
            value={state || ""}
            onChange={(e) => setState(e.target.value)}
          >
            <option value="">Select State</option>
            <option value="AP">Andhra Pradesh</option>
            <option value="TS">Telangana</option>
            <option value="KA">Karnataka</option>
          </select>

          {/* ============================================================
              CITY
          ============================================================ */}

          <input
            type="text"
            placeholder="City"
            value={city || ""}
            onChange={(e) => setCity(e.target.value)}
          />

          {/* ============================================================
              PINCODE
          ============================================================ */}

          <input
            type="text"
            placeholder="Pincode"
            value={pincode || ""}
            onChange={(e) => {
              const value = e.target.value;

              if (/^\d*$/.test(value) && value.length <= 6) {
                setPincode(value);
              }
            }}
          />

          {/* ============================================================
              ADDRESS
          ============================================================ */}

          <input
            type="text"
            placeholder="Address"
            value={address || ""}
            onChange={(e) => setAddress(e.target.value)}
          />

          {/* ============================================================
              VENDOR LOCATION
          ============================================================ */}

          <div className="vendor-location-box">

            {/* Google Maps Link */}

            <input
              type="text"
              placeholder="Google Maps link (optional)"
              value={location?.mapUrl || ""}
              onChange={(e) =>
                setLocation({
                  ...(location || {}),
                  mapUrl: e.target.value,
                })
              }
            />

            {/* Get Location Button */}

            <button
              type="button"
              className="get-location-button"
              onClick={getVendorLocation}
            >
              Get Location
            </button>

            {/* Coordinates */}

            {location?.lat !== undefined &&
              location?.lon !== undefined && (
                <div className="location-coordinates">

                  <span>
                    Latitude: {location.lat}
                  </span>

                  <span>
                    Longitude: {location.lon}
                  </span>

                </div>
              )}

          </div>
        </>
      )}

      {/* ================================================================
          EMAIL
      ================================================================ */}

      <input
        type="email"
        placeholder="Email"
        value={email || ""}
        onChange={(e) =>
          setEmail(e.target.value.trim().toLowerCase())
        }
      />

      {/* ================================================================
          PASSWORD
      ================================================================ */}

      <input
        type="password"
        placeholder="Password"
        value={password || ""}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* ================================================================
          CONFIRM PASSWORD
      ================================================================ */}

      {!isLogin && (
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword || ""}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
        />
      )}
    </>
  );
}

export default VendorRegistrationDetails;