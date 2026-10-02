import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/Profile.css";

const API_BASE_URL = "http://localhost:8080";

const ROLE_CONFIG = {
    USER: {
        tokenKey: "userJwtToken",
        roleKeys: ["userRole", "user_role", "role"],
        endpoint: "/user/me",
        title: "User Profile",
        badge: "USER"
    },

    VENDOR: {
        tokenKey: "vendorJwtToken",
        roleKeys: ["vendorRole", "vendor_role", "role"],
        endpoint: "/vendor/me",
        title: "Vendor Profile",
        badge: "VENDOR"
    },

    ADMIN: {
        tokenKey: "adminJwtToken",
        roleKeys: ["adminRole", "admin_role", "role"],
        endpoint: "/admin/me",
        title: "Admin Profile",
        badge: "ADMIN"
    }
};


/* ============================================================
   ROLE
============================================================ */

function normalizeRole(role) {
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
        return normalized;
    }

    return null;
}


/* ============================================================
   JWT
============================================================ */

function decodeJwt(token) {
    try {
        if (!token) {
            return null;
        }

        const parts = token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        let payload = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        while (payload.length % 4 !== 0) {
            payload += "=";
        }

        const decoded = decodeURIComponent(
            atob(payload)
                .split("")
                .map(
                    (char) =>
                        "%" +
                        ("00" + char.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("")
        );

        return JSON.parse(decoded);
    } catch (error) {
        console.error("JWT decode failed:", error);
        return null;
    }
}


/* ============================================================
   GET STORED ROLE
============================================================ */

function getStoredRole() {
    const possibleKeys = [
        "adminRole",
        "vendorRole",
        "userRole",
        "role",
        "admin_role",
        "vendor_role",
        "user_role"
    ];

    for (const key of possibleKeys) {
        const value = localStorage.getItem(key);
        const role = normalizeRole(value);

        if (role) {
            return role;
        }
    }

    return null;
}


/* ============================================================
   GET TOKEN FOR ROLE
============================================================ */

function getTokenForRole(role) {
    if (role === "ADMIN") {
        return (
            localStorage.getItem("adminJwtToken") ||
            localStorage.getItem("adminToken")
        );
    }

    if (role === "VENDOR") {
        return (
            localStorage.getItem("vendorJwtToken") ||
            localStorage.getItem("vendorToken")
        );
    }

    if (role === "USER") {
        return (
            localStorage.getItem("userJwtToken") ||
            localStorage.getItem("jwtToken")
        );
    }

    return null;
}


/* ============================================================
   GET ACTIVE SESSION
============================================================ */

function getActiveSession() {

    /*
     * First use the explicitly stored role.
     * This prevents an old token for another role from
     * being selected accidentally.
     */

    const storedRole = getStoredRole();

    if (storedRole) {
        const token = getTokenForRole(storedRole);

        if (token) {
            return {
                role: storedRole,
                token,
                payload: decodeJwt(token)
            };
        }
    }


    /*
     * Fallback:
     * inspect available tokens and determine the role
     * from the JWT.
     */

    const sessions = [
        {
            role: "ADMIN",
            token: localStorage.getItem("adminJwtToken")
        },
        {
            role: "VENDOR",
            token: localStorage.getItem("vendorJwtToken")
        },
        {
            role: "USER",
            token: localStorage.getItem("userJwtToken")
        }
    ];

    for (const session of sessions) {

        if (!session.token) {
            continue;
        }

        const payload = decodeJwt(session.token);

        const jwtRole =
            normalizeRole(payload?.role) ||
            normalizeRole(
                Array.isArray(payload?.authorities)
                    ? payload.authorities[0]
                    : payload?.authorities
            );

        return {
            role: jwtRole || session.role,
            token: session.token,
            payload
        };
    }

    return null;
}


/* ============================================================
   FORMAT VALUE
============================================================ */

function formatValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Not available";
    }

    return String(value);
}


/* ============================================================
   DISPLAY NAME
============================================================ */

