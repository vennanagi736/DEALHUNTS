import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ADD useNavigate
import { loginUser } from "../../api/UserApi";
import "../../styles/Login.css";
import Layout from "../../components/UserLayout";
import Details from "../../components/UserDetails";
import { validateLogin } from "../../components/validation";

function Login() {

  const navigate = useNavigate(); // INITIALIZE useNavigate

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {

    // Frontend validation
    const errorMessage = validateLogin(email, password);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await loginUser(email, password);

      if (response.data.success) {

        // 🔐 STORE TOKEN
        localStorage.setItem("token",response.data.token);
        navigate("/Home");
        setMessage("Login Successful");

        console.log("TOKEN:", response.data.token);

        // 🚀 Redirect after login
        navigate("/Home");

      } else {
        setMessage("Login Unsuccessful");
      }

    } catch (err) {
      setMessage("Server Error");
      console.error(err);
    }
  };

  return (
    <Layout title="Login Form">

      <Details
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
      />

      {/* Validation error */}
      {error && <p className="error-message">{error}</p>}

      {/* Backend message */}
      {message && (
        <p
          className="response-message"
          style={{
            color: message.includes("Successful")
              ? "green"
              : "red"
          }}
        >
          {message}
        </p>
      )}

      <div className="login-actions">
        <button
          onClick={handleLogin}
          disabled={!email || !password}
        >
          Login
        </button>

        <p>
          <Link
            to="/forgot-password"
            className="register-Link"
          >
            Forgot Password?
          </Link>
        </p>
      </div>

      <div className="actions">
        <p>
          I don't have an account.?{" "}
          <Link
            to="/register"
            className="register-link"
          >
            Register
          </Link>
        </p>
      </div>

    </Layout>
  );
}

export default Login;
