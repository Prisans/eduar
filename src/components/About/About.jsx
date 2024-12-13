import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import backgroundVideo from '../../assets/bg.mp4';
import godVideo from '../../assets/god.mp4';

const About = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <div className="about">
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
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about" className="active fancy-active">About</Link></li>
          <li><Link to="/subject">Subjects</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <div className={`auth-buttons ${isNavOpen ? 'open' : ''}`}>
          <Link to="/login" className="auth-btn login-btn" onClick={toggleNav}>Login</Link>
          <Link to="/signup" className="auth-btn signup-btn" onClick={toggleNav}>Sign Up</Link>
        </div>
      </nav>
      <div className="content">
        <h1>Why AR in Education?</h1>
        <p>
        AR in education makes learning interactive and engaging by using 3D visuals to simplify complex topics. It improves retention through immersive experiences and connects theory to real-world applications. AR also supports collaboration and accessibility, while being flexible with smartphone or tablet access, creating a dynamic learning environment.
        </p>
      </div>
    </div>
  );
};

export default About;
