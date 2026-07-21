import React, { useState } from "react";
import { Link} from "react-router-dom";
import Layout from "../../components/Layout";
import UserRegistrationDetails from "../../components/UserRegistrationDetails";
import { validateRegister } from "../../components/validation";
import { registerUser } from "../../api/UserApi";
import "../../styles/Register.css";

function Register() {
  // const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("FORM VALUES:", {
  firstName,
  lastName,
  email,
  password,
  confirmPassword
});

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
    password,
    confirmPassword
  );
   console.log("RESPONSE:", response.data);
  // Make sure message is a string
  setMessage(
  response.data?.message ||
  response.data ||
  "Register successful"
);
  if (response.data.success && response.data) {
    console.log("Successfully Registered");
  }
} catch (err) {
  setMessage("Server Error");
  console.error(err);
    }
  }

  return (
    <Layout>
      <form onSubmit={handleRegister}>
        <div className="register-box">
          <h2 className="register-title">Register</h2>

          <UserRegistrationDetails
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

          {error && <p className="error-message">{error}</p>}
          {message && (
            <p
              className="response-message"
              style={{ color: message.includes("Successful") ? "green" : "red" }}
            >
              {message}
            </p>
          )}

          <button type="submit" className="register-button">
            Register
          </button>

          <p className="login-link-container">
            Already have an account?{" "}
            <Link to="/Login" className="login-link">
              Login
            </Link>
          </p>
        </div>
      </form>
    </Layout>
  );
}

export default Register;