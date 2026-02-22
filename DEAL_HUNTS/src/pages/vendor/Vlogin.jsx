import React, { useState } from "react";
import Layout from "../../components/UserLayout"; // can keep generic layout
import Details from "../../components/UserDetails"; // form inputs
import { Link, useNavigate } from "react-router-dom";
import { vendorUser } from "../../api/UserApi.jsx";
import "../../styles/Login.css";
import { validateLogin } from "../../components/Validation.jsx";

function VendorForm() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleVendorLogin = async () => {

    // Frontend validation
    const errorMessage = validateLogin(email, password);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await vendorUser(email, password);

      if (response.data.success && response.data.role === "vendor") {

        // Store token
        localStorage.setItem("token", response.data.token);
        setMessage("✅ Login Successful");

        console.log("TOKEN:", response.data.token);

        // Redirect to Vendor Dashboard
        setTimeout(() => {
          navigate("/vendor-dashboard");
        }, 100);

      } else if (response.data.success && response.data.role !== "vendor") {
        setMessage("❌ You are not a vendor!");
      } else {
        setMessage("❌ Login Unsuccessful");
      }

    } catch (err) {
      setMessage("❌ Server Error / Invalid Credentials");
      console.error(err);
    }
  };

  return (
    <Layout title="Vendor Login">

      <Details
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
      />

      {error && <p className="error-message">{error}</p>}

      {message && (
        <p
          className="response-message"
          style={{ color: message.includes("Successful") ? "green" : "red" }}
        >
          {message}
        </p>
      )}

      <div className="login-actions">
        <button
          onClick={handleVendorLogin}
          disabled={!email || !password}
        >
          Vendor Login
        </button>

        <p>
          <Link to="/forgot-password" className="register-link">
            Forgot Password?
          </Link>
        </p>
      </div>

      <div className="actions">
        <p>
          I don't have a vendor account?{" "}
          <Link to="/vendor-register" className="register-link">
            Register
          </Link>
        </p>
      </div>

    </Layout>
  );
}

export default VendorForm;
