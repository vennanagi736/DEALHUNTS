import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import Layout from "../../components/UserLayout";
import Details from "../../components/UserDetails";
import { validateRegister } from "../../components/validation";
import { registerUser } from "../../api/UserApi";
import "../../styles/Login.css";


function Register() {
  const navigate = useNavigate(); // INITIALIZE useNavigate
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // ✅ success msg

  const handleRegister = async (e) => {
    e.preventDefault();

    // Frontend validation
    const errorMessage = validateRegister(
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    );

    if (errorMessage) {
      setError(errorMessage);
      setMessage("");
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await registerUser(
        firstName,
        lastName,
        email,
        password
      );

      if (response.data.success) {
        setMessage("Registration Successful");
        navigate("/Home");
      } else {
        setMessage("Registration Unsuccessful");
      }

    } catch (err) {
      setMessage("Server Error");
      console.error(err);
    }
  };

  return (
    <Layout title="Register Form">

      <Details
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
      />

      {/* Validation error */}
      {error && <p className="error-message">{error}</p>}

      {/* Backend message */}
      {message && (
        <p
          className="response-message"
          style={{
            color: message.includes("Successful") ? "green" : "red"
          }}
        >
          {message}
        </p>
      )}

      <button type="button" onClick={handleRegister}>
        Register
      </button>

      <div className="AA">
        <p>
          Already have an account?.{" "}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </p>
      </div>

    </Layout>
  );
}

export default Register;
