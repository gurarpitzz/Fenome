import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, ShieldAlert, Cpu, Layers, Radio, Lock, Unlock, HelpCircle, 
  Terminal, Binary, Crosshair, Sparkles, RefreshCw, Maximize2, Minimize2,
  AlertTriangle, Flame, Activity, Zap
} from 'lucide-react';

interface PayloadVulnerability {
  offset: string;
  opCode: string;
  instruction: string;
  threatLevel: 'CRITICAL_THREAT' | 'HIGH_WARNING' | 'COMPROMISED_LINK' | 'STEALTH_REVEAL';
  desc: string;
}

interface ScannerTarget {
  id: string;
  packageName: string;
  title: string;
  fileCoverText: string;
  signalsFound: number;
  baseHex: string[];
  vulnerabilities: PayloadVulnerability[];
}

const SCANNER_TARGETS: ScannerTarget[] = [
  {
    id: 'anubis_overlay',
    title: 'Anubis Banking Trojan Injector',
    packageName: 'com.sbi.secure.verify',
    fileCoverText: 'OBFUSCATED_XML_STRUCTURE_BLOCKED',
    signalsFound: 3,
    baseHex: [
      '00 1E 4A BF C2 E4 90 1D |  AE 04 2E C4 D8 9A F0 12',
      '1C CF 2F DA B4 18 FE E2 |  7B FC BA D4 3C 12 CC 94',
      'A1 0D FA 9E 1C 5B 05 FF |  A4 BB C1 20 DA FB E3 15',
      '74 08 FD E5 99 21 D4 CE |  FE BC AA DD C1 13 45 E4',
      '0F 12 A9 8C D2 D3 F1 E9 |  00 9A BB CC DA EF FB F5',
    ],
    vulnerabilities: [
      { offset: '0x3E1C', opCode: '1A 0F 2E 9C', instruction: 'RECEIVE_SMS_BROADCAST_INTERCEPT', threatLevel: 'CRITICAL_THREAT', desc: 'SILENT INTERCEPT ROUTINE ACTIVESTREAM FOR ONCE-TIME PIN (OTP) CODES' },
      { offset: '0x3E40', opCode: '44 FE BB 1D', instruction: 'SYSTEM_ALERT_WINDOW_OVERLAY', threatLevel: 'CRITICAL_THREAT', desc: 'MOCK INTERFACE COVERS TO STEAL USER BANKING CREDENTIALS (PHISHING)' },
      { offset: '0x3E8B', opCode: '3C A1 B4 FE', instruction: 'SOCKET_ESTABLISH: wss://103.242.12.5/receiver', threatLevel: 'COMPROMISED_LINK', desc: 'STOLEN CELLULAR MESSAGES EXFILTRATION WEB TUNNEL ADDR' },
    ]
  },
  {
    id: 'spynote_keylog',
    title: 'SpyNote Premium Global Keylogger',
    packageName: 'com.whatsapp.beta.secure',
    fileCoverText: 'BYTECODE_ACCESSIBILITY_INTERCEPT_RAW',
    signalsFound: 2,
    baseHex: [
      'EF F2 AA FE C2 10 59 BD |  CC 09 DA FB F3 A1 BD 23',
      'A1 C5 FE BD 2E FE DA FE |  0F A4 BA D3 D4 CB BC FE',
      'C4 EB DA 23 DE F1 D4 FC |  E3 DA BB EF CC DA BD 2D',
      'F1 2D DA C5 B4 DB FC 94 |  BE DD A4 12 EF CA FB E4',
      '0B D0 FE 3F A2 D4 F2 ED |  F4 BD 20 CA C1 DE AD 02',
    ],
    vulnerabilities: [
      { offset: '0x7C04', opCode: '90 EF 2D DA', instruction: 'BIND_ACCESSIBILITY_SERVICE_SNIFF', threatLevel: 'CRITICAL_THREAT', desc: 'KEYLOGS RAW KEYSTROKES FROM ALL INPUT VISUAL INTERACTIVE ELEMENTS GLOBALLY' },
      { offset: '0x7C50', opCode: '8E 4F 3D B9', instruction: 'TRAVERSE_ACTIVE_WINDOW_NODE_TREES', threatLevel: 'HIGH_WARNING', desc: 'EXTRACTS SCREEN DATA ELEMENTS AND EXPORT FOR TELEMETRY THREAT ANALYZERS' },
    ]
  }
];