function getDisplayName(profile) {

    if (!profile) {
        return "DEALHUNTS User";
    }

    if (profile.fullName) {
        return profile.fullName;
    }

    if (profile.name) {
        return profile.name;
    }

    const firstName =
        profile.firstName ||
        profile.firstname ||
        "";

    const lastName =
        profile.lastName ||
        profile.lastname ||
        "";

    const combined =
        `${firstName} ${lastName}`.trim();

    if (combined) {
        return combined;
    }

    return (
        profile.username ||
        profile.email ||
        profile.shopName ||
        profile.storeName ||
        "DEALHUNTS User"
    );
}


/* ============================================================
   INITIALS
============================================================ */

function getInitials(profile) {

    const displayName =
        getDisplayName(profile);

    const words = displayName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length >= 2) {
        return (
            words[0].charAt(0) +
            words[1].charAt(0)
        ).toUpperCase();
    }

    if (words.length === 1) {
        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return "DH";
}


/* ============================================================
   NORMALIZE API RESPONSE
============================================================ */

function normalizeProfileResponse(response) {

    if (!response) {
        return {};
    }

    if (response.data !== undefined) {
        return normalizeProfileResponse(response.data);
    }

    if (response.user !== undefined) {
        return normalizeProfileResponse(response.user);
    }

    if (response.vendor !== undefined) {
        return normalizeProfileResponse(response.vendor);
    }

    if (response.admin !== undefined) {
        return normalizeProfileResponse(response.admin);
    }

    if (response.profile !== undefined) {
        return normalizeProfileResponse(response.profile);
    }

    return response;
}


/* ============================================================
   PROFILE COMPONENT
============================================================ */

