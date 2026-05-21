'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface ScreenProps {
  videoUrl: string;
  isMuted: boolean;
  activeColorHex: string;
}

export default function CinemaScreen({ videoUrl, isMuted, activeColorHex }: ScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isYoutube, setIsYoutube] = useState(false);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState('');

  // Fallback to demo.mp4 if no video is selected or path is blank
  const activeUrl = videoUrl && videoUrl.trim() !== '' ? videoUrl.trim() : '/demo.mp4';

  // Robust YouTube URL and ID parser
  const getYouTubeEmbedUrl = (url: string, muted: boolean) => {
    let videoId = '';
    
    // Check various YouTube URL formats
    if (url.includes('youtube.com/watch')) {
      try {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v') || '';
      } catch (e) {
        const match = url.match(/[?&]v=([^&#]*)/);
        videoId = match ? match[1] : '';
      }
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube-nocookie.com/embed/')) {
      videoId = url.split('youtube-nocookie.com/embed/')[1]?.split('?')[0] || '';
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      videoId = url.trim();
    }

    if (!videoId) return '';

    const muteVal = muted ? '1' : '0';
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&mute=${muteVal}&enablejsapi=1&rel=0`;
  };

  // Track video type and URL updates
  useEffect(() => {
    const isYT = 
      activeUrl.includes('youtube.com') || 
      activeUrl.includes('youtu.be') || 
      activeUrl.includes('youtube-nocookie.com') ||
      /^[a-zA-Z0-9_-]{11}$/.test(activeUrl);

    setIsYoutube(isYT);

    if (isYT) {
      const embedUrl = getYouTubeEmbedUrl(activeUrl, isMuted);
      setYoutubeEmbedUrl(embedUrl);
    } else {
      setYoutubeEmbedUrl('');
    }
  }, [activeUrl]);

  // Handle direct video element synchronization
  useEffect(() => {
    if (!isYoutube && videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, isYoutube]);

  // Force autoplay fallback for direct videos on touch/gesture
  useEffect(() => {
    if (!isYoutube && videoRef.current) {
      videoRef.current.src = activeUrl;
      videoRef.current.load();
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const forcePlay = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(err => console.log('Autoplay deferred:', err));
            }
            window.removeEventListener('click', forcePlay);
            window.removeEventListener('touchstart', forcePlay);
          };
          window.addEventListener('click', forcePlay);
          window.addEventListener('touchstart', forcePlay);
        });
      }
    }
  }, [activeUrl, isYoutube]);

  // Snug and luxurious 16:9 VIP screening dimensions
  const screenWidth = 10;
  const screenHeight = 5.625;

  return (
    <group position={[0, 8, -10.5]}>
      {/* 🎬 3D Projection Screen Base */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[screenWidth, screenHeight]} />
        <meshBasicMaterial color="#000000" side={THREE.FrontSide} />
      </mesh>

      {/* 📺 INTERACTIVE HTML SCREEN */}
      <Html
        transform
        position={[0, 0, 0.05]}
        scale={[screenWidth / 12.8, screenHeight / 7.2, 1]}
        style={{
          width: '1280px',
          height: '720px',
          overflow: 'hidden',
          backgroundColor: '#000000',
          borderRadius: '8px',
          boxShadow: '0 0 50px rgba(0,0,0,0.92)',
          pointerEvents: 'none', // 🌟 PREVENT CLICKING TO PAUSE!
          userSelect: 'none',
          backfaceVisibility: 'hidden', // 🌟 INVISIBLE FROM BEHIND!
        }}
      >
        {isYoutube ? (
          youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              width="1280"
              height="720"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ 
                border: 'none', 
                width: '100%', 
                height: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0 
              }}
            />
          ) : (
            <div style={{ color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontFamily: 'monospace' }}>
              INVALID YOUTUBE URL / VIDEO ID
            </div>
          )
        ) : (
          <video
            ref={videoRef}
            loop
            playsInline
            autoPlay
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#000000',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        )}
      </Html>

      {/* Flat Screen Frame Bezel */}
      <mesh position={[0, 0, -0.15]}>
        <planeGeometry args={[screenWidth + 1.0, screenHeight + 1.0]} />
        <meshStandardMaterial color="#050507" roughness={1} side={THREE.FrontSide} />
      </mesh>

      {/* Dynamic Ambient Screen Backlight */}
      <pointLight position={[0, 0, 7]} intensity={95} distance={45} color={activeColorHex} />
    </group>
  );
}