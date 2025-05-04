import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import './Scanner.css';
import Apple3DModel from '../Apple3DModel/Apple3DModel';

const Scanner = ({ onClose }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [show3DModel, setShow3DModel] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        if (!tf.findBackend('webgl')) {
          console.error('WebGL not found');
          setError('WebGL is not supported in your browser. Please try a different browser.');
          return;
        }

        await tf.setBackend('webgl');
        await tf.ready();
        
        console.log('TensorFlow backend ready:', tf.getBackend());
        
        const loadedModel = await mobilenet.load({
          version: 2,
          alpha: 1.0
        });
        
        setModel(loadedModel);
        console.log("MobileNet model loaded successfully");
      } catch (err) {
        console.error("Detailed error loading model:", {
          message: err.message,
          stack: err.stack,
          backend: tf.getBackend(),
          backends: tf.engine().registryFactory.getKeys()
        });
        setError(`Failed to load model: ${err.message}. Please check your internet connection and try again.`);
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
    setIsScanning(true);  // Reset scanning state when starting camera
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
      }
    } else {
      setError("Camera access is not available on this device or browser.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const preprocessImage = (canvas) => {
    const tensor = tf.browser.fromPixels(canvas)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims();
    return tensor;
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current && model) {
      const context = canvasRef.current.getContext('2d');
      
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      
      context.clearRect(0, 0, videoWidth, videoHeight);
      context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
      
      try {
        const tensor = preprocessImage(canvasRef.current);
        
        // Get more predictions for better accuracy
        const predictions = await model.classify(tensor, 20);
        console.log("Raw predictions:", predictions);

        // Simplified terms for apple detection
        const appleRelatedTerms = [
          { term: 'apple', weight: 2.0 },
          { term: 'fruit', weight: 1.5 },
          { term: 'red delicious', weight: 1.5 },
          { term: 'granny smith', weight: 1.5 },
          { term: 'red apple', weight: 1.5 },
          { term: 'green apple', weight: 1.5 },
          { term: 'produce', weight: 1.0 },
          { term: 'food', weight: 0.5 }
        ];

        const matchedPredictions = predictions.map(prediction => {
          const predictionText = prediction.className.toLowerCase();
          let score = 0;
          let matchedTerms = [];

          appleRelatedTerms.forEach(({ term, weight }) => {
            if (predictionText.includes(term)) {
              score += prediction.probability * weight;
              matchedTerms.push(term);
            }
          });

          return {
            ...prediction,
            score,
            matchedTerms
          };
        }).filter(p => p.score > 0);

        matchedPredictions.sort((a, b) => b.score - a.score);
        const totalScore = matchedPredictions.reduce((sum, pred) => sum + pred.score, 0);
        
        // Lower threshold for apple detection since it's simpler
        const isApple = totalScore > 0.1 || 
                       (matchedPredictions.length > 0 && matchedPredictions[0].score > 0.2);

        if (isApple) {
          const bestMatch = matchedPredictions[0];
          
          alert(`Apple Detected! 🍎\n` +
                `Confidence: ${Math.round(totalScore * 100)}%\n` +
                `Type: ${bestMatch.className}`);
          
          console.log("Matched predictions:", matchedPredictions);
          console.log("Total score:", totalScore);
          console.log("Best match:", bestMatch);
          
          // Show 3D model
          setShow3DModel(true);
        } else {
          alert("No apple image detected. Please ensure:\n\n" +
                "1. The apple image is clear and centered\n" +
                "2. The image fills most of the camera frame\n" +
                "3. Hold your device steady\n" +
                "4. Try different angles or distances (6-12 inches works best)\n" +
                "5. Ensure good lighting");
        }

        tensor.dispose();
      } catch (err) {
        console.error("Error during image analysis:", err);
        setError("Failed to analyze the image. Please try again.");
      }
    } else {
      setError("Camera or image recognition model is not ready. Please try again.");
    }
  };

  return (
    <>
      <div className="scanner-overlay">
        <h2>Scan Apple Image</h2>
        {error && <p className="error-message">{error}</p>}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="scanner-video"
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} width="224" height="224" />
        <p className="scanner-instructions">
          Point the camera at an apple image in a book, screen, or any source. 
          Make sure the image is clear and well-lit.
        </p>
        <button onClick={captureImage} disabled={!model || !isScanning}>Scan</button>
        <button onClick={onClose}>Close Scanner</button>
      </div>
      {show3DModel && (
        <Apple3DModel onClose={() => setShow3DModel(false)} />
      )}
    </>
  );
};

export default Scanner;
