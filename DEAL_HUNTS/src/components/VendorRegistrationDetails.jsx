import React from "react";

function VendorRegistrationDetails({
  fullName, setFullName,
  state, setState,
  city, setCity,
  pincode, setPincode,
  shopName, setShopName,
  address, setAddress,
  location, setLocation,
  phone, setPhone,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  getVendorLocation,
  isLogin = false,
}) {
  return (
    <>
      {!isLogin && (
        <>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName || ""}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Shop Name"
            value={shopName || ""}
            onChange={(e) => setShopName(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Phone No (10 digits)"
            value={phone || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val) && val.length <= 10) setPhone(val);
            }}
          />

          <select
            value={state || ""}
            onChange={(e) => setState(e.target.value)}
          >
            <option value="">Select State</option>
            <option value="AP">Andhra Pradesh</option>
            <option value="TS">Telangana</option>
            <option value="KA">Karnataka</option>
          </select>

          <input
            type="text"
            placeholder="City"
            value={city || ""}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            type="text"
            placeholder="Pincode"
            value={pincode || ""}
            onChange={(e) => setPincode(e.target.value)}
          />

          <input
            type="text"
            placeholder="Address"
            value={address || ""}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div>
            <input
              type="text"
              placeholder="Google Maps link (optional)"
              value={location?.mapUrl || ""}
              onChange={(e) =>
                setLocation({ ...location, mapUrl: e.target.value })
              }
            />

            <button type="button" onClick={getVendorLocation}>
              Get Location
            </button>

            {location?.lat && (
              <p>
                Lat: {location.lat}, Lon: {location.lon}
              </p>
            )}
          </div>
        </>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email || ""}
        onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
      />

      <input
        type="password"
        placeholder="Password"
        value={password || ""}
        onChange={(e) => setPassword(e.target.value)}
      />

      {!isLogin && (
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword || ""}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      )}
    </>
  );
}

export default VendorRegistrationDetails;