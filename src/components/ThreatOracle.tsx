import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Eye, RotateCcw, ShieldAlert } from 'lucide-react';
import { ThreatForecastBranch } from '../types';

interface ThreatOracleProps {
  branches?: ThreatForecastBranch[];
  selectedBranch?: ThreatForecastBranch | null;
  onSelectBranch?: (branch: ThreatForecastBranch | null) => void;
}

const NUCLEOTIDE_COLORS = [
  new THREE.Color('#00F5FF'), // A: Active Electric Aqua Cyan
  new THREE.Color('#E100FF'), // T: Sunset Hyper Magenta-Violet
  new THREE.Color('#00FF88'), // C: Glowing Vivid Emerald
  new THREE.Color('#FF9900'), // G: Vibrant Cyber Gold-Orange
];

const NUCLEOTIDE_HEX_COLORS = [
  '#00F5FF', // A: Active Electric Aqua Cyan
  '#E100FF', // T: Sunset Hyper Magenta-Violet
  '#00FF88', // C: Glowing Vivid Emerald
  '#FF9900', // G: Vibrant Cyber Gold-Orange
];

// High-fidelity neural iris animation timing constants (significantly accelerated for perfect responsiveness and excitement)
const PHASE1_DURATION = 1.0; // was 2.0 (descent duration)
const PHASE2_DURATION = 3.5; // was 5.0 (splay/assembly duration)
const PHASE3_START = PHASE1_DURATION + PHASE2_DURATION; // 4.5 (active iris state begins)

// Utility to get 3D coordinates on the almond-shaped eyelid curves wrapping around the eyeball
const getPointOnEyelid = (u: number, isUpper: boolean) => {
  const x = -3.2 + 6.4 * u;
  // Almond shape curve
  const y = (isUpper ? 1.85 : -1.55) * Math.sin(u * Math.PI);
  // Curve in Z depth to wrap around the iris eyeball
  const z = -0.3 - 0.45 * Math.sin(u * Math.PI);
  return new THREE.Vector3(x, y, z);
};

const getTipColor = (index: number) => {
  const p = Math.floor(index / 2);
  const isEven = index % 2 === 0;
  // Use segmentsPerStrand (15) for tip calculation
  const baseIndex = (p * 7 + 15 * 3) % 4;
  return NUCLEOTIDE_COLORS[isEven ? baseIndex : (baseIndex ^ 1)];
};

const getTipColor2DStr = (index: number) => {
  const col = getTipColor(index);
  return `${Math.round(col.r * 255)}, ${Math.round(col.g * 255)}, ${Math.round(col.b * 255)}`;
};

