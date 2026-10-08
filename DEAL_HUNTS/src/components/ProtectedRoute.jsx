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

const getCurrentSession = (allowedRoles = []) => {

    /* --------------------------------------------------------
       ADMIN
       --------------------------------------------------------
       If this route requires ADMIN, check the admin session
       first even when a user session also exists.
    -------------------------------------------------------- */

    if (allowedRoles.includes("ROLE_ADMIN")) {

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
    }


    /* --------------------------------------------------------
       VENDOR
       -------------------------------------------------------- */

    if (allowedRoles.includes("ROLE_VENDOR")) {

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
    }


    /* --------------------------------------------------------
       USER
       -------------------------------------------------------- */

    if (allowedRoles.includes("ROLE_USER")) {

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


        /* ----------------------------------------------------
           OLD USER TOKEN
        ---------------------------------------------------- */

        const oldUserToken =
            localStorage.getItem("jwtToken");

        if (oldUserToken) {

            return {
                token: oldUserToken,
                role: "ROLE_USER",
            };
        }
    }


    /* --------------------------------------------------------
       COMMON FALLBACK
       --------------------------------------------------------
       Used for routes that allow multiple roles.
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


    const oldUserToken =
        localStorage.getItem("jwtToken");

    if (oldUserToken) {

        return {
            token: oldUserToken,
            role: "ROLE_USER",
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
    } = getCurrentSession(allowedRoles);


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