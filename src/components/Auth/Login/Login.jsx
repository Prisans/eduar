import React from "react";
import { Link } from "react-router-dom";
import bg from "../../../assets/bg.mp4";
import bgpic from "../../../assets/bg.png";
import "./Login.css";

const Login = () => {
  console.log("Login component rendered");
  return (
    <div className="login-container">
      <video src={bg} autoPlay loop muted></video>

      <div className="login-content">
        <div className="login-image">
          <img src={bgpic} alt="#" />
        </div>

        <div className="login-section">
          <div className="login-box">
            <div className="login-box-one">
              <h2>Log in</h2>
              <input type="email" placeholder="Email" required/>
              <input type="password" placeholder="Password" required/>
              <p>Forgot Password?</p>
            </div>

            <div className="login-box-two">
              <p className="border"></p>
              <button className="btn">Log in</button>
              <button className="btn google-btn">Log in with Google</button>
              <p className="sign-up-account">
                Don't have an account? <Link to="/signup">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