export const ThreatOracle: React.FC<ThreatOracleProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation phase tracking states
  const [currentPhase, setCurrentPhase] = useState<'DESCENT' | 'SPLAY' | 'IRIS'>('DESCENT');
  const [pupilDilation, setPupilDilation] = useState<number>(0);
  const [parallaxAngle, setParallaxAngle] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pulseActive, setPulseActive] = useState<boolean>(false);
  const [systemAlert, setSystemAlert] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [simulationTime, setSimulationTime] = useState<number>(0);
  const [webglError, setWebglError] = useState<boolean>(false);

  // References for rendering and physics loops
  const animationFrameIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);

  // Mouse coordinate refs (normalized -1 to 1)
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseSmoothRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animation sequence timeline refs
  const timeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Pulse wave variables
  const pulseActiveRef = useRef<boolean>(false);
  const pulseProgressRef = useRef<number>(0);

  // Interactive retrigger helper
  const handleResetSequence = () => {
    timeRef.current = 0;
    setCurrentPhase('DESCENT');
    pulseActiveRef.current = false;
    pulseProgressRef.current = 0;
    setPulseActive(false);
    setSystemAlert(false);
    setScanProgress(0);
  };

  // Click handler on canvas to trigger neural pulse & HUD scanning overlay
  const handleCanvasClick = () => {
    // Only permit trigger once Digital Iris has assembled (after splay phase)
    if (timeRef.current >= PHASE3_START) {
      pulseActiveRef.current = true;
      pulseProgressRef.current = 0;
      setPulseActive(true);
      setSystemAlert(true);
      setScanProgress(0);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Get exact bounding box dimensions of central panel bento box
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 450;

    const numStrands = 140;
    const segmentsPerStrand = 15;

    // ----------------------------------------------------------------------
    // PROCEDURAL SHAPE CALCULATOR (FIBER PATH MATHEMATICS)
    // ----------------------------------------------------------------------
    const getPointOnFiber = (i: number, j: number, t: number, dilatedRadius: number) => {
      const p = Math.floor(i / 2);
      const isEven = i % 2 === 0;
      const s = j / segmentsPerStrand; // progression from base (0) to tip (1)

      const pt = new THREE.Vector3();

      // Define pristine Iris parameters
      const rOuter = 4.8;
      const rInner = dilatedRadius;
      const rIris = rOuter - (rOuter - rInner) * s;
      const phi_i = (i * Math.PI * 2) / numStrands;

      // ---------------------------------------------------------
      // GEOMETRY A: MAJESTIC VERTICAL DNA DOUBLE-HELIX (PHASE 1)
      // ---------------------------------------------------------
      // Double-helix twist along the vertical Y-axis.
      // s is the vertical progression from bottom (0) to top (1).
      const twist_helix = s * Math.PI * 4.0 - t * 3.5;
      const angle_helix = (isEven ? 0 : Math.PI) + twist_helix;

      // Beautiful eye-shaped hourglass/iris flare profile:
      // Wider at the ends (s=0, s=1) and slightly tapering toward a tight organic waist in the middle,
      // which mimics the beautiful organic curvature of an iris/pupil frame in 3D.
      const R_helix = 1.1 + 0.85 * Math.pow(Math.abs(s - 0.5) * 2.0, 2.0);
      
      // Dynamic bioluminescent breathing wave undulation on the radius
      const wave_freq = 2.5;
      const wave_amp = 0.08 * Math.sin(t * wave_freq + s * Math.PI * 1.5);
      const R_helix_dynamic = R_helix + wave_amp;

      const pt_helix = new THREE.Vector3();
      // The helix spirals on the X-Z plane around the vertical Y-axis
      pt_helix.x = R_helix_dynamic * Math.cos(angle_helix);
      pt_helix.z = R_helix_dynamic * Math.sin(angle_helix);
      pt_helix.y = 5.2 * (0.5 - s); // Extends from -2.6 to +2.6 along the Y-axis

      // Elegant, liquid snake-like organic sway along the spine
      const spineWobbleX = 0.16 * Math.sin(t * 1.6 + s * Math.PI * 1.2);
      const spineWobbleZ = 0.16 * Math.cos(t * 1.6 + s * Math.PI * 1.2);
      pt_helix.x += spineWobbleX;
      pt_helix.z += spineWobbleZ;

      // Bundle the 140 strands into exactly TWO clean, thick, premium glowing cords of DNA.
      // p goes from 0 to 69. We bundle them tightly around the main helical path to look highly professional.
      const phi_p = (p * Math.PI * 2) / (numStrands / 2);
      const r_internal = 0.08 * (0.3 + 0.7 * s);
      pt_helix.x += r_internal * Math.cos(phi_p + t * 1.5);
      pt_helix.z += r_internal * Math.sin(phi_p + t * 1.5);

      // ---------------------------------------------------------
      // GEOMETRY B: FLAT CIRCULAR NEURAL IRIS (PHASE 3)
      // ---------------------------------------------------------
      // A highly realistic human iris stroma twist:
      // Mostly straight/radial near the outer rim (s=0), with a gorgeous sweeping curve near the pupil edge (s=1).
      const irisTwist = 0.65 * Math.pow(s, 1.4);
      const theta_iris_base = phi_i + irisTwist;
      const pt_iris = new THREE.Vector3(
        rIris * Math.cos(theta_iris_base),
        rIris * Math.sin(theta_iris_base),
        0.95 * Math.sin(Math.PI * s)
      );

      // ---------------------------------------------------------
      // SEQUENCING & TRANSITIONS
      // ---------------------------------------------------------
      if (t < PHASE1_DURATION) {
        // PHASE 1: DESCENT (Sliding down gracefully from the top screen bounds)
        const p1 = Math.max(0, Math.min(1.0, t / PHASE1_DURATION));
        // Smooth ease-out for slide-in from vertical height
        const easeDescent = 1.0 - Math.pow(1.0 - p1, 3.0);
        const slideInY = 12.0 * (1.0 - easeDescent);
        
        pt.x = pt_helix.x;
        pt.y = pt_helix.y + slideInY; // descent along Y
        pt.z = pt_helix.z;
      } 
      else if (t >= PHASE1_DURATION && t < PHASE3_START) {
        // PHASE 2: SPLAY & ASSEMBLY (Untwisting vertical DNA helix to assemble horizontal circular Iris)
        const p2 = (t - PHASE1_DURATION) / PHASE2_DURATION;
        const ease = p2 * p2 * (3.0 - 2.0 * p2); // Smooth hermite cubic blend

        pt.x = THREE.MathUtils.lerp(pt_helix.x, pt_iris.x, ease);
        pt.y = THREE.MathUtils.lerp(pt_helix.y, pt_iris.y, ease);
        pt.z = THREE.MathUtils.lerp(pt_helix.z, pt_iris.z, ease);
      } 
      else {
        // PHASE 3: ACTIVE SYSTEM LENS UNDULATION
        const blend = Math.min(1.0, t - PHASE3_START);
        const organicTwist = blend * 0.06 * Math.sin(t * 1.6 + phi_i * 3.5);
        const theta_iris = phi_i + irisTwist + organicTwist;

        const depthOscillation = blend * 0.12 * Math.sin(t * 2.2 + phi_i * 2.0);
        
        pt.x = rIris * Math.cos(theta_iris);
        pt.y = rIris * Math.sin(theta_iris);
        pt.z = (0.95 + depthOscillation) * Math.sin(Math.PI * s);
      }

      return pt;
    };

    if (!webglError) {
      try {
        // Initialize high performance WebGL Renderer
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: false, // Turned off for performance since postprocessing handles visual smoothing
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Target 1.5 for perfect performance and sharpness with post-processing
        renderer.setSize(width, height);
        rendererRef.current = renderer;

        // Initialize 3D Scene and Perspective Camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 11.5;

        // ----------------------------------------------------------------------
        // HIGH-END CINEMATIC VOLUMETRIC GLOW POST-PROCESSING
        // ----------------------------------------------------------------------
        let composer: EffectComposer | null = null;
        try {
          const renderPass = new RenderPass(scene, camera);
          const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            2.2,  // Heavy neon cinematic bloom strength
            0.4,  // Soft bloom radius
            0.08  // Lum threshold for maximum glowing responsiveness
          );

          composer = new EffectComposer(renderer);
          composer.addPass(renderPass);
          composer.addPass(bloomPass);
          composerRef.current = composer;
        } catch (postError) {
          console.warn("Three.js EffectComposer/UnrealBloomPass failed, using standard renderer fallback:", postError);
        }

        // Create the primary tracking assembly group
        const irisGroup = new THREE.Group();
        scene.add(irisGroup);

        // ----------------------------------------------------------------------
        // HIGH-END TACTICAL LIGHTING (FOR IMMERSIVE SPECULAR HIGHLIGHTS)
        // ----------------------------------------------------------------------
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.35); // Ambient light for subtle glow visibility
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.8); // Ultra high-contrast key light for metallic sheen
        keyLight.position.set(5, 12, 8);
        scene.add(keyLight);

        const specularPointLight = new THREE.PointLight(0xffffff, 3.0, 25); // Shiny center highlight
        specularPointLight.position.set(0, 0, 5);
        scene.add(specularPointLight);

        // ----------------------------------------------------------------------
        // PROCEDURAL CANVAS TEXTURE GENERATION (GOD-TIER SOFT GLOW FLARE)
        // ----------------------------------------------------------------------
        const createGlowTexture = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            gradient.addColorStop(0.15, 'rgba(240, 240, 240, 0.95)');
            gradient.addColorStop(0.4, 'rgba(150, 150, 150, 0.55)');
            gradient.addColorStop(0.7, 'rgba(60, 60, 60, 0.15)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 128);
          }
          return new THREE.CanvasTexture(canvas);
        };

        const glowTexture = createGlowTexture();

        // ----------------------------------------------------------------------
        // HIGHLY OPTIMIZED INSTANCED MESH FIBERS Setup
        // ----------------------------------------------------------------------
        const totalCylinderInstances = numStrands * segmentsPerStrand;

        // Lightweight 4-sided cylinder geometry for high geometric density
        const cylinderGeom = new THREE.CylinderGeometry(0.024, 0.024, 1.0, 4, 1);

        // Pure self-illuminated neon basic material
        const fiberMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        });

        const fiberMesh = new THREE.InstancedMesh(cylinderGeom, fiberMaterial, totalCylinderInstances);
        irisGroup.add(fiberMesh);

        // Apply beautiful genetic nucleotide colors along each strand (complementary base pairs)
        for (let i = 0; i < totalCylinderInstances; i++) {
          const strandIndex = Math.floor(i / segmentsPerStrand);
          const segmentIndex = i % segmentsPerStrand;
          const sNormalized = segmentIndex / segmentsPerStrand;
          const brightness = 0.15 + sNormalized * 0.55; // Elegant neon glow gradient

          const p = Math.floor(strandIndex / 2);
          const isEven = strandIndex % 2 === 0;
          const baseIndex = (p * 7 + segmentIndex * 3) % 4;
          const baseColor = NUCLEOTIDE_COLORS[isEven ? baseIndex : (baseIndex ^ 1)];
          const col = baseColor.clone().multiplyScalar(brightness);
          fiberMesh.setColorAt(i, col);
        }
        fiberMesh.instanceColor!.needsUpdate = true;

        // ----------------------------------------------------------------------
        // DNA BASE-PAIR RUNGS INSTANCED MESH Setup
        // ----------------------------------------------------------------------
        const totalRungs = (numStrands / 2) * (segmentsPerStrand + 1);
        const rungGeom = new THREE.CylinderGeometry(0.009, 0.009, 1.0, 4, 1);
        const rungMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide
        });
        const rungMesh = new THREE.InstancedMesh(rungGeom, rungMaterial, totalRungs);
        irisGroup.add(rungMesh);

        // Apply colors to rungs based on nucleotide base pairing
        for (let k = 0; k < totalRungs; k++) {
          const pairIndex = Math.floor(k / (segmentsPerStrand + 1));
          const segmentIndex = k % (segmentsPerStrand + 1);
          const baseIndex = (pairIndex * 7 + segmentIndex * 3) % 4;
          const col = NUCLEOTIDE_COLORS[baseIndex].clone().multiplyScalar(0.7); // slightly softer rung colors
          rungMesh.setColorAt(k, col);
        }
        rungMesh.instanceColor!.needsUpdate = true;

        // ----------------------------------------------------------------------
        // GLOWING TIPS INSTANCED MESH (PLANES WITH PROCEDURAL GLOW MAP)
        // ----------------------------------------------------------------------
        const tipGeom = new THREE.PlaneGeometry(0.18, 0.18);
        const tipMaterial = new THREE.MeshBasicMaterial({
          map: glowTexture,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false, // Prevent ugly clipping boxes around glowing nodes
        });

        const tipMesh = new THREE.InstancedMesh(tipGeom, tipMaterial, numStrands);
        irisGroup.add(tipMesh);

        for (let i = 0; i < numStrands; i++) {
          tipMesh.setColorAt(i, getTipColor(i));
        }
        tipMesh.instanceColor!.needsUpdate = true;

        // ----------------------------------------------------------------------
        // GLOSSY CYBERNETIC PUPIL DISC SETUP WITH CORNEAL SPECULAR REFLECTION
        // ----------------------------------------------------------------------
        const pupilGeom = new THREE.RingGeometry(0.01, 1.0, 64);
        const pupilMaterial = new THREE.MeshBasicMaterial({
          color: 0x050508,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide,
        });
        const pupilMesh = new THREE.Mesh(pupilGeom, pupilMaterial);
        pupilMesh.position.z = -0.05; // Placed slightly behind the glowing tips
        irisGroup.add(pupilMesh);

        // Glass Specular Corneal Highlight (Dynamic off-center studio reflection)
        const highlightGeom = new THREE.PlaneGeometry(0.6, 0.6);
        const highlightMaterial = new THREE.MeshBasicMaterial({
          map: glowTexture,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const pupilHighlightMesh = new THREE.Mesh(highlightGeom, highlightMaterial);
        pupilHighlightMesh.position.set(0.35, 0.35, 0.02);
        irisGroup.add(pupilHighlightMesh);

        // ----------------------------------------------------------------------
        // HUMAN INTERLOCKING IRIS ANATOMY ELEMENTS (LIMBAL, COLLARETTE, FURROWS)
        // ----------------------------------------------------------------------
        // Limbal Ring (Outer dark frame border)
        const limbalGeom = new THREE.RingGeometry(0.99, 1.0, 64);
        const limbalMaterial = new THREE.MeshBasicMaterial({
          color: 0x010103,
          transparent: true,
          opacity: 0.05,
          side: THREE.DoubleSide,
        });
        const limbalMesh = new THREE.Mesh(limbalGeom, limbalMaterial);
        limbalMesh.position.z = -0.04;
        irisGroup.add(limbalMesh);

        // Collarette Ring 1 (Active dividing ridge - Aqua/Cyan)
        const collaretteGeom = new THREE.RingGeometry(0.96, 1.0, 64);
        const collaretteMaterial = new THREE.MeshBasicMaterial({
          color: 0x00f5ff,
          transparent: true,
          opacity: 0.05,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });
        const collaretteMesh = new THREE.Mesh(collaretteGeom, collaretteMaterial);
        collaretteMesh.position.z = -0.03;
        irisGroup.add(collaretteMesh);

        // Collarette Ring 2 (Golden Outer Dividers)
        const collaretteGeom2 = new THREE.RingGeometry(0.97, 0.99, 64);
        const collaretteMaterial2 = new THREE.MeshBasicMaterial({
          color: 0xffaa00,
          transparent: true,
          opacity: 0.05,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });
        const collaretteMesh2 = new THREE.Mesh(collaretteGeom2, collaretteMaterial2);
        collaretteMesh2.position.z = -0.025;
        irisGroup.add(collaretteMesh2);

        // Contraction Furrows (Concentric stretch lines)
        const furrowGeom = new THREE.RingGeometry(0.99, 1.0, 64);
        const furrowMaterial = new THREE.MeshBasicMaterial({
          color: 0x00FF88,
          transparent: true,
          opacity: 0.05,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });
        const furrowMesh1 = new THREE.Mesh(furrowGeom, furrowMaterial);
        const furrowMesh2 = new THREE.Mesh(furrowGeom, furrowMaterial);
        furrowMesh1.position.z = -0.02;
        furrowMesh2.position.z = -0.02;
        irisGroup.add(furrowMesh1);
        irisGroup.add(furrowMesh2);

        // ----------------------------------------------------------------------
        // CYBERNETIC ALMOND EYE CONTOUR & HUD LASHES STRUCTURE
        // ----------------------------------------------------------------------
        const lidCylinderGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 4);
        const upperLidMaterial = new THREE.MeshBasicMaterial({
          color: 0x00f5ff,
          transparent: true,
          opacity: 0,
        });
        const lowerLidMaterial = new THREE.MeshBasicMaterial({
          color: 0xe100ff,
          transparent: true,
          opacity: 0,
        });
        const upperLidMesh = new THREE.InstancedMesh(lidCylinderGeom, upperLidMaterial, 30);
        const lowerLidMesh = new THREE.InstancedMesh(lidCylinderGeom, lowerLidMaterial, 30);

        const lashesGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.35, 4);
        const lashesMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
        });
        const lashesMesh = new THREE.InstancedMesh(lashesGeom, lashesMaterial, 12);

        // Populate upper eyelid
        const uTempMatrix = new THREE.Matrix4();
        for (let i = 0; i < 30; i++) {
          const u = i / 29;
          const p1 = getPointOnEyelid(u, true);
          const p2 = getPointOnEyelid(u + 0.01, true);
          const tangent = p2.clone().sub(p1).normalize();
          
          const uRot = new THREE.Quaternion();
          uRot.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
          
          const scaleFactor = Math.sin(u * Math.PI) * 0.7 + 0.3;
          uTempMatrix.compose(p1, uRot, new THREE.Vector3(scaleFactor, 1.0, scaleFactor));
          upperLidMesh.setMatrixAt(i, uTempMatrix);
        }
        upperLidMesh.instanceMatrix.needsUpdate = true;
        irisGroup.add(upperLidMesh);

        // Populate lower eyelid
        const lTempMatrix = new THREE.Matrix4();
        for (let i = 0; i < 30; i++) {
          const u = i / 29;
          const p1 = getPointOnEyelid(u, false);
          const p2 = getPointOnEyelid(u + 0.01, false);
          const tangent = p2.clone().sub(p1).normalize();
          
          const lRot = new THREE.Quaternion();
          lRot.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
          
          const scaleFactor = Math.sin(u * Math.PI) * 0.7 + 0.3;
          lTempMatrix.compose(p1, lRot, new THREE.Vector3(scaleFactor, 1.0, scaleFactor));
          lowerLidMesh.setMatrixAt(i, lTempMatrix);
        }
        lowerLidMesh.instanceMatrix.needsUpdate = true;
        irisGroup.add(lowerLidMesh);

        // Populate radiating eyelashes/ticks
        const lashTempMatrix = new THREE.Matrix4();
        for (let k = 0; k < 12; k++) {
          const isTop = k < 6;
          const index = isTop ? k : k - 6;
          const u = 0.18 + 0.64 * (index / 5);
          const basePos = getPointOnEyelid(u, isTop);
          const outwardDir = new THREE.Vector3(basePos.x * 1.3, basePos.y * 1.5, 0).normalize();
          const tickPos = basePos.clone().add(outwardDir.clone().multiplyScalar(0.18));
          
          const lashRot = new THREE.Quaternion();
          lashRot.setFromUnitVectors(new THREE.Vector3(0, 1, 0), outwardDir);
          
          lashTempMatrix.compose(tickPos, lashRot, new THREE.Vector3(1, 1, 1));
          lashesMesh.setMatrixAt(k, lashTempMatrix);
        }
        lashesMesh.instanceMatrix.needsUpdate = true;
        irisGroup.add(lashesMesh);

        // ----------------------------------------------------------------------
        // DIGITAL FLOWING PACKET PARTICLES Setup
        // ----------------------------------------------------------------------
        const numPackets = 16;
        const packetGeom = new THREE.PlaneGeometry(0.12, 0.12);
        const packetMaterial = new THREE.MeshBasicMaterial({
          map: glowTexture,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const packetMesh = new THREE.InstancedMesh(packetGeom, packetMaterial, numPackets);
        irisGroup.add(packetMesh);
        for (let p = 0; p < numPackets; p++) {
          packetMesh.setColorAt(p, new THREE.Color(1, 1, 1));
        }
        packetMesh.instanceColor!.needsUpdate = true;

        interface FlowPacket {
          strandIndex: number;
          progress: number;
          speed: number;
        }
        const packets: FlowPacket[] = [];
        for (let p = 0; p < numPackets; p++) {
          packets.push({
            strandIndex: Math.floor(Math.random() * numStrands),
            progress: Math.random(),
            speed: 0.45 + Math.random() * 0.4,
          });
        }

        // ----------------------------------------------------------------------
        // RESIZE OBSERVER SYSTEM
        // ----------------------------------------------------------------------
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width: entryWidth, height: entryHeight } = entry.contentRect;
            const w = entryWidth || 100;
            const h = entryHeight || 100;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            if (composer) {
              composer.setSize(w, h);
            }
          }
        });
        resizeObserver.observe(containerRef.current);
        resizeObserverRef.current = resizeObserver;

        const matrix = new THREE.Matrix4();
        const posA = new THREE.Vector3();
        const posB = new THREE.Vector3();
        const direction = new THREE.Vector3();
        const midpoint = new THREE.Vector3();
        const scale = new THREE.Vector3();
        const upVector = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion();
        const tempColor = new THREE.Color();

        const tick = (now: number) => {
          if (!lastTimeRef.current) lastTimeRef.current = now;
          const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
          lastTimeRef.current = now;

          timeRef.current += dt;
          const t = timeRef.current;
          setSimulationTime(t);

          // Determine active display state
          if (t < PHASE1_DURATION) {
            if (currentPhase !== 'DESCENT') setCurrentPhase('DESCENT');
          } else if (t >= PHASE1_DURATION && t < PHASE3_START) {
            if (currentPhase !== 'SPLAY') setCurrentPhase('SPLAY');
          } else {
            if (currentPhase !== 'IRIS') setCurrentPhase('IRIS');
          }

          // Smooth mouse coordinate tracking interpolation
          mouseSmoothRef.current.x += (mouseRef.current.x - mouseSmoothRef.current.x) * 0.085;
          mouseSmoothRef.current.y += (mouseRef.current.y - mouseSmoothRef.current.y) * 0.085;

          const mX = mouseSmoothRef.current.x;
          const mY = mouseSmoothRef.current.y;
          setParallaxAngle({ x: mX * 25, y: -mY * 25 });

          // Apply soft parallax tilting to the Iris assembly group
          irisGroup.rotation.y = mX * 0.44;
          irisGroup.rotation.x = -mY * 0.44;

          const cursorDist = Math.sqrt(mX * mX + mY * mY);
          const proximityIntensity = Math.max(0.0, 1.0 - cursorDist * 1.5);
          const isIrisState = t >= PHASE3_START;
          
          // Dilates pupil
          const targetDilation = isIrisState ? 1.35 + proximityIntensity * 1.75 : 1.35;
          setPupilDilation(THREE.MathUtils.lerp(0, Math.round((targetDilation - 1.35) * 57), isIrisState ? 1 : 0));

          const breath = isIrisState ? 0.04 * Math.sin(t * 2.8) : 0;
          const activeDilationRadius = targetDilation + breath;

          // Pulse wave propagation physics
          if (pulseActiveRef.current) {
            pulseProgressRef.current += dt * 1.45; // Wave travels over ~0.7s
            if (pulseProgressRef.current >= 1.0) {
              pulseActiveRef.current = false;
              setPulseActive(false);
            }
          }

          if (pulseActiveRef.current) {
            setScanProgress(Math.min(100, Math.floor(pulseProgressRef.current * 105)));
          }

          // Update Fiber Matrices & Specular Color Animations
          let instanceCounter = 0;
          for (let i = 0; i < numStrands; i++) {
            const p = Math.floor(i / 2);
            const isEven = i % 2 === 0;
            const strandColor = getTipColor(i);
            for (let j = 0; j < segmentsPerStrand; j++) {
              posA.copy(getPointOnFiber(i, j, t, activeDilationRadius));
              posB.copy(getPointOnFiber(i, j + 1, t, activeDilationRadius));

              direction.subVectors(posB, posA);
              const segmentLength = direction.length();
              midpoint.addVectors(posA, posB).multiplyScalar(0.5);

              direction.normalize();
              quat.setFromUnitVectors(upVector, direction);

              const sNormalized = j / segmentsPerStrand;
              const thickness = 0.024 * (1.1 - sNormalized); // Taper fibers towards the tip
              scale.set(thickness, segmentLength, thickness);

              matrix.compose(midpoint, quat, scale);
              fiberMesh.setMatrixAt(instanceCounter, matrix);

              const baseBrightness = 0.15 + sNormalized * 0.55;
              const baseIndex = (p * 7 + j * 3) % 4;
              const baseColor = NUCLEOTIDE_COLORS[isEven ? baseIndex : (baseIndex ^ 1)];
              
              // Boost fiber brightness to create a stunning glowing neon thread look at startup
              let tBrightness = baseBrightness;
              if (t < PHASE1_DURATION) {
                tBrightness = 1.35;
              } else if (t < PHASE3_START) {
                const ratio = (t - PHASE1_DURATION) / PHASE2_DURATION;
                tBrightness = THREE.MathUtils.lerp(1.35, baseBrightness, ratio);
              }
              tempColor.copy(baseColor).multiplyScalar(tBrightness);

              // Pulse coloring wave logic: Crimson red light wave
              if (pulseActiveRef.current) {
                const waveFront = 1.0 - pulseProgressRef.current;
                const waveWidth = 0.22;
                const distToWave = Math.abs(sNormalized - waveFront);

                if (distToWave < waveWidth) {
                  const intensity = Math.pow(1.0 - distToWave / waveWidth, 2.0);
                  const surgeColor = new THREE.Color('#FF3333');
                  const pulseIntensity = 1.0 + intensity * 3.5;
                  tempColor.lerp(surgeColor, intensity).multiplyScalar(pulseIntensity);
                  fiberMesh.setColorAt(instanceCounter, tempColor);
                } else {
                  fiberMesh.setColorAt(instanceCounter, tempColor);
                }
              } else {
                fiberMesh.setColorAt(instanceCounter, tempColor);
              }

              instanceCounter++;
            }

            // Update Tip Glow Matrices
            const tipPos = getPointOnFiber(i, segmentsPerStrand, t, activeDilationRadius);
            quat.identity();

            const baseColor = getTipColor(i);
            tempColor.copy(baseColor);

            if (pulseActiveRef.current) {
              const waveFront = 1.0 - pulseProgressRef.current;
              if (waveFront > 0.7) {
                const intensity = (waveFront - 0.7) / 0.3;
                const pulseIntensity = 1.0 + intensity * 2.5;
                tempColor.multiplyScalar(pulseIntensity);
                tipMesh.setColorAt(i, tempColor);
                
                const tipScale = 0.18 * pulseIntensity;
                scale.set(tipScale, tipScale, 1.0);
                matrix.compose(tipPos, quat, scale);
                tipMesh.setMatrixAt(i, matrix);
              } else {
                tipMesh.setColorAt(i, tempColor);
                
                scale.set(0.18, 0.18, 1.0);
                matrix.compose(tipPos, quat, scale);
                tipMesh.setMatrixAt(i, matrix);
              }
            } else {
              tipMesh.setColorAt(i, tempColor);
              
              scale.set(0.18, 0.18, 1.0);
              matrix.compose(tipPos, quat, scale);
              tipMesh.setMatrixAt(i, matrix);
            }
          }

          // Update DNA Base-Pair Rungs Matrices
          let rungCounter = 0;
          for (let p = 0; p < numStrands / 2; p++) {
            for (let j = 0; j <= segmentsPerStrand; j++) {
              posA.copy(getPointOnFiber(2 * p, j, t, activeDilationRadius));
              posB.copy(getPointOnFiber(2 * p + 1, j, t, activeDilationRadius));

              direction.subVectors(posB, posA);
              const rungLength = direction.length();
              midpoint.addVectors(posA, posB).multiplyScalar(0.5);

              direction.normalize();
              quat.setFromUnitVectors(upVector, direction);

              const sNormalized = j / segmentsPerStrand;
              // Scale rung thickness dynamically based on time t to emphasize DNA structure at the start
              let tFactor = 1.0;
              if (t < PHASE1_DURATION) {
                tFactor = 2.4; // Prominent and thick rungs at the beginning
              } else if (t < PHASE3_START) {
                const ratio = (t - PHASE1_DURATION) / PHASE2_DURATION;
                tFactor = THREE.MathUtils.lerp(2.4, 0.7, ratio);
              } else {
                tFactor = 0.7; // Thin, subtle cross-filaments in settled iris
              }

              const rungThickness = 0.009 * (1.1 - sNormalized * 0.5) * tFactor;
              scale.set(rungThickness, rungLength, rungThickness);

              matrix.compose(midpoint, quat, scale);
              rungMesh.setMatrixAt(rungCounter, matrix);

              // Pulse wave propagates through rungs too!
              const baseIndex = (p * 7 + j * 3) % 4;
              const baseColor = NUCLEOTIDE_COLORS[baseIndex];
              const baseBrightness = 0.2 + (j / segmentsPerStrand) * 0.5;
              
              // Boost rung brightness during descent for beautiful bioluminescent ladders
              let tBrightness = baseBrightness;
              if (t < PHASE1_DURATION) {
                tBrightness = 1.25;
              } else if (t < PHASE3_START) {
                const ratio = (t - PHASE1_DURATION) / PHASE2_DURATION;
                tBrightness = THREE.MathUtils.lerp(1.25, baseBrightness, ratio);
              }
              tempColor.copy(baseColor).multiplyScalar(tBrightness);

              if (pulseActiveRef.current) {
                const waveFront = 1.0 - pulseProgressRef.current;
                const waveWidth = 0.22;
                const distToWave = Math.abs(sNormalized - waveFront);
                if (distToWave < waveWidth) {
                  const intensity = Math.pow(1.0 - distToWave / waveWidth, 2.0);
                  const surgeColor = new THREE.Color('#FF3333');
                  tempColor.lerp(surgeColor, intensity).multiplyScalar(1.0 + intensity * 2.5);
                }
              }
              rungMesh.setColorAt(rungCounter, tempColor);

              rungCounter++;
            }
          }
          rungMesh.instanceMatrix.needsUpdate = true;
          if (rungMesh.instanceColor) rungMesh.instanceColor.needsUpdate = true;

          // Update central pupil scale dynamically to match the dilated iris radius
          if (pupilMesh) {
            const pupilScale = activeDilationRadius * 0.98;
            pupilMesh.scale.set(pupilScale, pupilScale, 1.0);
          }

          if (pupilHighlightMesh) {
            pupilHighlightMesh.visible = (t >= PHASE1_DURATION);
            const scaleVal = activeDilationRadius * 0.15;
            pupilHighlightMesh.scale.set(scaleVal, scaleVal, 1.0);
            pupilHighlightMesh.position.set(
              activeDilationRadius * 0.28 + mX * 0.1,
              activeDilationRadius * 0.28 - mY * 0.1,
              0.02
            );
          }

          // Dynamic updates for human iris interlocking elements
          if (limbalMesh) {
            limbalMesh.visible = (t >= PHASE1_DURATION);
            const ratio = Math.min(1.0, (t - PHASE1_DURATION) / PHASE2_DURATION);
            limbalMesh.scale.set(4.8, 4.8, 1.0); // frames the outer rim
            limbalMesh.material.opacity = ratio * 0.85;
          }
          if (collaretteMesh) {
            collaretteMesh.visible = (t >= PHASE1_DURATION);
            const ratio = Math.min(1.0, (t - PHASE1_DURATION) / PHASE2_DURATION);
            const collaretteScale = activeDilationRadius * 1.35;
            collaretteMesh.scale.set(collaretteScale, collaretteScale, 1.0);
            collaretteMesh.material.opacity = ratio * 0.45;
            collaretteMesh.rotation.z = t * 0.15; // Slow ambient rotation
          }
          if (collaretteMesh2) {
            collaretteMesh2.visible = (t >= PHASE1_DURATION);
            const ratio = Math.min(1.0, (t - PHASE1_DURATION) / PHASE2_DURATION);
            const collaretteScale = activeDilationRadius * 1.39;
            collaretteMesh2.scale.set(collaretteScale, collaretteScale, 1.0);
            collaretteMesh2.material.opacity = ratio * 0.35;
            collaretteMesh2.rotation.z = -t * 0.22; // Counter rotation!
          }
          if (furrowMesh1) {
            furrowMesh1.visible = (t >= PHASE1_DURATION);
            const ratio = Math.min(1.0, (t - PHASE1_DURATION) / PHASE2_DURATION);
            const furrowScale1 = activeDilationRadius * 1.85;
            furrowMesh1.scale.set(furrowScale1, furrowScale1, 1.0);
            furrowMesh1.material.opacity = ratio * 0.22;
          }
          if (furrowMesh2) {
            furrowMesh2.visible = (t >= PHASE1_DURATION);
            const ratio = Math.min(1.0, (t - PHASE1_DURATION) / PHASE2_DURATION);
            const furrowScale2 = activeDilationRadius * 2.3;
            furrowMesh2.scale.set(furrowScale2, furrowScale2, 1.0);
            furrowMesh2.material.opacity = ratio * 0.12;
          }

          // Update Eyelid / Cyber Eye contour opacity and visibility
          if (upperLidMesh && lowerLidMesh && lashesMesh) {
            const isLidsVisible = t >= PHASE1_DURATION;
            upperLidMesh.visible = isLidsVisible;
            lowerLidMesh.visible = isLidsVisible;
            lashesMesh.visible = isLidsVisible;
            
            const ratio = Math.min(1.0, (t - PHASE1_DURATION) / PHASE2_DURATION);
            upperLidMesh.material.opacity = ratio * 0.75;
            lowerLidMesh.material.opacity = ratio * 0.65;
            lashesMesh.material.opacity = ratio * 0.45;
          }

          fiberMesh.instanceMatrix.needsUpdate = true;
          if (fiberMesh.instanceColor) fiberMesh.instanceColor.needsUpdate = true;

          tipMesh.instanceMatrix.needsUpdate = true;
          if (tipMesh.instanceColor) tipMesh.instanceColor.needsUpdate = true;

          // Update Flowing Data Packets
          quat.identity();
          for (let p = 0; p < numPackets; p++) {
            const pkt = packets[p];
            pkt.progress += dt * pkt.speed;
            if (pkt.progress > 1.0) {
              pkt.progress = 0;
              pkt.strandIndex = Math.floor(Math.random() * numStrands);
            }

            const segmentFloat = pkt.progress * segmentsPerStrand;
            const currentSegment = Math.floor(segmentFloat);
            const segmentProgress = segmentFloat - currentSegment;

            const pt1 = getPointOnFiber(pkt.strandIndex, currentSegment, t, activeDilationRadius);
            const pt2 = getPointOnFiber(pkt.strandIndex, Math.min(segmentsPerStrand, currentSegment + 1), t, activeDilationRadius);

            midpoint.lerpVectors(pt1, pt2, segmentProgress);
            
            scale.set(0.12, 0.12, 1.0);
            matrix.compose(midpoint, quat, scale);
            packetMesh.setMatrixAt(p, matrix);

            // Color the packet to match its strand color
            packetMesh.setColorAt(p, getTipColor(pkt.strandIndex));
          }
          packetMesh.instanceMatrix.needsUpdate = true;
          if (packetMesh.instanceColor) packetMesh.instanceColor.needsUpdate = true;

          if (composer) {
            composer.render();
          } else {
            renderer.render(scene, camera);
          }
          animationFrameIdRef.current = requestAnimationFrame(tick);
        };

        // Start rendering lifecycle
        animationFrameIdRef.current = requestAnimationFrame(tick);

        const handleMouseMove = (e: MouseEvent) => {
          const bounds = containerRef.current?.getBoundingClientRect();
          if (!bounds) return;

          const x = e.clientX - bounds.left;
          const y = e.clientY - bounds.top;

          mouseRef.current.x = (x / bounds.width) * 2 - 1;
          mouseRef.current.y = -(y / bounds.height) * 2 + 1;
        };

        const handleMouseLeave = () => {
          mouseRef.current.x = 0;
          mouseRef.current.y = 0;
        };

        const element = containerRef.current;
        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
          if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
          element.removeEventListener('mousemove', handleMouseMove);
          element.removeEventListener('mouseleave', handleMouseLeave);
          
          if (composer) {
            try {
              composer.dispose();
            } catch (e) {
              console.warn("Composer dispose error", e);
            }
          }
          
          try {
            renderer.dispose();
            if (typeof renderer.forceContextLoss === 'function') {
              renderer.forceContextLoss();
            }
          } catch (e) {
            console.warn("Renderer dispose error", e);
          }

          cylinderGeom.dispose();
          rungGeom.dispose();
          tipGeom.dispose();
          packetGeom.dispose();
          pupilGeom.dispose();
          highlightGeom.dispose();
          limbalGeom.dispose();
          collaretteGeom.dispose();
          collaretteGeom2.dispose();
          furrowGeom.dispose();
          lidCylinderGeom.dispose();
          lashesGeom.dispose();
          fiberMaterial.dispose();
          rungMaterial.dispose();
          tipMaterial.dispose();
          packetMaterial.dispose();
          pupilMaterial.dispose();
          highlightMaterial.dispose();
          limbalMaterial.dispose();
          collaretteMaterial.dispose();
          collaretteMaterial2.dispose();
          furrowMaterial.dispose();
          upperLidMaterial.dispose();
          lowerLidMaterial.dispose();
          lashesMaterial.dispose();
          glowTexture.dispose();
        };
      } catch (err) {
        console.warn("THREE.WebGLRenderer failed to initialize. Activating 2D Canvas Fallback engine.", err);
        setWebglError(true);
        return;
      }
    }

    // ----------------------------------------------------------------------
    // HIGH-PERFORMANCE 2D CANVAS RENDERING FALLBACK
    // ----------------------------------------------------------------------
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set resolution base on screen DPI
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        const w = entryWidth || 100;
        const h = entryHeight || 100;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
      }
    });
    resizeObserver.observe(containerRef.current);
    resizeObserverRef.current = resizeObserver;

    const numPackets = 16;
    interface FlowPacket {
      strandIndex: number;
      progress: number;
      speed: number;
    }
    const packets: FlowPacket[] = [];
    for (let p = 0; p < numPackets; p++) {
      packets.push({
        strandIndex: Math.floor(Math.random() * numStrands),
        progress: Math.random(),
        speed: 0.45 + Math.random() * 0.4,
      });
    }

    let animFrameId: number;

    const tick2D = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      timeRef.current += dt;
      const t = timeRef.current;
      setSimulationTime(t);

      // Determine active display state
      if (t < PHASE1_DURATION) {
        if (currentPhase !== 'DESCENT') setCurrentPhase('DESCENT');
      } else if (t >= PHASE1_DURATION && t < PHASE3_START) {
        if (currentPhase !== 'SPLAY') setCurrentPhase('SPLAY');
      } else {
        if (currentPhase !== 'IRIS') setCurrentPhase('IRIS');
      }

      // Smooth mouse coordinate tracking interpolation
      mouseSmoothRef.current.x += (mouseRef.current.x - mouseSmoothRef.current.x) * 0.085;
      mouseSmoothRef.current.y += (mouseRef.current.y - mouseSmoothRef.current.y) * 0.085;

      const mX = mouseSmoothRef.current.x;
      const mY = mouseSmoothRef.current.y;
      setParallaxAngle({ x: mX * 25, y: -mY * 25 });

      const cursorDist = Math.sqrt(mX * mX + mY * mY);
      const proximityIntensity = Math.max(0.0, 1.0 - cursorDist * 1.5);
      const isIrisState = t >= PHASE3_START;
      
      const targetDilation = isIrisState ? 1.35 + proximityIntensity * 1.75 : 1.35;
      setPupilDilation(THREE.MathUtils.lerp(0, Math.round((targetDilation - 1.35) * 57), isIrisState ? 1 : 0));

      const breath = isIrisState ? 0.04 * Math.sin(t * 2.8) : 0;
      const activeDilationRadius = targetDilation + breath;

      // Pulse wave propagation physics
      if (pulseActiveRef.current) {
        pulseProgressRef.current += dt * 1.45;
        if (pulseProgressRef.current >= 1.0) {
          pulseActiveRef.current = false;
          setPulseActive(false);
        }
      }

      if (pulseActiveRef.current) {
        setScanProgress(Math.min(100, Math.floor(pulseProgressRef.current * 105)));
      }

      // Clear Canvas
      const currentRect = containerRef.current?.getBoundingClientRect();
      const currentW = currentRect?.width || width;
      const currentH = currentRect?.height || height;
      ctx.clearRect(0, 0, currentW, currentH);

      // 3D projection to 2D Screen
      const project = (pt: THREE.Vector3) => {
        let x = pt.x;
        let y = pt.y;
        let z = pt.z;

        // Rotate Y (group.rotation.y = mX * 0.44)
        const cosY = Math.cos(mX * 0.44);
        const sinY = Math.sin(mX * 0.44);
        const xY = x * cosY + z * sinY;
        const zY = -x * sinY + z * cosY;

        // Rotate X (group.rotation.x = -mY * 0.44)
        const cosX = Math.cos(-mY * 0.44);
        const sinX = Math.sin(-mY * 0.44);
        const yX = y * cosX - zY * sinX;
        const zX = y * sinX + zY * cosX;

        const d = 11.5 - zX;
        // FOV 45 perspective scale calculation
        const halfH = d * 0.41421356;
        const sx = (currentW / 2) + (xY / halfH) * (currentH / 2);
        const sy = (currentH / 2) - (yX / halfH) * (currentH / 2);

        return { sx, sy, scale: (currentH / 2) / halfH };
      };

      // 0. Draw Outer Almond Eyelids, Tear Ducts, and Tech Lashes in 2D Fallback
      if (t >= PHASE1_DURATION) {
        const ratio = Math.min(1.0, (t - PHASE1_DURATION) / PHASE2_DURATION);
        
        // Upper Lid Path
        ctx.beginPath();
        for (let i = 0; i <= 30; i++) {
          const u = i / 30;
          const pt3D = getPointOnEyelid(u, true);
          const pt2D = project(pt3D);
          if (i === 0) {
            ctx.moveTo(pt2D.sx, pt2D.sy);
          } else {
            ctx.lineTo(pt2D.sx, pt2D.sy);
          }
        }
        ctx.strokeStyle = `rgba(0, 245, 255, ${0.75 * ratio})`;
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // Lower Lid Path
        ctx.beginPath();
        for (let i = 0; i <= 30; i++) {
          const u = i / 30;
          const pt3D = getPointOnEyelid(u, false);
          const pt2D = project(pt3D);
          if (i === 0) {
            ctx.moveTo(pt2D.sx, pt2D.sy);
          } else {
            ctx.lineTo(pt2D.sx, pt2D.sy);
          }
        }
        ctx.strokeStyle = `rgba(225, 0, 255, ${0.65 * ratio})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Tech Lashes / Radial Ticks
        for (let k = 0; k < 12; k++) {
          const isTop = k < 6;
          const index = isTop ? k : k - 6;
          const u = 0.18 + 0.64 * (index / 5);
          const basePos = getPointOnEyelid(u, isTop);
          const outwardDir = new THREE.Vector3(basePos.x * 1.3, basePos.y * 1.5, 0).normalize();
          const tickPos = basePos.clone().add(outwardDir.clone().multiplyScalar(0.18));
          
          const ptStart = project(basePos);
          const ptEnd = project(tickPos);
          
          ctx.beginPath();
          ctx.moveTo(ptStart.sx, ptStart.sy);
          ctx.lineTo(ptEnd.sx, ptEnd.sy);
          ctx.strokeStyle = `rgba(0, 255, 136, ${0.45 * ratio})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Draw Left and Right Tear Duct Corner Brackets
        const leftCorner3D = getPointOnEyelid(0, true);
        const rightCorner3D = getPointOnEyelid(1, true);
        const leftCorner2D = project(leftCorner3D);
        const rightCorner2D = project(rightCorner3D);

        // Left Corner Target / Bracket
        ctx.beginPath();
        ctx.arc(leftCorner2D.sx, leftCorner2D.sy, 5 * leftCorner2D.scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 245, 255, ${0.5 * ratio})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Right Corner Target / Bracket
        ctx.beginPath();
        ctx.arc(rightCorner2D.sx, rightCorner2D.sy, 5 * rightCorner2D.scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(225, 0, 255, ${0.5 * ratio})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      // 0. Draw Central Dark Pupil, Limbal Ring, Collarette, Furrows and Specular Highlight for 2D Fallback
      if (t >= PHASE1_DURATION) {
        const ratio = Math.min(1.0, (t - PHASE1_DURATION) / PHASE2_DURATION);
        const pupilCenter = project(new THREE.Vector3(0, 0, -0.05));
        const pupilRadius = activeDilationRadius * 38.0 * (pupilCenter.scale / 45);

        // A. Limbal Ring (Outer dark frame border)
        const outerRadius = 4.8 * 38.0 * (pupilCenter.scale / 45);
        if (outerRadius > 0) {
          ctx.beginPath();
          ctx.arc(pupilCenter.sx, pupilCenter.sy, outerRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(1, 1, 3, ${0.45 * ratio})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        // B. Contraction Furrows (Concentric stretch lines)
        const furrowRadius1 = activeDilationRadius * 1.85 * 38.0 * (pupilCenter.scale / 45);
        const furrowRadius2 = activeDilationRadius * 2.3 * 38.0 * (pupilCenter.scale / 45);
        if (furrowRadius1 > 0) {
          ctx.beginPath();
          ctx.arc(pupilCenter.sx, pupilCenter.sy, furrowRadius1, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 136, ${0.12 * ratio})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        if (furrowRadius2 > 0) {
          ctx.beginPath();
          ctx.arc(pupilCenter.sx, pupilCenter.sy, furrowRadius2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 136, ${0.06 * ratio})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        // C. Double Rotating Collarette (Dividing Ridge)
        const collaretteRadius = activeDilationRadius * 1.35 * 38.0 * (pupilCenter.scale / 45);
        if (collaretteRadius > 0) {
          ctx.save();
          ctx.translate(pupilCenter.sx, pupilCenter.sy);
          
          // Ring 1: Aqua/Cyan with clockwise rotation
          ctx.beginPath();
          ctx.arc(0, 0, collaretteRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 245, 255, ${0.35 * ratio})`;
          ctx.lineWidth = 1.0;
          ctx.setLineDash([4, 8]);
          ctx.rotate(t * 0.15);
          ctx.stroke();
          
          // Ring 2: Solar Gold with counter-clockwise rotation
          ctx.beginPath();
          ctx.arc(0, 0, collaretteRadius * 1.03, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 153, 0, ${0.22 * ratio})`;
          ctx.lineWidth = 0.8;
          ctx.setLineDash([6, 12]);
          ctx.rotate(-t * 0.3);
          ctx.stroke();
          
          ctx.restore();
        }

        // D. Dark Obsidian Pupil Disc
        if (pupilRadius > 0) {
          ctx.beginPath();
          ctx.arc(pupilCenter.sx, pupilCenter.sy, pupilRadius, 0, Math.PI * 2);
          // Dark obsidian radial gradient with subtle neon blue outer rim
          const pupilGrad = ctx.createRadialGradient(
            pupilCenter.sx, pupilCenter.sy, pupilRadius * 0.7,
            pupilCenter.sx, pupilCenter.sy, pupilRadius
          );
          pupilGrad.addColorStop(0, `rgba(5, 5, 8, ${0.98 * ratio})`);
          pupilGrad.addColorStop(0.85, `rgba(10, 10, 15, ${0.95 * ratio})`);
          pupilGrad.addColorStop(1.0, `rgba(0, 240, 255, ${0.18 * ratio})`);
          ctx.fillStyle = pupilGrad;
          ctx.fill();

          // Draw the inner pupillary sphincter border ring
          ctx.beginPath();
          ctx.arc(pupilCenter.sx, pupilCenter.sy, pupilRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.28 * ratio})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // E. Pupil Specular Corneal Glassy Highlight (moving with cursor)
          const refX = pupilCenter.sx + pupilRadius * 0.28 + mX * 8;
          const refY = pupilCenter.sy - pupilRadius * 0.28 + mY * 8;
          const refRadius = pupilRadius * 0.15;
          if (refRadius > 0) {
            ctx.beginPath();
            ctx.arc(refX, refY, refRadius, 0, Math.PI * 2);
            const refGrad = ctx.createRadialGradient(refX, refY, 0, refX, refY, refRadius);
            refGrad.addColorStop(0, `rgba(255, 255, 255, ${0.55 * ratio})`);
            refGrad.addColorStop(0.5, `rgba(0, 245, 255, ${0.22 * ratio})`);
            refGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = refGrad;
            ctx.fill();
          }
        }
      }

      // 1. Draw Fiber Strands (Double Helix Strands with Nucleotide Base Colors)
      for (let i = 0; i < numStrands; i++) {
        let prevPt = project(getPointOnFiber(i, 0, t, activeDilationRadius));
        const p = Math.floor(i / 2);
        const isEven = i % 2 === 0;

        for (let j = 1; j <= segmentsPerStrand; j++) {
          const pt = project(getPointOnFiber(i, j, t, activeDilationRadius));
          
          const sNormalized = j / segmentsPerStrand;
          const baseBrightness = 0.25 + sNormalized * 0.55;

          const baseIndex = (p * 7 + j * 3) % 4;
          const baseColor = NUCLEOTIDE_COLORS[isEven ? baseIndex : (baseIndex ^ 1)];

          let tBrightness = baseBrightness;
          if (t < PHASE1_DURATION) {
            tBrightness = 1.35;
          } else if (t < PHASE3_START) {
            const ratio = (t - PHASE1_DURATION) / PHASE2_DURATION;
            tBrightness = THREE.MathUtils.lerp(1.35, baseBrightness, ratio);
          }

          let rVal = baseColor.r * tBrightness;
          let gVal = baseColor.g * tBrightness;
          let bVal = baseColor.b * tBrightness;

          if (pulseActiveRef.current) {
            const waveFront = 1.0 - pulseProgressRef.current;
            const waveWidth = 0.22;
            const distToWave = Math.abs(sNormalized - waveFront);
            if (distToWave < waveWidth) {
              const intensity = Math.pow(1.0 - distToWave / waveWidth, 2.0);
              rVal = THREE.MathUtils.lerp(rVal, 3.0, intensity);
              gVal = THREE.MathUtils.lerp(gVal, 0.1, intensity);
              bVal = THREE.MathUtils.lerp(bVal, 0.1, intensity);
            }
          }

          const r = Math.min(255, Math.floor(rVal * 255));
          const g = Math.min(255, Math.floor(gVal * 255));
          const b = Math.min(255, Math.floor(bVal * 255));

          ctx.beginPath();
          ctx.moveTo(prevPt.sx, prevPt.sy);
          ctx.lineTo(pt.sx, pt.sy);
          
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.15 + sNormalized * 0.75})`;
          ctx.lineWidth = Math.max(0.6, (1.1 - sNormalized) * 1.8 * (pt.scale / 45));
          ctx.stroke();

          prevPt = pt;
        }
      }

      // 1b. Draw DNA Connecting Base-Pair Rungs in 2D
      for (let p = 0; p < numStrands / 2; p++) {
        for (let j = 0; j <= segmentsPerStrand; j++) {
          const ptA = project(getPointOnFiber(2 * p, j, t, activeDilationRadius));
          const ptB = project(getPointOnFiber(2 * p + 1, j, t, activeDilationRadius));
          
          const sNormalized = j / segmentsPerStrand;
          const baseIndex = (p * 7 + j * 3) % 4;
          const baseColor = NUCLEOTIDE_COLORS[baseIndex];

          let tBrightness = 0.6;
          if (t < PHASE1_DURATION) {
            tBrightness = 1.25;
          } else if (t < PHASE3_START) {
            const ratio = (t - PHASE1_DURATION) / PHASE2_DURATION;
            tBrightness = THREE.MathUtils.lerp(1.25, 0.6, ratio);
          }

          let rVal = baseColor.r * tBrightness;
          let gVal = baseColor.g * tBrightness;
          let bVal = baseColor.b * tBrightness;

          if (pulseActiveRef.current) {
            const waveFront = 1.0 - pulseProgressRef.current;
            const waveWidth = 0.22;
            const distToWave = Math.abs(sNormalized - waveFront);
            if (distToWave < waveWidth) {
              const intensity = Math.pow(1.0 - distToWave / waveWidth, 2.0);
              rVal = THREE.MathUtils.lerp(rVal, 3.0, intensity);
              gVal = THREE.MathUtils.lerp(gVal, 0.1, intensity);
              bVal = THREE.MathUtils.lerp(bVal, 0.1, intensity);
            }
          }

          const r = Math.min(255, Math.floor(rVal * 255));
          const g = Math.min(255, Math.floor(gVal * 255));
          const b = Math.min(255, Math.floor(bVal * 255));

          // Scale rung thickness dynamically in 2D to emphasize DNA structure at the start
          let tFactor = 1.0;
          if (t < PHASE1_DURATION) {
            tFactor = 2.4;
          } else if (t < PHASE3_START) {
            const ratio = (t - PHASE1_DURATION) / PHASE2_DURATION;
            tFactor = THREE.MathUtils.lerp(2.4, 0.7, ratio);
          } else {
            tFactor = 0.7;
          }

          ctx.beginPath();
          ctx.moveTo(ptA.sx, ptA.sy);
          ctx.lineTo(ptB.sx, ptB.sy);
          
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(0.15 + sNormalized * 0.35) * (tFactor > 1 ? 1.4 : 1.0)})`;
          ctx.lineWidth = Math.max(0.4, 0.9 * (ptA.scale / 45) * tFactor);
          ctx.stroke();
        }
      }

      // 2. Draw Glowing Tips
      for (let i = 0; i < numStrands; i++) {
        const tipPos = getPointOnFiber(i, segmentsPerStrand, t, activeDilationRadius);
        const { sx, sy, scale: sScale } = project(tipPos);

        let pulseIntensity = 1.0;
        if (pulseActiveRef.current) {
          const waveFront = 1.0 - pulseProgressRef.current;
          if (waveFront > 0.7) {
            const intensity = (waveFront - 0.7) / 0.3;
            pulseIntensity = 1.0 + intensity * 2.5;
          }
        }

        const baseRadius = 1.5 * (sScale / 45);
        const glowRadius = baseRadius * 4.5 * pulseIntensity;

        if (glowRadius > 0 && sx >= 0 && sx <= currentW && sy >= 0 && sy <= currentH) {
          try {
            const colorStr = getTipColor2DStr(i);
            const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowRadius);
            const alpha = 0.85;
            grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1.0, alpha * pulseIntensity)})`);
            grad.addColorStop(0.3, `rgba(${colorStr}, ${Math.min(1.0, alpha * 0.5 * pulseIntensity)})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
            ctx.fill();
          } catch (e) {
            // Prevent any radial gradient scale/negative dimension crashes
          }
        }
      }

      // 3. Draw Flowing Packets
      for (let p = 0; p < numPackets; p++) {
        const pkt = packets[p];
        pkt.progress += dt * pkt.speed;
        if (pkt.progress > 1.0) {
          pkt.progress = 0;
          pkt.strandIndex = Math.floor(Math.random() * numStrands);
        }

        const segmentFloat = pkt.progress * segmentsPerStrand;
        const currentSegment = Math.floor(segmentFloat);
        const segmentProgress = segmentFloat - currentSegment;

        const pt1 = getPointOnFiber(pkt.strandIndex, currentSegment, t, activeDilationRadius);
        const pt2 = getPointOnFiber(pkt.strandIndex, Math.min(segmentsPerStrand, currentSegment + 1), t, activeDilationRadius);

        const px = pt1.x + (pt2.x - pt1.x) * segmentProgress;
        const py = pt1.y + (pt2.y - pt1.y) * segmentProgress;
        const pz = pt1.z + (pt2.z - pt1.z) * segmentProgress;

        const { sx, sy, scale: sScale } = project(new THREE.Vector3(px, py, pz));
        const packetRadius = 3.5 * (sScale / 45);

        if (packetRadius > 0 && sx >= 0 && sx <= currentW && sy >= 0 && sy <= currentH) {
          try {
            const pGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, packetRadius);
            pGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            pGrad.addColorStop(0.4, 'rgba(200, 200, 215, 0.4)');
            pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(sx, sy, packetRadius, 0, Math.PI * 2);
            ctx.fill();
          } catch (e) {
            // Safe guard
          }
        }
      }

      animFrameId = requestAnimationFrame(tick2D);
    };

    animFrameId = requestAnimationFrame(tick2D);

    const handleMouseMove = (e: MouseEvent) => {
      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      mouseRef.current.x = (x / bounds.width) * 2 - 1;
      mouseRef.current.y = -(y / bounds.height) * 2 + 1;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = 0;
      mouseRef.current.y = 0;
    };

    const element = containerRef.current;
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animFrameId);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [webglError]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full min-h-[350px] relative bg-[#09090b] rounded-3xl border border-white/5 overflow-hidden flex flex-col justify-between font-mono text-left select-none group"
    >
      {/* Background Matrix Scanning HUD Elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] opacity-60" />
        
        <div className="absolute top-4 left-6 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFAA00] animate-pulse" />
            <span className="text-[10px] font-black text-[#FFAA00] uppercase tracking-widest text-glow-amber">
              AUTONOMOUS DECEPTION ORACLE
            </span>
          </div>
          <span className="text-[7.5px] font-bold text-white/45 uppercase tracking-widest pl-3">
            NEURAL HEURISTIC THREAT VISUALIZATION
          </span>
        </div>
        <div className="absolute top-4 right-6 text-right">
          <span className="text-[8.5px] font-bold text-[#FFAA00] uppercase tracking-wider animate-pulse">
            CALIBRATION_LEVEL: SECURE
          </span>
        </div>
        
        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/10" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/10" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/10" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/10" />
      </div>

      {/* Floating Left Telemetry Rail Overlay */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-20 pointer-events-none select-none text-[8px] tracking-[0.2em] text-white/40">
        <div>
          <span className="block opacity-25 uppercase text-[6px]">ENGINE_CLASS</span>
          <span className="text-white/70 font-bold">DEEP_GNN_HEURISTIC</span>
        </div>
        <div>
          <span className="block opacity-25 uppercase text-[6px]">VISUALIZATION_FLOW</span>
          <span className={`font-bold transition-all ${currentPhase === 'IRIS' ? 'text-white/90 font-black' : ''}`}>
            {currentPhase}
          </span>
        </div>
        <div>
          <span className="block opacity-25 uppercase text-[6px]">FIBER_STREAM_COUNT</span>
          <span className="text-white/70 font-bold">140 STREAMS</span>
        </div>
        <div>
          <span className="block opacity-25 uppercase text-[6px]">GRID_SCALE</span>
          <span className="text-white/70 font-bold">3D_SPATIAL_1.0x</span>
        </div>
      </div>

      {/* Floating Right Status Rail Overlay */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-20 text-right text-[8px] tracking-[0.18em] text-white/40">
        <div className="pointer-events-none">
          <span className="block opacity-25 uppercase text-[6px]">PUPIL_DILATION_RATIO</span>
          <span className="text-white/70 font-bold font-mono">
            {currentPhase === 'IRIS' ? `${pupilDilation}%` : 'CALIBRATING'}
          </span>
        </div>
        <div className="pointer-events-none">
          <span className="block opacity-25 uppercase text-[6px]">HORIZONTAL_GAZE</span>
          <span className="text-white/70 font-bold">
            {parallaxAngle.x > 0 ? '+' : ''}{parallaxAngle.x.toFixed(1)}°
          </span>
        </div>
        <div className="pointer-events-none">
          <span className="block opacity-25 uppercase text-[6px]">VERTICAL_GAZE</span>
          <span className="text-white/70 font-bold">
            {parallaxAngle.y > 0 ? '+' : ''}{parallaxAngle.y.toFixed(1)}°
          </span>
        </div>
        <div className="pointer-events-none">
          <span className="block opacity-25 uppercase text-[6px]">SIMULATION_TIME</span>
          <span className="text-white/70 font-bold font-mono">{simulationTime.toFixed(2)}S</span>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleResetSequence();
          }}
          className="mt-2 bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 px-2.5 py-1.5 rounded-lg text-white text-[7.5px] font-bold uppercase tracking-widest flex items-center gap-1.5 self-end transition-all cursor-pointer pointer-events-auto"
        >
          <RotateCcw size={9} />
          REPLAY SEQ
        </button>
      </div>

      {/* CORE 3D CANVAS STAGE */}
      <div className="flex-1 w-full h-full relative cursor-crosshair">
        <canvas 
          key={webglError ? 'canvas-2d' : 'canvas-3d'}
          ref={canvasRef} 
          onClick={handleCanvasClick}
          className="w-full h-full block focus:outline-none animate-fade-in" 
        />

        {/* Central Pupil Cyberpunk warning HTML alert panel (blinks when clicked) */}
        <AnimatePresence>
          {systemAlert && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center"
            >
              <div className="relative w-64 h-64 rounded-full border border-red-500/30 bg-black/90 backdrop-blur-md shadow-[0_0_30px_rgba(255,51,51,0.3)] flex flex-col items-center justify-center p-6 text-center overflow-hidden alert-grid-glitch">
                {/* Rotating accent rings */}
                <div className="absolute inset-2 rounded-full border border-dashed border-red-500/20 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border border-double border-red-500/10 animate-[spin_15s_linear_infinite_reverse]" />
                
                {/* Threat Details */}
                <div className="z-10 flex flex-col items-center gap-1.5 w-full">
                  <ShieldAlert className="text-red-500 animate-pulse" size={20} />
                  <span className="text-[9px] font-black text-red-500 tracking-[0.2em] uppercase">
                    HAZARD DETECTED
                  </span>
                  
                  <div className="w-full text-left font-mono text-[7px] leading-tight text-white/80 space-y-1 my-1 border-y border-red-500/20 py-2">
                    <div className="text-white font-black animate-pulse text-center mb-1">
                      [ THREAT VECTOR IDENTIFIED ]
                    </div>
                    <div className="flex justify-between">
                      <span>VECTOR INDEX:</span>
                      <span className="text-white font-bold">MUTATION_GNN_03</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TARGET NODE:</span>
                      <span className="text-red-400 font-bold">JAM_HONEY_TOKEN_03</span>
                    </div>
                    <div className="flex justify-between">
                      <span>EXFIL_PORT:</span>
                      <span className="text-white/80 font-bold">8080 // OVERLAY</span>
                    </div>
                  </div>

                  {/* Isolation Progress bar inside pupil */}
                  <div className="w-full space-y-1">
                    <div className="flex justify-between text-[6.5px] text-white/40 font-mono">
                      <span>ISOLATING:</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-red-950/40 h-1 rounded-full overflow-hidden border border-red-500/25">
                      <div 
                        className="bg-red-500 h-full transition-all duration-75 shadow-[0_0_8px_rgba(255,51,51,0.8)]"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSystemAlert(false);
                    }}
                    className="pointer-events-auto mt-2 bg-red-950/60 hover:bg-red-900/80 active:bg-red-950 border border-red-500/30 text-red-400 font-black text-[7px] px-2 py-1 rounded tracking-widest uppercase transition-all cursor-pointer"
                  >
                    DISMISS
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Instructional Overlays depending on sequence phases */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none z-20 text-[8.5px] text-white/35 tracking-widest text-center w-full max-w-[90%] px-4">
          {currentPhase === 'DESCENT' && (
            <span className="animate-pulse">PHASE 1: DESCENT SEQUENCE IN PROGRESS...</span>
          )}
          {currentPhase === 'SPLAY' && (
            <span className="text-[#FFAA00] animate-pulse">PHASE 2: ASSEMBLING NEURAL IRIS PATTERN...</span>
          )}
          {currentPhase === 'IRIS' && (
            <div className="flex flex-col gap-1 items-center">
              <span className="text-white/60 font-bold flex items-center gap-1.5 uppercase tracking-[0.25em] text-[8px] sm:text-[9px]">
                <Eye size={10} className="text-white/50 animate-pulse shrink-0" /> Gaze Locked & Active. Gaze rotates based on cursor position.
              </span>
              <span className="text-[7.5px] opacity-60">
                {pulseActive ? 'EMITTING SURGE WAVE PROPAGATION...' : 'CLICK CENTRAL PUPIL TO EMIT HAZARD THREAT WAVE'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cybernetic bottom panel showing diagnostic rates */}
      <div className="px-6 py-4 border-t border-white/5 bg-black/50 backdrop-blur-sm z-20 flex justify-between items-center text-[8.5px] tracking-[0.2em] text-white/40">
        <div className="flex items-center gap-1.5">
          <Sparkles className="text-[#FFAA00]" size={10} />
          <span>STABILITY: <span className="text-white font-bold">99.98%</span></span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>COEFFICIENT: <span className="text-white font-bold font-mono">0.023b</span></span>
          <span className="w-[1px] h-3 bg-white/10" />
          <span>FIBER NOISE: <span className="text-white font-bold">-112DB</span></span>
          <span className="w-[1px] h-3 bg-white/10" />
          <span>DECEPTION LEVEL: <span className="text-[#FFAA00] font-bold">OPTIMAL</span></span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-green-400 font-bold font-mono uppercase">FEED_SYNCED</span>
        </div>
      </div>
    </div>
  );
};
