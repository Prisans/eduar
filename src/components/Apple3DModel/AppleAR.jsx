import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './Apple3DModel.css';

const AppleAR = ({ onClose }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.05);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Make renderer fullscreen
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '1';

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
      model.scale.set(scale, scale, scale);
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

    // Handle pinch/wheel for resizing
    let touchDistance = 0;
    const handleTouchStart = (event) => {
      if (event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        touchDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (event) => {
      if (event.touches.length === 2 && model) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        
        const delta = newDistance - touchDistance;
        const newScale = Math.max(0.01, scale + delta * 0.0001);
        setScale(newScale);
        model.scale.set(newScale, newScale, newScale);
        
        touchDistance = newDistance;
      }
    };

    const handleWheel = (event) => {
      if (model) {
        const delta = event.deltaY * -0.0001;
        const newScale = Math.max(0.01, scale + delta);
        setScale(newScale);
        model.scale.set(newScale, newScale, newScale);
      }
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

    // Add event listeners for resizing
    renderer.domElement.addEventListener('touchstart', handleTouchStart);
    renderer.domElement.addEventListener('touchmove', handleTouchMove);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Initialize video background
    const initializeVideoBackground = async () => {
      try {
        // Try to get a list of available video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          throw new Error('No video devices found');
        }

        // Start with lower resolution constraints
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true; // Important for iOS
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.play().then(resolve).catch(resolve);
          };
        });

        // Create video texture
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        
        const aspectRatio = window.innerWidth / window.innerHeight;
        const geometry = new THREE.PlaneGeometry(aspectRatio * 2, 2);
        const material = new THREE.MeshBasicMaterial({ 
          map: videoTexture,
          side: THREE.DoubleSide
        });
        
        const screen = new THREE.Mesh(geometry, material);
        screen.position.z = -5;
        scene.add(screen);
        
      } catch (error) {
        console.error('Video initialization error:', error);
        setHasVideoError(true);
      }
    };

    initializeVideoBackground();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('deviceorientation', handleOrientation);
      renderer.domElement.removeEventListener('touchstart', handleTouchStart);
      renderer.domElement.removeEventListener('touchmove', handleTouchMove);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [scale]);

  return (
    <div className="apple-ar-container">
      <div ref={containerRef} className="ar-viewer" />
      <div className="ar-controls">
        {hasVideoError ? (
          <p className="ar-error">Camera access error. Please check your camera permissions and try again.</p>
        ) : (
          <p className="ar-instructions">
            Move your device to view the 3D model<br/>
            Pinch or use mouse wheel to resize
          </p>
        )}
        <button onClick={onClose} className="close-button">Exit AR View</button>
      </div>
    </div>
  );
};

export default AppleAR;
