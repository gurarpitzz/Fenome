import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThreatNode, ThreatLink } from '../types';
import { 
  ArrowRight, Landmark, AlertTriangle, ShieldCheck, 
  TrendingUp, CircleAlert, Sparkles, Terminal, Cpu, Sliders, 
  Play, CheckCircle2, RefreshCw, Send, Globe as GlobeIcon, FileCode, Layers
} from 'lucide-react';
import { cn } from '../lib/utils';

interface FraudNexusProps {
  nodes: ThreatNode[];
  links: ThreatLink[];
  isPlayingAutonomousMode?: boolean;
}

// Coordinate conversions for global fraud and proxy hubs
interface ExtractedNode {
  id: string;
  label: string;
  lat: number;
  lng: number;
  type: 'attacker' | 'proxy' | 'destination' | 'decoy';
  risk: number;
  status: 'ACTIVE' | 'INTERCEPTED' | 'MONITORED' | 'DECEPTIVE_ROUTED' | 'SIMULATED';
  ip?: string;
  country?: string;
}

interface ExtractedLink {
  source: string;
  target: string;
  weight: number;
  bytes: string;
}

const PRESET_NODES: ExtractedNode[] = [
  { id: "NODE_JAMTARA", label: "Jamtara Cyber Center", lat: 24.12, lng: 86.42, type: "attacker", risk: 98, status: "ACTIVE", ip: "103.242.12.5", country: "India" },
  { id: "NODE_MUMBAI", label: "Mumbai Gateway Hub", lat: -23.55, lng: -46.63, type: "proxy", risk: 75, status: "INTERCEPTED", ip: "182.72.19.14", country: "India" },
  { id: "NODE_DUBAI", label: "New Delhi Proxy Matrix", lat: 40.71, lng: -74.00, type: "proxy", risk: 84, status: "DECEPTIVE_ROUTED", ip: "103.45.12.44", country: "India" },
  { id: "NODE_CAYMAN", label: "Bengaluru Security HQ", lat: -33.86, lng: 151.20, type: "destination", risk: 92, status: "MONITORED", ip: "104.28.19.112", country: "India" },
  { id: "NODE_BERLIN", label: "Kolkata Decoy Matrix", lat: 52.52, lng: 13.40, type: "decoy", risk: 12, status: "SIMULATED", ip: "182.50.12.89", country: "India" },
  { id: "NODE_SINGAPORE", label: "Chennai Router Port", lat: -1.29, lng: 36.82, type: "proxy", risk: 65, status: "ACTIVE", ip: "116.12.4.92", country: "India" }
];

const PRESET_LINKS: ExtractedLink[] = [
  { source: "NODE_JAMTARA", target: "NODE_MUMBAI", weight: 0.95, bytes: "420 KB/s" },
  { source: "NODE_MUMBAI", target: "NODE_DUBAI", weight: 0.82, bytes: "1.4 MB/s" },
  { source: "NODE_DUBAI", target: "NODE_CAYMAN", weight: 0.91, bytes: "3.2 MB/s" },
  { source: "NODE_JAMTARA", target: "NODE_BERLIN", weight: 0.99, bytes: "5.4 MB/s (DECOY_FLOW)" },
  { source: "NODE_MUMBAI", target: "NODE_SINGAPORE", weight: 0.73, bytes: "890 KB/s" }
];

