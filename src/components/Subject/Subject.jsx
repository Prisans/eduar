import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Subject.css';
import backgroundVideo from '../../assets/bg.mp4';
import godVideo from '../../assets/god.mp4';

const Subject = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <div className="subject">
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
          <li><Link to="/about">About</Link></li>
          <li><Link to="/subject" className="active fancy-active">Subjects</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <div className={`auth-buttons ${isNavOpen ? 'open' : ''}`}>
          <Link to="/login" className="auth-btn login-btn" onClick={toggleNav}>Login</Link>
          <Link to="/signup" className="auth-btn signup-btn" onClick={toggleNav}>Sign Up</Link>
        </div>
      </nav>
      <div className="content">
        <h1>Choose a Subject</h1>
        <div className="subject-boxes">
          <div className="subject-box">
            <h2>Math</h2>
          </div>
          <div className="subject-box">
            <h2>Biology</h2>
          </div>
          <div className="subject-box">
            <h2>Chemistry</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subject;
