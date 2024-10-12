import React from 'react'
import bg from "../../../assets/bg.mp4";
import bgpic from "../../../assets/bg.png";
import { Link } from "react-router-dom";

const SignUp = () => {
    return (
        <div className="login-container">
          <video src={bg} autoPlay loop muted></video>
    
          <div className="login-content">
            
    
            <div className="login-section">
    
              <div className="login-box">
    
                <div className="login-box-one">
                  <h2>Sign Up</h2>
                  <input type="text" placeholder="Name" required/>
                  <input type="email" placeholder="Email" required/>
                  <input type="password" placeholder="Password" required/>
                  
                </div>
    
                <div className="login-box-two">
                  <p className="border"></p>
                  <button className="btn">Sign Up</button>
                  <button className="btn google-btn">Log in with Google</button>
                  <p className="sign-up-account">
                    Have an account? <Link to='/login' >login</Link>
                  </p>
                </div>
    
              </div>
    
            </div>

            <div className="login-image">
              <img src={bgpic} alt="#" />
            </div>

          </div>
        </div>
      );
}

export default SignUp