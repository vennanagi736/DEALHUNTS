import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/UserApi";
import Layout from "../../components/Layout";
import "../../styles/Login.css";
import { useRole } from "../../context/UseRole";
import LoginDetails from "../../components/LoginDetails";
import { validateLogin } from "../../components/validation";

function Login() {
  const navigate = useNavigate();

  // Get both updateRole and logout
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
    console.log("user clicked login");

    e.preventDefault();

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

        setMessage(
          "Login Successful"
        );

        // Go to Home
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

      setMessage(
        "Server Error"
      );

    } finally {

      setLoading(false);

    }
  };

  // ============================================================
  // SKIP LOGIN
  // ============================================================

  const handleGuest = () => {

    console.log(
      "Continuing as guest"
    );

    /*
     * IMPORTANT:
     *
     * logout() clears:
     * 1. RoleContext state
     * 2. role from localStorage
     * 3. authentication tokens
     * 4. stored user information
     */

    logout();

    /*
     * Extra cleanup for any old user authentication keys.
     */

    localStorage.removeItem(
      "userToken"
    );

    localStorage.removeItem(
      "userJwtToken"
    );

    localStorage.removeItem(
      "jwtToken"
    );

    localStorage.removeItem(
      "userEmail"
    );

    localStorage.removeItem(
      "role"
    );

    /*
     * Go to Home as a guest.
     */

    navigate("/home");
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <Layout>

      <div className="login-page">

        <form onSubmit={handleLogin}>

          <div className="login-box">

            {/* ==================================================
                TITLE
            ================================================== */}

            <h2 className="login-title">
              Login-Form
            </h2>

            {/* ==================================================
                LOGIN DETAILS
            ================================================== */}

            <LoginDetails
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
            />

            {/* ==================================================
                VALIDATION ERROR
            ================================================== */}

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            {/* ==================================================
                RESPONSE MESSAGE
            ================================================== */}

            {message && (
              <p
                className="response-message"
                style={{
                  color: success
                    ? "green"
                    : "red"
                }}
              >
                {message}
              </p>
            )}

            {/* ==================================================
                LOGIN BUTTON
            ================================================== */}

            <div className="login-actions">

              <button
                type="submit"
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

            <p className="forgot-password">

              <Link
                to="/forgot-password"
                className="userregister-link"
              >
                Forgot Password?
              </Link>

            </p>

            {/* ==================================================
                REGISTER
            ================================================== */}

            <p className="register">

              I don't have an account?{" "}

              <Link
                to="/Register"
                className="userregister-link"
              >
                Register
              </Link>

            </p>

            {/* ==================================================
                SKIP LOGIN
            ================================================== */}

            <p className="register">

              Just browsing?{" "}

              <span
                className="userregister-link"
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

    </Layout>
  );
}

export default Login;
