import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { adminLogin } from "../../api/AdminApi";
import Details from "../../components/LoginDetails";
import { validateLogin } from "../../components/validation";
import { useRole } from "../../context/UseRole";

import "../../styles/ALogin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const { updateRole } = useRole();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // ============================================================
  // ADMIN LOGIN
  // ============================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    // ==========================================================
    // FRONTEND VALIDATION
    // ==========================================================

    const errorMessage = validateLogin(
      email,
      password
    );

    if (errorMessage) {
      setError(errorMessage);
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    // ==========================================================
    // ADMIN LOGIN API
    // ==========================================================

    try {
      const response = await adminLogin(
        email,
        password
      );

      // ========================================================
      // LOGIN SUCCESS
      // ========================================================

      if (response.data.success) {

        // ======================================================
        // STORE ADMIN JWT
        // ======================================================

        localStorage.setItem(
          "adminJwtToken",
          response.data.token
        );

        // ======================================================
        // STORE ADMIN EMAIL
        // ======================================================

        localStorage.setItem(
          "adminEmail",
          response.data.email
        );

        // ======================================================
        // STORE ADMIN ROLE
        // ======================================================

        localStorage.setItem(
          "adminRole",
          response.data.role
        );

        // ======================================================
        // SUCCESS MESSAGE
        // ======================================================

        setMessage("Login Successful");

        // ======================================================
        // UPDATE ROLE
        // ======================================================

        updateRole("ROLE_ADMIN");

        console.log("Going to admin");

        // ======================================================
        // NAVIGATE TO ADMIN DASHBOARD
        // ======================================================

        navigate("/adminDashboard");

      } else {

        // ======================================================
        // LOGIN FAILED
        // ======================================================

        setMessage(
          response.data.message ||
          "Login failed"
        );
      }

    } catch (err) {

      // ========================================================
      // SERVER ERROR
      // ========================================================

      console.error(
        "Admin login error:",
        err
      );

      setMessage("Server Error");

    } finally {

      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="al-admin-login-page">

      {/* ======================================================
          LOGIN FORM
      ====================================================== */}

      <form
        className="al-admin-login-form"
        onSubmit={handleLogin}
      >

        <div className="al-admin-login-box">

          {/* ==================================================
              TITLE
          ================================================== */}

          <h2 className="al-admin-login-title">
            Admin Login
          </h2>

          {/* ==================================================
              LOGIN DETAILS
          ================================================== */}

          <div className="al-admin-login-details">

            <Details
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
            />

          </div>

          {/* ==================================================
              VALIDATION ERROR
          ================================================== */}

          {error && (
            <p className="al-admin-login-error">
              {error}
            </p>
          )}

          {/* ==================================================
              RESPONSE MESSAGE
          ================================================== */}

          {message && (
            <p
              className={`al-admin-login-response ${
                message.includes("Successful")
                  ? "al-admin-login-success"
                  : "al-admin-login-failure"
              }`}
            >
              {message}
            </p>
          )}

          {/* ==================================================
              LOGIN BUTTON
          ================================================== */}

          <div className="al-admin-login-actions">

            <button
              type="submit"
              className="al-admin-login-submit"
              disabled={
                !email ||
                !password ||
                loading
              }
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </div>

          {/* ==================================================
              TAGLINE
          ================================================== */}

          <div className="al-admin-login-tagline">

            <p>
              Hunt Deals, Save Money
            </p>

          </div>

        </div>

      </form>

    </div>
  );
}

export default AdminLogin;