import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Scanner from '../Scanner/Scanner';
import './Home.css';
import backgroundVideo from '../../assets/bg.mp4';
import godVideo from '../../assets/god.mp4';

const Home = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleStartNow = () => {
    console.log("Start Now button clicked");
    setIsScanning(true);
  };

  const handleCloseScanner = () => {
    console.log("Closing scanner...");
    setIsScanning(false);
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
        <Link to="/" className="navbar-logo">EduAr</Link>
        <button className="nav-toggle" onClick={toggleNav}>
          {isNavOpen ? '✕' : '☰'}
        </button>
        <ul className={`navbar-links ${isNavOpen ? 'open' : ''}`}>
          <li><Link to="/" className="active fancy-active">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/subject">Subjects</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <div className={`auth-buttons ${isNavOpen ? 'open' : ''}`}>
          <Link to="/login" className="auth-btn login-btn">Login</Link>
          <Link to="/signup" className="auth-btn signup-btn">Sign Up</Link>
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
      {isScanning && <Scanner onClose={handleCloseScanner} />}
    </div>
  );
};

export default Home;
