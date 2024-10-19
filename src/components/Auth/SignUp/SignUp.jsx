import React , {useState} from 'react';
import bg from "../../../assets/bg.mp4";
import bgpic from "../../../assets/bg.png";
import { Link } from "react-router-dom";
import "./SignUp.css";
import { useNavigate } from 'react-router-dom';
import {
         signInWithPopup , 
         GoogleAuthProvider , 
         createUserWithEmailAndPassword 
        
        } from 'firebase/auth';
import { Auth } from '../firebase';



function SignUp() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const googleprovider = new GoogleAuthProvider();


  const handleSubmit = async (e) => {
    console.log(e);

    try {
      const userCredential = await createUserWithEmailAndPassword(Auth, email, password);
      console.log(userCredential);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
    if (console.error) {
      setErrorMsg("Fill all the fields correctly");
      return;
    }
    setErrorMsg("");


  };
  const handleSingnInWithGoogle = async () => {

    try {

      await signInWithPopup(Auth, googleprovider);
      navigate("/");

    } catch (error) {
      console.error(error);
    }

  };

  return (
    <div className="login-container">
      <video src={bg} autoPlay loop muted></video>

      <div className="login-content">


        <div className="login-section">

          <div className="login-box">

            <div onSubmit={handleSubmit} className="login-box-one">
              <h2>Sign Up</h2>

              <input type="text" placeholder="Name" value={name}
                onChange={(e) => setName(e.target.value)} />
              <input type="email" placeholder="Email"
                onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password"
                onChange={(e) => setPassword(e.target.value)} />
            </div>


            <div className="login-box-two">
              <p className="border"></p>
              <b className="Error-Msg">{errorMsg}</b>
              <button onClick={handleSubmit} className="btn">Sign Up</button>
              <button onClick={handleSingnInWithGoogle} className="btn google-btn">Log in with Google</button>
              <p className="sign-up-account">
                Have an account? <Link to='/login'>login</Link>
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