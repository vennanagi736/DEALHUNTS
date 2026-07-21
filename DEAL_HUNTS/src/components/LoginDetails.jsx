import React from "react";

function LoginDetails({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isLogin = false
}) {
  return (
    <>
      {/* Email Field */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
        disabled={false} // always editable
      />

      {/* Password Field */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={!email} // disabled until email is entered
      />

      {/* Confirm Password (only for registration) */}
      {!isLogin && confirmPassword !== undefined && (
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={!password} // stepwise for registration
        />
      )}
    </>
  );
}

export default LoginDetails;