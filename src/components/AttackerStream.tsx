import React from 'react';
import { motion } from 'motion/react';
import { AttackerAction } from '../lib/aetherEngine';
import { Terminal, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

interface AttackerStreamProps {
  logs: AttackerAction[];
}

export const AttackerStream: React.FC<AttackerStreamProps> = ({ logs }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
        {logs.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 30
              }
            }}
            whileHover={{ x: 5 }}
            className={cn(
              "text-[10px] font-mono leading-relaxed p-4 rounded-2xl border border-white/5 transition-colors duration-300",
              log.maliciousness > 70 ? "bg-red-threat/10 border-red-threat/20" : "bg-white/[0.02] hover:bg-white/[0.05]"
            )}
          >
            <div className="flex justify-between items-center mb-2 opacity-40">
              <span className="text-[8px] tracking-widest">[{log.timestamp}]</span>
              <span className="font-bold uppercase tracking-tighter">{log.layer}</span>
            </div>
            <div className="flex gap-2 items-start mb-3">
              {log.maliciousness > 70 && <ShieldAlert size={12} className="text-red-threat mt-0.5 shrink-0" />}
              <span className={cn(
                "font-medium leading-snug",
                log.maliciousness > 70 ? "text-red-threat" : "opacity-80"
              )}>
                {log.action}
              </span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${log.maliciousness}%` }}
                className={cn(
                  "h-full shadow-[0_0_10px_rgba(255,176,0,0.5)]",
                  log.maliciousness > 70 ? "bg-red-threat shadow-[0_0_10px_rgba(255,31,31,0.5)]" : "bg-amber-neon"
                )}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
