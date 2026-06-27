import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Zap, Shield, Activity, Globe, Lock, Database } from 'lucide-react';
import { FinomeLogo } from './FinomeLogo';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('INITIALIZING_CORE');
  const [isReady, setIsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const STATUS_MESSAGES = [
    'ESTABLISHING_NEURAL_LINK',
    'DECRYPTING_FINOME_STREAM',
    'SYNCHRONIZING_DNA_SEQUENCES',
    'MAPPING_GLOBAL_MESH',
    'CALIBRATING_DECEPTION_ENGINE',
    'SYSTEM_READY'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        const next = prev + Math.random() * 8;
        const statusIndex = Math.floor((next / 100) * STATUS_MESSAGES.length);
        setStatus(STATUS_MESSAGES[Math.min(statusIndex, STATUS_MESSAGES.length - 1)]);
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const particleCount = 300;
    
    // Create an expansive neural field
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 1.5 + 0.5,
        color: i % 10 === 0 ? '#00F0FF' : '#FFB000',
        pulse: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.2
      });
    }

    let animationFrame: number;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Chromatic Aberration Effect
      const passes = [
        { color: 'rgba(255, 0, 0, 0.2)', offset: -1 },
        { color: 'rgba(0, 255, 255, 0.2)', offset: 1 },
        { color: 'white', offset: 0 }
      ];

      passes.forEach(pass => {
        ctx.globalCompositeOperation = 'screen';
        
        particles.forEach((p, i) => {
          // Move particles towards the viewer
          p.z -= p.speed * 2;
          if (p.z <= 0) p.z = 1000;

          // Perspective Projection
          const perspective = 600 / p.z;
          const x = centerX + (p.x - centerX) * perspective + pass.offset;
          const y = centerY + (p.y - centerY) * perspective;

          const pPulse = Math.sin(time * 0.002 + p.pulse) * 0.5 + 0.5;

          // Draw Particle
          if (pass.offset === 0) {
            ctx.beginPath();
            const radius = Math.max(0.1, p.size * perspective * (1 + pPulse * 0.5));
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.min(1, (1000 - p.z) / 800) * perspective;
            ctx.fill();
          }

          // Draw Connections (Organic mesh)
          if (i % 15 === 0) {
            for (let j = i + 1; j < particles.length; j += 40) {
              const p2 = particles[j];
              const x2 = centerX + (p2.x - centerX) * (600 / p2.z) + pass.offset;
              const y2 = centerY + (p2.y - centerY) * (600 / p2.z);

              const distSq = (x - x2) ** 2 + (y - y2) ** 2;
              if (distSq < 200 * 200) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = pass.color === 'white' ? p.color : pass.color;
                ctx.globalAlpha = (1 - Math.sqrt(distSq) / 200) * 0.1 * perspective;
                ctx.stroke();
              }
            }
          }
        });
      });

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      animationFrame = requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const [glitchText, setGlitchText] = useState('');

  useEffect(() => {
    const glitch = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
      let iterations = 0;
      const interval = setInterval(() => {
        setGlitchText(prev => 
          status.split('').map((char, index) => {
            if (index < iterations) return status[index];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('')
        );
        if (iterations >= status.length) clearInterval(interval);
        iterations += 1 / 3;
      }, 30);
    };
    glitch();
  }, [status]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Iris Opening Effect */}
      <div className="absolute inset-0 z-[110] pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ rotate: i * 45, scale: 1 }}
            animate={{ scale: 0 }}
            transition={{ duration: 1.5, ease: [0.87, 0, 0.13, 1], delay: 0.2 }}
            className="absolute inset-0 bg-black origin-center"
            style={{
              clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)',
              transform: `rotate(${i * 45}deg)`
            }}
          />
        ))}
      </div>

      {/* Digital DNA Streams */}
      <div className="absolute inset-0 flex justify-between px-4 pointer-events-none opacity-5">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '-100%' }}
            animate={{ y: '100%' }}
            transition={{ duration: 15 + Math.random() * 15, repeat: Infinity, ease: "linear" }}
            className="text-[6px] font-mono flex flex-col gap-1 text-amber-neon"
          >
            {[...Array(80)].map((_, j) => (
              <span key={j}>{Math.random().toString(16).substring(2, 4).toUpperCase()}</span>
            ))}
          </motion.div>
        ))}
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-amber-neon/5 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-cyan-data/5 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Corner Brackets */}
      <div className="absolute inset-8 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-white" />
        <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-white" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-white" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-white" />
      </div>

      {/* Sleek HUD Layout */}
      <div className="absolute inset-16 flex flex-col justify-between pointer-events-none">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex items-center gap-6"
          >
            <FinomeLogo 
              threatLevel={45} 
              isPlaying={true} 
              size={64} 
            />
            <div>
              <h1 className="text-4xl font-black tracking-[0.4em] uppercase text-white animate-shimmer">FINOME</h1>
              <p className="text-[8px] font-mono tracking-[0.6em] opacity-30 uppercase">Temporal Financial Twin</p>
            </div>
          </motion.div>

          <div className="flex gap-8 opacity-20">
            {[Globe, Lock, Database].map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <Icon size={18} className="text-white" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Activity size={14} className="text-amber-neon animate-pulse" />
              <motion.span 
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }}
                className="text-amber-neon font-mono text-[10px] tracking-[0.4em] uppercase font-black"
              >
                {glitchText}
              </motion.span>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-mono opacity-20 uppercase tracking-[0.4em]">LAT: 37.7749° N / LNG: 122.4194° W</p>
              <p className="text-[8px] font-mono opacity-20 uppercase tracking-[0.4em]">Entropy_Rate: 1.24b_STABLE</p>
              <p className="text-[8px] font-mono opacity-20 uppercase tracking-[0.4em]">Node_ID: 0x7F2A9B_STABLE</p>
            </div>
          </div>

          <div className="w-96 space-y-4">
            <div className="flex justify-between items-end font-mono text-[10px] tracking-[0.4em] uppercase">
              <span className="opacity-30">Initialization Progress</span>
              <span className="text-amber-neon font-black">{Math.round(progress)}%</span>
            </div>
            <div className="h-[2px] w-full bg-white/5 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-amber-neon shadow-[0_0_20px_#FFB000]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enter Button */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative z-[120]"
          >
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#FFB000', color: '#000' }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-12 py-5 border border-amber-neon text-amber-neon text-[12px] font-black uppercase tracking-[0.8em] rounded-full transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,176,0,0.3)]"
            >
              Enter System
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
