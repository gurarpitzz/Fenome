import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Radio, Laptop, Shield, Zap, RefreshCw, 
  Map, Target, Sparkles, Activity, Crosshair, HelpCircle,
  X, Compass, AlertTriangle, Users, Database, ArrowUpRight
} from 'lucide-react';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

interface TwinNode {
  id: string;
  row: number;
  col: number;
  faceIndex: number;
  isTargeted: boolean;
  targetRevealZoom: number;
  name: string;
  riskScore: number;
  fundsDiverted: number;
  nodeIp: string;
  country: string;
  status: string;
}

interface TwinLink {
  id: string;
  fromId: string;
  toId: string;
  revealZoom: number;
  pulseOffset: number;
}

interface DataPacket {
  linkId: string;
  progress: number; // 0 to 1
  speed: number;
  isForward: boolean;
}

// ============================================================================
// PROCEDURAL FACE GENERATION ENGINE
// ============================================================================

const FACES_COUNT = 64;

function generateProceduralFace(seed: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Clear background with deep tinted grey
  ctx.fillStyle = '#111115';
  ctx.fillRect(0, 0, 16, 16);

  // Simple deterministic random helper based on seed
  let currentSeed = seed;
  const rand = () => {
    currentSeed = (currentSeed * 16807) % 2147483647;
    return (currentSeed - 1) / 2147483646;
  };

  // Determine monochromatic surveillance color profile (pure beautiful grayscale CCTV feeds)
  const greyVal = 180 + Math.floor(rand() * 75); // 180 to 255 (high contrast white-gray highlights)
  const baseColor = `rgb(${greyVal}, ${greyVal}, ${greyVal})`;
  const accentColor = `rgb(${Math.floor(greyVal * 0.4)}, ${Math.floor(greyVal * 0.4)}, ${Math.floor(greyVal * 0.4)})`;

  // Draw shoulders / neck base silhouette
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(8, 20, 8, Math.PI, 0, false);
  ctx.fill();

  // Draw head shape
  ctx.fillStyle = baseColor;
  const headHeight = 6 + Math.floor(rand() * 4);
  const headWidth = 5 + Math.floor(rand() * 3);
  ctx.beginPath();
  
  // Draw ellipse approximation via quadratic curves for maximum compatibility
  const x = 8;
  const y = 7;
  const rx = headWidth / 2;
  const ry = headHeight / 2;
  ctx.moveTo(x - rx, y);
  ctx.quadraticCurveTo(x - rx, y - ry, x, y - ry);
  ctx.quadraticCurveTo(x + rx, y - ry, x + rx, y);
  ctx.quadraticCurveTo(x + rx, y + ry, x, y + ry);
  ctx.quadraticCurveTo(x - rx, y + ry, x - rx, y);
  ctx.fill();

  // Draw Hair
  ctx.fillStyle = '#050508';
  const hairStyle = rand();
  if (hairStyle > 0.7) {
    // Top box cut hair
    ctx.fillRect(8 - headWidth/2, 7 - headHeight/2, headWidth, 2);
  } else if (hairStyle > 0.3) {
    // Shaggy / Spikes
    ctx.fillRect(6, 4, 4, 2);
    ctx.fillRect(5, 5, 6, 1);
  } else {
    // Over the sides hair
    ctx.fillRect(8 - headWidth/2 - 1, 6 - headHeight/2, headWidth + 2, 2);
    ctx.fillRect(8 - headWidth/2 - 1, 6 - headHeight/2, 2, headHeight/2 + 2);
    ctx.fillRect(8 + headWidth/2 - 1, 6 - headHeight/2, 2, headHeight/2 + 2);
  }

  // Draw Eyes (Tiny dark surveillance pixels)
  ctx.fillStyle = '#050508';
  const eyeY = 6;
  ctx.fillRect(6, eyeY, 1, 1);
  ctx.fillRect(9, eyeY, 1, 1);

  // Draw Nose
  ctx.fillRect(8, 7.5, 1, 1);

  // Draw Mouth (Thin flat line)
  ctx.fillRect(7, 9.5, 2, 1);

  // Add random Glasses overlay
  if (rand() > 0.8) {
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 5, 2, 2);
    ctx.strokeRect(9, 5, 2, 2);
    ctx.beginPath();
    ctx.moveTo(7, 6);
    ctx.lineTo(9, 6);
    ctx.stroke();
  }

  // Inject dither noise and vintage analog security lines
  const imgData = ctx.getImageData(0, 0, 16, 16);
  const data = imgData.data;
  for (let yi = 0; yi < 16; yi++) {
    for (let xi = 0; xi < 16; xi++) {
      const idx = (yi * 16 + xi) * 4;
      
      // Horizontal surveillance line attenuation
      if (yi % 2 === 0) {
        data[idx] = Math.max(0, data[idx] - 25);
        data[idx+1] = Math.max(0, data[idx+1] - 25);
        data[idx+2] = Math.max(0, data[idx+2] - 25);
      }

      // Add static noise matrix grain
      const noise = (rand() - 0.5) * 35;
      data[idx] = Math.max(0, Math.min(255, data[idx] + noise));
      data[idx+1] = Math.max(0, Math.min(255, data[idx+1] + noise));
      data[idx+2] = Math.max(0, Math.min(255, data[idx+2] + noise));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas;
}

// ============================================================================
// MOCK CYBER SYNDICATE DIRECTORY
// ============================================================================

const MOCK_NAMES = [
  'Arjun Mehta', 'Vikram Sen', 'Priya Nair', 'Zara Patel', 'Anya Petrova',
  'Hans Becker', 'Yuki Tanaka', 'Carlos Ruiz', 'Sarah Chen', 'Omar Farooq',
  'Dmitry Volkov', 'Elena Rostova', 'John Doe', 'Li Wei', 'Sven Lindqvist',
  'Fatima Al-Sayed', 'Devendra Rao', 'Ananya Sharma', 'Rohan Gupta', 'Karan Johar',
  'Meera Deshmukh', 'Aditya Verma', 'Sunita Rao', 'Siddharth Roy', 'Amrita Sen',
  'Sanjay Patel', 'Neha Dhupia', 'Rahul Dravid', 'Preeti Zinta', 'Kabir Khan'
];

const MOCK_IPS = [
  '103.242.12.89', '45.89.21.114', '192.168.42.5', '10.200.150.12',
  '89.122.90.4', '142.250.190.46', '109.24.188.75', '172.56.21.9'
];

const MOCK_COUNTRIES = [
  'India', 'Germany', 'USA', 'Singapore', 'Russia', 'Brazil', 'UAE', 'China', 'Sweden'
];

const MOCK_STATUSES = [
  'TARGET_LOCK', 'DECEPTIVE_FEED', 'INTERCEPTED', 'MONITORING', 'DISSOLVING', 'ROUTING_DECOY'
];

// Seedable PRNG for deterministic setup
function createDeterministicNodesAndLinks(cols: number, rows: number, spacing: number) {
  let seed = 987654321;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const nodes: TwinNode[] = [];
  const targetIds: string[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `node_${r}_${c}`;
      
      // Determine if this is a targeted node (red box & connectable)
      // High-density targeting
      const isTargeted = rand() < 0.08; 
      
      let targetRevealZoom = 12.0;
      const revealChoice = rand();
      if (revealChoice > 0.8) targetRevealZoom = 12.0;
      else if (revealChoice > 0.5) targetRevealZoom = 4.0;
      else if (revealChoice > 0.25) targetRevealZoom = 1.0;
      else targetRevealZoom = 0.35;

      const riskScore = isTargeted 
        ? Math.floor(82 + rand() * 17) 
        : Math.floor(10 + rand() * 45);

      const fundsDiverted = isTargeted
        ? Math.floor(12000 + rand() * 180000)
        : Math.floor(100 + rand() * 1500);

      nodes.push({
        id,
        row: r,
        col: c,
        faceIndex: Math.floor(rand() * FACES_COUNT),
        isTargeted,
        targetRevealZoom,
        name: MOCK_NAMES[Math.floor(rand() * MOCK_NAMES.length)],
        riskScore,
        fundsDiverted,
        nodeIp: MOCK_IPS[Math.floor(rand() * MOCK_IPS.length)],
        country: MOCK_COUNTRIES[Math.floor(rand() * MOCK_COUNTRIES.length)],
        status: isTargeted ? MOCK_STATUSES[Math.floor(rand() * 4)] : 'MONITORING'
      });

      if (isTargeted) {
        targetIds.push(id);
      }
    }
  }

  // Create links connecting nearby targeted nodes
  const links: TwinLink[] = [];
  let linkCounter = 0;

  for (let i = 0; i < targetIds.length; i++) {
    const fromId = targetIds[i];
    const fromParts = fromId.split('_');
    const r1 = parseInt(fromParts[1]);
    const c1 = parseInt(fromParts[2]);

    // Find 2 nearest target nodes to create organic mesh structure
    const candidates = targetIds
      .filter(id => id !== fromId)
      .map(id => {
        const parts = id.split('_');
        const r2 = parseInt(parts[1]);
        const c2 = parseInt(parts[2]);
        const dist = Math.sqrt((r1 - r2) ** 2 + (c1 - c2) ** 2);
        return { id, dist };
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2);

    candidates.forEach(cand => {
      // Avoid duplicate links
      const alreadyLinked = links.some(l => 
        (l.fromId === fromId && l.toId === cand.id) || 
        (l.fromId === cand.id && l.toId === fromId)
      );

      if (!alreadyLinked && cand.dist < 12) {
        const revealZoom = cand.dist > 8 ? 0.45 : cand.dist > 5 ? 1.5 : 5.0;
        
        links.push({
          id: `link_${linkCounter++}`,
          fromId,
          toId: cand.id,
          revealZoom,
          pulseOffset: rand() * Math.PI * 2
        });
      }
    });
  }

  return { nodes, links };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ApkLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Setup state triggers
  const [cols] = useState(50);
  const [rows] = useState(40);
  const [spacing] = useState(17);
  
  // Coordinate limits
  const worldWidth = cols * spacing;
  const worldHeight = rows * spacing;

  // Initialize nodes and links
  const { nodes, links } = useMemo(() => {
    return createDeterministicNodesAndLinks(cols, rows, spacing);
  }, [cols, rows, spacing]);

  // Pre-cached procedural faces
  const cachedFaces = useMemo(() => {
    const list: HTMLCanvasElement[] = [];
    for (let i = 0; i < FACES_COUNT; i++) {
      list.push(generateProceduralFace(54321 + i * 1111));
    }
    return list;
  }, []);

  // Viewport camera parameters (refs decouple raw drawing from React render cycles for perfect 60+ FPS smoothness)
  const currentCamX = useRef(worldWidth / 2);
  const currentCamY = useRef(worldHeight / 2);
  const currentZoom = useRef(0.7);
  const [cameraDisplayState, setCameraDisplayState] = useState({ x: worldWidth / 2, y: worldHeight / 2, z: 0.7 });
  const lastUpdateX = useRef(worldWidth / 2);
  const lastUpdateY = useRef(worldHeight / 2);
  const lastUpdateZ = useRef(0.7);
  const [isAutoZoom, setIsAutoZoom] = useState(true);

  // Target tracking values for ultra-smooth spring interpolation
  const targetCamX = useRef(worldWidth / 2);
  const targetCamY = useRef(worldHeight / 2);
  const targetZoom = useRef(0.7);

  // Interaction controls
  const [hoveredNode, setHoveredNode] = useState<TwinNode | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<{ node: TwinNode; sx: number; sy: number } | null>(null);
  const [packets, setPackets] = useState<DataPacket[]>([]);

  // Drag state trackers
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const cameraStartPos = useRef({ x: 0, y: 0 });

  // Auto-zoom progress variable
  const zoomDirection = useRef(-1); // -1 = zooming out, 1 = zooming in
  const lastTime = useRef(Date.now());

  // Tactical Scenario Engine variables for high-speed automated cycle
  const cinemaState = useRef<'ZOOMING_IN' | 'FOCUS_HOLD' | 'ZOOMING_OUT' | 'WIDELINE_HOLD'>('WIDELINE_HOLD');
  const cinemaTargetNode = useRef<TwinNode | null>(null);
  const cinemaTimer = useRef(1.5); // Initial wait before kicking off first fast-paced target zoom
  const screenShake = useRef(0);
  const isGlitching = useRef(false);

  // Handle panel dimension size changes dynamically
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        const width = canvas.parentElement.clientWidth;
        const height = canvas.parentElement.clientHeight;
        setCanvasDimensions({ width, height });
        canvas.width = width;
        canvas.height = height;
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial call after tiny delay for layout settlement
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Reset tool helper
  const handleRecenter = () => {
    setSelectedNodeData(null);
    currentCamX.current = worldWidth / 2;
    currentCamY.current = worldHeight / 2;
    currentZoom.current = 0.7;
    targetCamX.current = worldWidth / 2;
    targetCamY.current = worldHeight / 2;
    targetZoom.current = 0.7;
    setCameraDisplayState({ x: worldWidth / 2, y: worldHeight / 2, z: 0.7 });
    lastUpdateX.current = worldWidth / 2;
    lastUpdateY.current = worldHeight / 2;
    lastUpdateZ.current = 0.7;
    setIsAutoZoom(true);
    cinemaTargetNode.current = null;
    cinemaState.current = 'WIDELINE_HOLD';
    cinemaTimer.current = 1.0;
  };

  const handleToggleAutoZoom = () => {
    setIsAutoZoom(prev => !prev);
  };

  const handleClearPackets = () => {
    setPackets([]);
  };

  // Canvas coordinate mapping utilities
  const toScreen = (wx: number, wy: number) => {
    const sx = (wx - currentCamX.current) * currentZoom.current + canvasDimensions.width / 2;
    const sy = (wy - currentCamY.current) * currentZoom.current + canvasDimensions.height / 2;
    return { x: sx, y: sy };
  };

  const toWorld = (sx: number, sy: number) => {
    const wx = (sx - canvasDimensions.width / 2) / currentZoom.current + currentCamX.current;
    const wy = (sy - canvasDimensions.height / 2) / currentZoom.current + currentCamY.current;
    return { x: wx, y: wy };
  };

  // Mouse wheel scroll to scale zoom manually
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsAutoZoom(false); // Suspend auto zoom immediately on override
    setSelectedNodeData(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Capture mouse position in world space BEFORE zoom change
    const worldBefore = toWorld(mouseX, mouseY);

    // Calculate new zoom bounds
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const nextZoom = Math.max(0.08, Math.min(22.0, currentZoom.current * zoomFactor));

    currentZoom.current = nextZoom;
    targetZoom.current = nextZoom;

    // Reposition camera so that the world coordinate under the cursor remains under the cursor
    const nextCamX = worldBefore.x - (mouseX - canvasDimensions.width / 2) / nextZoom;
    const nextCamY = worldBefore.y - (mouseY - canvasDimensions.height / 2) / nextZoom;

    const boundedX = Math.max(-500, Math.min(worldWidth + 500, nextCamX));
    const boundedY = Math.max(-500, Math.min(worldHeight + 500, nextCamY));

    currentCamX.current = boundedX;
    currentCamY.current = boundedY;
    targetCamX.current = boundedX;
    targetCamY.current = boundedY;

    // Trigger low frequency HUD update
    setCameraDisplayState({ x: boundedX, y: boundedY, z: nextZoom });
    lastUpdateX.current = boundedX;
    lastUpdateY.current = boundedY;
    lastUpdateZ.current = nextZoom;
  };

  // Drag panning controls
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    isDragging.current = true;
    dragStartPos.current = { x: mouseX, y: mouseY };
    cameraStartPos.current = { x: currentCamX.current, y: currentCamY.current };
    setIsAutoZoom(false); // Disengage automated glide
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging.current) {
      const dx = mouseX - dragStartPos.current.x;
      const dy = mouseY - dragStartPos.current.y;

      // Distance offset in world scale is delta screen divided by zoom
      const nextCamX = cameraStartPos.current.x - dx / currentZoom.current;
      const nextCamY = cameraStartPos.current.y - dy / currentZoom.current;

      const boundedX = Math.max(-500, Math.min(worldWidth + 500, nextCamX));
      const boundedY = Math.max(-500, Math.min(worldHeight + 500, nextCamY));

      currentCamX.current = boundedX;
      currentCamY.current = boundedY;
      targetCamX.current = boundedX;
      targetCamY.current = boundedY;
      setSelectedNodeData(null);
    } else {
      // Hover detection logic
      const worldPoint = toWorld(mouseX, mouseY);
      
      // Calculate closest cell
      const c = Math.round(worldPoint.x / spacing);
      const r = Math.round(worldPoint.y / spacing);

      let foundNode: TwinNode | null = null;
      if (c >= 0 && c < cols && r >= 0 && r < rows) {
        const potentialNode = nodes[r * cols + c];
        if (potentialNode) {
          const screenPos = toScreen(potentialNode.col * spacing, potentialNode.row * spacing);
          const distSq = (mouseX - screenPos.x) ** 2 + (mouseY - screenPos.y) ** 2;
          
          // Adaptive hover radius - easier to pick small nodes
          const hitRadius = Math.max(16, 12 * currentZoom.current); 
          if (distSq <= hitRadius ** 2) {
            foundNode = potentialNode;
          }
        }
      }

      if (foundNode !== hoveredNode) {
        setHoveredNode(foundNode);
      }
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    setHoveredNode(null);
  };

  // Node selection handler & packet spawning trigger
  const handleNodeClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldPoint = toWorld(mouseX, mouseY);
    const c = Math.round(worldPoint.x / spacing);
    const r = Math.round(worldPoint.y / spacing);

    if (c >= 0 && c < cols && r >= 0 && r < rows) {
      const node = nodes[r * cols + c];
      if (node) {
        const screenPos = toScreen(node.col * spacing, node.row * spacing);
        const distSq = (mouseX - screenPos.x) ** 2 + (mouseY - screenPos.y) ** 2; // Fixed Y axis collision check
        
        // Match selection trigger
        setSelectedNodeData({ node, sx: screenPos.x, sy: screenPos.y });

        // Spawn high-speed data packets along all links attached to this node
        const newPackets: DataPacket[] = [];
        links.forEach(link => {
          if (link.fromId === node.id) {
            newPackets.push({
              linkId: link.id,
              progress: 0,
              speed: 0.035 + Math.random() * 0.015,
              isForward: true
            });
          } else if (link.toId === node.id) {
            newPackets.push({
              linkId: link.id,
              progress: 0,
              speed: 0.035 + Math.random() * 0.015,
              isForward: false
            });
          }
        });

        if (newPackets.length > 0) {
          setPackets(prev => [...prev, ...newPackets].slice(-60)); // Cap max simultaneous packets to safeguard performance
        }
      }
    }
  };

  // Tooltip dismiss trigger
  const handleDismissTooltip = () => {
    setSelectedNodeData(null);
  };

  // Secondary router packet burst helper
  const triggerCounterRouting = () => {
    if (!selectedNodeData) return;
    const targetNode = selectedNodeData.node;
    const newPackets: DataPacket[] = [];
    
    // Spawn massive multi-directional burst
    links.forEach(link => {
      if (link.fromId === targetNode.id || link.toId === targetNode.id) {
        // Multi-layered packet burst (spawns 3 packets sequential)
        for (let i = 0; i < 3; i++) {
          newPackets.push({
            linkId: link.id,
            progress: -i * 0.25, // Staggered entry delay
            speed: 0.04 + Math.random() * 0.02,
            isForward: link.fromId === targetNode.id
          });
        }
      }
    });

    setPackets(prev => [...prev, ...newPackets].slice(-80));
  };

  // Main drawing engine loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const render = () => {
      const now = Date.now();
      const dt = (now - lastTime.current) / 1000;
      lastTime.current = now;

      // ----------------------------------------------------------------------
      // Camera Auto-Zoom Oscillating Logic
      // ----------------------------------------------------------------------
      if (isAutoZoom) {
        if (!cinemaTargetNode.current) {
          // Select a random targeted node to lock onto
          const targetedNodes = nodes.filter(n => n.isTargeted);
          if (targetedNodes.length > 0) {
            cinemaTargetNode.current = targetedNodes[Math.floor(Math.random() * targetedNodes.length)];
            cinemaState.current = 'ZOOMING_IN';
            cinemaTimer.current = 2.0; // 2 seconds of smooth, majestic glide
            isGlitching.current = true; // Add glitched decryption noise while tracking
          } else {
            cinemaTargetNode.current = null;
          }
        }

        const target = cinemaTargetNode.current;
        if (target) {
          const targetWorldX = target.col * spacing;
          const targetWorldY = target.row * spacing;

          if (cinemaState.current === 'ZOOMING_IN') {
            targetCamX.current = targetWorldX;
            targetCamY.current = targetWorldY;
            targetZoom.current = 12.0;

            cinemaTimer.current -= dt;
            if (cinemaTimer.current <= 0) {
              // Lock target!
              cinemaState.current = 'FOCUS_HOLD';
              cinemaTimer.current = 2.4; // Keep focus on twin profile for 2.4 seconds
              screenShake.current = 14; // Snappy target-lock slam
              isGlitching.current = false;

              // Spontaneously fire a massive packet burst from this node!
              const newPackets: DataPacket[] = [];
              links.forEach(link => {
                if (link.fromId === target.id) {
                  for (let i = 0; i < 5; i++) {
                    newPackets.push({
                      linkId: link.id,
                      progress: -i * 0.12,
                      speed: 0.08 + Math.random() * 0.05,
                      isForward: true
                    });
                  }
                } else if (link.toId === target.id) {
                  for (let i = 0; i < 5; i++) {
                    newPackets.push({
                      linkId: link.id,
                      progress: -i * 0.12,
                      speed: 0.08 + Math.random() * 0.05,
                      isForward: false
                    });
                  }
                }
              });
              if (newPackets.length > 0) {
                setPackets(prev => [...prev, ...newPackets].slice(-120));
              }

              // Keep visualization completely clean by avoiding automatic profile popup triggering
            }
          } 
          else if (cinemaState.current === 'FOCUS_HOLD') {
            // Camera locked on target node coordinates
            targetCamX.current = targetWorldX;
            targetCamY.current = targetWorldY;
            targetZoom.current = 12.0;

            // Periodically spawn high-frequency micro-pulses
            if (Math.random() < 0.35) {
              const connectedLinks = links.filter(l => l.fromId === target.id || l.toId === target.id);
              if (connectedLinks.length > 0) {
                const randomLink = connectedLinks[Math.floor(Math.random() * connectedLinks.length)];
                setPackets(prev => [...prev, {
                  linkId: randomLink.id,
                  progress: 0,
                  speed: 0.11,
                  isForward: randomLink.fromId === target.id
                }].slice(-120));
              }
            }

            cinemaTimer.current -= dt;
            if (cinemaTimer.current <= 0) {
              // Zoom out to global network
              cinemaState.current = 'ZOOMING_OUT';
              cinemaTimer.current = 1.6; // beautiful smooth zoom out
              isGlitching.current = true;
            }
          }
          else if (cinemaState.current === 'ZOOMING_OUT') {
            targetCamX.current = worldWidth / 2;
            targetCamY.current = worldHeight / 2;
            targetZoom.current = 0.7;

            cinemaTimer.current -= dt;
            if (cinemaTimer.current <= 0) {
              cinemaState.current = 'WIDELINE_HOLD';
              cinemaTimer.current = 2.6; // Wide scale view pause
              isGlitching.current = false;
              screenShake.current = 4;
            }
          }
          else if (cinemaState.current === 'WIDELINE_HOLD') {
            // Keep centered
            targetCamX.current = worldWidth / 2;
            targetCamY.current = worldHeight / 2;
            targetZoom.current = 0.7;

            // Spontaneously trigger random packet bursts around the world map connections to look incredibly fast and active
            if (Math.random() < 0.55) {
              const randomLink = links[Math.floor(Math.random() * links.length)];
              if (randomLink) {
                setPackets(prev => [...prev, {
                  linkId: randomLink.id,
                  progress: 0,
                  speed: 0.07 + Math.random() * 0.06,
                  isForward: Math.random() > 0.5
                }].slice(-150));
              }
            }

            cinemaTimer.current -= dt;
            if (cinemaTimer.current <= 0) {
              // Restart cycle with next node
              cinemaTargetNode.current = null;
            }
          }
        }
      }

      // Buttery smooth frame-rate independent camera easing!
      const lerpFactor = 1 - Math.exp(-3.5 * dt);
      currentCamX.current += (targetCamX.current - currentCamX.current) * lerpFactor;
      currentCamY.current += (targetCamY.current - currentCamY.current) * lerpFactor;
      currentZoom.current += (targetZoom.current - currentZoom.current) * lerpFactor;

      // Only trigger React state updates for UI overlay once in a while or on noticeable movements to prevent frame drops
      if (Math.abs(currentCamX.current - lastUpdateX.current) > 4 || 
          Math.abs(currentCamY.current - lastUpdateY.current) > 4 || 
          Math.abs(currentZoom.current - lastUpdateZ.current) > 0.05) {
        lastUpdateX.current = currentCamX.current;
        lastUpdateY.current = currentCamY.current;
        lastUpdateZ.current = currentZoom.current;
        setCameraDisplayState({
          x: currentCamX.current,
          y: currentCamY.current,
          z: currentZoom.current
        });
      }

      // ----------------------------------------------------------------------
      // Clear and Setup Context
      // ----------------------------------------------------------------------
      ctx.fillStyle = '#060608';
      ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);

      // Lock pixel-perfect crisp pixel rendering
      ctx.imageSmoothingEnabled = false;

      // Calculate screen shake offsets
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (screenShake.current > 0.1) {
        shakeOffsetX = (Math.random() - 0.5) * screenShake.current;
        shakeOffsetY = (Math.random() - 0.5) * screenShake.current;
        screenShake.current *= 0.9; // decay
      }

      ctx.save();
      ctx.translate(shakeOffsetX, shakeOffsetY);

      // ----------------------------------------------------------------------
      // Render Background Digital Coordinate Mesh
      // ----------------------------------------------------------------------
      ctx.strokeStyle = 'rgba(255, 176, 0, 0.015)';
      ctx.lineWidth = 1;

      const minColVisible = Math.max(0, Math.floor(toWorld(0, 0).x / spacing));
      const maxColVisible = Math.min(cols - 1, Math.ceil(toWorld(canvasDimensions.width, 0).x / spacing));
      const minRowVisible = Math.max(0, Math.floor(toWorld(0, 0).y / spacing));
      const maxRowVisible = Math.min(rows - 1, Math.ceil(toWorld(0, canvasDimensions.height).y / spacing));

      // Draw horizontal & vertical cross wires
      for (let c = minColVisible; c <= maxColVisible; c++) {
        const { x: sx } = toScreen(c * spacing, 0);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, canvasDimensions.height);
        ctx.stroke();
      }
      for (let r = minRowVisible; r <= maxRowVisible; r++) {
        const { y: sy } = toScreen(0, r * spacing);
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(canvasDimensions.width, sy);
        ctx.stroke();
      }

      // ----------------------------------------------------------------------
      // Render Bezier Identity Links
      // ----------------------------------------------------------------------
      // Slow curve animation parameter
      const pulseTime = now / 1500;

      links.forEach(link => {
        const fromNode = nodes.find(n => n.id === link.fromId);
        const toNode = nodes.find(n => n.id === link.toId);
        if (!fromNode || !toNode) return;

        const p1 = toScreen(fromNode.col * spacing, fromNode.row * spacing);
        const p2 = toScreen(toNode.col * spacing, toNode.row * spacing);

        // Hover isolate logic
        let isHighlighted = false;
        let isDimmed = false;

        if (hoveredNode) {
          if (hoveredNode.id === link.fromId || hoveredNode.id === link.toId) {
            isHighlighted = true;
          } else {
            isDimmed = true;
          }
        } else if (selectedNodeData) {
          if (selectedNodeData.node.id === link.fromId || selectedNodeData.node.id === link.toId) {
            isHighlighted = true;
          } else {
            isDimmed = true;
          }
        }

        const baseAlpha = isHighlighted ? 0.9 : isDimmed ? 0.08 : 0.35;
        const colorString = isHighlighted 
          ? `rgba(255, 51, 51, ${baseAlpha})` 
          : `rgba(255, 255, 255, ${baseAlpha})`;

        ctx.strokeStyle = colorString;
        ctx.lineWidth = isHighlighted ? 1.5 : 0.8;

        // Draw curved Bezier path
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        
        // Control points shift dynamically to look organic
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const curveOffset = 18 * Math.sin(pulseTime + link.pulseOffset);
        
        // Offset normal vector perpendicular to curve direction
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        const cx = midX + nx * curveOffset;
        const cy = midY + ny * curveOffset;

        ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
        ctx.stroke();
      });

      // ----------------------------------------------------------------------
      // Render Active High-Speed Packets
      // ----------------------------------------------------------------------
      const livePackets: DataPacket[] = [];
      
      packets.forEach(packet => {
        // Update state logic
        const nextProgress = packet.progress + packet.speed;
        if (nextProgress >= 1.0) return; // Discard completed packet

        // Progress < 0 indicates delayed staggered launch
        if (nextProgress >= 0) {
          const link = links.find(l => l.id === packet.linkId);
          if (link) {
            const fromNode = nodes.find(n => n.id === link.fromId);
            const toNode = nodes.find(n => n.id === link.toId);

            if (fromNode && toNode) {
              const p1 = toScreen(fromNode.col * spacing, fromNode.row * spacing);
              const p2 = toScreen(toNode.col * spacing, toNode.row * spacing);

              // Match bezier curve mapping
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;
              const curveOffset = 18 * Math.sin(pulseTime + link.pulseOffset);
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const nx = -dy / len;
              const ny = dx / len;

              const cx = midX + nx * curveOffset;
              const cy = midY + ny * curveOffset;

              const t = packet.isForward ? nextProgress : (1.0 - nextProgress);

              // 2nd degree bezier interpolation
              const px = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cx + t * t * p2.x;
              const py = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cy + t * t * p2.y;

              const drawPacketPoint = (tVal: number, r: number, alpha: number) => {
                if (tVal < 0 || tVal > 1) return;
                const pxt = (1 - tVal) * (1 - tVal) * p1.x + 2 * (1 - tVal) * tVal * cx + tVal * tVal * p2.x;
                const pyt = (1 - tVal) * (1 - tVal) * p1.y + 2 * (1 - tVal) * tVal * cy + tVal * tVal * p2.y;
                ctx.beginPath();
                ctx.arc(pxt, pyt, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 51, 51, ${alpha})`;
                ctx.fill();
              };

              // Draw comet trails behind packet for fast high-speed effect
              drawPacketPoint(packet.isForward ? (t - 0.08) : (t + 0.08), 1.2, 0.22);
              drawPacketPoint(packet.isForward ? (t - 0.04) : (t + 0.04), 1.8, 0.45);

              // Draw main high-speed light pulse
              ctx.beginPath();
              ctx.arc(px, py, 2.8, 0, Math.PI * 2);
              ctx.fillStyle = '#ff3333';
              
              // Glowing aura
              ctx.shadowColor = '#ff3333';
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0; // Turn off immediately for performance
            }
          }
        }

        livePackets.push({
          ...packet,
          progress: nextProgress
        });
      });

      // Avoid layout cycle re-renders by mutably holding packet arrays in requestAnimationFrame
      // then flushing with simple limit-controlled updater when packet length changes.
      if (livePackets.length !== packets.length || Math.random() > 0.9) {
        setPackets(livePackets);
      }

      // ----------------------------------------------------------------------
      // Render Financial Twin Profile Faces & Targets
      // ----------------------------------------------------------------------
      const nodeSize = 16 * currentZoom.current;

      for (let r = minRowVisible; r <= maxRowVisible; r++) {
        for (let c = minColVisible; c <= maxColVisible; c++) {
          const node = nodes[r * cols + c];
          if (!node) continue;

          const screenPos = toScreen(c * spacing, r * spacing);

          // Culling check - avoid drawing offscreen nodes to maintain 60FPS
          if (
            screenPos.x + nodeSize / 2 < 0 || 
            screenPos.x - nodeSize / 2 > canvasDimensions.width ||
            screenPos.y + nodeSize / 2 < 0 || 
            screenPos.y - nodeSize / 2 > canvasDimensions.height
          ) {
            continue; 
          }

          // Hover / Select focus attenuation logic - disabled to keep nodes fully bright & high contrast
          const alpha = 1.0;

          ctx.globalAlpha = alpha;

          // Draw the blocky procedural face
          const faceCanvas = cachedFaces[node.faceIndex];
          const isGlitched = (isGlitching.current && Math.random() < 0.28) || (Math.random() < 0.008);
          
          if (isGlitched && currentZoom.current > 0.4) {
            // Draw face in horizontal sliced chunks with random offsets to simulate network interference
            const sliceY = Math.floor(Math.random() * 10) + 3;
            const offset = (Math.random() - 0.5) * 14 * currentZoom.current * 0.22;
            
            // Draw top slice
            ctx.drawImage(
              faceCanvas,
              0, 0, 16, sliceY,
              screenPos.x - nodeSize / 2 + offset, screenPos.y - nodeSize / 2,
              nodeSize, sliceY * currentZoom.current
            );
            // Draw bottom slice
            ctx.drawImage(
              faceCanvas,
              0, sliceY, 16, 16 - sliceY,
              screenPos.x - nodeSize / 2 - offset, screenPos.y - nodeSize / 2 + sliceY * currentZoom.current,
              nodeSize, (16 - sliceY) * currentZoom.current
            );
          } else {
            ctx.drawImage(
              faceCanvas, 
              screenPos.x - nodeSize / 2, 
              screenPos.y - nodeSize / 2, 
              nodeSize, 
              nodeSize
            );
          }

          // Render Neon Target Bounding Box overlays - always fully bright and visible for targeted nodes
          if (node.isTargeted) {
            const borderSize = nodeSize + 4;
            ctx.strokeStyle = 'rgba(255, 51, 51, 0.95)';
            ctx.lineWidth = 1;

            // Draw main bounding border box
            ctx.strokeRect(
              screenPos.x - borderSize / 2, 
              screenPos.y - borderSize / 2, 
              borderSize, 
              borderSize
            );

            // Corner Bracket Reticles
            const cornerLen = Math.max(2.5, borderSize * 0.25);
            ctx.beginPath();
            
            // Top Left
            ctx.moveTo(screenPos.x - borderSize / 2, screenPos.y - borderSize / 2 + cornerLen);
            ctx.lineTo(screenPos.x - borderSize / 2, screenPos.y - borderSize / 2);
            ctx.lineTo(screenPos.x - borderSize / 2 + cornerLen, screenPos.y - borderSize / 2);

            // Top Right
            ctx.moveTo(screenPos.x + borderSize / 2, screenPos.y - borderSize / 2 + cornerLen);
            ctx.lineTo(screenPos.x + borderSize / 2, screenPos.y - borderSize / 2);
            ctx.lineTo(screenPos.x + borderSize / 2 - cornerLen, screenPos.y - borderSize / 2);

            // Bottom Left
            ctx.moveTo(screenPos.x - borderSize / 2, screenPos.y + borderSize / 2 - cornerLen);
            ctx.lineTo(screenPos.x - borderSize / 2, screenPos.y + borderSize / 2);
            ctx.lineTo(screenPos.x - borderSize / 2 + cornerLen, screenPos.y + borderSize / 2);

            // Bottom Right
            ctx.moveTo(screenPos.x + borderSize / 2, screenPos.y + borderSize / 2 - cornerLen);
            ctx.lineTo(screenPos.x + borderSize / 2, screenPos.y + borderSize / 2);
            ctx.lineTo(screenPos.x + borderSize / 2 - cornerLen, screenPos.y + borderSize / 2);

            ctx.stroke();

            // Node identification tags if zoomed in close
            if (currentZoom.current >= 1.2) {
              ctx.fillStyle = 'rgba(255, 51, 51, 0.95)';
              ctx.font = '7px Courier New, Courier, monospace';
              ctx.fillText(
                `RECON_ID: 0x${node.id.split('_')[1]}${node.id.split('_')[2]}`, 
                screenPos.x - borderSize / 2, 
                screenPos.y + borderSize / 2 + 8
              );
            }
          }

          // Active hover indicators
          if (hoveredNode && hoveredNode.id === node.id) {
            ctx.strokeStyle = '#ffb000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(
              screenPos.x - nodeSize / 2 - 4, 
              screenPos.y - nodeSize / 2 - 4, 
              nodeSize + 8, 
              nodeSize + 8
            );
          }

          // Restore normal opacity
          ctx.globalAlpha = 1.0;
        }
      }

      // Update positions for selected node to synchronize DOM overlay placement
      if (selectedNodeData) {
        const syncPos = toScreen(
          selectedNodeData.node.col * spacing, 
          selectedNodeData.node.row * spacing
        );
        setSelectedNodeData(prev => prev ? {
          ...prev,
          sx: syncPos.x,
          sy: syncPos.y
        } : null);
      }

      ctx.restore();

      // ----------------------------------------------------------------------
      // Draw Digital Glitch Bars and Disintegration Scanlines
      // ----------------------------------------------------------------------
      if (isGlitching.current && Math.random() < 0.45) {
        const barY = Math.random() * canvasDimensions.height;
        const barH = 2 + Math.random() * 8;
        const barW = canvasDimensions.width;
        
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 51, 51, 0.12)' : 'rgba(0, 240, 255, 0.12)';
        ctx.fillRect(0, barY, barW, barH);
        
        ctx.fillStyle = 'rgba(255, 176, 0, 0.08)';
        ctx.fillRect(0, barY + barH * 2, barW, 1);
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isAutoZoom, hoveredNode, selectedNodeData, canvasDimensions, nodes, links, spacing, cols, rows]);

  return (
    <div className="w-full h-full flex flex-col bg-[#07070a] rounded-3xl border border-white/10 overflow-hidden text-left font-sans shadow-[0_12px_40px_rgba(0,0,0,0.9)] relative select-none">
      
      {/* Upper-left HUD system diagnostics */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none font-mono flex flex-col gap-1.5 bg-black/75 border border-white/5 p-4 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-white/10">
          <Activity className="text-amber-500 animate-pulse" size={13} />
          <span className="text-[10px] uppercase font-black tracking-widest text-white/90">SYNDICATE TRACKING HUD</span>
        </div>
        
        <div className="flex gap-4 text-[9px]">
          <span className="text-white/40">SIMULATED MEMBERS:</span>
          <span className="text-white font-bold font-mono">2,000 / 2,000</span>
        </div>
        <div className="flex gap-4 text-[9px]">
          <span className="text-white/40">INTERACTIVE LINK CHANNELS:</span>
          <span className="text-amber-500 font-bold font-mono">{links.length} Active</span>
        </div>
        <div className="flex gap-4 text-[9px]">
          <span className="text-white/40">CAMERA MAGNIFICATION:</span>
          <span className="text-cyan-400 font-bold font-mono">{Math.round(cameraDisplayState.z * 100)}%</span>
        </div>
        <div className="flex gap-4 text-[9px]">
          <span className="text-white/40">SYSTEM MODE:</span>
          <span className={`font-black uppercase flex items-center gap-1 ${isAutoZoom ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {isAutoZoom ? 'Auto Sweep Cycle' : 'Manual Explore'}
          </span>
        </div>
      </div>

      {/* Upper-right HUD controls */}
      <div className="absolute top-5 right-5 z-20 flex flex-wrap gap-2">
        <button
          onClick={handleToggleAutoZoom}
          className={`px-3.5 py-2 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 shadow-xl ${
            isAutoZoom 
              ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-400' 
              : 'bg-black/60 text-white/50 border-white/10 hover:text-white hover:bg-black/85'
          }`}
          title="Toggle camera auto panning & zoom simulation"
        >
          <RefreshCw size={11} className={isAutoZoom ? 'animate-spin-slow' : ''} />
          {isAutoZoom ? 'Freeze Sweep' : 'Engage Sweep'}
        </button>

        <button
          onClick={handleRecenter}
          className="px-3.5 py-2 bg-black/60 text-white/70 border border-white/10 hover:text-white hover:bg-black/85 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-xl"
          title="Return camera scale and center to entry point coordinates"
        >
          <Compass size={11} />
          Re-Center
        </button>

        {packets.length > 0 && (
          <button
            onClick={handleClearPackets}
            className="px-3.5 py-2 bg-red-950/40 text-red-400 border border-red-500/20 hover:text-red-300 hover:bg-red-950/60 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-xl animate-pulse"
          >
            <Zap size={11} />
            Flush Pulses ({packets.length})
          </button>
        )}
      </div>

      {/* Core WebGL/Canvas viewport window */}
      <div className="flex-1 w-full h-full relative overflow-hidden min-h-0">
        <canvas
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={handleNodeClick}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />

        {/* Dynamic tooltips and metalogical visual panels */}
        <AnimatePresence>
          {selectedNodeData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                left: Math.max(20, Math.min(canvasDimensions.width - 280, selectedNodeData.sx - 120)),
                top: Math.max(120, Math.min(canvasDimensions.height - 360, selectedNodeData.sy - 310))
              }}
              className="absolute z-30 bg-black/95 border border-amber-500/40 text-white rounded-xl p-4 w-64 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl font-mono"
            >
              {/* Tooltip Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Target size={12} className="text-red-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-black tracking-wider text-red-400">TARGET SELECTED</span>
                </div>
                <button 
                  onClick={handleDismissTooltip}
                  className="text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Node Portrait Preview */}
              <div className="flex gap-3 mb-3 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                <div className="w-12 h-12 border border-white/10 rounded overflow-hidden shrink-0 bg-[#0c0c10] flex items-center justify-center">
                  <canvas
                    ref={(el) => {
                      if (el) {
                        const ctx = el.getContext('2d');
                        if (ctx) {
                          ctx.imageSmoothingEnabled = false;
                          ctx.clearRect(0, 0, 48, 48);
                          ctx.drawImage(cachedFaces[selectedNodeData.node.faceIndex], 0, 0, 48, 48);
                        }
                      }
                    }}
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-black truncate text-white leading-tight uppercase">{selectedNodeData.node.name}</h4>
                  <span className="text-[8px] text-white/40 uppercase block mt-0.5">IP: {selectedNodeData.node.nodeIp}</span>
                  <span className="text-[8px] text-cyan-400 uppercase block mt-0.5">{selectedNodeData.node.country} Registry</span>
                </div>
              </div>

              {/* Detail fields */}
              <div className="space-y-2 text-[9px] mb-4">
                <div className="flex justify-between border-b border-white/[0.03] pb-1">
                  <span className="text-white/40">NODE VALUE ID:</span>
                  <span className="text-white font-bold">0x{selectedNodeData.node.id.toUpperCase().replace('_', '')}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1">
                  <span className="text-white/40">SYNTHETIC RISK:</span>
                  <span className={`font-black ${selectedNodeData.node.riskScore > 85 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
                    {selectedNodeData.node.riskScore}% CRITICAL
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1">
                  <span className="text-white/40">DIVERTED CAPITALS:</span>
                  <span className="text-white font-black font-mono">
                    ${selectedNodeData.node.fundsDiverted.toLocaleString()} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">SECURITY STATUS:</span>
                  <span className="text-amber-500 font-bold uppercase tracking-wider">{selectedNodeData.node.status}</span>
                </div>
              </div>

              {/* Primary interaction buttons */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={triggerCounterRouting}
                  className="w-full bg-red-500 hover:bg-red-600 text-white text-[9px] font-black uppercase tracking-wider py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-red-500/10"
                >
                  <Zap size={10} />
                  Trigger Packet Burst
                </button>
                <button
                  onClick={() => {
                    alert(`Initiating defensive network firewall isolation protocol for node ${selectedNodeData.node.name} (${selectedNodeData.node.nodeIp}). Deceptive honeypot feed activated.`);
                  }}
                  className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-[9px] font-black uppercase tracking-wider py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Shield size={10} className="text-amber-500" />
                  Isolate Virtual Twin
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic corner guidance tutorial panel */}
        <div className="absolute bottom-5 right-5 z-20 max-w-[210px] bg-black/85 border border-white/5 p-3 rounded-lg backdrop-blur-md font-mono pointer-events-auto">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase border-b border-white/10 pb-1 mb-1.5">
            <Compass size={11} />
            <span>Interactive Guide</span>
          </div>
          <p className="text-[8px] text-white/50 leading-relaxed font-mono">
            • <b className="text-white">Mouse Scroll:</b> Fly-by scale zoom<br />
            • <b className="text-white">Click & Drag:</b> Pan matrix coordinates<br />
            • <b className="text-white">Hover Nodes:</b> Isolate identity link paths<br />
            • <b className="text-white">Click Node:</b> Open twin dossier / route packet burst
          </p>
        </div>

        {/* Minimalist Radar minimap bottom-left */}
        <div className="absolute bottom-5 left-5 z-20 w-24 h-24 bg-black/80 border border-white/10 rounded-lg backdrop-blur-md overflow-hidden p-1 pointer-events-none hidden sm:block">
          <div className="text-[7.5px] font-mono font-black tracking-widest text-white/30 text-center mb-1 uppercase">RADAR HUD</div>
          <div className="w-full h-16 border border-white/5 relative bg-black/40">
            {/* Draw current camera bounding rectangle */}
            <div 
              style={{
                left: `${Math.max(0, Math.min(100, (cameraDisplayState.x / worldWidth) * 100 - 15))}%`,
                top: `${Math.max(0, Math.min(100, (cameraDisplayState.y / worldHeight) * 100 - 15))}%`,
                width: `${Math.max(8, Math.min(40, (1 / cameraDisplayState.z) * 20))}%`,
                height: `${Math.max(8, Math.min(40, (1 / cameraDisplayState.z) * 20))}%`,
              }}
              className="absolute border border-red-500 bg-red-500/10 transition-all duration-75"
            />
            {/* Draw tiny dots representing clustered targeted nodes */}
            {nodes.filter(n => n.isTargeted).slice(0, 40).map((n, i) => (
              <div 
                key={i} 
                style={{
                  left: `${(n.col / cols) * 100}%`,
                  top: `${(n.row / rows) * 100}%`
                }}
                className="absolute w-0.5 h-0.5 bg-amber-500/40 rounded-full"
              />
            ))}
            {/* Sweeping scanline */}
            <div className="absolute inset-x-0 h-[1.5px] bg-cyan-400/20 shadow-[0_0_8px_#00f0ff] animate-scanline pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
