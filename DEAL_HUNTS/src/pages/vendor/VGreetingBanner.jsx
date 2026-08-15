import React, { useState } from "react";

const STORAGE_KEY = "vendorGreetingDismissed";

function VendorGreetingBanner({ vendorName }) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );

  if (dismissed) return null;

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="vd-greeting">
      <span>
        Hello, <strong>{vendorName}</strong> 👋
      </span>
      <button
        className="vd-greeting-close"
        onClick={handleClose}
        aria-label="Dismiss greeting"
      >
        ×
      </button>
    </div>
  );
}

export default VendorGreetingBanner;
