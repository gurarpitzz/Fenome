import React from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, AlertTriangle, Radio } from 'lucide-react';
import { cn } from '../lib/utils';

interface SystemStateProps {
  threatLevel: number;
  confusionIndex: number;
  isEngaging: boolean;
  digitalDNA: string[];
}

export const SystemState: React.FC<SystemStateProps> = ({ 
  threatLevel, 
  confusionIndex, 
  isEngaging,
  digitalDNA 
}) => {
  return (
    <div className="h-16 border-b border-amber-neon/20 bg-black/60 backdrop-blur-md flex items-center px-6 gap-8">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className={cn(
            "w-8 h-8 transition-colors duration-500",
            threatLevel > 70 ? "text-red-threat" : "text-amber-neon"
          )} />
          {isEngaging && (
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute inset-0 bg-amber-neon rounded-full"
            />
          )}
        </div>
        <div>
          <h1 className="text-sm font-black tracking-[0.4em] uppercase glitch-text text-amber-neon animate-shimmer" data-text="FINOME">FINOME</h1>
          <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest opacity-60">
            <Radio size={8} className="animate-pulse" />
            <span>System Status: {isEngaging ? 'Engaging' : 'Monitoring'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-12 items-center justify-center">
        <div className="w-48 space-y-1">
          <div className="flex justify-between text-[8px] uppercase tracking-widest mb-1">
            <span className="flex items-center gap-1"><AlertTriangle size={8} /> Threat Level</span>
            <span className={threatLevel > 70 ? "text-red-threat" : ""}>{threatLevel}%</span>
          </div>
          <div className="h-1 bg-amber-neon/10 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${threatLevel}%` }}
              className={cn(
                "h-full transition-colors duration-500",
                threatLevel > 70 ? "bg-red-threat" : "bg-amber-neon"
              )}
            />
          </div>
        </div>

        <div className="w-48 space-y-1">
          <div className="flex justify-between text-[8px] uppercase tracking-widest mb-1">
            <span className="flex items-center gap-1"><Activity size={8} /> Confusion Index</span>
            <span>{confusionIndex}%</span>
          </div>
          <div className="h-1 bg-amber-neon/10 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${confusionIndex}%` }}
              className="h-full bg-amber-neon"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-[8px] uppercase tracking-widest opacity-50 mb-1">Digital DNA Sequence</div>
          <div className="flex gap-1">
            {digitalDNA.map((dna, i) => (
              <span key={i} className="text-[9px] px-1 bg-amber-neon/10 border border-amber-neon/20 rounded">
                {dna}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
