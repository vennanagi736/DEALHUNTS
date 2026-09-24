import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import LoginDetails from "../../components/LoginDetails";
import { vendorLogin } from "../../api/VendorApi";
import { useRole } from "../../context/UseRole";

import "../../styles/VLogin.css";

function VendorLogin() {

  const navigate = useNavigate();
  const { updateRole } = useRole();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  const handleVendorLogin = async (e) => {

    e.preventDefault();

    console.log("Vendor login clicked");

    setError("");
    setMessage("");
    setLoading(true);

    try {

      const response = await vendorLogin(email, password);

      console.log(response.data);


      // ============================================================
      // VENDOR EXISTS BUT IS NOT APPROVED
      // ============================================================

      if (!response.data.success) {

        if (
          response.data.message === "PENDING" ||
          response.data.message === "Waiting for admin approval"
        ) {
          navigate(`/request-status/${email}`);
          return;
        }

        setError(response.data.message);
        setMessage("");

        return;
      }


      // ============================================================
      // APPROVED VENDOR LOGIN
      // ============================================================

      if (
        response.data.success &&
        response.data.token
      ) {

        localStorage.setItem(
          "vendorJwtToken",
          response.data.token
        );

        localStorage.setItem(
          "vendorEmail",
          response.data.email
        );

        localStorage.setItem(
          "vendorId",
          response.data.id
        );

        updateRole("ROLE_VENDOR");

        setError("");
        setMessage(response.data.message);

        console.log("Vendor Login");
        console.log(response.data);

        navigate("/vendorHome");
      }

    } catch (err) {

      console.error(err);

      setError("Invalid email or password");
      setMessage("");

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="dh-vendor-login-page">

      {/* ============================================================
          LOGIN FORM
      ============================================================ */}

      <div className="dh-vendor-login-form-wrapper">

        <form
          onSubmit={handleVendorLogin}
          className="dh-vendor-login-form"
        >

          <div className="dh-vendor-login-box">

            <h2 className="dh-vendor-login-title">
              Vendor Login
            </h2>


            {/* ======================================================
                LOGIN DETAILS
            ====================================================== */}

            <div className="dh-vendor-login-details">

              <LoginDetails
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                isLogin={true}
              />

            </div>


            {/* ======================================================
                ERROR
            ====================================================== */}

            {error && (
              <p className="dh-vendor-login-error">
                {error}
              </p>
            )}


            {/* ======================================================
                RESPONSE MESSAGE
            ====================================================== */}

            {message && (
              <p
                className="dh-vendor-login-response"
                style={{
                  color: message
                    .toLowerCase()
                    .includes("success")
                    ? "green"
                    : "red",
                }}
              >
                {message}
              </p>
            )}


            {/* ======================================================
                LOGIN BUTTON
            ====================================================== */}

            <div className="dh-vendor-login-actions">

              <button
                type="submit"
                disabled={
                  loading ||
                  !email.trim() ||
                  !password.trim()
                }
                className="dh-vendor-login-submit"
              >
                {loading
                  ? "Logging in..."
                  : "Vendor Login"}
              </button>

            </div>


            {/* ======================================================
                FORGOT PASSWORD
            ====================================================== */}

            <p className="dh-vendor-login-forgot">

              <Link
                to="/VendorForgotPassword"
                className="dh-vendor-login-link"
              >
                Forgot Password?
              </Link>

            </p>


            {/* ======================================================
                REGISTER
            ====================================================== */}

            <p className="dh-vendor-login-register">

              I don't have an account?{" "}

              <Link
                to="/VendorRegister"
                className="dh-vendor-login-link"
              >
                Register
              </Link>

            </p>

          </div>

        </form>

      </div>

    </div>
  );
}

export default VendorLogin;