export const CyberSpotlightScanner: React.FC = () => {
  const [activeTarget, setActiveTarget] = useState<ScannerTarget>(SCANNER_TARGETS[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [lensLock, setLensLock] = useState<boolean>(false);
  const [customFrequency, setCustomFrequency] = useState<number>(374.85);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const [smoothPos, setSmoothPos] = useState({ x: -999, y: -999 });
  const isHoveredRef = useRef<boolean>(false);
  const [isLensInView, setIsLensInView] = useState<boolean>(false);

  const spotlightR = isFullScreen ? 250 : 150;

  // Render glowing signal spectrum canvas waves
  useEffect(() => {
    let animId: number;
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.5;
      
      // Draw Grid Lines first
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 15) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += 10) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Spectral green bounce
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.65)';
      ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
      ctx.shadowBlur = 8;
      for (let i = 0; i < canvas.width; i++) {
        const y = canvas.height * 0.5 + Math.sin(i * 0.03 + phase) * 12 * Math.cos(i * 0.005 + phase * 0.5);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Cyber cyan sweep
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
      ctx.shadowBlur = 12;
      for (let i = 0; i < canvas.width; i++) {
        const y = canvas.height * 0.5 + Math.sin(i * 0.04 - phase * 1.3) * 15 * Math.sin(i * 0.015 + phase * 0.4);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Alarm red threat pulse
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 31, 31, 0.5)';
      ctx.shadowColor = 'rgba(255, 31, 31, 0.3)';
      ctx.shadowBlur = 10;
      for (let i = 0; i < canvas.width; i++) {
        const amplitudeMultiplier = smoothPos.x > 0 ? (Math.abs(smoothPos.x - i) < 80 ? 2.5 : 0.6) : 1;
        const y = canvas.height * 0.5 + Math.cos(i * 0.06 + phase * 2.2) * 6 * amplitudeMultiplier * Math.sin(phase);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Reset shadows
      ctx.shadowBlur = 0;
      
      phase += 0.04;
      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [smoothPos, isFullScreen]);

  // Smooth mouse lerp specifically inside this dashboard panel component
  useEffect(() => {
    let rafId: number;
    let currentX = -999;
    let currentY = -999;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || lensLock) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Ensure cursor is inside our element boundaries
      if (x >= -50 && x <= rect.width + 50 && y >= -50 && y <= rect.height + 50) {
        setMousePos({ x, y });
        isHoveredRef.current = true;
        setIsLensInView(true);
      } else {
        isHoveredRef.current = false;
        setIsLensInView(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const lerp = () => {
      if (isHoveredRef.current && !lensLock) {
        if (currentX === -999) {
          currentX = mousePos.x;
          currentY = mousePos.y;
        } else {
          currentX += (mousePos.x - currentX) * 0.12;
          currentY += (mousePos.y - currentY) * 0.12;
        }
        setSmoothPos({ x: currentX, y: currentY });
      } else if (lensLock) {
        // Keeps it locked in center
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const targetX = rect.width / 2;
          const targetY = rect.height / 2;
          currentX += (targetX - currentX) * 0.1;
          currentY += (targetY - currentY) * 0.1;
          setSmoothPos({ x: currentX, y: currentY });
        }
      }
      rafId = requestAnimationFrame(lerp);
    };

    rafId = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [mousePos, lensLock]);

  // Redraw circular mask canvas dynamically
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    // Use an interval to catch transitions
    const timer = setInterval(updateSize, 250);
    window.addEventListener('resize', updateSize);
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', updateSize);
    };
  }, [isFullScreen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Default coordinates (either centered or current smooth tracking cursor)
    const rx = smoothPos.x < 0 ? canvasSize.width / 2 : smoothPos.x;
    const ry = smoothPos.y < 0 ? canvasSize.height / 2 : smoothPos.y;

    // Draw high quality radial spotlight mask
    const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, spotlightR);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.72)');
    grad.addColorStop(0.72, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(0.9, 'rgba(255, 255, 255, 0.08)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rx, ry, spotlightR, 0, Math.PI * 2);
    ctx.fill();

    const dataUrl = canvas.toDataURL();
    setMaskStyle({
      maskImage: `url(${dataUrl})`,
      WebkitMaskImage: `url(${dataUrl})`,
      maskSize: '100% 100%',
      WebkitMaskSize: '100% 100%'
    });
  }, [smoothPos, canvasSize, spotlightR]);

  const selectTarget = (t: ScannerTarget) => {
    setActiveTarget(t);
    // Visual flash/scramble effect on frequency selector
    setCustomFrequency(Math.floor(Math.random() * 800) + 120);
  };

  const mainScannerContent = (
    <div className={`w-full h-full flex flex-col bg-neutral-950 text-left select-none relative overflow-hidden font-sans ${isFullScreen ? 'p-6 rounded-none' : 'rounded-3xl border border-white/5 shadow-2xl'}`}>
      
      {/* Absolute high-glow neon matrix highlights if full screen */}
      {isFullScreen && (
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 via-amber-400 to-cyan-400 animate-pulse z-45" />
      )}

      {/* Top dashboard metadata widget bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 border-b border-white/5 bg-black/40 shrink-0 gap-3 relative z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 animate-pulse">
            <Radio size={16} className="animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase text-white font-mono tracking-widest flex items-center gap-2">
              Deep Spectral <span className="text-amber-400 text-shadow-amber font-mono font-black">Payload X-Ray Scan</span>
              {isFullScreen && <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-mono tracking-normal leading-none uppercase">IMMERSIVE MODE ACTIVE</span>}
            </h4>
            <p className="text-[9px] opacity-40 uppercase font-bold font-mono mt-0.5 tracking-wider">Dynamic lens decryption isolating obfuscated mobile trojan packages</p>
          </div>
        </div>

        {/* Diagnostic settings & Full-screen switches */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-wrap gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl p-1">
            {SCANNER_TARGETS.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTarget(t)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-tight uppercase transition-all duration-300 cursor-pointer ${
                  activeTarget.id === t.id
                    ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(255,176,0,0.35)]'
                    : 'text-white/45 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.packageName.split('.').slice(-1)[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center justify-center"
            title={isFullScreen ? "Minimize Portal" : "Maximize Full Screen"}
          >
            {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main split interactive stage */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        
        {/* Left Side: Spotlight interactive scanning container */}
        <div className="flex-1 min-h-[300px] lg:h-full relative overflow-hidden bg-black/80 p-5 select-none flex flex-col justify-between">
          
          {/* Cover Header Status Indicator */}
          <div className="flex justify-between items-center relative z-40 mb-3 pointer-events-none">
            <div className="px-3 py-1 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2 scale-95 origin-left">
              <Binary size={12} className="text-cyan-400" />
              <span className="text-[9px] font-mono font-black text-white/60 tracking-widest uppercase">Target Obfuscated Bytes Map</span>
            </div>
            
            <div className={`px-3 py-1 rounded-xl flex items-center gap-2 scale-95 origin-right border ${lensLock ? 'bg-amber-400/10 border-amber-400/30 text-amber-400' : 'bg-red-500/10 border-red-500/30 text-red-400 animate-shimmer'}`}>
              <Lock size={10} />
              <span className="text-[9px] font-mono font-black uppercase tracking-widest leading-none">
                {lensLock ? "LENS LOCK SECURED" : "LENS HOVER SCANNING"}
              </span>
            </div>
          </div>

          {/* Canvas container with spotlight reveal mechanism strictly bound */}
          <div 
            ref={containerRef}
            className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 p-6 font-mono text-[10px] leading-relaxed cursor-crosshair group flex flex-col justify-center select-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
          >
            {/* Horizontal scanline laser animation inside this view */}
            <motion.div 
              className="absolute left-0 right-0 h-[2px] bg-red-500/35 shadow-[0_0_15px_#ff1f1f] pointer-events-none z-41"
              animate={{ top: ['0%', '100%'] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
            />

            {/* Base cover layer (Clean, blocked view) */}
            <div className="absolute inset-0 p-6 bg-neutral-950 flex flex-col justify-between select-none z-10 transition-all duration-300">
              <div className="space-y-2 opacity-25 font-mono">
                {activeTarget.baseHex.map((line, i) => (
                  <div key={i} className="flex justify-between text-neutral-400 font-mono text-[10.5px] select-none tracking-widest">
                    <span className="text-amber-400/60 pr-5 shrink-0 font-mono font-bold">0x00{i}FA8:</span>
                    <span className="truncate font-mono">{line}</span>
                  </div>
                ))}
              </div>

              {/* Big Warning shield indicating block */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1.5px] p-6 text-center select-none">
                <div className="w-14 h-14 rounded-full bg-neutral-900/90 border border-red-500/20 flex items-center justify-center text-red-500/80 mb-3 relative overflow-hidden group-hover:scale-110 group-hover:border-red-500/40 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                  <Lock size={18} className="animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/10" />
                </div>
                <h5 className="text-[12px] font-black uppercase tracking-[0.25em] text-red-400 mb-1 font-mono">{activeTarget.fileCoverText}</h5>
                <p className="text-[9px] text-white/40 uppercase tracking-widest max-w-[280px]">Sweep laser spotlight scan over container to extract bytecode structure</p>
              </div>
            </div>

            {/* Canvas mask for radial glowing lens reveal */}
            <canvas 
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              style={{ display: 'none' }}
              className="absolute inset-0 pointer-events-none z-20"
            />

            {/* Under-layer code (Decoded, high alert, beautiful colors) */}
            <div 
              className="absolute inset-0 p-6 bg-[#030712] z-30 pointer-events-none select-none flex flex-col justify-between shadow-[inset_0_0_50px_rgba(0,240,255,0.15)]"
              style={{ ...maskStyle }}
            >
              <div className="space-y-4 select-none font-mono">
                <div className="flex items-center gap-2 text-cyan-400 text-[11px] font-black uppercase tracking-widest pb-1 border-b border-cyan-400/20">
                  <Crosshair size={12} className="animate-spin-slow text-glow-cyan" /> DECRYPTED FORENSICS SPECTRAL SCAN:
                </div>
                
                {activeTarget.vulnerabilities.map((vuln, idx) => (
                  <div key={idx} className="space-y-1 font-mono text-left">
                    <div className="flex items-center gap-2.5 font-mono">
                      <span className="text-amber-400 font-extrabold font-mono">{vuln.offset}</span>
                      <span className="text-[8px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/30 font-mono uppercase font-black leading-none">{vuln.opCode}</span>
                      <span className="text-white font-bold font-mono text-[10px] truncate">{vuln.instruction}</span>
                    </div>
                    <p className="text-[9px] text-red-400 font-mono tracking-wider pl-1 font-medium bg-red-500/5 p-1 rounded-lg border border-red-500/5 inline-block">
                      {vuln.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status byte signature tracker in lens HUD */}
              <div className="text-[8.5px] font-mono text-emerald-400 flex justify-between items-center pt-2.5 border-t border-emerald-500/20 font-bold mt-4 select-none">
                <span className="flex items-center gap-1.5 font-mono uppercase tracking-[0.15em]">
                  <Sparkles size={11} className="text-emerald-400 animate-pulse" /> SPECTRUM RESOLVER v7.2
                </span>
                <span className="font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/25">FREQUENCY: {customFrequency.toFixed(2)} MHZ</span>
              </div>
            </div>

            {/* Glowing lens frame ring that trails the smooth cursor */}
            {isLensInView && !lensLock && (
              <div 
                className="absolute pointer-events-none z-50 rounded-full border border-cyan-400 bg-gradient-to-tr from-cyan-500/[0.04] to-red-500/[0.04] flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.45)] bg-transparent select-none scale-100"
                style={{ 
                  left: smoothPos.x - spotlightR, 
                  top: smoothPos.y - spotlightR,
                  width: spotlightR * 2,
                  height: spotlightR * 2
                }}
              >
                {/* Visual grid / HUD target lines inside lens */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[0.8px] bg-cyan-400/20 pointer-events-none" />
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[0.8px] bg-cyan-400/20 pointer-events-none" />
                <div className="absolute w-20 h-20 rounded-full border border-cyan-400/30 pointer-events-none border-dashed animate-spin-slow" />
                <div className="absolute w-12 h-12 rounded-full border border-red-500/40 pointer-events-none" />
                <div className="absolute top-4 text-[7.5px] text-cyan-400 font-mono font-black uppercase tracking-[0.25em] bg-black/80 px-2 py-0.5 rounded border border-cyan-400/25">SPECTRE RESOLUTION</div>
              </div>
            )}
          </div>

          {/* Quick calibration feedback controls at the base of left column */}
          <div className="flex justify-between items-center mt-4 z-40 relative gap-3">
            <button 
              onClick={() => setLensLock(!lensLock)}
              className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                lensLock 
                  ? 'bg-amber-400 border-amber-400 text-black shadow-lg shadow-amber-400/20' 
                  : 'bg-white/[0.04] hover:bg-white/10 border-white/10 text-white/75'
              }`}
            >
              {lensLock ? <Unlock size={11} /> : <Lock size={11} />}
              Toggle Lens Hold
            </button>

            <div className="flex-1 max-w-[210px] flex items-center gap-2.5">
              <span className="text-[8px] text-white/45 uppercase font-bold font-mono tracking-widest">Aperture Calib:</span>
              <div className="flex-1 h-1.5 bg-white/15 rounded-full overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 bg-cyan-400 rounded-full animate-pulse" style={{ width: '70%' }} />
              </div>
              <span className="text-[9px] text-cyan-400 font-mono font-black">{spotlightR}PX</span>
            </div>
          </div>

        </div>

        {/* Right Side: Threat Diagnostics Panel list */}
        <div className="w-full lg:w-80 bg-black/30 flex flex-col shrink-0 min-h-0 select-none p-5 text-left border-t lg:border-t-0 lg:border-l border-white/5 relative z-40">
          <div className="pb-3 border-b border-white/5 mb-4 font-mono text-[9px] uppercase tracking-wider text-white/35 font-black flex justify-between items-center select-none">
            <span>Spectrum Signals</span>
            <span className="text-red-400 font-black">({activeTarget.signalsFound} EXTRACTED)</span>
          </div>

          {/* List of vulnerabilities found */}
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar select-none pr-1">
            
            <div className="p-4 bg-neutral-900 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden group select-none shadow-[2px_2px_15px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-1.5">
                <Cpu size={14} className="text-amber-400 animate-pulse" />
                <span className="text-[9.5px] font-black font-mono text-white uppercase tracking-wider">Trojan Identification</span>
              </div>
              <div className="space-y-1.5 text-[9px] font-mono text-white/55 leading-relaxed">
                <div><span className="opacity-40 uppercase">Ident:</span> <span className="text-amber-400 font-mono select-text font-bold">{activeTarget.packageName}</span></div>
                <div><span className="opacity-40 uppercase">GNN Class:</span> <span className="text-red-400 font-bold font-mono uppercase bg-red-400/10 px-1.5 py-0.5 rounded">Critical {activeTarget.packageName.includes('whatsapp') ? 'Keylog' : 'SmsIn'}</span></div>
                <div><span className="opacity-40 uppercase">Audit state:</span> <span className="text-cyan-400 font-mono">COMPLETE (CORRELATED)</span></div>
              </div>
            </div>

            {/* Bouncing spectrum signal wave canvas container */}
            <div className="space-y-1.5">
              <span className="text-[8px] uppercase tracking-[0.2em] font-mono text-white/40 block font-bold">Spectral Oscilloscope</span>
              <div className="h-16 rounded-xl overflow-hidden bg-neutral-950 border border-white/10 relative">
                <canvas ref={waveCanvasRef} width={280} height={64} className="w-full h-full" />
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[8px] uppercase tracking-widest font-mono text-white/40 block font-bold">FORENSIC TELEMETRY ENGINE:</span>
              
              <div className="p-3 bg-[#FF1F1F]/5 border border-[#FF1F1F]/20 rounded-2xl text-left space-y-1.5">
                <div className="flex items-center gap-2 text-red-400 font-bold text-[9px] uppercase font-mono">
                  <ShieldAlert size={14} className="text-red-400" />
                  <span>Interactive overlay threat</span>
                </div>
                <p className="text-[8.5px] text-white/70 leading-normal font-mono uppercase">
                  This payload queries package permissions to deploy active window blockers. Swipe the focus lens onto highlighted offset markers inside the scanner box.
                </p>
              </div>

              <div className="p-3 bg-neutral-950/60 border border-white/5 rounded-2xl text-left space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-[9px] uppercase font-mono">
                  <Activity size={14} className="text-cyan-400 animate-pulse" />
                  <span>Spectroscopic resolution</span>
                </div>
                <p className="text-[8.5px] text-white/55 leading-normal font-mono uppercase">
                  Live emulation container simulates honeytoken transactions to intercept outbound commands safely inside our Sandbox loop.
                </p>
              </div>
            </div>

          </div>

          {/* Quick isolation active state */}
          <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-[8px] font-mono select-none">
            <span className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> System containment clear
            </span>
            <span className="text-white/20 select-none uppercase tracking-wider font-bold">SHIELD PROTOTYPE</span>
          </div>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {mainScannerContent}
      
      {/* Full screen immersive viewport overlay */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] bg-[#030712] p-6 flex flex-col"
          >
            {mainScannerContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
