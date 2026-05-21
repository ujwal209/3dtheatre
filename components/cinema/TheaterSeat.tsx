'use client';

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface SeatProps {
  position: [number, number, number];
  label: string;
  onSelect: (pos: [number, number, number]) => void;
  isSelected: boolean;
  activeColorHex: string;
}

export default function TheaterSeat({ position, label, onSelect, isSelected, activeColorHex }: SeatProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Refs for smooth animations
  const groupRef = useRef<THREE.Group>(null);
  const backrestRef = useRef<THREE.Group>(null);
  const footrestRef = useRef<THREE.Group>(null);

  // Material setup - simulating high-end theater leather
  const baseColor = isSelected ? activeColorHex : isHovered ? '#1c1c1f' : '#0f0f11';
  const armrestColor = '#0a0a0c';
  const accentColor = isSelected ? '#ffffff' : isHovered ? '#ffffff' : '#2a2a2e';

  const leatherMaterial = (
    <meshPhysicalMaterial
      color={baseColor}
      roughness={0.75}
      metalness={0.1}
      clearcoat={0.15}
      clearcoatRoughness={0.8}
      sheen={0.4}
      sheenColor={new THREE.Color(0xffffff)}
    />
  );

  const hardPlasticMaterial = (
    <meshStandardMaterial color={armrestColor} roughness={0.9} metalness={0.3} />
  );

  // Smooth Animations Loop
  useFrame((state, delta) => {
    if (!groupRef.current || !backrestRef.current || !footrestRef.current) return;

    // 1. Subtle scale up on hover (if not selected)
    const targetScale = isHovered && !isSelected ? 1.03 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);

    // 2. Recliner Animation!
    // Leans back (positive rotation on X axis leans it towards +Z)
    const targetBackrestX = isSelected ? 0.35 : 0.05; 
    
    // Swings up (positive rotation on X axis swings it forward from -Y to -Z)
    const targetFootrestX = isSelected ? Math.PI / 2.2 : -0.15; 

    backrestRef.current.rotation.x = THREE.MathUtils.lerp(backrestRef.current.rotation.x, targetBackrestX, delta * 5);
    footrestRef.current.rotation.x = THREE.MathUtils.lerp(footrestRef.current.rotation.x, targetFootrestX, delta * 6);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[1.35, 1.35, 1.35]} // 🌟 Scale the seat up by 1.35x to make it massive and chunky!
      rotation={[0, 0, 0]} 
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        setIsHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
        setIsHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(position);
      }}
    >
      {/* 🚀 LED UNDERGLOW (Theater Floor Lighting) */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial
          color={isSelected ? activeColorHex : isHovered ? '#444' : '#000'}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 💺 BOTTOM SEAT CUSHION */}
      <RoundedBox args={[1.2, 0.35, 1.1]} radius={0.08} smoothness={4} position={[0, 0.35, 0]} castShadow receiveShadow>
        {leatherMaterial}
      </RoundedBox>

      {/* 🦵 DYNAMIC FOOTREST (Pivots at the front of the seat: z = -0.5) */}
      <group ref={footrestRef} position={[0, 0.25, -0.5]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[1.1, 0.5, 0.15]} />
          {leatherMaterial}
        </mesh>
      </group>

      {/* 🛋️ ANIMATED BACKREST (Pivots at the back of the seat: z = 0.4) */}
      <group ref={backrestRef} position={[0, 0.45, 0.4]}>
        {/* Lower Lumbar Support */}
        <RoundedBox args={[1.15, 0.5, 0.25]} radius={0.05} smoothness={4} position={[0, 0.25, 0]} castShadow receiveShadow>
          {leatherMaterial}
        </RoundedBox>
        {/* Upper Back */}
        <RoundedBox args={[1.15, 0.6, 0.2]} radius={0.05} smoothness={4} position={[0, 0.75, 0.05]} castShadow receiveShadow>
          {leatherMaterial}
        </RoundedBox>
        {/* Headrest */}
        <RoundedBox args={[0.8, 0.35, 0.25]} radius={0.08} smoothness={4} position={[0, 1.25, 0.1]} castShadow>
          {leatherMaterial}
        </RoundedBox>
        
        {/* Seat Number Label (Facing forward towards -Z) */}
        <Text
          position={[0, 1.45, -0.06]}
          fontSize={0.12}
          color={activeColorHex}
          anchorX="center"
          fontWeight="bold"
          rotation={[0, 0, 0]}
        >
          {label}
        </Text>
      </group>

      {/* 💪 LEFT ARMREST (from sitter's perspective facing -Z) */}
      <group position={[-0.75, 0, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.7, 1.3]} />
          {hardPlasticMaterial}
        </mesh>
        <RoundedBox args={[0.25, 0.1, 1.35]} radius={0.03} smoothness={2} position={[0, 0.75, 0]} castShadow>
          {leatherMaterial}
        </RoundedBox>
        {/* Cup Holder - Positioned at the front of the armrest (z = -0.4) */}
        <mesh position={[0, 0.76, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.06, 0.08, 32]} />
          <meshStandardMaterial color={activeColorHex} emissive={isSelected ? activeColorHex : '#000'} emissiveIntensity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.72, -0.4]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.08, 32]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>

      {/* 💪 RIGHT ARMREST */}
      <group position={[0.75, 0, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.7, 1.3]} />
          {hardPlasticMaterial}
        </mesh>
        <RoundedBox args={[0.25, 0.1, 1.35]} radius={0.03} smoothness={2} position={[0, 0.75, 0]} castShadow>
          {leatherMaterial}
        </RoundedBox>
        {/* Cup Holder */}
        <mesh position={[0, 0.76, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.06, 0.08, 32]} />
          <meshStandardMaterial color={activeColorHex} emissive={isSelected ? activeColorHex : '#000'} emissiveIntensity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.72, -0.4]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.08, 32]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>

      {/* 🌐 3D FLOATING HTML HUD OVERLAY */}
      {isHovered && !isSelected && (
        <Html center position={[0, 3.2, 0]} zIndexRange={[9999990, 9999900]}>
          <div
            className="bg-zinc-950/90 border p-4 rounded-xl shadow-2xl backdrop-blur-xl w-52 flex flex-col gap-2 pointer-events-auto transform transition-all scale-100 animate-in fade-in zoom-in duration-150 cursor-pointer"
            style={{ borderColor: `${activeColorHex}66`, boxShadow: `0 10px 30px -10px ${activeColorHex}44`, zIndex: 9999999 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(position);
              setIsHovered(false);
            }}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-white text-sm font-black tracking-widest font-mono">SEAT {label}</h3>
              <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider" style={{ backgroundColor: `${activeColorHex}33`, color: activeColorHex }}>
                VIP Recliner
              </span>
            </div>
            <p className="text-zinc-400 text-[10px] leading-relaxed mb-2 font-medium">
              Premium ergonomic leather. Features automated reclining and recessed cup holders.
            </p>
            <button
              className="text-white text-[11px] py-2.5 rounded-lg w-full font-bold tracking-widest uppercase transition-all shadow-lg hover:brightness-110 active:scale-95"
              style={{ backgroundColor: activeColorHex, boxShadow: `0 4px 14px 0 ${activeColorHex}66` }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(position);
                setIsHovered(false);
              }}
            >
              Select Seat
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}