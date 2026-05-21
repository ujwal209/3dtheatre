'use client';

import React from 'react';
import TheaterSeat from './TheaterSeat';

interface EnvironmentProps {
  onSeatSelect: (pos: [number, number, number]) => void;
  selectedSeatPos: [number, number, number] | null;
  activeColorHex: string;
}

export default function TheaterEnvironment({ onSeatSelect, selectedSeatPos, activeColorHex }: EnvironmentProps) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const seatsPerRow = 8;
  const seats = [];
  const stairSteps = [];

  // Snugly proportioned theater steps to match the 22-unit wide screen
  const stepWidth = 28; 
  const stepDepth = 2.5; 
  const stepHeight = 0.8;

  rows.forEach((row, rowIndex) => {
    const currentZ = rowIndex * stepDepth + 2;
    const currentY = (rowIndex * stepHeight) / 2;
    const stepHeightTotal = (rowIndex * stepHeight) + 0.1;

    stairSteps.push(
      <group key={`step-${row}`} position={[0, currentY, currentZ]}>
        <mesh receiveShadow>
          <boxGeometry args={[stepWidth, stepHeightTotal, stepDepth]} />
          <meshStandardMaterial color="#07070a" roughness={0.9} />
        </mesh>
        
        {/* Glowing stair LEDs */}
        <mesh position={[-1.7, stepHeightTotal / 2 - 0.005, 0]}>
          <boxGeometry args={[0.04, 0.01, stepDepth]} />
          <meshStandardMaterial emissive={activeColorHex} emissiveIntensity={3} color={activeColorHex} toneMapped={false} />
        </mesh>
        <mesh position={[1.7, stepHeightTotal / 2 - 0.005, 0]}>
          <boxGeometry args={[0.04, 0.01, stepDepth]} />
          <meshStandardMaterial emissive={activeColorHex} emissiveIntensity={3} color={activeColorHex} toneMapped={false} />
        </mesh>
      </group>
    );

    for (let i = 0; i < seatsPerRow; i++) {
      const isRightSide = i >= seatsPerRow / 2;
      const aisleGap = isRightSide ? 2.2 : -2.2;
      const x = (i - seatsPerRow / 2 + 0.5) * 2.3 + aisleGap;
      const y = rowIndex * stepHeight + 0.05; 
      const z = currentZ; 
      const labelName = `${row}${i + 1}`;
      
      const isSelected = selectedSeatPos !== null && selectedSeatPos[0] === x && selectedSeatPos[2] === z;

      seats.push(
        <TheaterSeat 
          key={labelName} 
          position={[x, y, z]} 
          label={labelName} 
          onSelect={onSeatSelect} 
          isSelected={isSelected} 
          activeColorHex={activeColorHex} 
        />
      );
    }
  });

  return (
    <group>
      {/* Wall coordinates pushed wide and deep to seal the massive 360 room! */}
      <mesh position={[-25, 6, 0]}><boxGeometry args={[0.4, 20, 60]} /><meshStandardMaterial color="#020204" roughness={1} /></mesh>
      <mesh position={[25, 6, 0]}><boxGeometry args={[0.4, 20, 60]} /><meshStandardMaterial color="#020204" roughness={1} /></mesh>
      
      {/* Front and Back Walls to completely enclose the camera during 360 orbit */}
      <mesh position={[0, 6, -28]}><boxGeometry args={[50, 20, 0.4]} /><meshStandardMaterial color="#020204" roughness={1} /></mesh>
      <mesh position={[0, 6, 28]}><boxGeometry args={[50, 20, 0.4]} /><meshStandardMaterial color="#020204" roughness={1} /></mesh>
      
      {stairSteps}
      {seats}
      
      {/* Floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#010103" roughness={0.9} />
      </mesh>
    </group>
  );
}