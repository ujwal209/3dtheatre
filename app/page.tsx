'use client';

import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Import our modular components
import CinemaScreen from '@/components/cinema/CinemaScreen';
import TheaterEnvironment from '@/components/cinema/TheaterEnvironment';
import CameraDirector from '@/components/cinema/CameraDirector';

export default function CinemaPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [targetCameraPos, setTargetCameraPos] = useState<[number, number, number] | null>(null);
  
  // Settings State
  const [ambientColor, setAmbientColor] = useState('#00ffff');
  const [isMuted, setIsMuted] = useState(false);
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=crUpS21VCyo');
  const [inputUrl, setInputUrl] = useState('');
  
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const controlsRef = useRef<any>(null);

  const handleSeatClick = (seatPosition: [number, number, number]) => {
    setTargetCameraPos(seatPosition);
  };

  const resetCamera = () => {
    // 🌟 Release active iframe focus trap to immediately restore full scroll and 360 rotation to the canvas!
    if (typeof document !== 'undefined' && document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
    setTargetCameraPos(null);
  };

  return (
    // touch-none prevents the mobile browser from pulling-to-refresh or scrolling while using the 3D canvas
    <div className="relative w-full h-[100dvh] bg-[#010103] overflow-hidden text-slate-100 font-sans select-none touch-none">
      
      {/* 🚀 PREMIUM ENTRY BARRIER (Minimalist & Single Color Theme) 🚀 */}
      {!hasStarted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 transition-opacity duration-500">
          <div className="relative text-center w-full max-w-sm p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-2xl">
            <div className="relative z-10 flex flex-col items-center">
              <h1 className="text-2xl sm:text-3xl font-black mb-8 tracking-[0.2em] text-white font-mono uppercase">
                CINEMA
              </h1>
              <button 
                onClick={() => setHasStarted(true)}
                className="w-full relative px-6 py-4 bg-zinc-800/50 hover:bg-zinc-700/80 text-white rounded-lg text-xs font-mono font-bold tracking-[0.2em] transition-all duration-300 border border-zinc-600 active:scale-95"
              >
                ENTER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT DASHBOARD HEADER */}
      <div className="absolute top-0 left-0 z-20 w-full p-4 sm:p-6 flex justify-between items-center pointer-events-none gap-3">
        <div className="bg-black/70 p-3 rounded-lg border border-zinc-800/80 backdrop-blur-md shadow-2xl">
          <h1 className="text-[10px] sm:text-xs font-black tracking-widest text-slate-300 font-mono">CINEMA</h1>
        </div>
        
        <div className="flex gap-2 sm:gap-4 pointer-events-auto items-center">
          {targetCameraPos && (
            <button 
              onClick={resetCamera} 
              className="bg-cyan-950 hover:bg-cyan-900 border border-sky-800 text-sky-300 px-4 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold tracking-wider active:scale-95 transition-all shadow-lg"
            >
              STAND UP
            </button>
          )}

          <button
            onClick={() => {
              setInputUrl(videoUrl);
              setShowSettings(!showSettings);
            }}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 p-2 sm:p-2.5 rounded-lg text-zinc-300 transition-all active:scale-95 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* UNIFIED SETTINGS MODAL (Mobile Scrollable) */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl flex flex-col gap-5 max-h-[95vh] overflow-y-auto">
            <h2 className="text-sm sm:text-base font-bold font-mono text-white tracking-widest uppercase border-b border-zinc-800 pb-3">Cinema Settings</h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] sm:text-xs text-zinc-400 font-mono tracking-widest uppercase">Video Source URL</label>
              <input
                type="text"
                placeholder="YouTube URL, Video ID, or local MP4 path"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/60 rounded-lg px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 text-slate-100 placeholder-zinc-600 font-mono w-full"
              />
              <span className="text-[9px] text-zinc-500 font-mono">
                Supports YouTube videos, IDs, and direct MP4/WebM URLs.
              </span>
              
              {/* Presets Grid */}
              <div className="mt-1 flex flex-col gap-1.5">
                <span className="text-[9px] text-zinc-400 font-bold uppercase font-mono tracking-wider">Quick Presets</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInputUrl('/demo.mp4')}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono py-1.5 px-2 rounded text-zinc-300 text-left truncate transition-all active:scale-95 cursor-pointer"
                  >
                    🎬 Local Demo
                  </button>
                  <button
                    onClick={() => setInputUrl('https://www.youtube.com/watch?v=jfKfPfyJRdk')}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono py-1.5 px-2 rounded text-zinc-300 text-left truncate transition-all active:scale-95 cursor-pointer"
                  >
                    🎵 Lofi Beats (YT)
                  </button>
                  <button
                    onClick={() => setInputUrl('https://www.youtube.com/watch?v=m3zvVGJR914')}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono py-1.5 px-2 rounded text-zinc-300 text-left truncate transition-all active:scale-95 cursor-pointer"
                  >
                    🚀 Space Walk (YT)
                  </button>
                  <button
                    onClick={() => setInputUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono py-1.5 px-2 rounded text-zinc-300 text-left truncate transition-all active:scale-95 cursor-pointer"
                  >
                    🐰 Big Buck Bunny
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] sm:text-xs text-zinc-400 font-mono tracking-widest uppercase">Audio Control</label>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-full py-3 rounded-lg text-xs font-bold tracking-widest transition-colors border ${
                  isMuted ? 'bg-red-950/80 text-red-400 border-red-900/50 hover:bg-red-900' : 'bg-cyan-950/80 text-cyan-400 border-cyan-900/50 hover:bg-cyan-900'
                }`}
              >
                {isMuted ? '🔇 SYSTEM MUTED - UNMUTE' : '🔊 SYSTEM PLAYING - MUTE'}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] sm:text-xs text-zinc-400 font-mono tracking-widest uppercase">Ambient Glow Color</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={ambientColor}
                  onChange={(e) => setAmbientColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-xs font-mono text-zinc-300">{ambientColor.toUpperCase()}</span>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-zinc-800">
              <button onClick={() => setShowSettings(false)} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-5 py-2.5 rounded-lg text-xs font-mono text-zinc-300 transition-colors">
                Cancel
              </button>
              <button onClick={() => {
                // If the user cleared the text or entered spaces, default back to /demo.mp4
                const finalUrl = inputUrl.trim() ? inputUrl.trim() : '/demo.mp4';
                setVideoUrl(finalUrl);
                setShowSettings(false);
              }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold px-6 py-2.5 rounded-lg text-xs shadow-lg shadow-cyan-600/20 transition-all active:scale-95">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WEBGL CANVAS */}
      <div className="absolute inset-0 z-10 pointer-events-auto">
        <Canvas 
          onPointerDown={() => {
            // 🌟 Release active iframe focus trap to immediately restore full scroll and 360 rotation to the canvas!
            if (typeof document !== 'undefined' && document.activeElement && document.activeElement.tagName === 'IFRAME') {
              (document.activeElement as HTMLElement).blur();
            }
          }}
          shadows={{ type: THREE.PCFShadowMap }} 
          camera={{ 
            position: isMobile ? [0, 6, 14] : [0, 5, 12], 
            fov: isMobile ? 65 : 55 
          }} 
          className="pointer-events-auto"
        >
          <color attach="background" args={['#010103']} />
          <ambientLight intensity={0.2} color="#ffffff" />
          <spotLight position={[0, 20, 6]} intensity={3} color="#ffffff" angle={1.5} penumbra={1} castShadow />

          {hasStarted && (
            <Suspense fallback={null}>
              <CinemaScreen videoUrl={videoUrl} isMuted={isMuted} activeColorHex={ambientColor} />
            </Suspense>
          )}
          
          <TheaterEnvironment 
            onSeatSelect={handleSeatClick} 
            selectedSeatPos={targetCameraPos}
            activeColorHex={ambientColor}
          />
          
          <CameraDirector 
            targetPos={targetCameraPos} 
            controlsRef={controlsRef} 
            animating={isAnimating}
            setAnimating={setIsAnimating}
          />

          <OrbitControls 
            ref={controlsRef} 
            makeDefault
            target={[0, 8, 0]}
            enableDamping={true} 
            dampingFactor={0.05}
            enablePan={false}
            enabled={!isAnimating} // 🌟 ONLY disabled while gliding! Allows looking around when seated!
            enableZoom={!targetCameraPos && !isAnimating} 
            enableRotate={!isAnimating} 
          />
        </Canvas>
      </div>
    </div>
  );
}