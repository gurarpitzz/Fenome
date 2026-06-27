import React from 'react';
import { motion } from 'motion/react';

export const Radar: React.FC<{ threatLevel: number }> = ({ threatLevel }) => {
  return (
    <div className="w-full h-full flex flex-col p-4 border-t border-amber-neon/10">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[8px] uppercase tracking-widest opacity-50">Threat Vector Distribution</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-amber-neon rounded-full" />
          <div className="w-1 h-1 bg-cyan-data rounded-full" />
        </div>
      </div>
      
      <div className="flex-1 relative flex items-center justify-center">
        {/* Radar Rings */}
        {[1, 2, 3].map(i => (
          <div 
            key={i}
            className="absolute border border-amber-neon/10 rounded-full"
            style={{ width: `${i * 33}%`, height: `${i * 33}%` }}
          />
        ))}
        
        {/* Radar Sweep */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-tr from-amber-neon/20 to-transparent rounded-full origin-center"
          style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }}
        />

        {/* Threat Blips */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2, 
              delay: i * 0.8 
            }}
            className="absolute w-1.5 h-1.5 bg-red-threat rounded-full shadow-[0_0_5px_rgba(255,49,49,0.8)]"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`
            }}
          />
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-2 text-[7px] uppercase tracking-tighter opacity-40">
        <div className="flex flex-col">
          <span>LATENCY</span>
          <span className="text-white">0.02ms</span>
        </div>
        <div className="flex flex-col">
          <span>JITTER</span>
          <span className="text-white">0.001</span>
        </div>
        <div className="flex flex-col">
          <span>PACKETS</span>
          <span className="text-white">1.2k/s</span>
        </div>
      </div>
    </div>
  );
};
