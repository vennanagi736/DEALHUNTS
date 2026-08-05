import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {

  let token = null;
  let role = null;
  console.log("protected is running");


  if (allowedRoles.includes("ROLE_USER")) {

    token = localStorage.getItem("userJwtToken");

    if(token){
      role = "ROLE_USER";
    }

  }


  else if (allowedRoles.includes("ROLE_VENDOR")) {

    token = localStorage.getItem("vendorJwtToken");

    if(token){
      role = "ROLE_VENDOR";
    }

  }


  else if (allowedRoles.includes("ROLE_ADMIN")) {

    token = localStorage.getItem("adminJwtToken");

    if(token){
      role = "ROLE_ADMIN";
    }
  }

  console.log("Protected Route Check");
  console.log("Allowed roles:",allowedRoles);
  console.log("Token:", token);
  console.log("Role:", role);


  if(!token){
    return <Navigate to="/login" replace />;
  }

  if(!allowedRoles.includes(role)){
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;