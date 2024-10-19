import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import bg from "../../../assets/bg.mp4";
import bgpic from "../../../assets/bg.png";
import "./Login.css";
// import { Auth } from '../firebase/firebase';
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Auth } from "../firebase";

const googleprovider = new GoogleAuthProvider();

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log(e);

    try {
      const userCredential = await signInWithEmailAndPassword(
        Auth,
        email,
        password
      );
      console.log(userCredential);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSingnInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(Auth, googleprovider);
      console.log(result);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };
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
              <input
                type="email"
                placeholder="Email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <p>Forgot Password?</p>
            </div>

            <div className="login-box-two">
              <p className="border"></p>
              <button onClick={handleSubmit} className="btn">
                Log in
              </button>
              <button
                onClick={handleSingnInWithGoogle}
                className="btn google-btn"
              >
                Log in with Google
              </button>
              <p className="sign-up-account">
                Don't have an account? <Link to="/signup">Sign Up</Link>{" "}
                {/* Updated Link */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
