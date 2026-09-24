import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import VendorRegistrationDetails from "../../components/VendorRegistrationDetails";
import { vendorRegister } from "../../api/VendorApi";
import { validateVendorRegister } from "../../components/Validation";

import "../../styles/VRegister.css";

function VendorRegister() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getVendorLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (post) => {
        setLocation({
          lat: post.coords.latitude,
          lon: post.coords.longitude,
        });

        setError("");
      },
      (err) => {
        console.error(err);
        setError("Unable to get your location. Please try again.");
      }
    );
  };

  useEffect(() => {
    getVendorLocation();
  }, []);

  /*
   * Register button remains disabled until
   * all required fields have been entered.
   */
  const isFormIncomplete =
    !fullName.trim() ||
    !shopName.trim() ||
    !state.trim() ||
    !city.trim() ||
    !pincode.trim() ||
    !location ||
    !address.trim() ||
    !phone.trim() ||
    !email.trim() ||
    !password ||
    !confirmPassword;

  const handleVendorRegister = async (e) => {
    e.preventDefault();

    console.log("SUBMIT WORKING");

    const errorMessage = validateVendorRegister(
      fullName,
      shopName,
      state,
      city,
      pincode,
      location,
      address,
      phone,
      email,
      password,
      confirmPassword
    );

    if (errorMessage) {
      setError(errorMessage);
      setMessage("");
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await vendorRegister(
        fullName,
        shopName,
        state,
        city,
        pincode,
        location,
        address,
        phone,
        email.trim().toLowerCase(),
        password
      );

      if (response.data?.success) {
        setMessage("Vendor Registration Successful");

        navigate(
          `/request-status/${email.trim().toLowerCase()}`
        );
      } else {
        setMessage(
          response.data?.message ||
          "Vendor Registration Failed"
        );
      }
    } catch (err) {
      console.error(err);
      setMessage("Server Error. Try again later.");
    }
  };

  return (
    <div className="vendor-register-page">

      <div className="form-wrapper">

        <form
          onSubmit={handleVendorRegister}
          className="register-box"
        >

          <h2>Vendor Registration</h2>

          <VendorRegistrationDetails
            fullName={fullName}
            setFullName={setFullName}

            state={state}
            setState={setState}

            city={city}
            setCity={setCity}

            pincode={pincode}
            setPincode={setPincode}

            email={email}
            setEmail={setEmail}

            shopName={shopName}
            setShopName={setShopName}

            address={address}
            setAddress={setAddress}

            phone={phone}
            setPhone={setPhone}

            location={location}
            setLocation={setLocation}

            getVendorLocation={getVendorLocation}

            password={password}
            setPassword={setPassword}

            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
          />

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {message && (
            <p className="register-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isFormIncomplete}
          >
            Register
          </button>

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