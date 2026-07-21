import { useState, useEffect } from "react";
import { RoleContext } from "./RoleContext";

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  // load once on app start
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
    localStorage.removeItem("role");
    localStorage.removeItem("jwtToken");
    setRole(null);
  };

  return (
    <RoleContext.Provider value={{ role, updateRole, logout }}>
      {children}
    </RoleContext.Provider>
  );
};