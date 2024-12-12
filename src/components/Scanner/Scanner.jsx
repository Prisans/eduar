import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import './Scanner.css';

const Scanner = ({ onClose }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        console.log("MobileNet model loaded");
      } catch (err) {
        console.error("Error loading MobileNet model:", err);
        setError("Failed to load image recognition model. Please try again.");
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (isScanning) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isScanning]);

  const startCamera = async () => {
    console.log("Starting camera...");
    setError(null);
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            console.log("Camera is now active and scanning");
          };
        }
      } catch (err) {
        console.error("Error accessing the camera:", err);
        setError(`Error accessing the camera: ${err.message}. Please make sure you've granted camera permissions and try again.`);
        setIsScanning(false);
      }
    } else {
      setError("Camera access is not available on this device or browser.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current && model) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      try {
        const predictions = await model.classify(canvasRef.current);
        console.log("Image analysis result:", predictions);

        const heartRelated = predictions.some(p => 
          p.className.toLowerCase().includes('heart') || 
          p.className.toLowerCase().includes('cardiac') ||
          p.className.toLowerCase().includes('organ') ||
          p.className.toLowerCase().includes('anatomy')
        );

        if (heartRelated) {
          alert("Heart-related image detected!");
        } else {
          alert("No heart-related image detected. Make sure the image is clear and contains a heart diagram or illustration.");
        }
      } catch (err) {
        console.error("Error during image analysis:", err);
        setError("Failed to analyze the image. Please try again.");
      }
    } else {
      setError("Camera or image recognition model is not ready. Please try again.");
    }
  };

  return (
    <div className="scanner-overlay">
      <h2>Scan Heart Image</h2>
      {error && <p className="error-message">{error}</p>}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="scanner-video"
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} width="224" height="224" />
      <p className="scanner-instructions">
        Point the camera at a heart image in a book or on a screen. 
        Ensure the image is well-lit, clear, and fills most of the camera view.
      </p>
      <button onClick={captureImage} disabled={!model || !isScanning}>Scan</button>
      <button onClick={onClose}>Close Scanner</button>
    </div>
  );
};

export default Scanner;