export const FraudNexus: React.FC<FraudNexusProps> = ({
  nodes: initialNodes,
  links: initialLinks,
  isPlayingAutonomousMode = false
}) => {
  // Google AI Studio Inspired Settings
  const [prompt, setPrompt] = useState<string>("Extract high-risk Jamtara OTP phishing nodes and plot exfiltration servers on the live globe.");
  const [systemInstructions, setSystemInstructions] = useState<string>("You are FINOME-AI, a military-grade honeypot deception model specialized in extracting financial fraud routing coordinates and intercepting mule accounts...");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [temperature, setTemperature] = useState<number>(0.75);
  const [safetySetting, setSafetySetting] = useState<boolean>(true);
  
  const [extractedNodes, setExtractedNodes] = useState<ExtractedNode[]>(PRESET_NODES);
  const [extractedLinks, setExtractedLinks] = useState<ExtractedLink[]>(PRESET_LINKS);
  const [summary, setSummary] = useState<string>("Autonomous Extraction Complete: Mapped active exfiltration tunnels targeting public sector clearing accounts across multiple mule hubs.");
  
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("NODE_JAMTARA");
  const [tokensCount, setTokensCount] = useState({ input: 1248, output: 654 });
  const [showSystemConfig, setShowSystemConfig] = useState<boolean>(false);
  const [countermeasureActive, setCountermeasureActive] = useState<string | null>(null);

  // 3D Canvas Refs & States
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredNodeRef = useRef<ExtractedNode | null>(null);
  const [hoveredNodeName, setHoveredNodeName] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Physics and rotation states (flinging support!)
  const rotationRef = useRef({ x: 0.3, y: 0.8 });
  const velocityRef = useRef({ x: 0.002, y: 0.003 });
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const lastDragPosRef = useRef({ x: 0, y: 0 });
  const burstParticlesRef = useRef<{ x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, maxLife: number, color: string }[]>([]);

  const selectedNode = extractedNodes.find(n => n.id === selectedNodeId) || null;

  // Handles Gemini AI Studio extraction call
  const handleExtractData = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (customPrompt) {
      setPrompt(customPrompt);
    }
    
    setIsExtracting(true);
    setCountermeasureActive(null);
    
    // Simulate dynamic AI Studio input tokens
    setTokensCount(prev => ({
      input: prev.input + Math.floor(Math.random() * 200) + 100,
      output: prev.output
    }));

    try {
      const response = await fetch("/api/extract-nexus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToUse,
          systemInstructions,
          model: selectedModel,
          temperature
        })
      });

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();

      if (data.nodes && data.nodes.length > 0) {
        // Enforce fallback IP & Country if omitted by AI
        const formattedNodes = data.nodes.map((n: any, i: number) => ({
          ...n,
          lat: typeof n.lat === 'number' ? n.lat : (typeof n.y === 'number' ? n.y : 0),
          lng: typeof n.lng === 'number' ? n.lng : (typeof n.x === 'number' ? n.x : 0),
          ip: n.ip || `103.${Math.floor(Math.random()*150)+50}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}`,
          country: n.country || (n.label.includes("Jamtara") ? "India" : n.label.includes("Cayman") ? "Cayman Islands" : "Unknown")
        }));
        
        setExtractedNodes(formattedNodes);
        setExtractedLinks(data.links || []);
        setSummary(data.summary || "Successful telemetry extraction completed.");
        if (formattedNodes[0]) {
          setSelectedNodeId(formattedNodes[0].id);
        }
      }
    } catch (e) {
      console.warn("Falling back to simulated data model:", e);
      // Fallback with fresh randomized risk coefficients
      const randomized = PRESET_NODES.map(node => ({
        ...node,
        risk: Math.min(100, Math.max(10, node.risk + Math.floor(Math.random() * 15) - 7)),
        status: Math.random() > 0.6 ? 'ACTIVE' : node.status
      }));
      setExtractedNodes(randomized);
      setSummary("System connection offline. Using deep caching reverse-engineering dataset exfiltrations.");
    } finally {
      setIsExtracting(false);
      setTokensCount(prev => ({
        ...prev,
        output: prev.output + Math.floor(Math.random() * 180) + 120
      }));
    }
  };

  const deployDeceptionCountermeasure = () => {
    if (!selectedNode) return;
    setCountermeasureActive(`Active decoy matrix deployed. Diverting traffic matching node ${selectedNode.label} to Finome simulated node ${selectedNode.id}_DECOY. Hostile C2 successfully hijacked.`);
    
    // Trigger visual blast particles on the node!
    triggerBurstOnSelectedNode();
  };

  const triggerBurstOnSelectedNode = () => {
    if (!selectedNode) return;
    const r = 166.4;
    const phi = (90 - selectedNode.lat) * (Math.PI / 180);
    const theta = (selectedNode.lng + 180) * (Math.PI / 180);
    const nx = r * Math.sin(phi) * Math.cos(theta);
    const ny = r * Math.cos(phi);
    const nz = r * Math.sin(phi) * Math.sin(theta);

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      burstParticlesRef.current.push({
        x: nx,
        y: ny,
        z: nz,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        vz: (Math.random() - 0.5) * speed,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        color: selectedNode.type === 'attacker' ? '#FF1F1F' : '#00F0FF'
      });
    }
  };

  // Canvas Core loop (Pure Math 3D Particle Globe)
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = width * window.devicePixelRatio;
          canvas.height = height * window.devicePixelRatio;
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
      }
    });
    resizeObserver.observe(container);

    // Generate background dots outlining the globe sphere
    const sphereDotsCount = 600;
    const sphereDots: { x: number, y: number, z: number, color: string, alpha: number }[] = [];
    for (let i = 0; i < sphereDotsCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / sphereDotsCount);
      const theta = Math.sqrt(sphereDotsCount * Math.PI) * phi;
      const radius = 166.4;
      sphereDots.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta),
        color: i % 10 === 0 ? 'rgba(0, 240, 255, 0.45)' : 'rgba(255, 176, 0, 0.2)',
        alpha: Math.random() * 0.4 + 0.3
      });
    }

    let animationFrame: number;
    let pulseProgress = 0;

    const render = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      const radius = 166.4;

      if (w === 0 || h === 0) {
        animationFrame = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // Atmospheric outer glow halos (planetary high-fidelity shield styling)
      const glowGradients = [
        { r: radius, color: 'rgba(0, 240, 255, 0.18)', width: 1.5 },
        { r: radius + 2, color: 'rgba(0, 240, 255, 0.09)', width: 3.0 },
        { r: radius + 6, color: 'rgba(0, 240, 255, 0.04)', width: 5.0 },
        { r: radius + 11, color: 'rgba(0, 240, 255, 0.02)', width: 8.5 }
      ];
      glowGradients.forEach(glow => {
        ctx.beginPath();
        ctx.strokeStyle = glow.color;
        ctx.lineWidth = glow.width;
        ctx.arc(w / 2, h / 2, glow.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Fling deceleration inertia
      if (!isDraggingRef.current) {
        rotationRef.current.y += velocityRef.current.y;
        rotationRef.current.x += velocityRef.current.x;
        velocityRef.current.y *= 0.94;
        velocityRef.current.x *= 0.94;

        // Keep a minimum idle spin rate
        if (Math.abs(velocityRef.current.y) < 0.0015) velocityRef.current.y = 0.0015;
        if (Math.abs(velocityRef.current.x) < 0.0005) velocityRef.current.x = 0.0005;
      }

      const rotY = rotationRef.current.y;
      const rotX = rotationRef.current.x;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // 3D rotation projection helper
      const project = (x3d: number, y3d: number, z3d: number) => {
        // Rotate around Y
        const x1 = x3d * cosY - z3d * sinY;
        const z1 = x3d * sinY + z3d * cosY;
        // Rotate around X
        const y2 = y3d * cosX - z1 * sinX;
        const z2 = y3d * sinX + z1 * cosX;

        const fov = 350;
        const scale = fov / (fov + z2);
        const px = x1 * scale + w / 2;
        const py = y2 * scale + h / 2;
        return { px, py, pz: z2, scale, visible: z2 < 179.2 };
      };

      // Orbit 1: Tilted cyber telemetry ring
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
      ctx.lineWidth = 0.8;
      const orbitRadius = radius * 1.35;
      for (let a = 0; a <= 360; a += 5) {
        const rad = a * Math.PI / 180;
        const ox = orbitRadius * Math.cos(rad);
        const oy = orbitRadius * Math.sin(rad) * 0.35;
        const oz = orbitRadius * Math.sin(rad) * 0.92;
        const { px, py, visible } = project(ox, oy, oz);
        if (visible) {
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // Draw satellite node on Orbit 1
      const orbitTime = Date.now() * 0.0006;
      const sx = orbitRadius * Math.cos(orbitTime);
      const sy = orbitRadius * Math.sin(orbitTime) * 0.35;
      const sz = orbitRadius * Math.sin(orbitTime) * 0.92;
      const sProj = project(sx, sy, sz);
      if (sProj.visible) {
        ctx.fillStyle = '#00F0FF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sProj.px, sProj.py, 3 * sProj.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.font = '7px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.fillText("DEC-SAT_01", sProj.px + 8, sProj.py + 2);
      }

      // Orbit 2: Inverse tilted routing telemetry ring
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 31, 31, 0.05)';
      ctx.lineWidth = 0.8;
      const orbitRadius2 = radius * 1.48;
      for (let a = 0; a <= 360; a += 5) {
        const rad = a * Math.PI / 180;
        const ox = -orbitRadius2 * Math.sin(rad) * 0.45;
        const oy = orbitRadius2 * Math.cos(rad);
        const oz = orbitRadius2 * Math.sin(rad) * 0.88;
        const { px, py, visible } = project(ox, oy, oz);
        if (visible) {
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      const orbitTime2 = -Date.now() * 0.0004;
      const sx2 = -orbitRadius2 * Math.sin(orbitTime2) * 0.45;
      const sy2 = orbitRadius2 * Math.cos(orbitTime2);
      const sz2 = orbitRadius2 * Math.sin(orbitTime2) * 0.88;
      const sProj2 = project(sx2, sy2, sz2);
      if (sProj2.visible) {
        ctx.fillStyle = '#FF1F1F';
        ctx.shadowColor = '#FF1F1F';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sProj2.px, sProj2.py, 2.5 * sProj2.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.font = '7px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 31, 31, 0.6)';
        ctx.fillText("TRAC-SAT_02", sProj2.px + 8, sProj2.py + 2);
      }

      // Draw elegant cyber latitude / longitude circles (Glow ring grid)
      ctx.lineWidth = 1;
      const ringLatitudes = [-60, -30, 0, 30, 60];
      ringLatitudes.forEach((latVal) => {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        const rSub = radius * Math.cos(latVal * Math.PI / 180);
        const yOffset = radius * Math.sin(latVal * Math.PI / 180);

        for (let a = 0; a <= 360; a += 10) {
          const rRad = a * Math.PI / 180;
          const { px, py } = project(rSub * Math.cos(rRad), yOffset, rSub * Math.sin(rRad));
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });

      // Draw passive spherical cloud dots
      sphereDots.forEach(dot => {
        const proj = project(dot.x, dot.y, dot.z);
        if (!proj.visible) return;

        // Depth alpha scaling
        const depthAlpha = Math.max(0.05, (radius - proj.pz) / (radius * 2));
        ctx.fillStyle = dot.color;
        ctx.globalAlpha = dot.alpha * depthAlpha;
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, Math.max(0.4, 0.9 * proj.scale), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw connection bezier arcs (exfiltration curves)
      pulseProgress = (pulseProgress + 0.007) % 1.0;
      ctx.lineWidth = 1.5;

      extractedLinks.forEach(link => {
        const srcNode = extractedNodes.find(n => n.id === link.source);
        const dstNode = extractedNodes.find(n => n.id === link.target);
        if (!srcNode || !dstNode) return;

        // Transform nodes into 3D Cartesian coordinates
        const phiSrc = (90 - srcNode.lat) * (Math.PI / 180);
        const thetaSrc = (srcNode.lng + 180) * (Math.PI / 180);
        const ax = radius * Math.sin(phiSrc) * Math.cos(thetaSrc);
        const ay = radius * Math.cos(phiSrc);
        const az = radius * Math.sin(phiSrc) * Math.sin(thetaSrc);

        const phiDst = (90 - dstNode.lat) * (Math.PI / 180);
        const thetaDst = (dstNode.lng + 180) * (Math.PI / 180);
        const bx = radius * Math.sin(phiDst) * Math.cos(thetaDst);
        const by = radius * Math.cos(phiDst);
        const bz = radius * Math.sin(phiDst) * Math.sin(thetaDst);

        // Control point C (Arched high-tech curve)
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2;
        const mz = (az + bz) / 2;
        const mLen = Math.sqrt(mx*mx + my*my + mz*mz);
        const arcStrength = 1.45; // Arches up outwards from the sphere
        const cx = (mx / mLen) * radius * arcStrength;
        const cy = (my / mLen) * radius * arcStrength;
        const cz = (mz / mLen) * radius * arcStrength;

        // Quadratic Bezier drawer
        ctx.beginPath();
        ctx.strokeStyle = srcNode.type === 'attacker' ? 'rgba(255, 31, 31, 0.25)' : 'rgba(0, 240, 255, 0.25)';
        
        const steps = 30;
        let lastPt = project(ax, ay, az);
        
        for (let i = 1; i <= steps; i++) {
          const tVal = i / steps;
          const invT = 1 - tVal;
          // Bezier formula
          const lx = invT * invT * ax + 2 * invT * tVal * cx + tVal * tVal * bx;
          const ly = invT * invT * ay + 2 * invT * tVal * cy + tVal * tVal * by;
          const lz = invT * invT * az + 2 * invT * tVal * cz + tVal * tVal * bz;

          const pL = project(lx, ly, lz);

          // 1. Draw outer wide glow line
          ctx.beginPath();
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = srcNode.type === 'attacker' ? `rgba(255, 31, 31, ${(0.04 + (1-tVal)*0.08)})` : `rgba(0, 240, 255, ${(0.04 + (1-tVal)*0.08)})`;
          ctx.moveTo(lastPt.px, lastPt.py);
          ctx.lineTo(pL.px, pL.py);
          ctx.stroke();

          // 2. Draw inner sharp laser line
          ctx.beginPath();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = srcNode.type === 'attacker' ? `rgba(255, 100, 100, ${(0.25 + (1-tVal)*0.45)})` : `rgba(100, 240, 255, ${(0.25 + (1-tVal)*0.45)})`;
          ctx.moveTo(lastPt.px, lastPt.py);
          ctx.lineTo(pL.px, pL.py);
          ctx.stroke();

          lastPt = pL;
        }

        // Draw active floating pulses traveling across connections
        const tPulse = pulseProgress;
        const invT = 1 - tPulse;
        const px = invT * invT * ax + 2 * invT * tPulse * cx + tPulse * tPulse * bx;
        const py = invT * invT * ay + 2 * invT * tPulse * cy + tPulse * tPulse * by;
        const pz = invT * invT * az + 2 * invT * tPulse * cz + tPulse * tPulse * bz;
        const pProj = project(px, py, pz);

        if (pProj.visible) {
          ctx.fillStyle = srcNode.type === 'attacker' ? '#FF1F1F' : '#00F0FF';
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.fillStyle;
          ctx.beginPath();
          ctx.arc(pProj.px, pProj.py, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      // Draw interactive pulsing nodes & map coordinates
      let foundHover: ExtractedNode | null = null;
      
      extractedNodes.forEach(node => {
        const phi = (90 - node.lat) * (Math.PI / 180);
        const theta = (node.lng + 180) * (Math.PI / 180);
        const nx = radius * Math.sin(phi) * Math.cos(theta);
        const ny = radius * Math.cos(phi);
        const nz = radius * Math.sin(phi) * Math.sin(theta);

        const proj = project(nx, ny, nz);
        if (!proj.visible) return;

        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeRef.current?.id === node.id;
        
        // Node marker colors matching type
        let color = '#00F0FF'; // default cyan
        if (node.type === 'attacker') color = '#FF1F1F';
        if (node.type === 'destination') color = '#FFAA00';
        if (node.type === 'decoy') color = '#10B981';

        const nodeRadius = isSelected ? 8 : (isHovered ? 6 : 4.5);
        const scaleRadius = Math.max(1.5, nodeRadius * proj.scale);

        // Interactive mouse hover calculation
        if (lastMousePosRef.current.x > 0) {
          const dx = proj.px - lastMousePosRef.current.x;
          const dy = proj.py - lastMousePosRef.current.y;
          if (Math.sqrt(dx*dx + dy*dy) < 16) {
            foundHover = node;
            setHoverPos({ x: proj.px, y: proj.py });
          }
        }

        // Pulse aura
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const auraMultiplier = 1.5 + Math.sin(Date.now() / 150) * 0.4;
        ctx.arc(proj.px, proj.py, scaleRadius * auraMultiplier, 0, Math.PI * 2);
        ctx.stroke();

        // Solid Node Core
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, scaleRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node Label
        ctx.font = '7.5px "JetBrains Mono", monospace';
        ctx.fillStyle = isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.55)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label.split(" ")[0], proj.px, proj.py - scaleRadius - 5);
      });

      // Update hovered ref
      hoveredNodeRef.current = foundHover;
      if (foundHover) {
        setHoveredNodeName((foundHover as ExtractedNode).label);
      } else {
        setHoveredNodeName(null);
      }

      // Draw active explosive burst particles (Countermeasures)
      burstParticlesRef.current.forEach((p, idx) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        
        // friction
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.vz *= 0.95;

        const pProj = project(p.x, p.y, p.z);
        if (pProj.visible) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 1 - (p.life / p.maxLife);
          ctx.beginPath();
          ctx.arc(pProj.px, pProj.py, Math.max(0.5, 2 * pProj.scale), 0, Math.PI * 2);
          ctx.fill();
        }
      });
      // Filter dead bursts
      burstParticlesRef.current = burstParticlesRef.current.filter(p => p.life < p.maxLife);
      ctx.globalAlpha = 1.0;

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [extractedNodes, extractedLinks, selectedNodeId]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastDragPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Store current exact local mouse position for hover checks
    lastMousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (!isDraggingRef.current) return;
    
    const deltaY = e.clientX - lastDragPosRef.current.x;
    const deltaX = e.clientY - lastDragPosRef.current.y;

    const sensitivity = 0.52; // Perfectly tuned middle-ground sensitivity

    rotationRef.current.y += deltaY * 0.00245 * sensitivity;
    rotationRef.current.x += deltaX * 0.00245 * sensitivity;

    velocityRef.current.y = deltaY * 0.0014 * sensitivity;
    velocityRef.current.x = deltaX * 0.0014 * sensitivity;

    lastDragPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = () => {
    if (hoveredNodeRef.current) {
      setSelectedNodeId(hoveredNodeRef.current.id);
      triggerBurstOnSelectedNode();
    }
  };

  return (
    <div className="w-full h-full min-h-[580px] relative bg-[#030303]/40 border border-white/5 rounded-3xl flex flex-col justify-between overflow-hidden text-white font-sans">
      
      {/* Absolute background sci-fi grids for high fidelity */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60 mix-blend-color-dodge" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.04)_0%,transparent_70%)]" />

      {/* ACTIVE 3D EXFILTRATION GLOBE VIEW STAGE (TAKES FULL BACKGROUND/FOREGROUND) */}
      <div ref={containerRef} className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing">
        <canvas 
          ref={canvasRef} 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Floating popover bubble on particle node hover */}
        <AnimatePresence>
          {hoveredNodeName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: -25 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute z-30 pointer-events-none bg-[#050505]/95 border border-cyan-data/40 p-3 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.25)] backdrop-blur-md"
              style={{ left: hoverPos.x, top: hoverPos.y }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={9} className="text-cyan-data animate-pulse" />
                <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider">{hoveredNodeName}</span>
              </div>
              <span className="text-[7.5px] text-white/50 block font-mono">Latitude: {hoveredNodeRef.current?.lat.toFixed(2)} • Longitude: {hoveredNodeRef.current?.lng.toFixed(2)}</span>
              <span className="text-[7.5px] font-mono text-red-threat uppercase tracking-widest block mt-0.5 animate-pulse">Threat Level: {hoveredNodeRef.current?.risk}%</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
