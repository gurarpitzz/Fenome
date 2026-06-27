import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Sliders, Play, Pause, Plus, Trash2, Edit2, Check, X,
  TrendingUp, Wallet, ArrowUpRight, Award, ShieldAlert, Zap, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Milestone {
  id: string;
  date: string;
  title: string;
  amount: number;
  isMonthly: boolean;
  side: 'left' | 'right';
  stepIndex: number;
  color: string;
  category: 'saving' | 'spending' | 'investment' | 'emergency';
}

const DEFAULT_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    date: '2024 APR',
    title: 'High UPI Transactions',
    amount: 52430,
    isMonthly: true,
    side: 'right',
    stepIndex: 4,
    color: '#FF1F1F', // Red
    category: 'spending'
  },
  {
    id: 'm2',
    date: '2024 JUL',
    title: 'Lifestyle Spending',
    amount: 31870,
    isMonthly: true,
    side: 'right',
    stepIndex: 10,
    color: '#FFB000', // Orange
    category: 'spending'
  },
  {
    id: 'm3',
    date: '2024 OCT',
    title: 'SIP Initiated',
    amount: 10000,
    isMonthly: true,
    side: 'left',
    stepIndex: 16,
    color: '#00FF66', // Green
    category: 'saving'
  },
  {
    id: 'm4',
    date: '2025 JAN',
    title: 'Emergency Fund',
    amount: 75000,
    isMonthly: false,
    side: 'left',
    stepIndex: 22,
    color: '#00F0FF', // Cyan
    category: 'emergency'
  },
  {
    id: 'm5',
    date: '2025 MAR',
    title: 'Investment Portfolio',
    amount: 120000,
    isMonthly: false,
    side: 'right',
    stepIndex: 27,
    color: '#0088FF', // Blue
    category: 'investment'
  }
];

