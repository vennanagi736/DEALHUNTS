import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/Admin.css";
import SideWindow from "../../components/SideBar";
import { FaRegWindowClose } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
function AdminVendorRequest() {
  
  const token = localStorage.getItem("jwtToken");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const getLocation = (req) =>req.city && req.state ? `${req.city}, ${req.state}` : "N/A";
  const navigate = useNavigate();

  // ---------------- APPROVE ----------------
  const handleApprove = async (id) => {
  try {
    await axios.put(
      `http://localhost:8080/admin/vendor/${id}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setRequests((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "APPROVED" } : v
      )
    );

    if (selectedVendor?.id === id) {
      setSelectedVendor({
        ...selectedVendor,
        status: "APPROVED",
      });
    }
  } catch (err) {
    console.error("Approve failed", err);
  }
};  
// ---------------- REJECT ----------------
const handleReject = async (id) => {
  try {
    await axios.put(
      `http://localhost:8080/admin/vendor/${id}/reject`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setRequests((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "REJECTED" } : v
      )
    );

    if (selectedVendor?.id === id) {
      setSelectedVendor({
        ...selectedVendor,
        status: "REJECTED",
      });
    }
  } catch (err) {
    console.error("Reject failed", err);
  }
};  // ---------------- FETCH ----------------
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/admin/vendor-requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRequests(res.data);
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token]);

  return (
    <div className="adminhome-container">
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

      <main className="main">
        <div className="request-content">
          <h2 className="request-title">Vendor Requests</h2>

          {loading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <p>No requests found</p>
          ) : (
            <table className="request-table">
              <thead>
                <tr>
                  <th>Created At</th>
                  <th>Name</th>
                  <th>Shop</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>

             <tbody>
  {requests.map((req) => {
    console.log(req);

    return (
      <tr key={req.id}>
        <td>
            {req.createdAt
            ? new Date(req.createdAt).toLocaleDateString("en-IN",{
              day : "2-digit",
              month: "short",
              year: "numeric",
              hour:"2-digit",
              minute: "2-digit",
            })
            : "N/A"}
        </td>

        <td>{req.fullName}</td>
        <td>{req.shopName}</td>
        <td>{getLocation(req)}</td>

        <td>
          <span
            className={`status-badge ${(req.status || "").toLowerCase()}`}
          >
            {req.status}
          </span>
        </td>

        <td>
          <button
            className="view-btn"
            onClick={() => setSelectedVendor(req)}
          >
            View
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
</table>
          )}
        </div>
      </main>
            {/* popup model */}
{selectedVendor && (
  <>
    {/* overlay */}
    <div
      className="request-pop"
      onClick={() => setSelectedVendor(null)}
    />

    {/* drawer */}
    <div className="vendor-drawer">

      <button
        className="close-drawer"
        onClick={() => setSelectedVendor(null)}
      >
        ✖
      </button>

      <h3>Vendor Details</h3>

      <p><strong>Name:</strong> {selectedVendor.fullName}</p>
      <p><strong>Email:</strong> {selectedVendor.email}</p>
      <p><strong>Shop:</strong> {selectedVendor.shopName}</p>
      <p><strong>City:</strong> {selectedVendor.city}</p>
      <p><strong>State:</strong> {selectedVendor.state}</p>
      <p><strong>Address:</strong> {selectedVendor.address}</p>
      <p><strong>Status:</strong> {selectedVendor.status}</p>

      {selectedVendor.status === "PENDING" && (
        <div className="drawer-actions">

          <button
            className="approve-btn"
            onClick={() => handleApprove(selectedVendor.id)}
          >
            Approve
          </button>

          <button
            className="reject-btn"
            onClick={() => handleReject(selectedVendor.id)}
          >
            Reject
          </button>

        </div>
      )}
    </div>
  </>
)}

      <footer className="admin-footer">
        <p>© 2026 Website. All rights reserved.</p>
      </footer>
    </div>
    
  );
}

export default AdminVendorRequest;