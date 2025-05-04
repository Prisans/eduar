import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import './Scanner.css';
import Apple3DModel from '../Apple3DModel/Apple3DModel';
import Banana3DModel from '../Banana3DModel/Banana3DModel';
import NikeShoes3DModel from '../NikeShoes3DModel/NikeShoes3DModel';
import Brain3DModel from '../Brain3DModel/Brain3DModel';
import Bottle3DModel from '../Bottle3DModel/Bottle3DModel';

const Scanner = ({ onClose }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);
  const [detectedObject, setDetectedObject] = useState(null);
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

  const scanImage = async () => {
    if (!videoRef.current || !canvasRef.current || !model) {
      setError("Camera or image recognition model is not ready. Please try again.");
      return;
    }

    const context = canvasRef.current.getContext('2d');
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    
    context.clearRect(0, 0, videoWidth, videoHeight);
    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    
    try {
      const tensor = preprocessImage(canvasRef.current);
      const predictions = await model.classify(tensor, 20);
      console.log("Raw predictions:", predictions);

      // Define detection terms for objects
      const detectionTerms = {
        apple: [
          { term: 'apple', weight: 2.0 },
          { term: 'fruit', weight: 1.5 },
          { term: 'red delicious', weight: 1.5 },
          { term: 'granny smith', weight: 1.5 },
          { term: 'red apple', weight: 1.5 },
          { term: 'green apple', weight: 1.5 },
          { term: 'produce', weight: 1.0 },
          { term: 'food', weight: 0.5 }
        ],
        banana: [
          { term: 'banana', weight: 2.0 },
          { term: 'fruit', weight: 1.5 },
          { term: 'plantain', weight: 1.5 },
          { term: 'yellow banana', weight: 1.5 },
          { term: 'ripe banana', weight: 1.5 },
          { term: 'produce', weight: 1.0 },
          { term: 'food', weight: 0.5 }
        ],
        shoes: [
          { term: 'shoe', weight: 2.0 },
          { term: 'sneaker', weight: 2.0 },
          { term: 'nike', weight: 2.0 },
          { term: 'footwear', weight: 1.5 },
          { term: 'running shoe', weight: 1.5 },
          { term: 'athletic shoe', weight: 1.5 },
          { term: 'sports shoe', weight: 1.5 }
        ],
        brain: [
          { term: 'brain', weight: 2.0 },
          { term: 'organ', weight: 1.5 },
          { term: 'cerebral', weight: 1.5 },
          { term: 'anatomy', weight: 1.5 },
          { term: 'medical', weight: 1.0 },
          { term: 'nervous system', weight: 1.0 }
        ],
        bottle: [
          { term: 'bottle', weight: 2.0 },
          { term: 'container', weight: 1.5 },
          { term: 'water bottle', weight: 1.5 },
          { term: 'plastic bottle', weight: 1.5 },
          { term: 'glass bottle', weight: 1.5 },
          { term: 'drink', weight: 1.0 },
          { term: 'beverage', weight: 1.0 }
        ]
      };

      // Calculate scores for objects
      const scores = {};
      Object.keys(detectionTerms).forEach(objectType => {
        const matchedPredictions = predictions.map(prediction => {
          const predictionText = prediction.className.toLowerCase();
          let score = 0;
          let matchedTerms = [];

          detectionTerms[objectType].forEach(({ term, weight }) => {
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
        scores[objectType] = {
          totalScore: matchedPredictions.reduce((sum, pred) => sum + pred.score, 0),
          bestMatch: matchedPredictions[0] || null
        };
      });

      // Determine which object was detected (if any)
      const detectedScores = Object.entries(scores)
        .filter(([type, score]) => score.totalScore > 0.1)
        .sort(([typeA, dataA], [typeB, dataB]) => dataB.totalScore - dataA.totalScore);

      if (detectedScores.length > 0) {
        const [objectType, scoreData] = detectedScores[0];
        setDetectedObject(objectType);
        
        const emojis = {
          apple: '🍎',
          banana: '🍌',
          shoes: '👟',
          brain: '🧠',
          bottle: '🍾'
        };
        
        alert(`${objectType.charAt(0).toUpperCase() + objectType.slice(1)} Detected! ${emojis[objectType]}\n` +
              `Confidence: ${Math.round(scoreData.totalScore * 100)}%\n` +
              `Type: ${scoreData.bestMatch?.className}`);
        
        console.log(`${objectType} detection:`, scoreData);
        setShow3DModel(true);
      } else {
        setDetectedObject(null);
        setShow3DModel(false);
        alert("No object detected. Please ensure:\n\n" +
              "1. The image is clear and centered\n" +
              "2. The image fills most of the camera frame\n" +
              "3. Hold your device steady\n" +
              "4. Try different angles or distances (6-12 inches works best)\n" +
              "5. Ensure good lighting");
      }

      tensor.dispose();
    } catch (err) {
      console.error("Error during scanning:", err);
      setError("Failed to analyze the image. Please try again.");
    }
  };

  return (
    <>
      <div className="scanner-overlay">
        <h2>Object Scanner</h2>
        {error && <p className="error-message">{error}</p>}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="scanner-video"
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} width="224" height="224" />
        <p className="scanner-instructions">
          Point the camera at the object you want to scan, then click the Scan button.
        </p>
        <button onClick={scanImage} disabled={!model || !isScanning}>Scan</button>
        <button onClick={onClose}>Close Scanner</button>
      </div>
      {show3DModel && (
        detectedObject === 'apple' ? (
          <Apple3DModel onClose={() => setShow3DModel(false)} />
        ) : detectedObject === 'banana' ? (
          <Banana3DModel onClose={() => setShow3DModel(false)} />
        ) : detectedObject === 'shoes' ? (
          <NikeShoes3DModel onClose={() => setShow3DModel(false)} />
        ) : detectedObject === 'brain' ? (
          <Brain3DModel onClose={() => setShow3DModel(false)} />
        ) : (
          <Bottle3DModel onClose={() => setShow3DModel(false)} />
        )
      )}
    </>
  );
};

export default Scanner;
