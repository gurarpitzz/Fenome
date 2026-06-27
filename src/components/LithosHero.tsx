import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowDown, Compass, Eye, ShieldAlert, Cpu } from 'lucide-react';

const BG_IMAGE_1 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";

const SPOTLIGHT_R = 260;

interface LithosHeroProps {
  onStartDigging: () => void;
  standalone?: boolean;
}

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

const RevealLayer: React.FC<RevealLayerProps> = ({ image, cursorX, cursorY }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and match dimension
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Default to center if cursor position is not yet tracked
    const rx = cursorX < 0 ? canvasSize.width / 2 : cursorX;
    const ry = cursorY < 0 ? canvasSize.height / 2 : cursorY;

    // Direct translation of requested gradient stops
    const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, SPOTLIGHT_R);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
    grad.addColorStop(0.75, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.12)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rx, ry, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    try {
      const dataUrl = canvas.toDataURL();
      setMaskStyle({
        maskImage: `url(${dataUrl})`,
        WebkitMaskImage: `url(${dataUrl})`,
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
      });
    } catch (e) {
      console.warn("Masking failed, falling back to spotlight clipping path:", e);
      setMaskStyle({
        clipPath: `circle(${SPOTLIGHT_R}px at ${rx}px ${ry}px)`,
        WebkitClipPath: `circle(${SPOTLIGHT_R}px at ${rx}px ${ry}px)`
      });
    }
  }, [cursorX, cursorY, canvasSize]);

  return (
    <>
      <canvas 
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ display: 'none' }}
        className="absolute inset-0 pointer-events-none z-20"
      />
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{ 
          backgroundImage: `url(${image})`,
          ...maskStyle
        }}
      />
    </>
  );
};

export const LithosHero: React.FC<LithosHeroProps> = ({ onStartDigging, standalone = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mouseRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    // Mouse listener inside viewport limits
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    // Set initial position to center on load
    mouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    smoothRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    window.addEventListener('mousemove', handleMouseMove);

    let rafId: number;
    const updatePosition = () => {
      // Easing linear interpolation
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.1;
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.1;
      setCursorPos({ x: smoothRef.current.x, y: smoothRef.current.y });
      rafId = requestAnimationFrame(updatePosition);
    };
    rafId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white tracking-[-0.02em] select-none text-left" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Navigation overlay */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5 bg-gradient-to-b from-black/60 to-transparent">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <svg 
            width={26} 
            height={26} 
            viewBox="0 0 256 256" 
            fill="#ffffff"
            className="hover:rotate-12 transition-transform duration-300"
          >
            <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
          </svg>
          <span className="text-white text-2xl font-playfair italic">Lithos</span>
        </div>

        {/* Center pill */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1 select-none">
          <button className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-white/15">
            Course
          </button>
          {['Field Guides', 'Geology', 'Plans', 'Live Tour'].map((item) => (
            <button 
              key={item}
              className="text-white/80 hover:bg-white/20 hover:text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {!standalone && (
            <button 
              onClick={onStartDigging}
              className="bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold px-4 py-2 rounded-full transition-all flex items-center gap-2 uppercase tracking-widest cursor-pointer"
            >
              <Cpu size={12} className="animate-spin-slow" /> FINOME CYBER INTERFACE
            </button>
          )}
          <button 
            onClick={onStartDigging}
            className="bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white hover:text-white/80 p-2"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl pt-24 px-6 flex flex-col gap-6 md:hidden"
          >
            {['Course', 'Field Guides', 'Geology', 'Plans', 'Live Tour'].map((item) => (
              <button 
                key={item}
                className="text-white text-xl font-medium text-left border-b border-white/5 pb-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </button>
            ))}
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onStartDigging();
              }}
              className="bg-[#e8702a] text-white text-center py-4 rounded-full font-bold mt-4"
            >
              Start Digging
            </button>
            {!standalone && (
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onStartDigging();
                }}
                  className="border border-white/20 text-white text-center py-4 rounded-full font-semibold"
                >
                  Launch Finome Dashboard
                </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Section */}
      <section 
        className="relative w-full overflow-hidden h-screen bg-black"
        style={{ height: '100dvh' }}
      >
        {/* Base Layer */}
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />

        {/* Reveal Layer */}
        <RevealLayer 
          image={BG_IMAGE_2}
          cursorX={cursorPos.x}
          cursorY={cursorPos.y}
        />

        {/* Heading Block */}
        <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
          <h1 className="text-white leading-[0.95] flex flex-col items-center select-none font-sans font-normal text-6xl sm:text-7xl md:text-8xl">
            <span 
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
            >
              Layers hold
            </span>
            <span 
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
            >
              tales of time
            </span>
          </h1>
        </div>

        {/* Bottom Left description text */}
        <div className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade" style={{ animationDelay: '0.7s' }}>
          <p className="text-sm text-white/80 leading-relaxed font-sans">
            Every layer of sediment records a chapter of our planet, from ancient seabeds to drifting ash, layered across millions of years beneath us.
          </p>
        </div>

        {/* Bottom Right detail blocks & Actions */}
        <div 
          className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.85s' }}
        >
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans select-text">
            Our interactive maps let you peel back the crust to trace how stones, fossils, and deep time combine to shape the ground beneath your feet.
          </p>
          <button 
            onClick={onStartDigging}
            className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30 cursor-pointer text-left"
          >
            Start Digging
          </button>
        </div>

        {/* Bottom Indicator arrow of active screen scanning */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 opacity-40 z-40 text-white font-mono text-[9px] tracking-widest uppercase">
          <span className="animate-pulse">Move Cursor to Deep Scan</span>
          <ArrowDown className="text-white animate-bounce" size={12} />
        </div>
      </section>

    </div>
  );
};
