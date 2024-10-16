import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contact.css';
import backgroundVideo from '../../assets/bg.mp4';
import godVideo from '../../assets/god.mp4';

const Contact = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form after submission
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact">
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
          <li><Link to="/subject">Subjects</Link></li>
          <li><Link to="/contact" className="active fancy-active">Contact</Link></li>
        </ul>
        <div className={`auth-buttons ${isNavOpen ? 'open' : ''}`}>
          <Link to="/login" className="auth-btn login-btn" onClick={toggleNav}>Login</Link>
          <Link to="/signup" className="auth-btn signup-btn" onClick={toggleNav}>Sign Up</Link>
        </div>
      </nav>
      <div className="content">
        <h1>Thank You for Choosing Us!</h1>
        <p>We'd love to hear from you. Please submit your query or connect with us using the form below.</p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleInputChange}
            required
          ></textarea>
          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
