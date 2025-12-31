
import React, { useEffect, useState } from 'react';

interface TwilightIconProps {
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';
  size: number;
}

const TwilightIcon: React.FC<TwilightIconProps> = ({ direction, size }) => {
  const [step, setStep] = useState(0);
  const isMoving = direction !== 'NONE';

  // Animation cycle for walking (legs/hands movement)
  useEffect(() => {
    if (!isMoving) {
      setStep(0);
      return;
    }
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % 2);
    }, 120); // Faster cycle for more energetic walking
    return () => clearInterval(interval);
  }, [isMoving]);

  // Flip the sprite based on direction
  const isFlipped = direction === 'LEFT';
  
  // Rotation for maze orientation (optional, but keeping it subtle)
  const rotation = direction === 'UP' ? -15 : direction === 'DOWN' ? 15 : 0;

  // Colors from reference image
  const bodyColor = "#D19FE8"; 
  const maneColor = "#2B1155"; 
  const stripePink = "#FB5296"; 
  const stripePurple = "#9E5CF6"; 
  const wingColor = "#E2C1F0"; 

  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        transform: `rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <svg width={size * 1.5} height={size * 1.5} viewBox="0 0 100 100">
        {/* Tail */}
        <path 
          d="M 20 65 Q 5 60 5 85 Q 5 100 20 95 Q 25 80 20 65" 
          fill={maneColor} 
        />
        <path d="M 8 70 Q 12 80 18 90" stroke={stripePink} strokeWidth="2" fill="none" />

        {/* Back Legs - Far Side */}
        <rect 
          x="35" 
          y={isMoving && step === 0 ? "72" : "78"} 
          width="10" 
          height="18" 
          rx="3" 
          fill="#B080C8" 
        />
        <rect 
          x="55" 
          y={isMoving && step === 1 ? "72" : "78"} 
          width="10" 
          height="18" 
          rx="3" 
          fill="#B080C8" 
        />

        {/* Body */}
        <path 
          d="M 25 45 Q 25 80 55 80 L 75 80 Q 90 80 90 60 Q 90 40 70 40 L 40 40 Q 25 40 25 45" 
          fill={bodyColor} 
        />

        {/* Cutie Mark */}
        <g transform="translate(42, 60) scale(0.35)">
          <path d="M 0 -15 L 4 -4 L 15 0 L 4 4 L 0 15 L -4 4 L -15 0 L -4 -4 Z" fill={stripePink} />
          <circle cx="12" cy="-12" r="3" fill="white" />
          <circle cx="-12" cy="-12" r="3" fill="white" />
          <circle cx="12" cy="12" r="3" fill="white" />
          <circle cx="-12" cy="12" r="3" fill="white" />
        </g>

        {/* Wings (Alicorn) */}
        <g style={{ transform: isMoving ? `rotate(${step === 0 ? -8 : 0}deg)` : 'none', transformOrigin: '40px 45px' }}>
          <path 
            d="M 40 45 Q 25 15 55 20 Q 65 10 75 25 Q 50 35 40 45" 
            fill={wingColor} 
            stroke={bodyColor}
            strokeWidth="0.5"
          />
        </g>

        {/* Front Legs - Near Side */}
        <rect 
          x="68" 
          y={isMoving && step === 1 ? "72" : "78"} 
          width="10" 
          height="18" 
          rx="3" 
          fill={bodyColor} 
        />
        <rect 
          x="82" 
          y={isMoving && step === 0 ? "72" : "78"} 
          width="10" 
          height="18" 
          rx="3" 
          fill={bodyColor} 
        />

        {/* Neck & Head */}
        <path d="M 75 45 L 85 30 Q 95 15 105 30 Q 110 45 95 60 L 75 60 Z" fill={bodyColor} />
        
        {/* Horn */}
        <path d="M 92 22 L 102 2 L 108 18 Z" fill={bodyColor} stroke="#BA68C8" strokeWidth="0.5" />

        {/* Eye */}
        <ellipse cx="98" cy="35" rx="4" ry="7" fill="white" />
        <ellipse cx="100" cy="35" rx="2.5" ry="4.5" fill="#4B0082" />
        <circle cx="100.5" cy="33.5" r="1.2" fill="white" />

        {/* Mane (Hair) */}
        <path 
          d="M 85 25 Q 100 0 115 25 L 110 45 Q 100 50 90 40 Z" 
          fill={maneColor} 
        />
        <path d="M 95 12 L 105 32" stroke={stripePink} strokeWidth="1.5" fill="none" />
        <path d="M 100 10 L 110 30" stroke={stripePurple} strokeWidth="1" fill="none" />

        {/* Bangs */}
        <path d="M 85 25 L 75 45 Q 85 55 95 45 Z" fill={maneColor} />
        <path d="M 82 30 L 78 43" stroke={stripePink} strokeWidth="1.2" fill="none" />
      </svg>
    </div>
  );
};

export default TwilightIcon;
