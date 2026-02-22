import React from "react";

function Details({
  firstName,setFirstName,
  lastName,setLastName,
  email,setEmail,
  password,setPassword,
  confirmPassword,setConfirmPassword,
}){
  return(
    <>
    {/*show first name if passed*/}
    {firstName!==undefined&&(
      <input
      type = "text"
      placeholder="First Name"
      value = {firstName}
      onChange={(e)=>setFirstName(e.target.value)}
      />
    )}
    {lastName!=undefined&&(
      <input 
      type = "text"
      placeholder="Last Name"
      value = {lastName}
      onChange={(e) => setLastName(e.target.value)}
    />
    )}
     <input
     type="email"
     placeholder="Email"
     value={email}
     onChange={(e)=>setEmail(e.target.value)}
     />
     <input
     type="password"
     placeholder="Password"
     value={password}
     onChange={(e)=>setPassword(e.target.value)}
     disabled={!email}
     />
     {confirmPassword!=undefined&&(
     <input 
     type = "password"
     placeholder="Confirm-Password"
     value={confirmPassword}
     onChange={(e)=>setConfirmPassword(e.target.value)}
     disabled={!password}
     />
     )}
    </>
  );
};
export default Details;