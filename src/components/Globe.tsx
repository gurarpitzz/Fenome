import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  x: number;
  y: number;
  z: number;
  ox: number;
  oy: number;
  oz: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  fragmentSize: number;
}

interface GlobeProps {
  threatLevel: number;
}

const SURPRISE_INFO = [
  "NEURAL_LINK_ESTABLISHED",
  "DECEPTION_MATRIX_ACTIVE",
  "FINOME_CORE_STABLE",
  "THREAT_MITIGATION_IN_PROGRESS",
  "SYNAPTIC_SYNC_COMPLETE"
];

export const Globe: React.FC<GlobeProps> = ({ threatLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<string | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const explodedRef = useRef(false);
  const threatLevelRef = useRef(threatLevel);

  useEffect(() => {
    threatLevelRef.current = threatLevel;
  }, [threatLevel]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initParticles = (w: number, h: number) => {
      const r = Math.min(w, h) * 0.35;
      const particleCount = 2800;
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        newParticles.push({
          x: (Math.random() - 0.5) * w,
          y: (Math.random() - 0.5) * h,
          z: (Math.random() - 0.5) * r,
          ox: x, oy: y, oz: z,
          vx: 0, vy: 0, vz: 0,
          size: Math.random() * 1.5 + 0.5,
          fragmentSize: Math.random() * 0.5 + 0.2,
          color: i % 12 === 0 ? '#00F0FF' : '#FFB000'
        });
      }
      particlesRef.current = newParticles;
    };

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = width * window.devicePixelRatio;
          canvas.height = height * window.devicePixelRatio;
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
          if (particlesRef.current.length === 0) {
            initParticles(width, height);
          }
        }
      }
    });

    resizeObserver.observe(container);

    let rotationX = 0;
    let rotationY = 0;
    let animationFrame: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      mouseRef.current.x = (e.clientX - rect.left) - w / 2;
      mouseRef.current.y = (e.clientY - rect.top) - h / 2;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleClick = () => {
      explodedRef.current = !explodedRef.current;
      
      // Add initial burst velocity
      if (explodedRef.current) {
        particlesRef.current.forEach(p => {
          const force = 15 + Math.random() * 20;
          const angle = Math.random() * Math.PI * 2;
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
          p.vz += (Math.random() - 0.5) * force;
        });
        setInfo(SURPRISE_INFO[Math.floor(Math.random() * SURPRISE_INFO.length)]);
        setTimeout(() => setInfo(null), 2500);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);

    const render = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      const r = Math.min(w, h) * 0.35;

      if (w === 0 || h === 0) {
        animationFrame = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      
      rotationY += 0.003;
      rotationX += 0.001;

      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      const currentThreat = threatLevelRef.current;
      const threatR = 255;
      const threatG = Math.round(176 + (31 - 176) * (currentThreat / 100));
      const threatB = Math.round(0 + (31 - 0) * (currentThreat / 100));
      const threatColor = `rgb(${threatR}, ${threatG}, ${threatB})`;

      particlesRef.current.forEach(p => {
        let tx = p.ox;
        let ty = p.oy;
        let tz = p.oz;

        if (explodedRef.current) {
          // Scatter target
          tx *= 3.5;
          ty *= 3.5;
          tz *= 3.5;
          // Add jitter
          tx += (Math.random() - 0.5) * 100;
          ty += (Math.random() - 0.5) * 100;
        }

        // Mouse interaction
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            p.vx += dx * force * 0.15;
            p.vy += dy * force * 0.15;
          }
        }

        // Spring physics
        const springK = explodedRef.current ? 0.01 : 0.06;
        p.vx += (tx - p.x) * springK;
        p.vy += (ty - p.y) * springK;
        p.vz += (tz - p.z) * springK;

        // Friction
        const friction = explodedRef.current ? 0.92 : 0.82;
        p.vx *= friction;
        p.vy *= friction;
        p.vz *= friction;

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Rotation
        let rx = p.x;
        let ry = p.y * cosX - p.z * sinX;
        let rz = p.y * sinX + p.z * cosX;

        let finalX = rx * cosY + rz * sinY;
        let finalY = ry;
        let finalZ = -rx * sinY + rz * cosY;

        const perspective = 1500 / (1500 - finalZ);
        const px = finalX * perspective + w / 2;
        const py = finalY * perspective + h / 2;

        if (finalZ > -r * 3) {
          const alpha = Math.max(0.05, (finalZ + r * 2) / (r * 4));
          ctx.fillStyle = p.color === '#00F0FF' ? '#00F0FF' : threatColor;
          ctx.globalAlpha = alpha;
          
          const currentSize = explodedRef.current ? p.fragmentSize : p.size;
          
          ctx.beginPath();
          const pRadius = Math.max(0.1, currentSize * perspective);
          ctx.arc(px, py, pRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center cursor-pointer group">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
      
      <AnimatePresence>
        {info && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute bottom-12 px-4 py-2 bg-amber-neon/10 border border-amber-neon/30 backdrop-blur-xl rounded-full"
          >
            <span className="text-[10px] font-black tracking-[0.3em] text-amber-neon uppercase">{info}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,176,0,0.02),transparent_70%)]" />
      </div>
    </div>
  );
};
