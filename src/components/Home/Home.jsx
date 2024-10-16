import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import backgroundVideo from '../../assets/bg.mp4';
import godVideo from '../../assets/god.mp4';

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);

  const handleStartNow = () => {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      setIsScanning(true);
      startCamera();
    } else {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing the camera:", err);
      setIsScanning(false);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleCloseScanner = () => {
    setIsScanning(false);
    stopCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
        <Link to="/" className="navbar-logo">Logo</Link>
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
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Camera access is not available or denied.</p>
          </div>
        </div>
      )}
      {isScanning && (
        <div className="scanner-overlay">
          <h2>Ready to Scan</h2>
          <video ref={videoRef} autoPlay playsInline className="scanner-video" />
          <button onClick={handleCloseScanner}>Close Scanner</button>
        </div>
      )}
    </div>
  );
};

export default Home;
