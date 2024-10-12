import React from "react";
import bg from "../../../assets/bg.mp4";
import bgpic from "../../../assets/bg.png";
import "./Login.css";

const Login = () => {
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
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <p>Forgot Password?</p>
            </div>

            <div className="login-box-two">
              <p className="border"></p>
              <button className="btn">Log in</button>
              <button className="btn google-btn">Log in with Google</button>
              <p className="sign-up-account">
                Don't have account? <a href="#">Sign Up</a>
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
