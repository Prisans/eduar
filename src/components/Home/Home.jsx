import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import backgroundVideo from '../../assets/bg.mp4';
import godVideo from '../../assets/god.mp4';

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleStartNow = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <div className="home">
      <div className="video-background">
        <video autoPlay loop muted playsInline className="god-video">
          <source src={godVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <video autoPlay loop muted playsInline className="background-video">
          <source src={backgroundVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <nav className={`navbar ${isNavOpen ? 'open' : ''}`}>
        <div className="navbar-logo">Logo</div>
        <button className="nav-toggle" onClick={toggleNav}>
          {isNavOpen ? '✕' : '☰'}
        </button>
        <ul className={`navbar-links ${isNavOpen ? 'open' : ''}`}>
          <li><a href="#home" onClick={toggleNav}>Home</a></li>
          <li><a href="#about" onClick={toggleNav}>About</a></li>
          <li><a href="#services" onClick={toggleNav}>Services</a></li>
          <li><a href="#contact" onClick={toggleNav}>Contact</a></li>
        </ul>
        <div className={`auth-buttons ${isNavOpen ? 'open' : ''}`}>
          <Link to="/login" className="auth-btn login-btn" onClick={toggleNav}>Login</Link>
          <Link to="/signup" className="auth-btn signup-btn" onClick={toggleNav}>Sign Up</Link>
        </div>
      </nav>
      <div className="content">
        <h1>
          Bring Learning to Life with
          <br />
          <span className="ar-text">AR!</span>
        </h1>
        
        <button className="start-now-btn" onClick={handleStartNow}>Start Now</button>
      </div>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Open it from Mobile</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
