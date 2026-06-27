import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, TrendingUp, Shield, Target, Coins, Percent, 
  HelpCircle, Compass, Cpu, Layers, Sparkles, AlertCircle, 
  ChevronRight, X, Play, Pause, RefreshCw, BarChart2,
  Calendar, Award, Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

interface GenomeEvent {
  id: string;
  timestamp: string;
  module: string;
  observation: string;
  confidence: number;
  progress: number;
  icon: React.ReactNode;
  impact: 'positive' | 'warning' | 'info';
  details: {
    analysis: string;
    actionableInsight: string;
    metricLabel: string;
    metricValue: string;
    volatility: 'Low' | 'Medium' | 'High';
  };
}

const ALL_GENOME_EVENTS: GenomeEvent[] = [
  {
    id: '1',
    timestamp: '4:35:12 PM',
    module: 'SAVING_GENOME',
    observation: 'Detected irregular saving behaviour over previous 14 days',
    confidence: 96,
    progress: 96,
    icon: <Coins size={14} className="text-[#F6A800]" />,
    impact: 'warning',
    details: {
      analysis: 'Sudden spike in recurring subscriptions coupled with discretionary weekend outflows has disrupted the standard linear trajectory of the emergency reserve buffer.',
      actionableInsight: 'Deploy temporary micro-saving rules (₹50 roundup/debit) to recover the 14-day shortfall autonomously.',
      metricLabel: 'Trajectory Deviation',
      metricValue: '-12.4%',
      volatility: 'Medium'
    }
  },
  {
    id: '2',
    timestamp: '4:35:09 PM',
    module: 'INVESTMENT_GENOME',
    observation: 'Monthly surplus sufficient to increase SIP allocation by ₹2,000',
    confidence: 94,
    progress: 94,
    icon: <TrendingUp size={14} className="text-[#33E1C9]" />,
    impact: 'positive',
    details: {
      analysis: 'Continuous reductions in utility expenditures and direct cashflow tracking have unlocked an extra ₹2,500 surplus with a 98% persistence rating.',
      actionableInsight: 'Allocate ₹2,000 towards the Small-Cap index fund to compound long-term equity allocations.',
      metricLabel: 'Unlocked Surplus',
      metricValue: '₹2,500/mo',
      volatility: 'Low'
    }
  },
  {
    id: '3',
    timestamp: '4:35:04 PM',
    module: 'CREDIT_GENOME',
    observation: 'Credit utilization rising above optimal behavioural threshold',
    confidence: 91,
    progress: 91,
    icon: <Percent size={14} className="text-[#F6A800]" />,
    impact: 'warning',
    details: {
      analysis: 'High credit utilization triggered on primary rewards-based card due to heavy quarterly flight bookings, crossing the recommended 30% risk ceiling.',
      actionableInsight: 'Execute an early mid-cycle credit payment of ₹15,000 to instantly restore the credit utilization metric to 18%.',
      metricLabel: 'Utilisation Level',
      metricValue: '38.2%',
      volatility: 'High'
    }
  },
  {
    id: '4',
    timestamp: '4:34:59 PM',
    module: 'GOAL_GENOME',
    observation: 'Emergency fund completion probability increased to 87%',
    confidence: 95,
    progress: 95,
    icon: <Target size={14} className="text-[#33E1C9]" />,
    impact: 'positive',
    details: {
      analysis: 'Persistent contribution streams coupled with dynamic cashback round-ups have pushed the emergency fund safety metric towards critical velocity.',
      actionableInsight: 'Maintain current rate of automated transfers for 18 more days to achieve absolute goal self-sufficiency.',
      metricLabel: 'Safety Coverage',
      metricValue: '5.2 Months',
      volatility: 'Low'
    }
  },
  {
    id: '5',
    timestamp: '4:34:55 PM',
    module: 'RISK_GENOME',
    observation: 'Insurance coverage gap identified for current income profile',
    confidence: 93,
    progress: 93,
    icon: <Shield size={14} className="text-[#F6A800]" />,
    impact: 'info',
    details: {
      analysis: 'A comparative analysis of current asset valuations and personal medical dependents indicates a protection deficit in critical illness coverage.',
      actionableInsight: 'Review a low-premium ₹50 Lakh top-up term plan optimized specifically for tech professionals.',
      metricLabel: 'Protection Deficit',
      metricValue: '₹25,00,000',
      volatility: 'Low'
    }
  },
  {
    id: '6',
    timestamp: '4:34:40 PM',
    module: 'SPENDING_GENOME',
    observation: 'Frequent weekend dining spike matches discretionary threshold of 40%',
    confidence: 89,
    progress: 89,
    icon: <Sparkles size={14} className="text-[#F6A800]" />,
    impact: 'warning',
    details: {
      analysis: 'Micro-payment patterns show a persistent accumulation of small food-aggregator receipts which collectively represent 41.2% of discretionary limits.',
      actionableInsight: 'Toggle "Discipline Alert" rules to snooze delivery apps when dining budgets cross ₹5,000 this week.',
      metricLabel: 'Discretionary Dining',
      metricValue: '41.2%',
      volatility: 'Medium'
    }
  },
  {
    id: '7',
    timestamp: '4:34:30 PM',
    module: 'WEALTH_GENOME',
    observation: 'Compounding momentum accelerated by active dividend reinvestment',
    confidence: 97,
    progress: 97,
    icon: <Activity size={14} className="text-[#33E1C9]" />,
    impact: 'positive',
    details: {
      analysis: 'Zero cash drag was maintained over the current quarter as all distributed profits were successfully swept back into fractional ETF pools.',
      actionableInsight: 'Configure automated capital reinvestment sweeps to secure the momentum for next quarter.',
      metricLabel: 'Compounding Velocity',
      metricValue: '+1.8% Net',
      volatility: 'Low'
    }
  },
  {
    id: '8',
    timestamp: '4:34:15 PM',
    module: 'TAX_GENOME',
    observation: 'Potential tax efficiency optimized using active Section 80C pathways',
    confidence: 92,
    progress: 92,
    icon: <Layers size={14} className="text-[#33E1C9]" />,
    impact: 'info',
    details: {
      analysis: 'Dynamic predictive tracking has aligned remaining ELSS tax saver fund investment limits to lower standard tax liability by ₹46,800 annually.',
      actionableInsight: 'Execute ELSS tax saver sweep of ₹15,000 before the end of the current micro-cycle.',
      metricLabel: 'Tax Shield Potential',
      metricValue: '₹46,800/yr',
      volatility: 'Low'
    }
  }
];

