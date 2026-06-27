import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Activity, Cpu, Lock, AlertTriangle, ArrowLeft, Terminal, Eye, Database, Network } from 'lucide-react';
import * as d3 from 'd3';

interface NeuralProcessDetailProps {
  onBack: () => void;
  threatLevel: number;
  attackerLogs: any[];
  deceptionLogs: any[];
}

export const NeuralProcessDetail: React.FC<NeuralProcessDetailProps> = ({ onBack, threatLevel, attackerLogs, deceptionLogs }) => {
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const [glitchActive, setGlitchActive] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNodes(prev => {
        const next = [...prev];
        if (next.length > 15) next.shift();
        next.push(Math.floor(Math.random() * 144));
        return next;
      });
      if (Math.random() > 0.9) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 600;
    const nodes = d3.range(150).map(i => ({ id: i }));
    const links = d3.range(200).map(() => ({
      source: Math.floor(Math.random() * 150),
      target: Math.floor(Math.random() * 150)
    }));

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).distance(50))
      .force('charge', d3.forceManyBody().strength(-30))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#FFB000')
      .attr('stroke-opacity', 0.1)
      .attr('stroke-width', 0.5);

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 2)
      .attr('fill', '#FFB000')
      .attr('opacity', 0.3);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      className="fixed inset-0 z-[100] bg-black/90 flex flex-col overflow-hidden"
    >
      {/* Glitch Overlay */}
      <AnimatePresence>
        {glitchActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] pointer-events-none bg-red-500/10 mix-blend-screen"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,0,0,0.1)_3px)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,176,0,0.05),transparent_70%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-neon/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-data/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header: Mission Control Style */}
      <header className="relative z-10 flex justify-between items-center px-12 py-8 border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-10">
          <motion.button
            whileHover={{ scale: 1.1, x: -5, backgroundColor: 'rgba(255,176,0,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-4 rounded-full border border-amber-neon/20 text-amber-neon transition-all"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-[0.5em] text-white uppercase">Neural_Process_Stream</h1>
              <div className="px-2 py-0.5 bg-amber-neon text-black text-[10px] font-black rounded-sm">LIVE_FEED</div>
            </div>
            <p className="text-[10px] font-mono text-amber-neon/40 tracking-[0.4em] uppercase">Session_ID: 0x7F2A9B_SYNAPSE_v4.2.0 // Node: CORTEX_PRIMARY</p>
          </div>
        </div>

        <div className="flex gap-16">
          <div className="space-y-2">
            <div className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">System Entropy</div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-mono font-black text-amber-neon">1.24</span>
              <span className="text-[10px] font-mono opacity-30 mb-1">BITS/SEC</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">Threat Level</div>
            <div className="flex items-end gap-2">
              <span className={`text-2xl font-mono font-black ${threatLevel > 70 ? 'text-red-500 animate-pulse' : 'text-amber-neon'}`}>
                {threatLevel}
              </span>
              <span className="text-[10px] font-mono opacity-30 mb-1">%_CRITICAL</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Neural Matrix & Visualization */}
        <div className="flex-[1.4] relative border-r border-white/5 p-10 flex flex-col gap-10">
          {/* Top: Synaptic Map */}
          <div className="flex-1 relative bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden group">
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3 text-[10px] font-black tracking-[0.3em] text-amber-neon/60">
              <Cpu size={14} />
              SYNAPTIC_MAP_v2.0
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <svg ref={svgRef} className="w-full h-full" />
            </div>

            <div className="absolute inset-0 p-12 grid grid-cols-12 gap-4">
              {Array.from({ length: 144 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: activeNodes.includes(i) ? 1 : 0.05,
                    scale: activeNodes.includes(i) ? 1.2 : 1,
                    backgroundColor: activeNodes.includes(i) ? 'rgba(255, 176, 0, 0.4)' : 'rgba(255, 255, 255, 0.02)'
                  }}
                  className="aspect-square border border-white/5 rounded-sm flex items-center justify-center relative"
                >
                  {activeNodes.includes(i) && (
                    <motion.div 
                      layoutId="node-glow"
                      className="absolute inset-0 bg-amber-neon/20 blur-xl rounded-sm"
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Scanning Line */}
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 w-full h-[1px] bg-amber-neon/20 z-20 shadow-[0_0_15px_rgba(255,176,0,0.5)]"
            />
          </div>

          {/* Bottom: DNA Stream & Metrics */}
          <div className="h-48 flex gap-10">
            <div className="flex-1 bg-white/[0.02] rounded-xl border border-white/5 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-black tracking-[0.3em] text-cyan-data">NEURAL_DNA_STREAM</div>
                <div className="text-[8px] font-mono opacity-30">ENCRYPTED_v8</div>
              </div>
              <div className="flex-1 flex items-end gap-1.5">
                {Array.from({ length: 48 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: [`${20 + Math.random() * 80}%`, `${20 + Math.random() * 80}%`],
                      opacity: [0.2, 0.8, 0.2]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
                    className="flex-1 bg-cyan-data rounded-full"
                  />
                ))}
              </div>
            </div>
            <div className="w-64 bg-white/[0.02] rounded-xl border border-white/5 p-6 flex flex-col justify-center gap-4">
              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-widest opacity-30">Sync Stability</div>
                <div className="text-xl font-mono font-black text-green-400">99.98%</div>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-widest opacity-30">Neural Density</div>
                <div className="text-xl font-mono font-black text-amber-neon">1.4k/μm³</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Intelligence Panels */}
        <div className="flex-1 flex flex-col bg-black/60 backdrop-blur-xl">
          {/* Adversary Panel */}
          <div className="flex-1 p-10 border-b border-white/5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-xs font-black tracking-[0.3em] text-red-500">
                <AlertTriangle size={18} />
                ADVERSARY_COMMAND_LOG
              </div>
              <div className="text-[9px] font-mono opacity-30 uppercase tracking-widest">Live_Intercept</div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
              {attackerLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 bg-red-500/5 border border-red-500/10 rounded-lg relative group overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-red-400 tracking-widest uppercase">{log.layer}</span>
                    <span className="text-[9px] font-mono opacity-40">{log.timestamp}</span>
                  </div>
                  <p className="text-xs font-mono text-red-100/70 leading-relaxed">{log.action}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Deception Panel */}
          <div className="flex-1 p-10 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-xs font-black tracking-[0.3em] text-cyan-data">
                <Shield size={18} />
                FINOME_DECEPTION_CORE
              </div>
              <div className="text-[9px] font-mono opacity-30 uppercase tracking-widest">Active_Mitigation</div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
              {deceptionLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 bg-cyan-data/5 border border-cyan-data/10 rounded-lg relative group overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-data" />
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-cyan-data tracking-widest uppercase">DECEPTION</span>
                    <span className="text-[9px] font-mono opacity-40">{log.timestamp}</span>
                  </div>
                  <p className="text-xs font-mono text-cyan-100/70 leading-relaxed mb-3">{log.response}</p>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-cyan-data/40">
                    <Zap size={10} />
                    <span>MUTATION: {log.mutation}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-16 border-t border-white/5 bg-black/80 flex items-center px-12 justify-between relative z-10">
        <div className="flex gap-12 items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono text-green-500/60 font-bold tracking-widest">NEURAL_SYNC_STABLE</span>
          </div>
          <div className="flex items-center gap-3">
            <Activity size={14} className="text-amber-neon/40" />
            <span className="text-[10px] font-mono text-amber-neon/40 font-bold tracking-widest">LATENCY: 0.002MS</span>
          </div>
          <div className="flex items-center gap-3">
            <Database size={14} className="text-amber-neon/40" />
            <span className="text-[10px] font-mono text-amber-neon/40 font-bold tracking-widest">CORE_TEMP: 34°C</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-[10px] font-mono text-white/20 tracking-widest">FINOME_v4.2.0_STABLE</div>
          <div className="px-6 py-2 bg-white text-black text-[10px] font-black tracking-[0.3em] uppercase rounded-full">
            Autonomous_Mode
          </div>
        </div>
      </footer>
    </motion.div>
  );
};
