import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import './Apple3DModel.css';

// Simple fallback component while loading
const Loader = () => {
  return (
    <div className="loader">
      <p>Loading 3D Model...</p>
    </div>
  );
};

// Simple apple using basic shapes
function SimpleApple() {
  return (
    <group>
      {/* Main apple body */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ff0000" metalness={0.1} roughness={0.2} />
      </mesh>
      
      {/* Apple stem */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
        <meshStandardMaterial color="#4d2600" />
      </mesh>
    </group>
  );
}

const Apple3DModel = ({ onClose }) => {
  return (
    <div className="apple-3d-container">
      <div className="model-viewer">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: '#1a1a1a' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Suspense fallback={<Loader />}>
            <SimpleApple />
          </Suspense>
          
          <OrbitControls
            enableZoom={true}
            autoRotate={true}
            autoRotateSpeed={2}
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

export default Apple3DModel; 