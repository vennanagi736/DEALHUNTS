import React, { useEffect, useState } from "react";
import "../../styles/Admin.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function RequestStatus() {
  const { email } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    if (!email) return;

    axios
      .get(`http://localhost:8080/vendor/status?email=${email}`)
      .then((res) => setStatus(res.data))
      .catch(() => setStatus("ERROR"));
  }, [email]);

  return (
    <div className="adminhome-container">

      <header className="admin-header">
        <div className="logo">
          <span className="Gold">DEAL</span>
          <span className="Black">HUNTS</span>
          <span className="Vendor">Vendor</span>
        </div>
      </header>

      <main className="main">
        <div>
          <h1>Nice to have you Mr/Mrs: {email}</h1>

          <h1>Vendor Registration Status</h1>

          <p>Status: {status}</p>
          <p>Once the Admin processes the request, you will be redirected.</p>

          {status === "PENDING" && (
            <p>Please wait for admin approval.</p>
          )}

          {status === "APPROVED" && (
            <>
              <p>Your vendor account has been approved.</p>

              <button  className = "login-btn" onClick={() => navigate("/vendorLogin")}>
                Go to Login
              </button>
            </>
          )}

          {status === "REJECTED" && (
            <p>Your request was rejected.</p>
          )}
        </div>
      </main>

      <footer className="admin-footer">
        <p>© 2026 Website. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default RequestStatus;