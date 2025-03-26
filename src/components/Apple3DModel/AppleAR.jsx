import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './Apple3DModel.css';

const AppleAR = ({ onClose }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.05);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const modelRef = useRef(null);
  const lastTapRef = useRef(0);

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
    renderer.setPixelRatio(window.devicePixelRatio);
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
    loader.load('/models/apple.glb', (gltf) => {
      const model = gltf.scene;
      model.scale.set(scale, scale, scale);
      
      // Center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      
      scene.add(model);
      modelRef.current = model;
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

    // Handle device orientation controls
    let initialAlpha = null;
    let initialBeta = null;
    let initialGamma = null;

    const handleOrientation = (event) => {
      if (!modelRef.current) return;

      if (initialAlpha === null) {
        initialAlpha = event.alpha;
        initialBeta = event.beta;
        initialGamma = event.gamma;
        return;
      }

      const alpha = event.alpha - initialAlpha;
      const beta = event.beta - initialBeta;
      const gamma = event.gamma - initialGamma;

      modelRef.current.rotation.y = THREE.MathUtils.degToRad(alpha);
      modelRef.current.rotation.x = THREE.MathUtils.degToRad(beta);
      modelRef.current.rotation.z = THREE.MathUtils.degToRad(gamma);
    };

    // Handle touch controls
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDistance = 0;

    const handleTouchStart = (event) => {
      if (event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        touchDistance = Math.sqrt(dx * dx + dy * dy);
      } else if (event.touches.length === 1) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
          setShowControls(prev => !prev);
        }
        lastTapRef.current = now;
      }
    };

    const handleTouchMove = (event) => {
      if (!modelRef.current) return;

      if (event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        
        const delta = (newDistance - touchDistance) * 0.001;
        const newScale = Math.max(0.01, Math.min(0.2, scale + delta));
        setScale(newScale);
        modelRef.current.scale.set(newScale, newScale, newScale);
        
        touchDistance = newDistance;
      } else if (event.touches.length === 1) {
        const dx = event.touches[0].clientX - touchStartX;
        const dy = event.touches[0].clientY - touchStartY;
        
        modelRef.current.rotation.y += dx * 0.005;
        modelRef.current.rotation.x += dy * 0.005;
        
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }
    };

    const handleWheel = (event) => {
      if (!modelRef.current) return;
      const delta = event.deltaY * -0.0001;
      const newScale = Math.max(0.01, Math.min(0.2, scale + delta));
      setScale(newScale);
      modelRef.current.scale.set(newScale, newScale, newScale);
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

    // Add event listeners
    renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: true });

    // Initialize video background
    const initializeVideoBackground = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          throw new Error('No video devices found');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true;
        
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.play().then(resolve).catch(resolve);
          };
        });

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

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

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

  const handleResize = (delta) => {
    if (!modelRef.current) return;
    const newScale = Math.max(0.01, Math.min(0.2, scale + delta));
    setScale(newScale);
    modelRef.current.scale.set(newScale, newScale, newScale);
  };

  return (
    <div className="apple-ar-container">
      <div ref={containerRef} className="ar-viewer" />
      {showControls && (
        <>
          {hasVideoError ? (
            <div className="ar-instructions ar-error">
              Camera access error. Please check your camera permissions and try again.
            </div>
          ) : (
            <div className="ar-instructions">
              • Double tap to show/hide controls<br/>
              • Pinch or scroll to resize<br/>
              • Drag to rotate
            </div>
          )}
          <div className="resize-controls">
            <button className="resize-button" onClick={() => handleResize(0.01)}>+</button>
            <button className="resize-button" onClick={() => handleResize(-0.01)}>-</button>
          </div>
          <div className="ar-controls">
            <button onClick={onClose} className="close-button">Exit AR</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AppleAR;
