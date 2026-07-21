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
  if (!fullName) return "Enter full name";
  if (!shopName) return "Enter shop name";
  if (!state) return "Enter state";
  if (!city) return "Enter city";

  if (!pincode) return "Enter pincode";
  const pincodeRegex = /^\d{6}$/;
  if (!pincode || !pincodeRegex.test(pincode.toString().trim())){
    console.log("Pincode:",pincode); 
    return "Pincode must be 6 digits";
  }
  if (!location) return "Enter location";
  if (!address) return "Enter address";

  if (!phone) return "Enter phone number";
  const phoneRegex = /^\d{10}$/; 
  if (!phoneRegex.test(phone)) return "Invalid phone number";

  if (!email) return "Enter email";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Invalid email format";

  if (!password) return "Enter password";
  if (!confirmPassword) return "Confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  if (password.length < 8) return "Password must be at least 8 characters";

  return null;
};

export const validateRegister = (firstName, lastName, email, password, confirmPassword) => {
  if (!firstName) return "Enter first name";
  if (!lastName) return "Enter last name";  
  if (!email) return "Enter email";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Invalid email format";

  if (!password) return "Enter password";
  if (!confirmPassword) return "Enter confirm password";
  if (password !== confirmPassword) return "Passwords do not match";
  if (password.length < 8) return "Password must be at least 8 characters";

  return null;
};

export const validateLogin = (email, password) => {
  if (!email) return "Enter email";
  if (!password) return "Enter password";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Invalid email format";
  
  if (password.length < 8) return "Password must be at least 8 characters";

  return null;
};