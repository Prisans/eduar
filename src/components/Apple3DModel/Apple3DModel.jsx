import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import './Apple3DModel.css';

function Model() {
  const { scene } = useGLTF('/models/apple.glb');
  return <primitive object={scene} scale={0.05} position={[0, 0, 0]} />;
}

const Loader = () => (
  <div className="loader">
    <p>Loading 3D Model...</p>
  </div>
);

const Apple3DModel = ({ onClose }) => {
  return (
    <div className="apple-3d-container">
      <div className="model-viewer">
        <Canvas
          camera={{ position: [8, 0, 0], fov: 30 }}
          style={{ background: '#1a1a1a' }}
          gl={{ antialias: true }}
        >
          {/* Lighting setup */}
          <ambientLight intensity={0.6} />
          <spotLight
            position={[5, 5, 5]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
          />
          <pointLight position={[-5, 5, 5]} intensity={0.5} />

          <Suspense fallback={<Loader />}>
            <Model />
          </Suspense>

          <OrbitControls
            enableZoom={true}
            autoRotate={true}
            autoRotateSpeed={2}
            minDistance={6}
            maxDistance={12}
            enableDamping
            dampingFactor={0.05}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      <div className="controls">
        <p>Drag to rotate • Scroll to zoom • Auto-rotating</p>
        <button onClick={onClose}>Close 3D View</button>
      </div>
    </div>
  );
};

// Pre-load the model
useGLTF.preload('/models/apple.glb');

export default Apple3DModel; 