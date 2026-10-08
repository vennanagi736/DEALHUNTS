import React, { useState } from "react";
import {
    Link,
    useLocation,
} from "react-router-dom";

import { FiMail } from "react-icons/fi";
import "../styles/ForgotPassword.css";


function ForgotPassword() {

    const location = useLocation();


    // ============================================================
    // ACCOUNT TYPE
    //
    // User Login:
    // state={{ accountType: "user" }}
    //
    // Vendor Login:
    // state={{ accountType: "vendor" }}
    //
    // Default = user
    // ============================================================

    const accountType =
        location.state?.accountType === "vendor"
            ? "vendor"
            : "user";


    const [email, setEmail] = useState("");

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);


    // ============================================================
    // EMAIL CHANGE
    // ============================================================

    const handleEmailChange = (e) => {

        setEmail(e.target.value);

        setError("");

        setMessage("");

    };


    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setMessage("");


        const trimmedEmail =
            email.trim();


        // ========================================================
        // EMPTY EMAIL
        // ========================================================

        if (!trimmedEmail) {

            setError(
                "Please enter your email address."
            );

            return;

        }


        // ========================================================
        // EMAIL VALIDATION
        // ========================================================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(trimmedEmail)) {

            setError(
                "Please enter a valid email address."
            );

            return;

        }


        setLoading(true);


        try {

            // ====================================================
            // PASSWORD RESET API
            //
            // Connect the actual API here later.
            //
            // accountType:
            //
            // "user"   -> User account
            // "vendor" -> Vendor account
            // ====================================================

            await new Promise(
                (resolve) =>
                    setTimeout(resolve, 1000)
            );


            setMessage(
                `If an account exists for this email, a password reset link has been sent to your ${
                    accountType
                } account.`
            );


        } catch (err) {

            console.error(
                "FORGOT PASSWORD ERROR:",
                err
            );

            setError(
                "Unable to process your request. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // LOGIN ROUTE
    // ============================================================

    const loginRoute =
        accountType === "vendor"
            ? "/vendorLogin"
            : "/login";


    return (

        <div className="forgot-password-page-uvfp">

            <form
                className="forgot-password-card-uvfp"
                onSubmit={handleSubmit}
            >

                {/* ==================================================
                    TITLE
                ================================================== */}

                <h2 className="forgot-password-title-uvfp">
                    Forgot Password?
                </h2>


                {/* ==================================================
                    DESCRIPTION
                ================================================== */}

                <p className="forgot-password-description-uvfp">
                    Enter your registered email address to
                    reset your password.
                </p>


                {/* ==================================================
                    EMAIL
                ================================================== */}

                <div className="forgot-password-field-uvfp">

                    <label
                        htmlFor="forgot-password-email-uvfp"
                    >
                        Email Address
                    </label>


                    <div className="forgot-password-input-wrapper-uvfp">

                        <FiMail
                            className="forgot-password-input-icon-uvfp"
                        />


                        <input
                            id="forgot-password-email-uvfp"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="Enter your email"
                            autoComplete="email"
                            disabled={loading}
                        />

                    </div>

                </div>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <p
                        className="forgot-password-error-uvfp"
                        role="alert"
                    >
                        {error}
                    </p>

                )}


                {/* ==================================================
                    SUCCESS MESSAGE
                ================================================== */}

                {message && (

                    <p
                        className="forgot-password-success-uvfp"
                        role="status"
                    >
                        {message}
                    </p>

                )}


                {/* ==================================================
                    SUBMIT
                ================================================== */}

                <div className="forgot-password-actions-uvfp">

                    <button
                        type="submit"
                        className="forgot-password-submit-uvfp"
                        disabled={
                            !email.trim() ||
                            loading
                        }
                    >
                        {loading
                            ? "Sending..."
                            : "Send Reset Link"
                        }
                    </button>

                </div>


                {/* ==================================================
                    BACK TO LOGIN
                ================================================== */}

                <p className="forgot-password-back-login-uvfp">

                    <Link
                        to={loginRoute}
                        className="forgot-password-login-link-uvfp"
                    >
                        Back to Login
                    </Link>

                </p>

            </form>

        </div>

    );

}


export default ForgotPassword;
