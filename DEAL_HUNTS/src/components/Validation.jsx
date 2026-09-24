export const validateVendorRegister = (
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
) => {

  if (!fullName.trim()) return "Enter full name";

  if (!shopName.trim()) return "Enter shop name";

  if (!state.trim()) return "Enter state";

  if (!city.trim()) return "Enter city";

  if (!pincode.trim()) return "Enter pincode";

  const pincodeRegex = /^\d{6}$/;

  if (!pincodeRegex.test(pincode.trim())) {
    return "Pincode must be 6 digits";
  }

  if (!location) return "Enter location";

  if (!address.trim()) return "Enter address";

  if (!phone.trim()) return "Enter phone number";

  const phoneRegex = /^\d{10}$/;

  if (!phoneRegex.test(phone.trim())) {
    return "Invalid phone number";
  }

  if (!email.trim()) return "Enter email";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return "Invalid email format";
  }

  if (!password) return "Enter password";

  if (!confirmPassword) return "Confirm your password";

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  return null;
};


export const validateRegister = (
  firstName,
  lastName,
  email,
  password,
  confirmPassword
) => {

  if (!firstName.trim()) return "Enter first name";

  if (!lastName.trim()) return "Enter last name";

  if (!email.trim()) return "Enter email";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return "Invalid email format";
  }

  if (!password) return "Enter password";

  if (!confirmPassword) return "Enter confirm password";

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  return null;
};


export const validateLogin = (email, password) => {

  if (!email.trim()) return "Enter email";

  if (!password) return "Enter password";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return "Invalid email format";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  return null;
};