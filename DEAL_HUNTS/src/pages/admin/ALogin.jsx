import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../api/AdminApi";
import Layout from "../../components/Layout";
import Details from "../../components/LoginDetails";
import { validateLogin } from "../../components/validation";
import {useRole} from "../../context/UseRole";
import "../../styles/Admin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const {updateRole} = useRole();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // To disable button while submitting

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Frontend validation
    const errorMessage = validateLogin(email, password);

if (errorMessage) {
  setError(errorMessage);
  setMessage("");
  return;
}


setError("");
setMessage("");
setLoading(true);


try {

  const response = await adminLogin(email, password);


  if (response.data.success) {


    localStorage.setItem(
      "adminJwtToken",
      response.data.token
    );


    localStorage.setItem(
      "adminEmail",
      response.data.email
    );


    localStorage.setItem(
      "adminRole",
      response.data.role
    );

    setMessage("Login Successful");
    updateRole("ROLE_ADMIN");
    console.log("Going to admin");
    navigate("/adminDashboard");

  } else {
    alert(response.data.message);
  }

} catch(err) {
  alert("Server Error");
  console.error(err);
} finally {
  setLoading(false);
}
  }

  return (
    <Layout title="Admin Login">
      <div className="admin-handler">
      <form className="handlingform" onSubmit={handleLogin}>
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
            style={{
              color: message.includes("Successful") ? "green" : "red",
            }}
          >
            {message}
          </p>
        )}

        <div className="login-actions">
          <button type="submit" disabled={!email || !password || loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="tagline">
            <p>Hunt Deals, Save Money</p>
          </div>
        </div>
      </form>
      </div>
    </Layout>
  );
}

export default AdminLogin;