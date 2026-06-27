import React from 'react';
import { motion } from 'motion/react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Atmospheric Gradients */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-neon/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-data/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-red-threat/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Moving Grid */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, #FFB000 1px, transparent 1px), linear-gradient(to bottom, #FFB000 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => {
          const startX = typeof window !== 'undefined' ? Math.random() * window.innerWidth : 1200;
          const startY = typeof window !== 'undefined' ? Math.random() * window.innerHeight * 0.8 + window.innerHeight * 0.1 : 600;
          const startOpacity = 0.1 + Math.random() * 0.4;
          return (
            <motion.div
              key={i}
              initial={{ 
                x: startX, 
                y: startY,
                opacity: startOpacity
              }}
              animate={{ 
                y: -50,
                opacity: 0
              }}
              transition={{ 
                duration: Math.random() * 8 + 6, 
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-amber-neon rounded-full"
            />
          );
        })}
      </div>

      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.8) 100%)'
        }}
      />
      
      {/* Scanline & Grain */}
      <div className="scanline" />
      <div className="grain" />
    </div>
  );
};
