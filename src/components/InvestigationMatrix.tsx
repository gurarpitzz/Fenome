import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InvestigationCard } from '../types';
import { 
  FileSearch, AlertTriangle, ShieldCheck, 
  Layers, ChevronRight, Zap, Target, Landmark, Fingerprint 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface InvestigationMatrixProps {
  cards: InvestigationCard[];
  stage_active: number;
  onSetStage: (stage: number) => void;
  metrics?: any;
}

const CYBER_STAGES = [
  { id: 0, label: 'APK Unpack', icon: <FileSearch size={14} />, desc: 'Decompile analysis & entropy checks' },
  { id: 1, label: 'Intercept Check', icon: <Fingerprint size={14} />, desc: 'SMS Broadcast OTP Hooks search' },
  { id: 2, label: 'Victim Id Locked', icon: <Target size={14} />, desc: 'Identifying infected UPI accounts' },
  { id: 3, label: 'Mule Core Traced', icon: <Landmark size={14} />, desc: 'GNN cluster centrality calculations' },
  { id: 4, label: 'Mitigated Cloud', icon: <ShieldCheck size={14} />, desc: 'Automated Account Freeze dispatch' }
];

export const InvestigationMatrix: React.FC<InvestigationMatrixProps> = ({
  cards,
  stage_active,
  onSetStage,
  metrics
}) => {
  const [selectedCard, setSelectedCard] = useState<InvestigationCard | null>(cards[0]);

  return (
    <div className="w-full h-full min-h-0 flex flex-col lg:flex-row gap-5 overflow-hidden">
      
      {/* Visualizer Detective Board */}
      <div className="flex-grow min-h-[220px] lg:min-h-0 relative border border-white/5 bg-black/60 rounded-3xl p-5 overflow-hidden flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex justify-between items-center z-10 border-b border-white/5 pb-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="text-amber-neon animate-pulse" size={12} />
              <span className="text-[10px] font-black tracking-[0.4em] text-amber-neon uppercase">FINOME Investigation Matrix</span>
            </div>
            <div className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
              Live Threat Kill Chain reconstruction & Cyber Detective Board
            </div>
          </div>
          <div>
            <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded text-[8.5px] text-white/50 tracking-wider font-mono">
              STAGE_CORRELATION: ONLINE
            </span>
          </div>
        </div>

        {/* Live Cyber Stages Progress bar */}
        <div className="my-4 grid grid-cols-5 gap-2 shrink-0">
          {CYBER_STAGES.map((stage) => {
            const isCompleted = stage.id <= stage_active;
            const isCurrent = stage.id === stage_active;
            
            return (
              <div 
                key={stage.id}
                onClick={() => onSetStage(stage.id)}
                className={cn(
                  "p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-1.5 relative overflow-hidden",
                  isCurrent
                    ? "bg-amber-neon/10 border-amber-neon text-amber-neon text-glow-amber shadow-[0_0_15px_rgba(255,176,0,0.1)]"
                    : isCompleted
                      ? "bg-white/5 border-white/20 text-white"
                      : "bg-white/[0.01] border-white/5 text-white/25"
                )}
              >
                {/* Horizontal progress ribbon */}
                {isCompleted && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-neon" />
                )}
                
                <div className="flex justify-between items-center text-[8px] font-mono font-bold tracking-widest">
                  <span className="flex items-center gap-1.5">{stage.icon} {stage.label}</span>
                  <span>{stage.id + 1}</span>
                </div>
                <p className="text-[7px] opacity-40 leading-snug truncate mt-0.5">{stage.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Dynamic Detective Board Listing of evidence cards */}
        <div className="flex-1 my-1.5 overflow-y-auto pr-1.5 custom-scrollbar min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
            {cards.map((card) => {
              const isSelected = selectedCard?.id === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={cn(
                    "p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between",
                    isSelected
                      ? "bg-white/[0.03] border-white/20 shadow-[0_4px_12px_rgba(255,255,255,0.02)]"
                      : "bg-white/[0.01] border-white/5 opacity-60 hover:opacity-100 hover:bg-white/[0.02]"
                  )}
                >
                  <div>
                    <div className="flex justify-between items-center text-[7.5px] font-mono opacity-30 mb-1.5 uppercase font-semibold">
                      <span>{card.category} Evidence</span>
                      <span>{card.time}</span>
                    </div>
                    <h4 className="text-[11.5px] font-bold text-white mb-1 leading-tight">{card.title}</h4>
                    <p className="text-[9.5px] text-white/50 leading-relaxed truncate">{card.description}</p>
                  </div>

                  <div className="mt-2.5 flex justify-between items-center border-t border-white/5 pt-2">
                    <span className="text-[8px] font-mono text-cyan-data/80">{Object.keys(card.payload).length} Parameters</span>
                    <span className={cn(
                      "text-[7px] font-mono font-black border px-1.5 py-0.5 rounded",
                      card.status === 'CRITICAL' ? "bg-red-threat/10 text-red-threat border-red-threat/20 animate-pulse" :
                      card.status === 'WARNING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      card.status === 'SECURED' ? "bg-cyan-data/10 text-cyan-data border-cyan-data/20" :
                      "bg-white/10 text-white border-white/20"
                    )}>
                      {card.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info line */}
        <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em] pt-3 border-t border-white/5 shrink-0">
          Unified Investigation Board tracking suspicious Indian APK assemblies and money transfers.
        </div>
      </div>

      {/* Selected Evidence detailed inspector */}
      <div className="w-full lg:w-72 xl:w-80 shrink-0 h-[220px] lg:h-full min-h-0 overflow-y-auto pr-1 z-10 custom-scrollbar flex flex-col gap-4">
        
        {/* Active Stage Indicator Card */}
        <div className="bg-glass border border-white/10 rounded-3xl p-5 shrink-0">
          <h5 className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 mb-3 flex items-center gap-2">
            <Target size={12} /> Live Active Stage
          </h5>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-neon/10 border border-amber-neon/30 flex items-center justify-center font-mono font-bold text-amber-neon text-sm animate-pulse shrink-0">
              {stage_active + 1}
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white leading-normal uppercase">{CYBER_STAGES[stage_active].label}</h4>
              <p className="text-[8.5px] text-white/40 leading-snug mt-0.5">{CYBER_STAGES[stage_active].desc}</p>
            </div>
          </div>
        </div>

        {/* Detailed Evidence Cards view */}
        <AnimatePresence mode="wait">
          {selectedCard ? (
            <motion.div
              key={selectedCard.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow bg-glass border border-white/10 rounded-3xl p-5 flex flex-col justify-between overflow-hidden min-h-[160px]"
            >
              <div className="flex flex-col min-h-0 h-full">
                <div className="flex justify-between items-center mb-3.5 border-b border-white/5 pb-2.5 shrink-0">
                  <span className="text-[8.5px] font-black uppercase tracking-widest text-cyan-data font-mono">Evidence Inspector</span>
                  <span className="text-[8px] font-mono text-white/30 font-semibold">{selectedCard.time}</span>
                </div>

                <h3 className="text-xs font-extrabold text-white mb-1 shrink-0">{selectedCard.title}</h3>
                <p className="text-[10px] text-white/60 leading-relaxed mb-4 italic shrink-0">
                  "{selectedCard.description}"
                </p>

                <div className="flex-1 space-y-3 border-y border-white/5 py-3.5 overflow-y-auto pr-1.5 custom-scrollbar min-h-0">
                  {Object.entries(selectedCard.payload).map(([k, v]) => (
                    <div key={k} className="p-2.5 bg-black/30 border border-white/5 rounded-xl">
                      <label className="text-[7px] font-bold font-mono uppercase tracking-widest opacity-35 block mb-1">{k}</label>
                      <span className="text-[9.5px] font-mono font-medium text-white/95 break-all leading-normal">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3.5 shrink-0">
                <div className="text-[7.5px] uppercase tracking-[0.25em] opacity-40 leading-relaxed text-center">
                  Data correlates live with active telemetry rates.
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-grow border border-dashed border-white/10 rounded-3xl p-5 flex flex-col justify-center items-center text-center">
              <Zap className="opacity-20 text-white mb-3 animate-bounce" size={24} />
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1.5">Select Evidence Card</h5>
              <p className="text-[8.5px] text-white/40 leading-relaxed max-w-xs">
                Browse index logs on the left and select one to decompile its parameter registries and target payloads.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
