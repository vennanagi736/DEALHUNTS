export const validateRegister = (firstName, lastName, email, password, confirmPassword) => {

    if (!firstName) return "Enter first name";
    if (!lastName) return "Enter last name";
    if (!email) return "Enter email";
    if (!password) return "Enter password";
    if (!confirmPassword) return "Confirm your password";

    if (!/^\S+@\S+\.\S+$/.test(email))
        return "Invalid email format";

    if (password !== confirmPassword)
        return "Passwords do not match";

    if (password.length < 6)
        return "Password must be at least 6 characters";

    return null;
};
export const validateLogin = (email, password) => {

    if (!email) return "Enter email";
    if (!password) return "Enter password";

    if (!/^\S+@\S+\.\S+$/.test(email))
        return "Invalid email format";

    return null;
};
