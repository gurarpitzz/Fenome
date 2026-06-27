import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ShieldAlert, Cpu, Swords, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

interface RiskEntropyChartProps {
  threatLevel: number;
  deceptionLogs: any[];
  attackerLogs: any[];
  metrics: {
    entropyRate: number;
    confusionProbability: number;
    engagementScore: number;
    intelligenceYield: number;
    adversaryACI: number;
    dnaSync: number;
  };
  riskRings: {
    malware: number;
    fraud: number;
    network: number;
    system: number;
  };
}

export const RiskEntropyChart: React.FC<RiskEntropyChartProps> = ({
  threatLevel,
  deceptionLogs,
  attackerLogs,
  metrics,
  riskRings
}) => {
  const [history, setHistory] = useState<number[]>(Array(16).fill(45));
  const [lastEmitted, setLastEmitted] = useState<number>(0);
  const pulseRef = useRef<boolean>(false);

  // Buffer state history representation
  useEffect(() => {
    setHistory(prev => {
      const nextHist = [...prev.slice(1), threatLevel];
      return nextHist;
    });
  }, [threatLevel]);

  // Construct coordinates for custom SVG area graph fits perfectly on 250px container
  const width = 310;
  const height = 90;
  const padding = 10;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Max value reference
  const maxVal = 100;
  const minVal = 0;

  // Compute points
  const points = history.map((val, idx) => {
    const x = padding + (idx / (history.length - 1)) * graphWidth;
    const y = padding + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;
    return { x, y, value: val };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${padding + graphHeight} L ${points[0].x} ${padding + graphHeight} Z`
    : '';

  // Risk factor calculations matching aetherEngine behavior
  const baseExposure = 48;
  const codeEntropyFactor = Number((metrics.entropyRate * 4.5).toFixed(1));
  const attackInflowFactor = Math.min(22, (attackerLogs.length || 1) * 0.75);
  const honeypotMitigation = Math.min(25, (deceptionLogs.length || 0) * 3.5);

  return (
    <div className="flex flex-col h-full justify-between select-none">
      
      {/* Header telemetry details */}
      <div className="flex justify-between items-start mb-3 shrink-0 border-b border-white/5 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="text-amber-neon animate-pulse" size={13} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Scoring Core Engine</h4>
          </div>
          <p className="text-[7px] font-mono text-white/30 uppercase tracking-widest mt-0.5">Finome predictive real-time feeds</p>
        </div>
        
        <div className="text-right">
          <div className="text-[9.5px] font-mono font-black text-amber-neon text-glow-amber">
            RISK LIMIT: {threatLevel > 75 ? 'BREACHED' : 'CONTAINED'}
          </div>
          <div className="text-[6.5px] font-mono text-white/40 tracking-wider">SEC v4.8 ACTIVE</div>
        </div>
      </div>

      {/* Embedded Real-time glowing Spark/Area graph */}
      <div className="relative bg-black/60 border border-white/5 rounded-2xl p-2.5 mb-3 flex flex-col justify-center overflow-hidden shrink-0">
        
        {/* Absolute Background telemetry Grid */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-[0.03] pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="border-t border-l border-white" />
          ))}
        </div>

        {/* Floating Indicator details inside graph */}
        <div className="absolute top-2 left-3 flex items-center gap-2 pointer-events-none z-10">
          <TrendingUp className="text-amber-neon animate-pulse shrink-0" size={11} />
          <span className="text-[7.5px] font-mono text-white/50 uppercase tracking-wider">Dynamic Risk progression</span>
        </div>

        <div className="absolute top-2 right-3 font-mono text-[8px] text-white/50 pointer-events-none z-10 flex gap-1.5">
          <span className="text-red-threat font-bold animate-pulse">{threatLevel}% CRIT</span>
          <span className="opacity-30">|</span>
          <span className="text-cyan-data tracking-tighter">ENTROPY: {metrics.entropyRate}</span>
        </div>

        {/* Real Dynamic SVG */}
        <div className="w-full h-24 overflow-hidden relative mt-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF1F1F" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#FFB000" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#FFB000" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="riskLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00F0FF" />
                <stop offset="40%" stopColor="#FFB000" />
                <stop offset="100%" stopColor="#FF1F1F" />
              </linearGradient>
            </defs>

            {/* Grid Line Threshold references */}
            <line x1="0" y1={padding + graphHeight * 0.25} x2={width} y2={padding + graphHeight * 0.25} stroke="rgba(255, 31, 31, 0.12)" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="0" y1={padding + graphHeight * 0.6} x2={width} y2={padding + graphHeight * 0.6} stroke="rgba(255, 176, 0, 0.1)" strokeWidth="1" strokeDasharray="3,3" />

            {/* Glowing filled Area path */}
            {areaD && (
              <motion.path
                d={areaD}
                fill="url(#riskAreaGrad)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Stroke Trendline path */}
            {pathD && (
              <motion.path
                d={pathD}
                fill="none"
                stroke="url(#riskLineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
            )}

            {/* Pulsing focal node indicator on the very last point */}
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="3.5"
                fill="#FF1F1F"
                className="animate-ping"
                style={{ transformOrigin: `${points[points.length - 1].x}px ${points[points.length - 1].y}px` }}
              />
            )}
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="2.5"
                fill="#FF1F1F"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Micro Factor Breakdowns (Satisfying improved risk scoring visibility) */}
      <div className="flex-1 space-y-1.5 overflow-hidden flex flex-col justify-end">
        <span className="text-[6.5px] font-mono text-white/30 uppercase tracking-[0.2em] block font-extrabold mb-1">
          Scoring Metrics Breakdown
        </span>

        {/* Factor 1: Base Exposure */}
        <div className="p-1.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-[10px]">
          <span className="text-white/50 font-mono text-[8.5px]">01 // BASE VULNERABILITY</span>
          <span className="font-mono text-white/80 font-black">{baseExposure} pts</span>
        </div>

        {/* Factor 2: Code Entropy coefficient */}
        <div className="p-1.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-[10px]">
          <span className="text-white/50 font-mono text-[8.5px]">02 // DYNAMIC CODE ENTROPY</span>
          <span className="font-mono text-cyan-data font-black">+{codeEntropyFactor} pts</span>
        </div>

        {/* Factor 3: Active Attack Inflow Density */}
        <div className="p-1.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-[10px]">
          <span className="text-white/50 font-mono text-[8.5px]">03 // ACTIVE ATTACK DENSITY</span>
          <span className="font-mono text-amber-neon font-black">+{attackInflowFactor.toFixed(1)} pts</span>
        </div>

        {/* Factor 4: Deception Honeypot Mitigation */}
        <div className="p-1.5 bg-red-threat/5 border border-red-threat/10 rounded-xl flex items-center justify-between text-[10px] animate-shimmer">
          <span className="text-red-threat font-mono text-[8.5px] font-bold">04 // DECEPTION DECOY DAMPENER</span>
          <span className="font-mono text-red-threat font-black">-{honeypotMitigation.toFixed(1)} pts</span>
        </div>
      </div>

      {/* Footer warning indicators */}
      <div className="mt-3 p-2 bg-[#FF1F1F]/5 border border-[#FF1F1F]/20 rounded-xl flex items-center gap-2 select-none shrink-0">
        <AlertTriangle size={12} className={cn("text-red-threat", threatLevel > 75 && "animate-bounce")} />
        <p className="text-[7.5px] text-white/50 font-mono leading-relaxed leading-snug">
          {threatLevel > 75 
            ? "CRITICAL STATE: Severe banking Trojan signature matches detected in active honeypots. Automatic sandbox containment protocols active."
            : "MONITORING SYSTEM: Operational telemetry parameters remain within safe autonomous baseline indices."
          }
        </p>
      </div>

    </div>
  );
};
