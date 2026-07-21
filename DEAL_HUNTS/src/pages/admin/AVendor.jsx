import React, { useEffect, useState } from "react";
import "../../styles/Admin.css";
import { useNavigate } from "react-router-dom";
import SideWindow from "../../components/SideBar";
import { getAllVendors } from "../../api/AdminApi";
import axios from "axios";

function VendorsDetails() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ---------------- FETCH VENDORS ----------------
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await getAllVendors();
        setVendors(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVendors();
  }, []);

  // ---------------- DELETE VENDOR ----------------
  const handleDelete = async () => {
    if (!selectedVendor || deleting) return;

    setDeleting(true);

    try {
      await axios.delete(
        `http://localhost:8080/admin/vendor/${selectedVendor.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      setVendors((prev) =>
        prev.filter((v) => v.id !== selectedVendor.id)
      );

      setShowConfirm(false);
      setSelectedVendor(null);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="adminhome-container">

      {/* ---------------- HEADER ---------------- */}
      <header className="admin-header">
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

      {/* ---------------- TABLE ---------------- */}
      <main className="main">
        <h2>Manage Vendors</h2>

        <table className="request-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Shop</th>
              <th>City</th>
              <th>State</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>{vendor.id}</td>
                <td>{vendor.fullName}</td>
                <td>{vendor.email}</td>
                <td>{vendor.shopName}</td>
                <td>{vendor.city}</td>
                <td>{vendor.state}</td>

                <td>
                  <button
                    className="view-btn"
                    onClick={() => setSelectedVendor(vendor)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* ---------------- DRAWER ---------------- */}
      {selectedVendor && (
        <>
          <div
            className="request-pop"
            onClick={() => setSelectedVendor(null)}
          />

          <div className="vendor-drawer">
            <h3>Vendor Details</h3>

            <p><b>Name:</b> {selectedVendor.fullName}</p>
            <p><b>Email:</b> {selectedVendor.email}</p>
            <p><b>Shop:</b> {selectedVendor.shopName}</p>
            <p><b>City:</b> {selectedVendor.city}</p>
            <p><b>State:</b> {selectedVendor.state}</p>
            
            <div
              className="wrong-btn"
              onClick={() => setSelectedVendor(null)}
              >
              X
            </div>
            <button
              className="remove-btn"
              onClick={() => setShowConfirm(true)}
            >
              Remove Vendor
            </button>
            </div>
        </>
      )}

      {/* ---------------- CONFIRM POPUP ---------------- */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">

            <p>
              Do you want to remove{" "}
              <b>{selectedVendor?.fullName}</b>?
            </p>

            <div className="confirm-actions">

              <button
                className="delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Removing..." : "Yes, Remove"}
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ---------------- FOOTER ---------------- */}
      <footer className="admin-footer">
        <p>© 2026 Website. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default VendorsDetails;