export default function Profile() {

    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [activeSection, setActiveSection] =
        useState("overview");


    /* ========================================================
       LOAD PROFILE
    ======================================================== */

    const loadProfile = useCallback(async () => {

        setLoading(true);
        setError("");

        try {

            const activeSession =
                getActiveSession();

            if (!activeSession) {

                setSession(null);
                setProfile(null);
                setLoading(false);

                return;
            }


            const normalizedRole =
                normalizeRole(activeSession.role);


            if (!normalizedRole) {
                throw new Error(
                    "Unable to determine account role."
                );
            }


            const config =
                ROLE_CONFIG[normalizedRole];


            if (!config) {
                throw new Error(
                    "Unsupported account role."
                );
            }


            if (!activeSession.token) {
                throw new Error(
                    "Authentication token was not found."
                );
            }


            setSession({
                ...activeSession,
                role: normalizedRole
            });


            const response =
                await axios.get(
                    `${API_BASE_URL}${config.endpoint}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${activeSession.token}`
                        }
                    }
                );


            const actualProfile =
                normalizeProfileResponse(
                    response.data
                );


            setProfile(actualProfile);

        } catch (err) {

            console.error(
                "Profile loading error:",
                err
            );


            if (err.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (err.response?.status === 403) {

                setError(
                    "You are not authorized to view this profile."
                );

            } else if (err.response?.status === 404) {

                setError(
                    "Profile API endpoint was not found."
                );

            } else {

                setError(
                    err.message ||
                    "Unable to load profile details."
                );
            }

        } finally {

            setLoading(false);
        }

    }, []);


    useEffect(() => {
        loadProfile();
    }, [loadProfile]);


    /* ========================================================
       LOGOUT
    ======================================================== */

    const handleLogout = () => {

        if (!session) {
            navigate("/login");
            return;
        }


        if (session.role === "ADMIN") {

            localStorage.removeItem(
                "adminJwtToken"
            );

            localStorage.removeItem(
                "adminToken"
            );

            localStorage.removeItem(
                "adminRole"
            );

            localStorage.removeItem(
                "admin_role"
            );
        }


        if (session.role === "VENDOR") {

            localStorage.removeItem(
                "vendorJwtToken"
            );

            localStorage.removeItem(
                "vendorToken"
            );

            localStorage.removeItem(
                "vendorRole"
            );

            localStorage.removeItem(
                "vendor_role"
            );
        }


        if (session.role === "USER") {

            localStorage.removeItem(
                "userJwtToken"
            );

            localStorage.removeItem(
                "jwtToken"
            );

            localStorage.removeItem(
                "userRole"
            );

            localStorage.removeItem(
                "user_role"
            );

            localStorage.removeItem(
                "userEmail"
            );
        }


        localStorage.removeItem("role");

        navigate("/login", {
            replace: true
        });
    };


    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {

        return (
            <>
                <Header />

                <div className="dh-profile-page">

                    <div className="dh-profile-loading">

                        <div className="dh-profile-spinner"></div>

                        <p>
                            Loading profile...
                        </p>

                    </div>

                </div>
            </>
        );
    }


    /* ========================================================
       NO SESSION
    ======================================================== */

    if (!session) {

        return (
            <>
                <Header />

                <div className="dh-profile-page">

                    <div className="dh-profile-empty">

                        <div className="dh-profile-empty-icon">
                            👤
                        </div>

                        <h2>
                            No active account
                        </h2>

                        <p>
                            Please login to view your
                            DEALHUNTS profile.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                            className="dh-profile-primary-btn"
                        >
                            Login
                        </button>

                    </div>

                </div>
            </>
        );
    }


    const role = session.role;


    /* ========================================================
       MAIN PROFILE
    ======================================================== */

    return (
        <>

            {/* =================================================
                DEALHUNTS HEADER
            ================================================= */}

            <Header />


            <div className="dh-profile-page">

                {/* =================================================
                    PROFILE HEADER CARD
                ================================================= */}

                <section className="dh-profile-header-card">

                    <div className="dh-profile-avatar">
                        {getInitials(profile)}
                    </div>


                    <div className="dh-profile-header-info">

                        <div className="dh-profile-name-row">

                            <h1>
                                {getDisplayName(profile)}
                            </h1>

                            <span
                                className={
                                    `dh-profile-role-badge ` +
                                    `dh-profile-role-${role.toLowerCase()}`
                                }
                            >
                                {role}
                            </span>

                        </div>


                        <p className="dh-profile-email">

                            {formatValue(
                                profile?.email ||
                                profile?.username ||
                                session?.payload?.email
                            )}

                        </p>


                        <p className="dh-profile-account-text">

                            DEALHUNTS{" "}
                            {role.toLowerCase()} account

                        </p>

                    </div>


                    <button
                        type="button"
                        className="dh-profile-logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </section>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="dh-profile-error">

                        <div>
                            <strong>
                                Unable to load profile
                            </strong>

                            <span>
                                {error}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={loadProfile}
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================================
                    PROFILE CONTENT
                ================================================= */}

                <section className="dh-profile-content">

                    {/* =================================================
                        LEFT NAVIGATION
                    ================================================= */}

                    <aside className="dh-profile-menu">

                        <button
                            type="button"
                            className={
                                activeSection === "overview"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveSection(
                                    "overview"
                                )
                            }
                        >
                            <span>⌂</span>
                            Overview
                        </button>


                        <button
                            type="button"
                            className={
                                activeSection === "personal"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveSection(
                                    "personal"
                                )
                            }
                        >
                            <span>👤</span>
                            Personal Details
                        </button>


                        <button
                            type="button"
                            className={
                                activeSection === "account"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveSection(
                                    "account"
                                )
                            }
                        >
                            <span>⚙</span>
                            Account Details
                        </button>


                        {role === "USER" && (

                            <button
                                type="button"
                                className={
                                    activeSection === "activity"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveSection(
                                        "activity"
                                    )
                                }
                            >
                                <span>🛒</span>
                                My Activity
                            </button>

                        )}


                        {role === "VENDOR" && (

                            <button
                                type="button"
                                className={
                                    activeSection === "business"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveSection(
                                        "business"
                                    )
                                }
                            >
                                <span>🏪</span>
                                Business Details
                            </button>

                        )}


                        {role === "ADMIN" && (

                            <button
                                type="button"
                                className={
                                    activeSection === "admin"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveSection(
                                        "admin"
                                    )
                                }
                            >
                                <span>🛡</span>
                                Administration
                            </button>

                        )}

                    </aside>


                    {/* =================================================
                        RIGHT CONTENT
                    ================================================= */}

                    <main className="dh-profile-details">

                        {/* =================================================
                            OVERVIEW
                        ================================================= */}

                        {activeSection === "overview" && (

                            <div className="dh-profile-section">

                                <div className="dh-profile-section-heading">

                                    <h2>
                                        Profile Overview
                                    </h2>

                                    <p>
                                        Your actual DEALHUNTS
                                        account information.
                                    </p>

                                </div>


                                <div className="dh-profile-overview-grid">

                                    <div className="dh-profile-info-card">

                                        <span className="dh-profile-card-label">
                                            Account Type
                                        </span>

                                        <strong>
                                            {role}
                                        </strong>

                                    </div>


                                    <div className="dh-profile-info-card">

                                        <span className="dh-profile-card-label">
                                            Name
                                        </span>

                                        <strong>
                                            {getDisplayName(
                                                profile
                                            )}
                                        </strong>

                                    </div>


                                    <div className="dh-profile-info-card">

                                        <span className="dh-profile-card-label">
                                            Email
                                        </span>

                                        <strong>
                                            {formatValue(
                                                profile?.email ||
                                                session?.payload?.email
                                            )}
                                        </strong>

                                    </div>


                                    <div className="dh-profile-info-card">

                                        <span className="dh-profile-card-label">
                                            Account ID
                                        </span>

                                        <strong>
                                            {formatValue(
                                                profile?.id ||
                                                profile?.userId ||
                                                profile?.vendorId ||
                                                profile?.adminId
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            PERSONAL DETAILS
                        ================================================= */}

                        {activeSection === "personal" && (

                            <div className="dh-profile-section">

                                <div className="dh-profile-section-heading">

                                    <h2>
                                        Personal Details
                                    </h2>

                                    <p>
                                        Information associated
                                        with this account.
                                    </p>

                                </div>


                                <div className="dh-profile-details-grid">

                                    <div className="dh-profile-detail-item">
                                        <label>
                                            Full Name
                                        </label>

                                        <div>
                                            {getDisplayName(
                                                profile
                                            )}
                                        </div>
                                    </div>


                                    <div className="dh-profile-detail-item">
                                        <label>
                                            Email
                                        </label>

                                        <div>
                                            {formatValue(
                                                profile?.email ||
                                                session?.payload?.email
                                            )}
                                        </div>
                                    </div>


                                    <div className="dh-profile-detail-item">
                                        <label>
                                            Username
                                        </label>

                                        <div>
                                            {formatValue(
                                                profile?.username
                                            )}
                                        </div>
                                    </div>


                                    <div className="dh-profile-detail-item">
                                        <label>
                                            Phone
                                        </label>

                                        <div>
                                            {formatValue(
                                                profile?.phone ||
                                                profile?.phoneNo ||
                                                profile?.phoneNumber ||
                                                profile?.mobile
                                            )}
                                        </div>
                                    </div>


                                    <div className="dh-profile-detail-item">
                                        <label>
                                            First Name
                                        </label>

                                        <div>
                                            {formatValue(
                                                profile?.firstName ||
                                                profile?.firstname
                                            )}
                                        </div>
                                    </div>


                                    <div className="dh-profile-detail-item">
                                        <label>
                                            Last Name
                                        </label>

                                        <div>
                                            {formatValue(
                                                profile?.lastName ||
                                                profile?.lastname
                                            )}
                                        </div>
                                    </div>

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            ACCOUNT DETAILS
                        ================================================= */}

                        {activeSection === "account" && (

                            <div className="dh-profile-section">

                                <div className="dh-profile-section-heading">

                                    <h2>
                                        Account Details
                                    </h2>

                                    <p>
                                        Authentication and
                                        account information.
                                    </p>

                                </div>


                                <div className="dh-profile-details-grid">

                                    <div className="dh-profile-detail-item">
                                        <label>
                                            Role
                                        </label>

                                        <div>
                                            {formatValue(
                                                profile?.role ||
                                                `ROLE_${role}`
                                            )}
                                        </div>
                                    </div>


                                    <div className="dh-profile-detail-item">
                                        <label>
                                            Account ID
                                        </label>

                                        <div>
                                            {formatValue(
                                                profile?.id ||
                                                profile?.userId ||
                                                profile?.vendorId ||
                                                profile?.adminId
                                            )}
                                        </div>
                                    </div>


                                    <div className="dh-profile-detail-item">
                                        <label>
                                            Account Status
                                        </label>

                                        <div>
                                            {formatValue(
                                                profile?.status ||
                                                profile?.accountStatus ||
                                                profile?.approvalStatus
                                            )}
                                        </div>
                                    </div>


                                    <div className="dh-profile-detail-item">
                                        <label>
                                            Created At
                                        </label>

                                        <div>
                                            {formatValue(
                                                profile?.createdAt ||
                                                profile?.createdDate
                                            )}
                                        </div>
                                    </div>


                                    <div className="dh-profile-detail-item">
                                        <label>
                                            Updated At
                                        </label>

                                        <div>
                                            {formatValue(
                                                profile?.updatedAt ||
                                                profile?.updatedDate
                                            )}
                                        </div>
                                    </div>


                                    <div className="dh-profile-detail-item">
                                        <label>
                                            Authentication
                                        </label>

                                        <div>
                                            Active
                                        </div>
                                    </div>

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            USER ACTIVITY
                        ================================================= */}

                        {role === "USER" &&
                            activeSection === "activity" && (

                                <div className="dh-profile-section">

                                    <div className="dh-profile-section-heading">

                                        <h2>
                                            My Activity
                                        </h2>

                                        <p>
                                            Your DEALHUNTS
                                            shopping account.
                                        </p>

                                    </div>


                                    <div className="dh-profile-overview-grid">

                                        <div className="dh-profile-info-card">

                                            <span className="dh-profile-card-label">
                                                Cart
                                            </span>

                                            <strong>
                                                View Cart
                                            </strong>

                                        </div>


                                        <div className="dh-profile-info-card">

                                            <span className="dh-profile-card-label">
                                                Wishlist
                                            </span>

                                            <strong>
                                                View Wishlist
                                            </strong>

                                        </div>


                                        <div className="dh-profile-info-card">

                                            <span className="dh-profile-card-label">
                                                Orders
                                            </span>

                                            <strong>
                                                View Orders
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            )}


                        {/* =================================================
                            VENDOR BUSINESS
                        ================================================= */}

                        {role === "VENDOR" &&
                            activeSection === "business" && (

                                <div className="dh-profile-section">

                                    <div className="dh-profile-section-heading">

                                        <h2>
                                            Business Details
                                        </h2>

                                        <p>
                                            Vendor account and
                                            business information.
                                        </p>

                                    </div>


                                    <div className="dh-profile-details-grid">

                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Vendor ID
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.id ||
                                                    profile?.vendorId
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Full Name
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.fullName ||
                                                    profile?.name
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Shop Name
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.shopName
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Email
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.email
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Phone
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.phoneNo ||
                                                    profile?.phone ||
                                                    profile?.phoneNumber
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Status
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.status
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                City
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.city
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                State
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.state
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Pincode
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.pincode
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item dh-profile-detail-full">
                                            <label>
                                                Address
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.address
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item dh-profile-detail-full">
                                            <label>
                                                Location
                                            </label>

                                            <div>

                                                {profile?.locationLink ? (

                                                    <a
                                                        href={
                                                            profile.locationLink
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Open Location
                                                    </a>

                                                ) : (
                                                    "Not available"
                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )}


                        {/* =================================================
                            ADMIN
                        ================================================= */}

                        {role === "ADMIN" &&
                            activeSection === "admin" && (

                                <div className="dh-profile-section">

                                    <div className="dh-profile-section-heading">

                                        <h2>
                                            Administration
                                        </h2>

                                        <p>
                                            Administrator account
                                            information.
                                        </p>

                                    </div>


                                    <div className="dh-profile-details-grid">

                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Admin ID
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.id ||
                                                    profile?.adminId
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Admin Name
                                            </label>

                                            <div>
                                                {getDisplayName(
                                                    profile
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Email
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.email
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Role
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.role ||
                                                    `ROLE_${role}`
                                                )}
                                            </div>
                                        </div>


                                        <div className="dh-profile-detail-item">
                                            <label>
                                                Status
                                            </label>

                                            <div>
                                                {formatValue(
                                                    profile?.status ||
                                                    profile?.accountStatus
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                </div>

                            )}

                    </main>

                </section>

            </div>

        </>
    );
}
