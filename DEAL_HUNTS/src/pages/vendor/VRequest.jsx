import React, { useEffect, useState } from "react";
import "../../styles/Admin.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function RequestStatus() {
    const { email } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState("Loading...");

    useEffect(() => {
        if (!email) {
            setStatus("ERROR");
            return;
        }

        const checkStatus = async () => {
            try {
                const encodedEmail = encodeURIComponent(email);

                const response = await axios.get(
                    `http://localhost:8080/vendor/status?email=${encodedEmail}`
                );

                const vendorStatus = response.data;

                console.log("Vendor status response:", vendorStatus);

                setStatus(
                    typeof vendorStatus === "string"
                        ? vendorStatus.toUpperCase()
                        : vendorStatus?.status?.toUpperCase() || "ERROR"
                );

            } catch (error) {
                console.error(
                    "Vendor status request failed:",
                    error.response?.status,
                    error.response?.data || error.message
                );

                setStatus("ERROR");
            }
        };

        checkStatus();
    }, [email]);

    return (
        <div className="adminhome-container">

            <main className="main">

                <div>

                    <h1>
                        Nice to have you Mr/Mrs: {email}
                    </h1>

                    <h1>
                        Vendor Registration Status
                    </h1>

                    <p>
                        Status: {status}
                    </p>

                    <p>
                        Once the Admin processes the request, you will be redirected.
                    </p>

                    {status === "PENDING" && (
                        <p>
                            Please wait for admin approval.
                        </p>
                    )}

                    {status === "APPROVED" && (
                        <>
                            <p>
                                Your vendor account has been approved.
                            </p>

                            <button
                                className="login-btn"
                                onClick={() => navigate("/vendorLogin")}
                            >
                                Go to Login
                            </button>
                        </>
                    )}

                    {status === "REJECTED" && (
                        <p>
                            Your request was rejected.
                        </p>
                    )}

                    {status === "ERROR" && (
                        <p>
                            Unable to retrieve your registration status.
                            Please try again.
                        </p>
                    )}

                </div>

            </main>

            <footer className="admin-footer">
                <p>
                    © 2026 Website. All rights reserved.
                </p>
            </footer>

        </div>
    );
}

export default RequestStatus;