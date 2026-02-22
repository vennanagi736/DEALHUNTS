import React from "react";
import Login from "./pages/user/Login"; // matches your file name
import Register from "./pages/user/Register";
import Home from "./pages/user/Home";

function HomePage(){
  return <Home/>;  //this will display home page
}
function LoginForm() {
  return <Login />; // this will display the login form
}
function RegisterForm(){
  return <Register/>; //this will diplay the register form
}
export default Home;
