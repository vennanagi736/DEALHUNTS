import { useState, useEffect } from "react";
import { RoleContext } from "./RoleContext";

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");

    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const updateRole = (newRole) => {
    console.log("Setting role:", newRole);

    setRole(newRole);
    localStorage.setItem("role", newRole);
  };

  const logout = () => {
    // Remove role
    localStorage.removeItem("role");

    // Remove ALL authentication tokens
    localStorage.removeItem("userToken");
    localStorage.removeItem("userJwtToken");

    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorJwtToken");

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminJwtToken");

    // Remove stored user information
    localStorage.removeItem("userEmail");
    localStorage.removeItem("vendorEmail");
    localStorage.removeItem("adminEmail");

    // Remove old token if it exists
    localStorage.removeItem("jwtToken");

    // Reset React state
    setRole(null);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        updateRole,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};