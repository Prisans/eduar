import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import backgroundVideo from '../../assets/bg.mp4';
import godVideo from '../../assets/god.mp4';

const Home = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleStartNow = () => {
    console.log("Start Now button clicked");
    setIsScanning(true);
  };

  useEffect(() => {
    if (isScanning) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isScanning]);

  const startCamera = async () => {
    console.log("Starting camera...");
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
        });
        console.log("Camera stream obtained:", stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            console.log("Camera is now active and scanning");
          };
        } else {
          console.error("Video ref is null");
        }
      } catch (err) {
        console.error("Error accessing the camera:", err);
        alert(`Error accessing the camera: ${err.message}. Please make sure you've granted camera permissions and try again.`);
        setIsScanning(false);
      }
    } else {
      console.error("getUserMedia is not supported");
      alert("Camera access is not available on this device or browser.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      console.log("Camera stopped");
    }
  };

  const captureImage = () => {
    console.log("Capturing image...");
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
      console.log("Image captured:", imageDataUrl.substring(0, 50) + "...");
      alert("Image captured! You can process it further or send it to your backend.");
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleCloseScanner = () => {
    console.log("Closing scanner...");
    setIsScanning(false);
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
      {isScanning && (
        <div className="scanner-overlay">
          <h2>Scan Diagram</h2>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="scanner-video"
            style={{ width: '100%', maxWidth: '640px', height: 'auto' }}
            onLoadedMetadata={() => console.log("Video metadata loaded")}
            onPlay={() => console.log("Video started playing")}
            onError={(e) => console.error("Video error:", e)}
          />
          <p>Camera status: {videoRef.current && videoRef.current.srcObject ? 'Active' : 'Inactive'}</p>
          <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
          <button onClick={captureImage}>Scan</button>
          <button onClick={handleCloseScanner}>Close Scanner</button>
        </div>
      )}
    </div>
  );
};

export default Home;
