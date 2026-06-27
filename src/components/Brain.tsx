import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';

interface BrainProps {
  threatLevel: number;
  isEngaging: boolean;
  onEnterProcess?: () => void;
}

export const Brain: React.FC<BrainProps> = ({ threatLevel, isEngaging, onEnterProcess }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollAccumulator = useRef(0);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const updateSize = () => {
      const rect = svgRef.current?.parentElement?.getBoundingClientRect();
      if (rect) {
        const size = Math.min(rect.width, rect.height);
        d3.select(svgRef.current)
          .attr('width', size)
          .attr('height', size);
        return size;
      }
      return 400;
    };

    const size = updateSize();
    const center = { x: size / 2, y: size / 2 };

    // Add multiple layers of glowing particles
    const particles = d3.range(400).map(i => ({
      id: i,
      x: center.x + (Math.random() - 0.5) * size * 1.5,
      y: center.y + (Math.random() - 0.5) * size * 1.5,
      size: Math.random() * 2.5,
      speed: Math.random() * 0.03,
      color: Math.random() > 0.5 ? '#FFB000' : '#00F0FF'
    }));

    const particleElements = svg.append('g')
      .selectAll('circle.particle')
      .data(particles)
      .enter()
      .append('circle')
      .attr('class', 'particle')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('opacity', 0.2);

    d3.timer((elapsed) => {
      particleElements
        .attr('transform', d => {
          const angle = elapsed * d.speed;
          const dx = Math.cos(angle) * 40;
          const dy = Math.sin(angle) * 40;
          return `translate(${dx}, ${dy})`;
        });
    });

    // Create a pulsing neural grid
    const nodes = d3.range(250).map(i => ({
      id: i,
      x: center.x + (Math.random() - 0.5) * size * 0.8,
      y: center.y + (Math.random() - 0.5) * size * 0.8,
      group: Math.floor(Math.random() * 8),
      fx: null as number | null,
      fy: null as number | null
    }));

    const links = d3.range(450).map(() => ({
      source: Math.floor(Math.random() * 250),
      target: Math.floor(Math.random() * 250),
    }));

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).distance(size * 0.12))
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(center.x, center.y))
      .force('collision', d3.forceCollide().radius(15))
      .on('tick', () => {
        linkElements
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        nodeElements
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);
          
        glowElements
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);
      });

    const linkElements = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', isEngaging ? '#FF1F1F' : '#FFB000')
      .attr('stroke-width', 0.8)
      .attr('opacity', 0.15);

    const glowElements = svg.append('g')
      .selectAll('circle.glow')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'glow')
      .attr('r', 12)
      .attr('fill', isEngaging ? '#FF1F1F' : '#FFB000')
      .attr('opacity', 0.06);

    const nodeElements = svg.append('g')
      .selectAll('circle.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', (d: any) => d.group === 0 ? 10 : 4)
      .attr('fill', (d: any) => {
        if (isEngaging) return '#FF1F1F';
        if (d.group === 0) return '#FFB000';
        if (d.group === 1) return '#00F0FF';
        if (d.group === 2) return '#FFFFFF';
        return 'transparent';
      })
      .attr('stroke', (d: any) => d.group === 3 ? '#FFB000' : 'none')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9)
      .attr('cursor', 'pointer')
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r', 25)
          .attr('opacity', 1)
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 4);
        
        svg.append('text')
          .attr('id', `label-${d.id}`)
          .attr('x', d.x + 30)
          .attr('y', d.y)
          .attr('fill', '#FFFFFF')
          .attr('font-size', '16px')
          .attr('font-family', 'JetBrains Mono')
          .attr('font-weight', '900')
          .attr('letter-spacing', '0.2em')
          .attr('class', 'pointer-events-none')
          .text(`NODE_0x${d.id.toString(16).toUpperCase()}`);
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r', d.group === 0 ? 10 : 4)
          .attr('opacity', 0.9)
          .attr('stroke', d.group === 3 ? '#FFB000' : 'none')
          .attr('stroke-width', 2);
        
        svg.select(`#label-${d.id}`).remove();
      });

    // Mouse force interaction
    svg.on('mousemove', (event) => {
      const [mx, my] = d3.pointer(event);
      nodes.forEach((node: any) => {
        const dx = node.x - mx;
        const dy = node.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          node.vx += dx * force * 0.2;
          node.vy += dy * force * 0.2;
        }
      });
      simulation.alphaTarget(0.1).restart();
    });

    // Scroll to enter logic
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      scrollAccumulator.current += event.deltaY;
      
      const zoom = 1 + Math.abs(scrollAccumulator.current) / 1000;
      svg.attr('transform', `scale(${zoom})`);
      svg.attr('opacity', 1 - Math.abs(scrollAccumulator.current) / 1500);

      if (Math.abs(scrollAccumulator.current) > 1000) {
        onEnterProcess?.();
        scrollAccumulator.current = 0;
      }
    };

    const svgNode = svgRef.current;
    if (svgNode) {
      svgNode.addEventListener('wheel', handleWheel, { passive: false });
    }

    // Add orbit rings
    const orbits = [size * 0.3, size * 0.4, size * 0.5, size * 0.6];
    orbits.forEach((r, i) => {
      svg.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', i % 2 === 0 ? '#FFB000' : '#00F0FF')
        .attr('stroke-width', 0.8)
        .attr('stroke-dasharray', i % 2 === 0 ? '6,20' : '3,12')
        .attr('opacity', 0.1)
        .append('animateTransform')
        .attr('attributeName', 'transform')
        .attr('type', 'rotate')
        .attr('from', `0 ${center.x} ${center.y}`)
        .attr('to', `${i % 2 === 0 ? 360 : -360} ${center.x} ${center.y}`)
        .attr('dur', `${20 + i * 8}s`)
        .attr('repeatCount', 'indefinite');
    });

    // Gradients
    const defs = svg.append('defs');
    const coreGrad = defs.append('radialGradient').attr('id', 'core-grad-main');
    coreGrad.append('stop').attr('offset', '0%').attr('stop-color', isEngaging ? '#FF1F1F' : '#FFB000').attr('stop-opacity', 0.8);
    coreGrad.append('stop').attr('offset', '100%').attr('stop-color', isEngaging ? '#FF1F1F' : '#FFB000').attr('stop-opacity', 0);

    svg.append('circle')
      .attr('cx', center.x)
      .attr('cy', center.y)
      .attr('r', size * 0.4)
      .attr('fill', 'url(#core-grad-main)')
      .attr('class', 'animate-pulse');

    return () => {
      simulation.stop();
      if (svgNode) {
        svgNode.removeEventListener('wheel', handleWheel);
      }
    };
  }, [threatLevel, isEngaging, onEnterProcess]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair group">
      <svg ref={svgRef} width="400" height="400" className="filter drop-shadow-[0_0_30px_rgba(255,176,0,0.4)] transition-transform duration-300" />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] uppercase tracking-[0.5em] font-black text-amber-neon mb-2"
        >
          Neural Core Active
        </motion.div>
        <div className="text-[8px] uppercase tracking-[0.3em] opacity-30 group-hover:opacity-100 transition-opacity duration-500">
          Scroll to Enter Process Stream
        </div>
      </div>
    </div>
  );
};
