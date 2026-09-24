import React, { useState } from "react";
import { Link } from "react-router-dom";

import UserRegistrationDetails from "../../components/UserRegistrationDetails";
import { validateRegister } from "../../components/validation";
import { registerUser } from "../../api/UserApi";

import "../../styles/Register.css";

function Register() {
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
      confirmPassword,
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

      if (response.data?.success) {
        console.log("Successfully Registered");

        setMessage(
          response.data?.message || "Register Successful"
        );
      } else {
        setMessage(
          response.data?.message || "Registration failed"
        );
      }
    } catch (err) {
      console.error(err);
      setMessage("Server Error");
    }
  };

  return (
    <div className="dh-user-register-page">
      <form
        className="dh-user-register-form"
        onSubmit={handleRegister}
      >
        <div className="dh-user-register-box">

          <h2 className="dh-user-register-title">
            Register-Form
          </h2>

          <div className="dh-user-register-details">
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
          </div>

          {error && (
            <p className="dh-user-register-error">
              {error}
            </p>
          )}

          {message && (
            <p
              className={`dh-user-register-response ${
                message.includes("Successful")
                  ? "dh-user-register-success"
                  : "dh-user-register-failure"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="dh-user-register-submit"
            disabled = {
              !firstName.trim() ||
              !lastName.trim() ||
              !email.trim() ||
              !password.trim() ||
              !confirmPassword
            }
          >
            Register
          </button>

          <p className="dh-user-register-login">
            Already have an account?{" "}

            <Link
              to="/login"
              className="dh-user-register-link"
            >
              Login
            </Link>
          </p>

        </div>
      </form>
    </div>
  );
}

export default Register;