// Simple custom particle definition for background ambient micro-animation
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  color: 'orange' | 'teal';
}

export const FinomeGenomeActivity: React.FC = () => {
  const [events, setEvents] = useState<GenomeEvent[]>(ALL_GENOME_EVENTS.slice(0, 5));
  const [currentIndex, setCurrentIndex] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<GenomeEvent | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Real-time animated counters for confidence scores of newly added items
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [interpolatedConfidence, setInterpolatedConfidence] = useState<number>(50);

  // Initialize and update ambient particles
  useEffect(() => {
    // Generate particles
    const initialParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speedY: -(Math.random() * 0.2 + 0.1),
      color: Math.random() > 0.5 ? 'orange' : 'teal',
    }));
    setParticles(initialParticles);

    // Dynamic floating particle loop
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => {
          let nextY = p.y + p.speedY;
          if (nextY < 0) {
            nextY = 100; // Reset to bottom
            return {
              ...p,
              x: Math.random() * 100,
              y: nextY,
            };
          }
          return { ...p, y: nextY };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Continuous background event rotation/adding mechanism to simulate ongoing live analysis
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % ALL_GENOME_EVENTS.length;
      const nextEventOriginal = ALL_GENOME_EVENTS[nextIndex];
      
      // Give it a fresh unique timestamp matching the current live simulated clock
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const nextEvent: GenomeEvent = {
        ...nextEventOriginal,
        id: `${nextEventOriginal.id}-${Date.now()}`,
        timestamp: timeStr,
      };

      // Slide events list: append new one, remove oldest to keep list length capped at 5
      setEvents((prev) => {
        const sliced = prev.length >= 5 ? prev.slice(1) : prev;
        return [...sliced, nextEvent];
      });

      setNewlyAddedId(nextEvent.id);
      setInterpolatedConfidence(50);
      setCurrentIndex(nextIndex);

      // Increment counter animation for newly spawned event
      let start = 50;
      const end = nextEvent.confidence;
      const stepTime = Math.abs(Math.floor(800 / (end - start)));
      const counterTimer = setInterval(() => {
        start += 1;
        setInterpolatedConfidence(start);
        if (start >= end) {
          clearInterval(counterTimer);
        }
      }, stepTime);

    }, 5500); // Trigger every 5.5s for realistic non-flashy terminal evolution speed

    return () => clearInterval(timer);
  }, [currentIndex, isPlaying]);

  return (
    <div className="w-full flex-1 min-h-[350px] rounded-3xl bg-[#090909] border border-white/[0.06] overflow-hidden flex flex-col p-5 relative font-mono select-none shadow-[0_8px_32px_rgba(0,0,0,0.9)] transition-all duration-700">
      
      {/* Ultra-subtle custom canvas grids & breathing glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F6A800]/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Floating particles background rendering */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={cn(
            "absolute rounded-full pointer-events-none transition-opacity duration-1000 opacity-20",
            p.color === 'orange' ? "bg-[#F6A800]" : "bg-[#33E1C9]"
          )}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}

      {/* Embedded Scanline overlay for high fidelity terminal simulation */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.01] via-transparent to-black/20 mix-blend-overlay z-10" />

      {/* Header layout - matching strict guidelines */}
      <div className="flex justify-between items-start mb-4 shrink-0 pb-3 border-b border-white/[0.05] z-10">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#8B8B8B]">
            FINOME GENOME ACTIVITY
          </span>
          <h2 className="text-[12px] font-bold text-[#F5F5F5] uppercase tracking-wide mt-0.5">
            LIVE EVOLUTION OF CUSTOMER'S FINANCIAL GENOME
          </h2>
        </div>
        
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F6A800] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#F6A800]"></span>
            </span>
            <span className="text-[8.5px] font-black text-[#F6A800] tracking-[0.2em] uppercase">
              ● LIVE
            </span>
          </div>
          
          <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.05] px-1.5 py-0.5 rounded text-[7.5px] text-[#8B8B8B] tracking-wider uppercase">
            <RefreshCw size={8} className="animate-spin text-[#33E1C9] mr-0.5" />
            PROCESSING
          </div>
        </div>
      </div>

      {/* Controls panel overlays for quick user interactions */}
      <div className="flex justify-between items-center mb-3 shrink-0 z-10 bg-white/[0.01] border border-white/[0.03] px-2.5 py-1.5 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-[7.5px] uppercase tracking-wider text-[#8B8B8B]">SIMULATOR:</span>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 text-[8px] bg-white/[0.03] hover:bg-white/[0.08] text-[#F5F5F5] px-2 py-0.5 border border-white/[0.05] rounded-lg transition-all"
          >
            {isPlaying ? (
              <>
                <Pause size={7.5} className="text-[#F6A800]" />
                PAUSE
              </>
            ) : (
              <>
                <Play size={7.5} className="text-[#33E1C9]" />
                EVOLVE
              </>
            )}
          </button>
        </div>

        <span className="text-[7.5px] text-[#8B8B8B] italic">
          Click cards to inspect details
        </span>
      </div>

      {/* Continuous scrolling stream list container */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-none pr-1.5 z-10 min-h-0 relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {events.map((evt) => {
            const isHovered = hoveredEventId === evt.id;
            const isNew = evt.id === newlyAddedId;
            const confidenceVal = isNew ? interpolatedConfidence : evt.confidence;
            
            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHoveredEventId(evt.id)}
                onMouseLeave={() => setHoveredEventId(null)}
                onClick={() => setSelectedEvent(evt)}
                className={cn(
                  "p-3 rounded-2xl border cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col gap-2",
                  isHovered 
                    ? "bg-[#111112] border-[#F6A800]/40 shadow-[0_0_15px_rgba(246,168,0,0.08)] -translate-y-0.5" 
                    : isNew
                      ? "bg-[#0c0c0e] border-[#33E1C9]/25 shadow-[inset_0_0_12px_rgba(51,225,201,0.03)]"
                      : "bg-white/[0.02] border-white/[0.05]"
                )}
              >
                {/* Micro Orange/Teal Glow Stripe Left Indicator */}
                <div 
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300",
                    isHovered 
                      ? "bg-[#F6A800] h-full shadow-[0_0_8px_#F6A800]" 
                      : evt.impact === 'positive' 
                        ? "bg-[#33E1C9]" 
                        : "bg-[#F6A800]"
                  )} 
                />

                {/* Event header info */}
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-[#8B8B8B] tracking-wider">
                      [{evt.timestamp}]
                    </span>
                    <span
                      className={cn(
                        "text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded leading-none transition-colors duration-300",
                        isHovered 
                          ? "bg-[#F6A800]/20 border border-[#F6A800]/30 text-[#F6A800]" 
                          : evt.impact === 'positive'
                            ? "bg-[#33E1C9]/10 border border-[#33E1C9]/15 text-[#33E1C9]"
                            : "bg-[#F6A800]/10 border border-[#F6A800]/15 text-[#F6A800]"
                      )}
                    >
                      {evt.module}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {evt.icon}
                  </div>
                </div>

                {/* Observation line */}
                <p className="text-[9.5px] font-medium leading-normal text-[#F5F5F5] pr-2">
                  {evt.observation}
                </p>

                {/* Footer metrics line */}
                <div className="flex justify-between items-center mt-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[7.5px] text-[#8B8B8B]">Confidence:</span>
                    <span className="text-[8.5px] font-bold text-[#33E1C9] tracking-wider">
                      {confidenceVal}%
                    </span>
                  </div>

                  {isHovered && (
                    <span className="text-[7px] text-[#F6A800] flex items-center gap-0.5 animate-pulse font-bold tracking-widest">
                      INSPECT GENOME <ChevronRight size={8} />
                    </span>
                  )}
                </div>

                {/* Thin animated progress bar */}
                <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden w-full relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${evt.progress}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isHovered 
                        ? "bg-gradient-to-r from-[#F6A800] to-[#33E1C9] shadow-[0_0_4px_#F6A800]" 
                        : evt.impact === 'positive'
                          ? "bg-[#33E1C9]"
                          : "bg-[#F6A800]"
                    )}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Popout detailed genome review screen when an event is selected */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 flex flex-col p-5"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/[0.08] pb-3 mb-4">
              <div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#F6A800]">
                  GENOME INTEL INSPECTION
                </span>
                <h3 className="text-[11px] font-bold text-[#F5F5F5] uppercase tracking-wide mt-1 flex items-center gap-1.5">
                  {selectedEvent.icon} {selectedEvent.module}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-[#8B8B8B] hover:text-[#F5F5F5] transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            {/* Content Details */}
            <div className="flex-1 overflow-y-auto space-y-4 text-left pr-1.5 select-text">
              
              <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl space-y-1.5">
                <span className="text-[7.5px] uppercase tracking-wider text-[#8B8B8B]">Behavioural Observation</span>
                <p className="text-[10px] font-bold text-[#F5F5F5] leading-relaxed">
                  "{selectedEvent.observation}"
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[7.5px] uppercase tracking-wider text-[#8B8B8B]">Telemetry Analysis Report</span>
                <p className="text-[9px] text-[#8B8B8B] leading-relaxed">
                  {selectedEvent.details.analysis}
                </p>
              </div>

              <div className="bg-[#F6A800]/[0.02] border border-[#F6A800]/15 p-3 rounded-xl space-y-1">
                <span className="text-[7.5px] uppercase tracking-wider text-[#F6A800] font-bold">Actionable Finome Rule</span>
                <p className="text-[9px] text-[#F5F5F5] leading-relaxed">
                  {selectedEvent.details.actionableInsight}
                </p>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-white/[0.01] border border-white/[0.05] p-2 rounded-xl text-center">
                  <span className="block text-[6.5px] uppercase tracking-wider text-[#8B8B8B] mb-0.5">{selectedEvent.details.metricLabel}</span>
                  <span className="text-[10px] font-black text-[#F5F5F5] tracking-tight">{selectedEvent.details.metricValue}</span>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.05] p-2 rounded-xl text-center">
                  <span className="block text-[6.5px] uppercase tracking-wider text-[#8B8B8B] mb-0.5">Statistical confidence</span>
                  <span className="text-[10px] font-black text-[#33E1C9] tracking-tight">{selectedEvent.confidence}%</span>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.05] p-2 rounded-xl text-center">
                  <span className="block text-[6.5px] uppercase tracking-wider text-[#8B8B8B] mb-0.5">Volatility rating</span>
                  <span className={cn(
                    "text-[10px] font-black tracking-tight",
                    selectedEvent.details.volatility === 'High' 
                      ? "text-[#F6A800]" 
                      : "text-[#33E1C9]"
                  )}>{selectedEvent.details.volatility}</span>
                </div>
              </div>
            </div>

            {/* Close footer */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[8.5px] uppercase tracking-[0.25em] rounded-xl transition-all hover:text-[#33E1C9]"
            >
              DISMISS INSPECTION
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
