import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './Apple3DModel.css';

const AppleAR = ({ onClose }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(5, 5, 5);
    scene.add(spotLight);

    // Load the 3D model
    const loader = new GLTFLoader();
    let model;
    loader.load('/models/apple.glb', (gltf) => {
      model = gltf.scene;
      model.scale.set(0.05, 0.05, 0.05);
      model.position.set(0, 0, 0);
      scene.add(model);
    });

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Add device orientation controls
    let initialAlpha = null;
    let initialBeta = null;
    let initialGamma = null;

    const handleOrientation = (event) => {
      if (!model) return;

      if (initialAlpha === null) {
        initialAlpha = event.alpha;
        initialBeta = event.beta;
        initialGamma = event.gamma;
        return;
      }

      const alpha = event.alpha - initialAlpha;
      const beta = event.beta - initialBeta;
      const gamma = event.gamma - initialGamma;

      model.rotation.y = THREE.MathUtils.degToRad(alpha);
      model.rotation.x = THREE.MathUtils.degToRad(beta);
      model.rotation.z = THREE.MathUtils.degToRad(gamma);
    };

    // Request device orientation permission
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Get video feed
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          
          // Create video texture
          const videoTexture = new THREE.VideoTexture(video);
          const geometry = new THREE.PlaneGeometry(16, 9);
          geometry.scale(0.5, 0.5, 0.5);
          const material = new THREE.MeshBasicMaterial({ map: videoTexture });
          const screen = new THREE.Mesh(geometry, material);
          screen.position.z = -5;
          scene.add(screen);
        })
        .catch(console.error);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('deviceorientation', handleOrientation);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="apple-ar-container">
      <div ref={containerRef} className="ar-viewer" />
      <div className="ar-controls">
        <p className="ar-instructions">Move your device to view the 3D model in your environment</p>
        <button onClick={onClose} className="close-button">Exit AR View</button>
      </div>
    </div>
  );
};

export default AppleAR;
