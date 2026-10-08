import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    Link
} from "react-router-dom";

import VendorRegistrationDetails
    from "../../components/VendorRegistrationDetails";

import {
    vendorRegister,
    checkVendorEmail
} from "../../api/VendorApi";

import {
    validateVendorRegister
} from "../../components/Validation";

import "../../styles/VRegister.css";


function VendorRegister() {

    const navigate =
        useNavigate();


    // ============================================================
    // FORM STATE
    // ============================================================

    const [
        fullName,
        setFullName,
    ] = useState("");


    const [
        state,
        setState,
    ] = useState("");


    const [
        city,
        setCity,
    ] = useState("");


    const [
        pincode,
        setPincode,
    ] = useState("");


    const [
        shopName,
        setShopName,
    ] = useState("");


    const [
        address,
        setAddress,
    ] = useState("");


    // ============================================================
    // LOCATION
    //
    // Updated only after:
    //
    // Popup
    //   -> select location
    //   -> Confirm Location
    // ============================================================

    const [
        location,
        setLocation,
    ] = useState(null);


    // ============================================================
    // LOCATION POPUP
    // ============================================================

    const [
        showLocationPopup,
        setShowLocationPopup,
    ] = useState(false);


    // ============================================================
    // OTHER FORM STATE
    // ============================================================

    const [
        phone,
        setPhone,
    ] = useState("");


    const [
        email,
        setEmail,
    ] = useState("");


    const [
        password,
        setPassword,
    ] = useState("");


    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState("");


    // ============================================================
    // FORM MESSAGES
    // ============================================================

    const [
        error,
        setError,
    ] = useState("");


    const [
        message,
        setMessage,
    ] = useState("");


    // ============================================================
    // EMAIL DUPLICATE CHECK STATE
    // ============================================================

    const [
        emailExists,
        setEmailExists,
    ] = useState(false);


    const [
        checkingEmail,
        setCheckingEmail,
    ] = useState(false);


    // ============================================================
    // EMAIL VALIDATION
    // ============================================================

    const isValidEmail =
        (value) => {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            return emailRegex.test(
                value.trim()
            );
        };


    // ============================================================
    // CHECK EMAIL WHILE TYPING
    //
    // Waits 500ms after the user stops typing.
    //
    // This prevents an API request for every single keystroke.
    // ============================================================

    useEffect(() => {

        const normalizedEmail =
            email.trim().toLowerCase();


        // --------------------------------------------------------
        // Empty email
        // --------------------------------------------------------

        if (!normalizedEmail) {

            setEmailExists(false);
            setCheckingEmail(false);

            return;
        }


        // --------------------------------------------------------
        // Invalid email format
        //
        // Do not call backend until the format is valid.
        // --------------------------------------------------------

        if (
            !isValidEmail(
                normalizedEmail
            )
        ) {

            setEmailExists(false);
            setCheckingEmail(false);

            return;
        }


        // --------------------------------------------------------
        // Show checking state
        // --------------------------------------------------------

        setCheckingEmail(true);
        setEmailExists(false);


        // --------------------------------------------------------
        // Debounce API request
        // --------------------------------------------------------

        const timer =
            setTimeout(
                async () => {

                    try {

                        const response =
                            await checkVendorEmail(
                                normalizedEmail
                            );


                        const exists =
                            response.data?.exists === true;


                        setEmailExists(
                            exists
                        );


                    } catch (err) {

                        console.error(
                            "Vendor email check error:",
                            err
                        );


                        // ------------------------------------------------
                        // Do not mark email as duplicate if the server
                        // check itself failed.
                        // Final backend registration check still protects
                        // against duplicates.
                        // ------------------------------------------------

                        setEmailExists(false);

                    } finally {

                        setCheckingEmail(false);

                    }

                },
                500
            );


        // --------------------------------------------------------
        // Cancel previous timer if email changes
        // --------------------------------------------------------

        return () => {

            clearTimeout(
                timer
            );

        };

    }, [email]);


    // ============================================================
    // LOCATION VALIDATION
    // ============================================================

    const hasValidLocation =
        location &&
        Number.isFinite(
            Number(location.lat)
        ) &&
        Number.isFinite(
            Number(location.lon)
        );


    // ============================================================
    // FORM VALIDATION
    // ============================================================

    const isFormIncomplete =

        !fullName.trim() ||

        !shopName.trim() ||

        !state.trim() ||

        !city.trim() ||

        !pincode.trim() ||

        !hasValidLocation ||

        !address.trim() ||

        !phone.trim() ||

        !email.trim() ||

        !password ||

        !confirmPassword;


    // ============================================================
    // REGISTER VENDOR
    // ============================================================

    const handleVendorRegister =
        async (e) => {

            e.preventDefault();


            console.log(
                "========== VENDOR REGISTRATION =========="
            );


            // ----------------------------------------------------
            // LOCATION REQUIRED
            // ----------------------------------------------------

            if (!location) {

                setError(
                    "Please select and confirm your shop location."
                );

                setMessage("");

                return;
            }


            // ----------------------------------------------------
            // VALID COORDINATES REQUIRED
            // ----------------------------------------------------

            if (

                !Number.isFinite(
                    Number(location.lat)
                ) ||

                !Number.isFinite(
                    Number(location.lon)
                )

            ) {

                setError(
                    "Please select a valid shop location."
                );

                setMessage("");

                return;
            }


            // ----------------------------------------------------
            // EMAIL FORMAT
            // ----------------------------------------------------

            const normalizedEmail =
                email.trim().toLowerCase();


            if (
                !isValidEmail(
                    normalizedEmail
                )
            ) {

                setError(
                    "Invalid email format"
                );

                setMessage("");

                return;
            }


            // ----------------------------------------------------
            // DUPLICATE EMAIL
            //
            // This prevents registration immediately if the
            // email check already confirmed that it exists.
            // ----------------------------------------------------

            if (emailExists) {

                setError(
                    "Email already exists"
                );

                setMessage("");

                return;
            }


            // ----------------------------------------------------
            // EXISTING PROJECT VALIDATION
            // ----------------------------------------------------

            const errorMessage =
                validateVendorRegister(

                    fullName,

                    shopName,

                    state,

                    city,

                    pincode,

                    location,

                    address,

                    phone,

                    normalizedEmail,

                    password,

                    confirmPassword

                );


            if (errorMessage) {

                setError(
                    errorMessage
                );

                setMessage("");

                return;
            }


            setError("");
            setMessage("");


            // ====================================================
            // SEND REGISTRATION REQUEST
            // ====================================================

            try {

                const response =
                    await vendorRegister(

                        fullName,

                        shopName,

                        state,

                        city,

                        pincode,

                        location,

                        address,

                        phone
                            .trim(),

                        normalizedEmail,

                        password

                    );


                console.log(
                    "Vendor registration response:",
                    response.data
                );


                // =================================================
                // SUCCESS
                // =================================================

                if (
                    response.data?.success
                ) {

                    setMessage(
                        "Vendor Registration Successful"
                    );


                    navigate(
                        `/request-status/${normalizedEmail}`
                    );

                    return;
                }


                // =================================================
                // BACKEND FAILURE
                // =================================================

                setMessage(

                    response.data?.message ||

                    "Vendor Registration Failed"

                );

            } catch (err) {

                console.error(
                    "Vendor registration error:",
                    err
                );


                setError(

                    err.response?.data?.message ||

                    "Server Error. Try again later."

                );

                setMessage("");

            }

        };


    // ============================================================
    // JSX
    // ============================================================

    return (

        <div className="vendor-register-page">

            <div className="form-wrapper">

                <form
                    onSubmit={
                        handleVendorRegister
                    }
                    className="register-box"
                >

                    {/* ==========================================
                        TITLE
                    ========================================== */}

                    <h2>
                        Vendor Registration
                    </h2>


                    {/* ==========================================
                        REGISTRATION DETAILS
                    ========================================== */}

                    <VendorRegistrationDetails

                        fullName={
                            fullName
                        }

                        setFullName={
                            setFullName
                        }


                        state={
                            state
                        }

                        setState={
                            setState
                        }


                        city={
                            city
                        }

                        setCity={
                            setCity
                        }


                        pincode={
                            pincode
                        }

                        setPincode={
                            setPincode
                        }


                        email={
                            email
                        }

                        setEmail={
                            setEmail
                        }


                        shopName={
                            shopName
                        }

                        setShopName={
                            setShopName
                        }


                        address={
                            address
                        }

                        setAddress={
                            setAddress
                        }


                        phone={
                            phone
                        }

                        setPhone={
                            setPhone
                        }


                        location={
                            location
                        }

                        setLocation={
                            setLocation
                        }


                        password={
                            password
                        }

                        setPassword={
                            setPassword
                        }


                        confirmPassword={
                            confirmPassword
                        }

                        setConfirmPassword={
                            setConfirmPassword
                        }


                        // =================================================
                        // LOCATION POPUP CONTROL
                        // =================================================

                        showLocationPopup={
                            showLocationPopup
                        }

                        setShowLocationPopup={
                            setShowLocationPopup
                        }

                    />


                    {/* ==========================================
                        EMAIL DUPLICATE MESSAGE
                    ========================================== */}

                    {emailExists && (

                        <p className="error-message">
                            Email already exists
                        </p>

                    )}


                    {/* ==========================================
                        EMAIL CHECKING MESSAGE
                    ========================================== */}

                    {checkingEmail && (

                        <p className="register-message">
                            Checking email...
                        </p>

                    )}


                    {/* ==========================================
                        GENERAL ERROR
                    ========================================== */}

                    {error && !emailExists && (

                        <p className="error-message">
                            {error}
                        </p>

                    )}


                    {/* ==========================================
                        SUCCESS / INFORMATION MESSAGE
                    ========================================== */}

                    {message && (

                        <p className="register-message">
                            {message}
                        </p>

                    )}


                    {/* ==========================================
                        REGISTER BUTTON
                    ========================================== */}

                    <button
                        type="submit"
                        disabled={
                            isFormIncomplete ||
                            emailExists ||
                            checkingEmail
                        }
                    >
                        Register
                    </button>


                    {/* ==========================================
                        LOGIN LINK
                    ========================================== */}

                    <p className="login">

                        Already account exists?{" "}

                        <Link
                            to="/vendorLogin"
                            className="userregister-link"
                        >
                            Login
                        </Link>

                    </p>

                </form>

            </div>

        </div>
    );
}


export default VendorRegister;