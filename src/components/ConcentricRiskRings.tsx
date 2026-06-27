import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, Network, Cpu, Smartphone } from 'lucide-react';

interface ConcentricRiskRingsProps {
  scores: {
    malware: number;
    fraud: number;
    network: number;
    system: number;
  };
}

export const ConcentricRiskRings: React.FC<ConcentricRiskRingsProps> = ({ scores }) => {
  // SVG drawing configuration
  const center = 110;
  const rings = [
    { radius: 95, score: scores.malware, label: 'MALWARE', color: '#FFB000', icon: <Smartphone size={10} className="text-amber-neon" /> },
    { radius: 75, score: scores.fraud, label: 'FRAUD_CON', color: '#FF1F1F', icon: <Target size={10} className="text-red-threat" /> },
    { radius: 55, score: scores.network, label: 'NETWORK', color: '#00F0FF', icon: <Network size={10} className="text-cyan-data" /> },
    { radius: 35, score: scores.system, label: 'MITIG_SYS', color: '#00FF66', icon: <Cpu size={10} className="text-green-400" /> }
  ];

  return (
    <div className="flex flex-col h-full justify-between p-4">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2 shrink-0">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Risk Scoring Core</h4>
        <span className="text-[7.5px] font-mono opacity-30 uppercase">Co-related vectors</span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 min-h-0">
        
        {/* Glowing SVGs */}
        <div className="relative w-48 h-48 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {rings.map((ring, idx) => {
              const circumference = 2 * Math.PI * ring.radius;
              const strokeDashoffset = circumference - (ring.score / 100) * circumference;
              
              return (
                <React.Fragment key={idx}>
                  {/* Track ring */}
                  <circle
                    cx={center}
                    cy={center}
                    r={ring.radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.02)"
                    strokeWidth="6"
                  />
                  {/* Animated value ring */}
                  <motion.circle
                    cx={center}
                    cy={center}
                    r={ring.radius}
                    fill="transparent"
                    stroke={ring.color}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${ring.color}33)` }}
                  />
                </React.Fragment>
              );
            })}
          </svg>

          {/* Central Core Emblem */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[7px] font-mono uppercase tracking-[0.3em] opacity-25">AVG CORE</span>
            <span className="text-xl font-black font-mono text-white leading-none">
              {Math.round((scores.malware + scores.fraud + scores.network + scores.system) / 4)}%
            </span>
            <span className="text-[6.5px] font-mono uppercase text-red-threat tracking-widest mt-1.5 font-bold">MUTATING</span>
          </div>
        </div>

        {/* Legend readout list */}
        <div className="flex-1 w-full space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {rings.map((ring, idx) => (
            <div key={idx} className="p-2.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {ring.icon}
                <span className="text-[9px] font-bold font-mono tracking-wider opacity-60 uppercase">{ring.label}</span>
              </div>
              <span className="font-mono font-black" style={{ color: ring.color }}>{ring.score}%</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
