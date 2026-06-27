import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface FinomeLogoProps {
  threatLevel?: number;
  isPlaying?: boolean;
  size?: number;
  className?: string;
}

export const FinomeLogo: React.FC<FinomeLogoProps> = ({
  threatLevel = 45,
  isPlaying = false,
  size = 48,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine core colors based on threat level
  const isHighThreat = threatLevel > 75;
  const coreColor = isHighThreat ? '#FF1F1F' : isHovered ? '#00F0FF' : '#FFB000';
  const glowFilterId = `finome-logo-glow-${threatLevel}-${isHovered ? 'hover' : 'idle'}`;

  // Speed of rotation increases when playing scenarios, hovered, or during high threat
  const rotationDuration = isHighThreat ? 4 : isPlaying ? 8 : isHovered ? 6 : 15;
  const innerRotationDuration = isHighThreat ? -3 : isPlaying ? -6 : isHovered ? -5 : -12;

  return (
    <motion.div
      className={cn("relative flex items-center justify-center cursor-pointer select-none", className)}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background radial glow */}
      <div 
        className="absolute inset-0 rounded-full blur-[12px] opacity-40 transition-all duration-500"
        style={{
          background: `radial-gradient(circle, ${coreColor} 0%, transparent 70%)`
        }}
      />

      {/* SVG Canvas */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
      >
        <defs>
          {/* Futuristic High-Density Glow Filter */}
          <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur1" />
            <feGaussianBlur stdDeviation="7" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Core Metallic Gradient */}
          <linearGradient id="cyber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={coreColor} />
            <stop offset="50%" stopColor="#FFF2CC" stopOpacity="0.9" />
            <stop offset="100%" stopColor={isHighThreat ? '#B91C1C' : '#D97706'} />
          </linearGradient>

          {/* Accent Ring Gradient */}
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor={coreColor} />
            <stop offset="100%" stopColor="#FF1F1F" />
          </linearGradient>
        </defs>

        {/* --- LAYER 1: OUTER COMPASS / TELEMETRY RING --- */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: rotationDuration,
            ease: "linear"
          }}
        >
          {/* Outer circle with dashed technical markers */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke={coreColor}
            strokeWidth="0.75"
            strokeOpacity={isHovered ? "0.6" : "0.3"}
            strokeDasharray="4 8 12 8"
          />

          {/* Outer Ring ticks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 50 + Math.cos(rad) * 44;
            const y1 = 50 + Math.sin(rad) * 44;
            const x2 = 50 + Math.cos(rad) * 41;
            const y2 = 50 + Math.sin(rad) * 41;
            return (
              <line
                key={`tick-${angle}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={coreColor}
                strokeWidth="1.25"
                strokeOpacity={isHovered ? "0.8" : "0.4"}
              />
            );
          })}
        </motion.g>

        {/* --- LAYER 2: MIDDLE CYBER-HEXAGON ORBITER --- */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: innerRotationDuration,
            ease: "linear"
          }}
        >
          {/* Hexagonal track */}
          <polygon
            points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5"
            stroke={isHovered ? "#00F0FF" : "rgba(255, 255, 255, 0.15)"}
            strokeWidth="1"
            strokeDasharray="6 4"
            className="transition-colors duration-300"
          />

          {/* Small Orbiting Tech Nodes */}
          <motion.circle
            cx="80"
            cy="32.5"
            r={isHovered ? "2.5" : "1.5"}
            fill={isHovered ? "#00F0FF" : coreColor}
            filter={`url(#${glowFilterId})`}
          />
          <motion.circle
            cx="20"
            cy="67.5"
            r={isHovered ? "2.5" : "1.5"}
            fill={isHighThreat ? "#FF1F1F" : "#00F0FF"}
            filter={`url(#${glowFilterId})`}
          />
        </motion.g>

        {/* --- LAYER 3: INNER GEOMETRIC SHIELD BACKING --- */}
        <motion.polygon
          points="50,22 74,36 74,64 50,78 26,64 26,36"
          fill="rgba(5, 5, 5, 0.85)"
          stroke={coreColor}
          strokeWidth="1.5"
          className="transition-all duration-500"
          style={{
            filter: isHovered || isHighThreat ? `drop-shadow(0px 0px 8px ${coreColor}40)` : 'none'
          }}
          animate={{
            scale: isHovered ? [1, 1.03, 1] : isPlaying ? [1, 1.05, 1] : 1,
          }}
          transition={{
            repeat: isPlaying || isHovered ? Infinity : 0,
            duration: 2,
            ease: "easeInOut"
          }}
        />

        {/* --- LAYER 4: CUSTOM CYBER-LIGHTNING & "F" COGNITIVE MONOGRAM --- */}
        <g filter={`url(#${glowFilterId})`}>
          {/* Elegant Backing Shield Core */}
          <path
            d="M50 25 L70 35 L70 50 C70 62 58 72 50 75 C42 72 30 62 30 50 L30 35 Z"
            fill="url(#cyber-gradient)"
            fillOpacity="0.08"
            stroke={coreColor}
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* High-fidelity custom lightning bolt (ZAP) intersecting an elegant "F" shape */}
          <motion.path
            d="M 54 26 
               L 37 47 
               H 49 
               L 39 74 
               L 63 49 
               H 50 
               L 59 26 
               Z"
            fill="url(#cyber-gradient)"
            stroke={coreColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
            animate={isHovered ? {
              skewX: [0, -3, 3, -1, 0],
              opacity: [1, 0.85, 1, 0.9, 1],
              scale: [1, 1.04, 0.98, 1.02, 1]
            } : isPlaying ? {
              opacity: [1, 0.7, 1],
              scale: [1, 1.02, 1]
            } : {}}
            transition={{
              repeat: Infinity,
              duration: isHovered ? 0.45 : 1.8,
              ease: "easeInOut"
            }}
          />

          {/* Glowing Center Core Shard */}
          <motion.path
            d="M 49 46 H 51 L 43 65 Z"
            fill="#FFFFFF"
            opacity={isHovered ? "0.9" : "0.5"}
            animate={{
              opacity: [0.3, 0.9, 0.3]
            }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "easeInOut"
            }}
          />
        </g>

        {/* --- LAYER 5: INTERACTIVE TELEMETRY CROSSHAIRS --- */}
        {isHovered && (
          <g stroke="#00F0FF" strokeWidth="0.5" opacity="0.75" className="animate-pulse">
            <line x1="12" y1="50" x2="16" y2="50" />
            <line x1="84" y1="50" x2="88" y2="50" />
            <line x1="50" y1="12" x2="50" y2="16" />
            <line x1="50" y1="84" x2="50" y2="88" />
          </g>
        )}
      </svg>
    </motion.div>
  );
};
