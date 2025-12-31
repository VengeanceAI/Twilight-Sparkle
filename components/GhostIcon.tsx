
import React from 'react';
// Fixed: Removed COLORS from '../types' as it is not exported there
import { GhostState } from '../types';
import { COLORS as GAME_COLORS } from '../constants';

interface GhostIconProps {
  color: string;
  state: string;
  size: number;
}

const GhostIcon: React.FC<GhostIconProps> = ({ color, state, size }) => {
  const isFrightened = state === 'FRIGHTENED';
  const isEaten = state === 'EATEN';
  const fillColor = isFrightened ? GAME_COLORS.FRIGHTENED : isEaten ? 'transparent' : color;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {/* Body */}
      {!isEaten && (
        <path 
          d="M 10 90 L 10 40 Q 10 10 50 10 Q 90 10 90 40 L 90 90 L 75 80 L 60 90 L 45 80 L 30 90 L 15 80 Z" 
          fill={fillColor} 
        />
      )}
      
      {/* Eyes */}
      <circle cx="35" cy="40" r="8" fill="white" />
      <circle cx="35" cy="40" r="4" fill={isFrightened ? "white" : "black"} />
      
      <circle cx="65" cy="40" r="8" fill="white" />
      <circle cx="65" cy="40" r="4" fill={isFrightened ? "white" : "black"} />

      {/* Scared Mouth */}
      {isFrightened && (
        <path d="M 30 70 Q 50 60 70 70" stroke="white" strokeWidth="3" fill="none" />
      )}
    </svg>
  );
};

export default GhostIcon;
