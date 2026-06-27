import React from 'react';
import { motion } from 'motion/react';
import { DeceptionResponse } from '../lib/aetherEngine';
import { Cpu, Zap, Dna } from 'lucide-react';

interface DeceptionEngineProps {
  logs: DeceptionResponse[];
  isEngaging: boolean;
}

export const DeceptionEngine: React.FC<DeceptionEngineProps> = ({ logs, isEngaging }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pr-2">
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4">
            <Zap size={48} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Awaiting Threat</p>
          </div>
        )}
        
        {logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest opacity-30">
              <Zap size={10} className="text-amber-neon" />
              <span>Response Vector Generated</span>
              <span className="ml-auto font-mono">{log.timestamp}</span>
            </div>
            
            <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl relative overflow-hidden group hover:bg-white/[0.05] transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-neon/40" />
              <p className="text-[11px] leading-relaxed italic opacity-90">
                "{log.response}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center gap-1.5 text-[7px] uppercase tracking-widest opacity-40 mb-2 font-bold">
                  <Cpu size={8} /> Analysis
                </div>
                <p className="text-[9px] leading-tight opacity-60 font-medium">{log.analysis}</p>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center gap-1.5 text-[7px] uppercase tracking-widest opacity-40 mb-2 font-bold">
                  <Dna size={8} /> Mutation
                </div>
                <p className="text-[9px] leading-tight opacity-60 font-medium">{log.mutation}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
