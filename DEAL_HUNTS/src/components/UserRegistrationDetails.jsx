import React from "react";

function UserRegistrationDetails({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isLogin = false,
}) {
  return (
    <>
      {!isLogin && (
        <>
          <input
            type="text"
            placeholder="First Name"
            value={firstName || ""}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Last Name"
            value={lastName || ""}
            onChange={(e) => setLastName(e.target.value)}
          />
        </>
      )}

      {/* ALWAYS ENABLE EMAIL */}
      <input
        type="email"
        placeholder="Email"
        value={email || ""}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* ALWAYS ENABLE PASSWORD */}
      <input
        type="password"
        placeholder="Password"
        value={password || ""}
        onChange={(e) => setPassword(e.target.value)}
      />

      {!isLogin && (
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword || ""}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      )}
    </>
  );
}

export default UserRegistrationDetails;