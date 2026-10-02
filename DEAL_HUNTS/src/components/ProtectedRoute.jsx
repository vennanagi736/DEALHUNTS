import { Navigate, useLocation } from "react-router-dom";


/* ============================================================
   NORMALIZE ROLE
============================================================ */

const normalizeRole = (role) => {

    if (!role) {
        return null;
    }

    const normalized = String(role)
        .replace(/^ROLE_/i, "")
        .trim()
        .toUpperCase();

    if (
        normalized === "USER" ||
        normalized === "VENDOR" ||
        normalized === "ADMIN"
    ) {
        return `ROLE_${normalized}`;
    }

    return null;
};


/* ============================================================
   GET CURRENT SESSION
============================================================ */

const getCurrentSession = () => {

    /* --------------------------------------------------------
       USER
       --------------------------------------------------------
       User token is checked first because user-only pages such
       as Cart, Wishlist and Orders must use the user session.
    -------------------------------------------------------- */

    const userToken =
        localStorage.getItem("userJwtToken");

    if (userToken) {

        return {
            token: userToken,
            role:
                normalizeRole(
                    localStorage.getItem("userRole")
                ) || "ROLE_USER",
        };
    }


    /* --------------------------------------------------------
       OLD USER TOKEN
    -------------------------------------------------------- */

    const oldUserToken =
        localStorage.getItem("jwtToken");

    if (oldUserToken) {

        return {
            token: oldUserToken,
            role: "ROLE_USER",
        };
    }


    /* --------------------------------------------------------
       VENDOR
    -------------------------------------------------------- */

    const vendorToken =
        localStorage.getItem("vendorJwtToken");

    if (vendorToken) {

        return {
            token: vendorToken,
            role:
                normalizeRole(
                    localStorage.getItem("vendorRole")
                ) || "ROLE_VENDOR",
        };
    }


    /* --------------------------------------------------------
       ADMIN
    -------------------------------------------------------- */

    const adminToken =
        localStorage.getItem("adminJwtToken");

    if (adminToken) {

        return {
            token: adminToken,
            role:
                normalizeRole(
                    localStorage.getItem("adminRole")
                ) || "ROLE_ADMIN",
        };
    }


    /* --------------------------------------------------------
       NO SESSION
    -------------------------------------------------------- */

    return {
        token: null,
        role: null,
    };
};


/* ============================================================
   PROTECTED ROUTE
============================================================ */

const ProtectedRoute = ({
    children,
    allowedRoles = [],
}) => {

    const location = useLocation();

    const {
        token,
        role,
    } = getCurrentSession();


    /* ========================================================
       DEBUG
    ======================================================== */

    console.log(
        "========================================"
    );

    console.log(
        "ProtectedRoute"
    );

    console.log(
        "Path:",
        location.pathname
    );

    console.log(
        "Allowed roles:",
        allowedRoles
    );

    console.log(
        "Token:",
        token ? "EXISTS" : "NOT FOUND"
    );

    console.log(
        "Detected role:",
        role
    );

    console.log(
        "========================================"
    );


    /* ========================================================
       NO LOGIN
    ======================================================== */

    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }


    /* ========================================================
       ROLE NOT ALLOWED
    ======================================================== */

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(role)
    ) {

        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        );
    }


    /* ========================================================
       ACCESS GRANTED
    ======================================================== */

    return children;
};


export default ProtectedRoute;