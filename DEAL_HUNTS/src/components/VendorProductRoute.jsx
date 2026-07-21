import { Navigate } from "react-router-dom";

const VendorProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("jwtToken");
  if (!isAuthenticated) {
    return <Navigate to="/VendorLogin" replace />;
  }
  return children;
};

export default VendorProtectedRoute;