import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VendorRegistrationDetails from "../../components/VendorRegistrationDetails";
import "../../styles/Register.css";
import { vendorRegister } from "../../api/VendorApi";
import { validateVendorRegister } from "../../components/Validation";

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
    navigator.geolocation.getCurrentPosition(
      (post) => {
        setLocation({
          lat: post.coords.latitude,
          lon: post.coords.longitude,
        });
      },
      (err) => console.error(err)
    );
  };

  useEffect(() => {
    getVendorLocation();
  }, []);

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
        navigate(`/request-status/${email.trim().toLowerCase()}`);
      } else {
        setMessage(response.data?.message || "Vendor Registration Failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server Error. Try again later.");
    }
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <span className="Gold">DEAL</span>
          <span className="Black">HUNTS</span>
          <span className="Vendor">Vendor</span>
        </div>
        <div className="login-btn">
          <button onClick={() => navigate("/VendorLogin")}>Login</button>
        </div>
      </header>

      <div className="form-wrapper">
        <form onSubmit={handleVendorRegister} className="register-box">
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
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
          />

          {error && <p className="error-message">{error}</p>}
          {message && <p>{message}</p>}

          <button type="submit">Register</button>
        </form>
      </div>
    </>
  );
}

export default VendorRegister;