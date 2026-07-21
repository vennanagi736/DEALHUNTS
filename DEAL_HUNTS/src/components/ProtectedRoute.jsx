// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const token = localStorage.getItem("jwtToken");
//   const role = localStorage.getItem("role");

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   if (!allowedRoles.includes(role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("jwtToken");
  const role = localStorage.getItem("role");

  console.log("Token:", token);
  console.log("Role:", role);
  console.log("Allowed Roles:", allowedRoles);
  console.log("Includes?", allowedRoles.includes(role));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;