import React, { useEffect } from 'react';
import './NikeShoes3DModel.css';

const NikeShoes3DModel = ({ onClose }) => {
  useEffect(() => {
    // Load the 3D model viewer script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@google/model-viewer@1.12.0/dist/model-viewer.min.js';
    script.type = 'module';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="model-overlay">
      <div className="model-container">
        <h2>Nike Shoes 3D Model</h2>
        <div className="model-viewer">
          <model-viewer
            src="/models/nike.glb"
            alt="3D model of Nike shoes"
            auto-rotate
            camera-controls
            shadow-intensity="1"
            style={{ width: '100%', height: '400px' }}
          ></model-viewer>
        </div>
        <button onClick={onClose}>Close Model</button>
      </div>
    </div>
  );
};

export default NikeShoes3DModel;