export const FinancialHealthHelix: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('balanced');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  
  // Helix Rotation Angle
  const [angle, setAngle] = useState<number>(0);
  
  // Custom Milestone Form State
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newDate, setNewDate] = useState<string>('2025 JUN');
  const [newTitle, setNewTitle] = useState<string>('Mutual Funds Topup');
  const [newAmount, setNewAmount] = useState<number>(25000);
  const [newIsMonthly, setNewIsMonthly] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<'saving' | 'spending' | 'investment' | 'emergency'>('investment');
  const [newSide, setNewSide] = useState<'left' | 'right'>('right');

  // Selected for inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');

  const animationRef = useRef<number | null>(null);

  // Rotation update loop
  useEffect(() => {
    let lastTime = performance.now();
    const updateRotation = (time: number) => {
      if (isRotating) {
        const delta = (time - lastTime) * 0.001;
        setAngle(prev => (prev + delta * rotationSpeed * 1.5) % (Math.PI * 2));
      }
      lastTime = time;
      animationRef.current = requestAnimationFrame(updateRotation);
    };
    animationRef.current = requestAnimationFrame(updateRotation);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRotating, rotationSpeed]);

  // Fluctuating ticker values when simulation is active
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setMilestones(prev => prev.map(m => {
        // Only slightly fluctuate spending/UPI, keeping savings stable or slowly growing
        if (m.category === 'spending' && Math.random() > 0.7) {
          const changePercent = (Math.random() - 0.5) * 0.04; // +/- 2%
          return {
            ...m,
            amount: Math.round(m.amount * (1 + changePercent))
          };
        }
        return m;
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Dynamic Financial Genome Health Score Calculation
  // Savings & Investments boost score, high spending drags score down.
  const calculateScore = () => {
    let savingsSum = 0;
    let spendingSum = 0;
    
    milestones.forEach(m => {
      // Monthly amounts are weighted higher
      const weightedAmount = m.isMonthly ? m.amount * 12 : m.amount;
      if (m.category === 'saving' || m.category === 'emergency' || m.category === 'investment') {
        savingsSum += weightedAmount;
      } else {
        spendingSum += weightedAmount;
      }
    });

    if (savingsSum === 0) return 40;
    
    const ratio = savingsSum / (spendingSum || 1);
    
    // Scale logically from 40 to 100 based on healthy saving ratio
    let baseScore = 70;
    if (ratio > 2) baseScore += 15;
    else if (ratio > 1) baseScore += 8;
    else if (ratio < 0.5) baseScore -= 15;
    else baseScore -= 5;

    // Bonus for diversity
    const uniqueCats = new Set(milestones.map(m => m.category)).size;
    baseScore += (uniqueCats - 2) * 4;

    return Math.min(100, Math.max(30, Math.round(baseScore)));
  };

  const currentScore = calculateScore();

  // Apply visual preset states
  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    setSelectedMilestoneId(null);
    setEditingId(null);
    setIsAdding(false);

    if (preset === 'balanced') {
      setMilestones(DEFAULT_MILESTONES);
    } else if (preset === 'saver') {
      setMilestones([
        { id: 'm1', date: '2024 APR', title: 'Controlled UPI Trans', amount: 15400, isMonthly: true, side: 'right', stepIndex: 4, color: '#FF1F1F', category: 'spending' },
        { id: 'm2', date: '2024 JUL', title: 'Minimalist Lifestyle', amount: 12500, isMonthly: true, side: 'right', stepIndex: 10, color: '#FFB000', category: 'spending' },
        { id: 'm3', date: '2024 OCT', title: 'Aggressive Mutual SIP', amount: 45000, isMonthly: true, side: 'left', stepIndex: 16, color: '#00FF66', category: 'saving' },
        { id: 'm4', date: '2025 JAN', title: 'Emergency Fund Solidified', amount: 150000, isMonthly: false, side: 'left', stepIndex: 22, color: '#00F0FF', category: 'emergency' },
        { id: 'm5', date: '2025 MAR', title: 'Equity Indexes Rebalanced', amount: 350000, isMonthly: false, side: 'right', stepIndex: 27, color: '#0088FF', category: 'investment' }
      ]);
    } else if (preset === 'spender') {
      setMilestones([
        { id: 'm1', date: '2024 APR', title: 'Excessive Food & Pubs', amount: 82400, isMonthly: true, side: 'right', stepIndex: 4, color: '#FF1F1F', category: 'spending' },
        { id: 'm2', date: '2024 JUL', title: 'Luxury Retail Spree', amount: 95000, isMonthly: true, side: 'right', stepIndex: 10, color: '#FFB000', category: 'spending' },
        { id: 'm3', date: '2024 OCT', title: 'Symbolic Token SIP', amount: 2000, isMonthly: true, side: 'left', stepIndex: 16, color: '#00FF66', category: 'saving' },
        { id: 'm4', date: '2025 JAN', title: 'Drained Emergency Res', amount: 12000, isMonthly: false, side: 'left', stepIndex: 22, color: '#00F0FF', category: 'emergency' },
        { id: 'm5', date: '2025 MAR', title: 'Speculative Token Bets', amount: 45000, isMonthly: false, side: 'right', stepIndex: 27, color: '#0088FF', category: 'investment' }
      ]);
    }
  };

  // Add Custom Milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose stepIndex that is not already heavily occupied
    const occupiedSteps = milestones.map(m => m.stepIndex);
    let stepIndex = 13; // default midpoint
    for (let s = 1; s < 30; s++) {
      if (!occupiedSteps.includes(s) && s !== 4 && s !== 10 && s !== 16 && s !== 22 && s !== 27) {
        stepIndex = s;
        break;
      }
    }

    const categoryColors = {
      spending: '#FF1F1F',
      saving: '#00FF66',
      emergency: '#00F0FF',
      investment: '#0088FF'
    };

    const newMilestone: Milestone = {
      id: `custom-${Date.now()}`,
      date: newDate.toUpperCase(),
      title: newTitle,
      amount: newAmount,
      isMonthly: newIsMonthly,
      side: newSide,
      stepIndex,
      color: categoryColors[newCategory],
      category: newCategory
    };

    setMilestones(prev => [...prev, newMilestone]);
    setIsAdding(false);
    setSelectedMilestoneId(newMilestone.id);
  };

  // Delete Milestone
  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    setSelectedMilestoneId(null);
    setEditingId(null);
  };

  // Start Editing Amount/Title
  const startEditing = (m: Milestone) => {
    setEditingId(m.id);
    setEditAmount(m.amount);
    setEditTitle(m.title);
    setEditDate(m.date);
  };

  // Save Edit
  const saveEditing = () => {
    setMilestones(prev => prev.map(m => {
      if (m.id === editingId) {
        return {
          ...m,
          amount: editAmount,
          title: editTitle,
          date: editDate.toUpperCase()
        };
      }
      return m;
    }));
    setEditingId(null);
  };

  // Helper formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helix mathematics for rendering the dynamic rotating DNA strand
  const renderDnaHelix = () => {
    const width = 160;
    const height = 310;
    const centerX = width / 2;
    const padding = 20;
    const numSteps = 30;
    const rungs: React.ReactNode[] = [];
    const strandsA: { x: number; y: number; z: number; color: string; index: number }[] = [];
    const strandsB: { x: number; y: number; z: number; color: string; index: number }[] = [];

    // Helix structure configuration
    const helixRadius = 35;
    const verticalPeriodCount = 1.6; // number of full twists

    // Colors mapping down the vertical gradient
    const getVerticalColor = (percent: number) => {
      if (percent < 0.25) return '#FF1F1F'; // Red
      if (percent < 0.45) return '#FFB000'; // Orange
      if (percent < 0.65) return '#00FF66'; // Green
      if (percent < 0.85) return '#00F0FF'; // Cyan
      return '#0088FF'; // Blue
    };

    for (let i = 0; i < numSteps; i++) {
      const percent = i / (numSteps - 1);
      const y = padding + percent * (height - padding * 2);
      
      // Calculate current helical phase angle based on height and rotation state
      const phase = percent * Math.PI * 2 * verticalPeriodCount + angle;
      
      // Compute 3D Coordinates (Z is depth, used for scaling and styling)
      const xA = centerX + Math.sin(phase) * helixRadius;
      const xB = centerX - Math.sin(phase) * helixRadius;
      const zA = Math.cos(phase); // -1 to 1
      const zB = -Math.cos(phase); // -1 to 1

      const col = getVerticalColor(percent);

      strandsA.push({ x: xA, y, z: zA, color: col, index: i });
      strandsB.push({ x: xB, y, z: zB, color: col, index: i });

      // Draw connective rung at alternating steps for lighter density HUD look
      if (i % 2 === 0) {
        const strokeOpacity = 0.08 + Math.max(0, (zA + zB + 2) / 4) * 0.25;
        rungs.push(
          <line
            key={`rung-${i}`}
            x1={xA}
            y1={y}
            x2={xB}
            y2={y}
            stroke={col}
            strokeWidth="1.2"
            strokeOpacity={strokeOpacity}
            strokeDasharray="2, 2"
          />
        );
      }
    }

    // Lead pointers from actual moving coordinates to labels
    const pointers: React.ReactNode[] = [];

    milestones.forEach(m => {
      const { stepIndex, side, color, id } = m;
      if (stepIndex >= numSteps) return;

      // Find node matching step index
      // Pick either Strand A or Strand B for organic separation, say Strand A
      const node = strandsA[stepIndex];
      if (!node) return;

      const isSelected = selectedMilestoneId === id;
      const labelY = node.y; // horizontal lead alignments
      const labelAnchorX = side === 'right' ? width - 5 : 5;

      // Polyline routing: start at moving node (x, y), do micro diagonal elbow bend, end at side boundary
      const nodeX = node.x;
      const nodeY = node.y;
      
      const elbowX = side === 'right' ? nodeX + 15 : nodeX - 15;
      const elbowY = nodeY - 6;

      pointers.push(
        <g key={`lead-${id}`} className="pointer-events-none">
          {/* Glowing node point highlight */}
          <circle
            cx={nodeX}
            cy={nodeY}
            r={isSelected ? 4.5 : 2.5}
            fill={color}
            className={cn(isSelected ? "animate-pulse" : "")}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
          {/* Animated pointer lead line */}
          <path
            d={`M ${nodeX} ${nodeY} L ${elbowX} ${elbowY} L ${labelAnchorX} ${elbowY}`}
            fill="none"
            stroke={color}
            strokeWidth={isSelected ? "1.5" : "0.75"}
            strokeOpacity={isSelected ? "0.9" : "0.35"}
            strokeDasharray={isSelected ? "none" : "3, 2"}
          />
        </g>
      );
    });

    return (
      <svg className="w-full h-full select-none overflow-visible">
        <defs>
          {/* Vertical linear gradients for double helix structure */}
          <linearGradient id="helixGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF1F1F" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#FFB000" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00FF66" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#00F0FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0088FF" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Ambient structure shadows/backing */}
        <line
          x1={centerX}
          y1={padding}
          x2={centerX}
          y2={height - padding}
          stroke="rgba(255,255,255,0.015)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Render connective horizontal rungs */}
        {rungs}

        {/* Render Strand A connectors / ribbon lines */}
        <path
          d={strandsA.reduce((acc, curr, idx) => 
            acc + `${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, ''
          )}
          fill="none"
          stroke="url(#helixGrad)"
          strokeWidth="1.5"
          strokeOpacity="0.45"
        />

        {/* Render Strand B connectors / ribbon lines */}
        <path
          d={strandsB.reduce((acc, curr, idx) => 
            acc + `${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, ''
          )}
          fill="none"
          stroke="url(#helixGrad)"
          strokeWidth="1.5"
          strokeOpacity="0.45"
          strokeDasharray="4, 3"
        />

        {/* Render points of Strand A */}
        {strandsA.map((node, i) => {
          const zScale = 1.5 + node.z * 0.8; // depth scaling
          const opacity = 0.25 + (node.z + 1) * 0.35; // depth opacity
          return (
            <circle
              key={`a-node-${i}`}
              cx={node.x}
              cy={node.y}
              r={zScale}
              fill={node.color}
              fillOpacity={opacity}
              style={{ filter: node.z > 0.5 ? `drop-shadow(0 0 3px ${node.color}cc)` : 'none' }}
            />
          );
        })}

        {/* Render points of Strand B */}
        {strandsB.map((node, i) => {
          const zScale = 1.5 + node.z * 0.8;
          const opacity = 0.2 + (node.z + 1) * 0.3;
          return (
            <circle
              key={`b-node-${i}`}
              cx={node.x}
              cy={node.y}
              r={zScale}
              fill={node.color}
              fillOpacity={opacity}
            />
          );
        })}

        {/* Draw interactive lead connections */}
        {pointers}
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden justify-between p-4 bg-glass select-none">
      
      {/* Header telemetry stats */}
      <div className="flex justify-between items-center mb-1 shrink-0 border-b border-white/5 pb-2">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Financial Health Genome</h4>
          <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest">Helix Mapping Milestones</span>
        </div>
        
        {/* Glowing health score tracker */}
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase">SCORE</span>
            <span className={cn(
              "text-base font-black font-mono leading-none tracking-tight",
              currentScore >= 80 ? "text-green-400" : currentScore >= 60 ? "text-amber-neon" : "text-red-threat"
            )}>
              {currentScore}
            </span>
            <span className="text-[8px] font-mono text-zinc-500">/100</span>
          </div>
          <div className="text-[6.5px] font-mono uppercase tracking-wider text-green-400/80 mt-0.5 font-bold">
            {currentScore >= 80 ? '● HEALTHY RESERVES' : currentScore >= 60 ? '▲ MODERATE DRIFT' : '✖ WARNING STATE'}
          </div>
        </div>
      </div>

      {/* Preset and Action Controls row */}
      <div className="flex items-center justify-between gap-1 mb-2 shrink-0 bg-white/[0.01] border border-white/5 p-1 rounded-xl">
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => applyPreset('balanced')}
            className={cn(
              "px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider transition-all",
              activePreset === 'balanced' ? "bg-white/10 text-white font-black" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            BALANCED
          </button>
          <button
            onClick={() => applyPreset('saver')}
            className={cn(
              "px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider transition-all",
              activePreset === 'saver' ? "bg-green-400/10 text-green-400 font-black border border-green-400/20" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            SAVER
          </button>
          <button
            onClick={() => applyPreset('spender')}
            className={cn(
              "px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider transition-all",
              activePreset === 'spender' ? "bg-red-threat/10 text-red-threat font-black border border-red-threat/20" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            SPENDER
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="p-1 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-lg text-white/50 hover:text-white transition-all shrink-0"
            title={isRotating ? "Pause Rotation" : "Play Rotation"}
          >
            {isRotating ? <Pause size={8} /> : <Play size={8} />}
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 bg-amber-neon/10 hover:bg-amber-neon/20 border border-amber-neon/20 hover:border-amber-neon/30 text-amber-neon rounded-lg transition-all shrink-0 flex items-center gap-0.5"
            title="Create custom milestone node"
          >
            <Plus size={8} /> <span className="text-[7px] font-black uppercase tracking-wider">ADD</span>
          </button>
        </div>
      </div>

      {/* Main interactive genome grid display area */}
      <div className="flex-1 min-h-0 relative flex items-center justify-between mb-2">
        
        {/* Left Side Labels: (m3: 2024 OCT, m4: 2025 JAN) */}
        <div className="w-[110px] space-y-4 shrink-0 z-10 select-none text-left flex flex-col justify-center">
          {milestones.filter(m => m.side === 'left').map(m => {
            const isSelected = selectedMilestoneId === m.id;
            const isEditing = editingId === m.id;
            return (
              <div 
                key={m.id}
                onClick={() => {
                  setSelectedMilestoneId(isSelected ? null : m.id);
                  if (editingId) setEditingId(null);
                }}
                className={cn(
                  "p-2 bg-black/40 border rounded-xl cursor-pointer hover:bg-white/[0.02] transition-all relative select-none",
                  isSelected ? "border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] bg-[#090909]" : "border-white/5"
                )}
              >
                <div className="flex justify-between items-start mb-0.5">
                  <span className="text-[6.5px] font-black font-mono px-1 rounded uppercase tracking-wider text-black bg-white" style={{ backgroundColor: m.color }}>
                    {m.date}
                  </span>
                  {m.isMonthly && (
                    <span className="text-[5.5px] font-mono text-zinc-500 font-bold uppercase tracking-widest">/MO</span>
                  )}
                </div>
                
                <h5 className="text-[8px] font-black text-white leading-tight truncate uppercase tracking-wide">
                  {m.title}
                </h5>
                <p className="text-[8.5px] font-black font-mono mt-0.5" style={{ color: m.color }}>
                  {formatCurrency(m.amount)}
                </p>

                {/* Left Mini Edit indicators */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 bg-black/80 border border-white/10 rounded-md p-0.5 flex gap-1 z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEditing(m); }}
                      className="text-white hover:text-amber-neon"
                    >
                      <Edit2 size={8} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteMilestone(m.id); }}
                      className="text-white hover:text-red-threat"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Center: Dynamic Animated double helix canvas */}
        <div className="flex-1 h-full min-h-0 relative max-w-[170px]">
          {renderDnaHelix()}
        </div>

        {/* Right Side Labels: (m1: 2024 APR, m2: 2024 JUL, m5: 2025 MAR) */}
        <div className="w-[110px] space-y-3 shrink-0 z-10 select-none text-right flex flex-col justify-center">
          {milestones.filter(m => m.side === 'right').map(m => {
            const isSelected = selectedMilestoneId === m.id;
            return (
              <div 
                key={m.id}
                onClick={() => {
                  setSelectedMilestoneId(isSelected ? null : m.id);
                  if (editingId) setEditingId(null);
                }}
                className={cn(
                  "p-2 bg-black/40 border rounded-xl cursor-pointer hover:bg-white/[0.02] transition-all relative select-none",
                  isSelected ? "border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] bg-[#090909]" : "border-white/5"
                )}
              >
                <div className="flex justify-between items-start mb-0.5 flex-row-reverse">
                  <span className="text-[6.5px] font-black font-mono px-1 rounded uppercase tracking-wider text-black" style={{ backgroundColor: m.color }}>
                    {m.date}
                  </span>
                  {m.isMonthly && (
                    <span className="text-[5.5px] font-mono text-zinc-500 font-bold uppercase tracking-widest">/MO</span>
                  )}
                </div>
                
                <h5 className="text-[8px] font-black text-white leading-tight truncate uppercase tracking-wide">
                  {m.title}
                </h5>
                <p className="text-[8.5px] font-black font-mono mt-0.5" style={{ color: m.color }}>
                  {formatCurrency(m.amount)}
                </p>

                {/* Right Mini Edit indicators */}
                {isSelected && (
                  <div className="absolute -top-1.5 -left-1.5 bg-black/80 border border-white/10 rounded-md p-0.5 flex gap-1 z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEditing(m); }}
                      className="text-white hover:text-amber-neon"
                    >
                      <Edit2 size={8} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteMilestone(m.id); }}
                      className="text-white hover:text-red-threat"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Dynamic Popups & Forms Drawers */}
      <div className="shrink-0 relative z-30">
        <AnimatePresence mode="wait">
          
          {/* 1. Milestone Editing Drawer */}
          {editingId && (() => {
            const m = milestones.find(it => it.id === editingId);
            if (!m) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-black/90 border border-white/10 p-3 rounded-2xl flex flex-col space-y-2.5 text-left"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-mono font-black text-amber-neon uppercase tracking-wider flex items-center gap-1">
                    <Sliders size={10} /> Edit DNA Milestone Values
                  </span>
                  <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-white">
                    <X size={10} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[6.5px] uppercase tracking-wider text-zinc-500 block mb-0.5">Timeline Date</label>
                    <input
                      type="text"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 focus:border-amber-neon/40 text-white rounded-lg p-1 text-[8.5px] font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[6.5px] uppercase tracking-wider text-zinc-500 block mb-0.5">Label Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 focus:border-amber-neon/40 text-white rounded-lg p-1 text-[8.5px] font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[7px] text-zinc-400 font-bold mb-1">
                    <span className="uppercase tracking-wider">Adjustment Amount</span>
                    <span className="font-mono text-amber-neon">{formatCurrency(editAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="1000"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full accent-amber-neon bg-white/10 h-1 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={saveEditing}
                    className="flex-1 py-1 bg-amber-neon hover:bg-amber-neon/80 text-black text-[8px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    <Check size={8} /> Apply Changes
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white text-[8px] font-bold uppercase rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            );
          })()}

          {/* 2. Add Custom Milestone Form */}
          {isAdding && (
            <motion.form
              onSubmit={handleAddMilestone}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-black/95 border border-white/10 p-3 rounded-2xl flex flex-col space-y-2 text-left"
            >
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-mono font-black text-[#00F0FF] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={10} /> Add Custom Helix Milestone
                </span>
                <button type="button" onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white">
                  <X size={10} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[6.5px] uppercase tracking-wider text-zinc-500 block mb-0.5">Date (eg 2025 JUN)</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/5 focus:border-cyan-data/40 text-white rounded-lg p-1 text-[8.5px] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[6.5px] uppercase tracking-wider text-zinc-500 block mb-0.5">Title Name</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/5 focus:border-cyan-data/40 text-white rounded-lg p-1 text-[8.5px] font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[6.5px] uppercase tracking-wider text-zinc-500 block mb-0.5">Amount (INR)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    required
                    className="w-full bg-white/5 border border-white/5 focus:border-cyan-data/40 text-white rounded-lg p-1 text-[8.5px] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[6.5px] uppercase tracking-wider text-zinc-500 block mb-0.5">Category Type</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 focus:border-cyan-data/40 text-white rounded-lg p-1 text-[8.5px] font-bold focus:outline-none"
                  >
                    <option value="saving">Saving Core</option>
                    <option value="spending">Discretionary Spend</option>
                    <option value="emergency">Emergency Reserve</option>
                    <option value="investment">Equity Investment</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-[7.5px] bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsMonthly}
                    onChange={(e) => setNewIsMonthly(e.target.checked)}
                    className="accent-cyan-data"
                  />
                  <span className="text-zinc-400 font-bold uppercase">Monthly recurring</span>
                </label>

                <div className="flex gap-2">
                  <span className="text-zinc-500 font-bold">SIDE:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="side"
                      checked={newSide === 'left'}
                      onChange={() => setNewSide('left')}
                      className="accent-cyan-data"
                    />
                    <span className="text-zinc-400">LEFT</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="side"
                      checked={newSide === 'right'}
                      onChange={() => setNewSide('right')}
                      className="accent-cyan-data"
                    />
                    <span className="text-zinc-400">RIGHT</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-1.5 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-1 bg-cyan-data hover:bg-cyan-data/80 text-black text-[8px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={8} /> Thread New Gene
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white text-[8px] font-bold uppercase rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}

          {/* 3. Empty slot helper display */}
          {!editingId && !isAdding && (
            <div className="text-[7.5px] font-mono text-zinc-500 text-center uppercase tracking-widest bg-white/[0.01] border border-white/5 py-1.5 rounded-xl flex justify-center items-center gap-2">
              <Zap size={10} className="text-amber-neon animate-pulse" /> Click a node callout card to inspect & modify metrics
            </div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};
