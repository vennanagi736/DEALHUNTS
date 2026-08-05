import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginDetails from "../../components/LoginDetails";
import { vendorLogin } from "../../api/VendorApi";
import { useRole } from "../../context/UseRole";
import "../../styles/Login.css";

function VendorLogin() {

  console.log("vnenennenne");
  const navigate = useNavigate();   
  const {updateRole} = useRole();

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
    // Vendor exists but not approved
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

    // Approved vendor login
    if(response.data.success && response.data.token){

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

  } catch(err){
    console.error(err);
    setError("Invalid email or password");
    setMessage("");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <header className="header">
        <div className="logo">
          <span className="Gold">DEAL</span>
          <span className="Black">HUNTS</span>
          <span className="Vendor"> Vendor</span>
        </div>
      </header>

      <div className="form-wrapper">
        <form onSubmit={handleVendorLogin} className="login-box">
          <h2 className="login-title">Vendor Login</h2>

          <LoginDetails
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLogin={true} 
          />

          {error && <p className="error-message">{error}</p>}

          {message && (
            <p
              className="response-message"
              style={{
                color: message.toLowerCase().includes("success") ? "green" : "red",
              }}
            >
              {message}
            </p>
          )}

          <div className="login-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Vendor Login"}
            </button>
          </div>

          <p className="forgot-password">
            <Link to="/VendorForgotPassword" className="userregister-link">
              Forgot Password?
            </Link>
          </p>

          <p className="register">
            I don't have an account?{" "}
            <Link to="/VendorRegister" className="userregister-link">
              Register
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}

export default VendorLogin;