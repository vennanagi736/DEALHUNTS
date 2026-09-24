import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../../api/UserApi";
import "../../styles/Login.css";

import { useRole } from "../../context/UseRole";
import LoginDetails from "../../components/LoginDetails";
import { validateLogin } from "../../components/validation";

function Login() {
  const navigate = useNavigate();

  const { updateRole, logout } = useRole();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("user clicked login");

    const errorMessage = validateLogin(
      email,
      password
    );

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await loginUser(
        email,
        password
      );

      if (response.data.success) {
        setError("");

        // ======================================================
        // STORE USER JWT
        // ======================================================

        localStorage.setItem(
          "userJwtToken",
          response.data.token
        );

        // ======================================================
        // STORE USER EMAIL
        // ======================================================

        localStorage.setItem(
          "userEmail",
          response.data.email
        );

        // ======================================================
        // STORE USER ROLE
        // ======================================================

        updateRole("ROLE_USER");

        setSuccess(true);
        setMessage("Login Successful");

        // ======================================================
        // NAVIGATE TO HOME
        // ======================================================

        navigate("/home");

      } else {

        setSuccess(false);

        setMessage(
          response.data.message ||
          "Login failed"
        );
      }

    } catch (error) {

      console.error(error);

      setSuccess(false);
      setMessage("Server Error");

    } finally {

      setLoading(false);
    }
  };

  // ============================================================
  // SKIP LOGIN
  // ============================================================

  const handleGuest = () => {

    console.log("Continuing as guest");

    /*
     * logout() clears:
     * 1. RoleContext state
     * 2. role from localStorage
     * 3. authentication tokens
     * 4. stored user information
     */

    logout();

    // ==========================================================
    // EXTRA CLEANUP
    // ==========================================================

    localStorage.removeItem("userToken");
    localStorage.removeItem("userJwtToken");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");

    // ==========================================================
    // GO TO HOME AS GUEST
    // ==========================================================

    navigate("/home");
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="dh-user-login-page">

      {/* ======================================================
          LOGIN FORM
      ====================================================== */}

      <form
        className="dh-user-login-form"
        onSubmit={handleLogin}
      >

        <div className="dh-user-login-box">

          {/* ==================================================
              TITLE
          ================================================== */}

          <h2 className="dh-user-login-title">
            Login-Form
          </h2>

          {/* ==================================================
              LOGIN DETAILS
          ================================================== */}

          <div className="dh-user-login-details">

            <LoginDetails
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
            <p className="dh-user-login-error">
              {error}
            </p>
          )}

          {/* ==================================================
              RESPONSE MESSAGE
          ================================================== */}

          {message && (
            <p
              className={`dh-user-login-response ${
                success
                  ? "dh-user-login-success"
                  : "dh-user-login-failure"
              }`}
            >
              {message}
            </p>
          )}

          {/* ==================================================
              LOGIN BUTTON
          ================================================== */}

          <div className="dh-user-login-actions">

            <button
              type="submit"
              className="dh-user-login-submit"
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
              FORGOT PASSWORD
          ================================================== */}

          <p className="dh-user-login-forgot">

            <Link
              to="/forgot-password"
              className="dh-user-login-link"
            >
              Forgot Password?
            </Link>

          </p>

          {/* ==================================================
              REGISTER
          ================================================== */}

          <p className="dh-user-login-register">

            I don't have an account?{" "}

            <Link
              to="/register"
              className="dh-user-login-link"
            >
              Register
            </Link>

          </p>

          {/* ==================================================
              SKIP LOGIN
          ================================================== */}

          <p className="dh-user-login-guest">

            Just browsing?{" "}

            <span
              className="dh-user-login-guest-link"
              onClick={handleGuest}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {

                if (
                  e.key === "Enter" ||
                  e.key === " "
                ) {
                  handleGuest();
                }

              }}
            >
              Skip login
            </span>

          </p>

        </div>

      </form>

    </div>
  );
}

export default Login;
