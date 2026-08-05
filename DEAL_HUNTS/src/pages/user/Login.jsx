import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/UserApi";
import Layout from "../../components/Layout";
import "../../styles/Login.css";
import { useRole } from "../../context/UseRole";
import LoginDetails from "../../components/LoginDetails";
import { validateLogin } from "../../components/validation";

function Login() {

  const navigate = useNavigate();
  const { updateRole } = useRole();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);



  const handleLogin = async (e) => {

    console.log("user clicked login");

    e.preventDefault();


    const errorMessage = validateLogin(email, password);


    if(errorMessage){

      setError(errorMessage);
      return;

    }


    setError("");
    setMessage("");
    setLoading(true);



    try {


      const response = await loginUser(
        email,
        password
      );



      if(response.data.success){

        setError("");
        localStorage.setItem(
          "userJwtToken",
          response.data.token
        );


        localStorage.setItem(
          "userEmail",
          response.data.email
        );


        updateRole("ROLE_USER");


        setSuccess(true);

        setMessage(
          "Login Successful"
        );


        navigate("/home");


      }
      else{


        setSuccess(false);

        setMessage(
          response.data.message
        );


      }


    }
    catch(error){


      console.error(error);

      setSuccess(false);

      setMessage(
        "Server Error"
      );


    }
    finally{


      setLoading(false);


    }


  };



  return (

    <Layout>

      <div className="login-page">

        <form onSubmit={handleLogin}>


          <div className="login-box">


            <h2 className="login-title">
              Login-Form
            </h2>



            <LoginDetails

              email={email}

              setEmail={setEmail}

              password={password}

              setPassword={setPassword}

            />



            {error && (

              <p className="error-message">
                {error}
              </p>

            )}



            {message && (

              <p

                className="response-message"

                style={{
                  color: success ? "green" : "red"
                }}

              >

                {message}

              </p>

            )}



            <div className="login-actions">


              <button

                type="submit"

                disabled={
                  !email ||
                  !password ||
                  loading
                }

              >

                {
                  loading
                  ?
                  "Logging in..."
                  :
                  "Login"
                }


              </button>


            </div>



            <p className="forgot-password">

              <Link
                to="/forgot-password"
                className="userregister-link"
              >

                Forgot Password?

              </Link>

            </p>



            <p className="register">

              I don't have an account?{" "}


              <Link
                to="/Register"
                className="userregister-link"
              >

                Register

              </Link>


            </p>


          </div>


        </form>


      </div>


    </Layout>

  );

}


export default Login;