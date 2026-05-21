'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

interface CameraDirectorProps {
  targetPos: [number, number, number] | null;
  controlsRef: React.MutableRefObject<any>;
  animating: boolean;
  setAnimating: (val: boolean) => void;
}

export default function CameraDirector({ targetPos, controlsRef, animating, setAnimating }: CameraDirectorProps) {
  const prevTarget = useRef<[number, number, number] | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🛑 STRICT CAMERA CONSTRAINTS
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (targetPos) {
      // 💺 SEATED VIEW LIMITS (Locked in the chair)
      controls.minDistance = 0.1;
      controls.maxDistance = 0.1; 
      
      controls.minAzimuthAngle = -Math.PI / 2.5; 
      controls.maxAzimuthAngle = Math.PI / 2.5;  
      
      controls.minPolarAngle = Math.PI / 2.5; 
      controls.maxPolarAngle = Math.PI / 1.8; 
      controls.enablePan = false; 
    } else {
      // 🚁 DEFAULT OVERVIEW LIMITS (Floating in the back)
      controls.minDistance = 5;
      controls.maxDistance = 60; 
      
      // 360-degree unrestricted circular turn!
      controls.minAzimuthAngle = -Infinity; 
      controls.maxAzimuthAngle = Infinity;  
      
      controls.minPolarAngle = Math.PI / 6; 
      controls.maxPolarAngle = Math.PI / 2 - 0.05;
      controls.enablePan = false; 
    }
  }, [targetPos, controlsRef]);

  // Trigger the glide animation only when targetPos changes
  useEffect(() => {
    if (targetPos !== prevTarget.current) {
      setAnimating(true);
      prevTarget.current = targetPos;

      // 🛡️ FAILSAFE TIMEOUT: React state updates are bulletproofly unlocked after 1.2s!
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [targetPos, setAnimating]);

  useFrame((state) => {
    if (controlsRef.current && !targetPos && !animating) {
      const controls = controlsRef.current;
      const distance = controls.getDistance();
      
      // 🛡️ DYNAMIC MATHEMATICAL GUARDRAIL
      // If we are zoomed out (distance > 9.5), we dynamically clamp the rotation angle 
      // so the camera physically cannot cross Z = -9.5 (right in front of the screen).
      // If zoomed in close (distance <= 9.5), the angle opens to Infinity for full 360 spin!
      if (distance > 9.5) {
        const maxAzimuth = Math.acos(-9.5 / distance);
        controls.minAzimuthAngle = -maxAzimuth;
        controls.maxAzimuthAngle = maxAzimuth;
      } else {
        controls.minAzimuthAngle = -Infinity;
        controls.maxAzimuthAngle = Infinity;
      }
    }

    if (animating && controlsRef.current) {
      if (targetPos) {
        // 1. WE ARE MOVING TO A SEAT
        const seat = new THREE.Vector3(targetPos[0], targetPos[1] + 1.6, targetPos[2] + 0.1);
        const screen = new THREE.Vector3(0, 13.5, -10.5);
        const direction = screen.clone().sub(seat).normalize();
        const lookAt = seat.clone().add(direction.multiplyScalar(0.1));

        state.camera.position.lerp(seat, 0.06);
        controlsRef.current.target.lerp(lookAt, 0.06);

        if (state.camera.position.distanceTo(seat) < 0.1) {
          setAnimating(false);
        }
      } else {
        // 2. WE ARE STANDING BACK UP
        const defaultPos = isMobile 
          ? new THREE.Vector3(0, 7, 24)
          : new THREE.Vector3(0, 6, 20);
        const defaultTarget = new THREE.Vector3(0, 8, 0);

        state.camera.position.lerp(defaultPos, 0.06);
        controlsRef.current.target.lerp(defaultTarget, 0.06);

        if (state.camera.position.distanceTo(defaultPos) < 0.1) {
          setAnimating(false);
        }
      }
      controlsRef.current.update();
    }
  });

  return null;
}