"use client";

import { cn } from "@/lib/utils";
import { useRef, useEffect, useCallback } from "react";

interface Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  type: 'policy' | 'clause' | 'entity';
  color: string;
  size: number;
}

interface Pulse {
  source: Node;
  target: Node;
  progress: number; // 0 to 1
  speed: number;
}

// Math helpers
function rotateY(x: number, y: number, z: number, angle: number): [number, number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos + z * sin, y, -x * sin + z * cos];
}

function rotateX(x: number, y: number, z: number, angle: number): [number, number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x, y * cos - z * sin, y * sin + z * cos];
}

function project(x: number, y: number, z: number, cx: number, cy: number, fov: number): [number, number, number] {
  const scale = fov / (fov + z);
  return [x * scale + cx, y * scale + cy, z];
}

export function Component({ className }: { className?: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotYRef = useRef(0);
  const rotXRef = useRef(0);

  const nodesRef = useRef<Node[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, targetRotX: 0, targetRotY: 0 });

  useEffect(() => {
    // Initialize nodes
    const nodes: Node[] = [];
    const numNodes = 200;
    const radius = 220; // Radius of the bounding sphere

    for (let i = 0; i < numNodes; i++) {
      // Random point uniformly in a sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      // Assign types and visuals randomly
      const rand = Math.random();
      let type: 'policy' | 'clause' | 'entity' = 'entity';
      let color = 'rgba(148, 163, 184, 1)'; // slate-400 (entities)
      let size = 1.2;

      if (rand < 0.1) {
        type = 'policy';
        color = 'rgba(96, 165, 250, 1)'; // blue-400 (root nodes)
        size = 3.5;
      } else if (rand < 0.4) {
        type = 'clause';
        color = 'rgba(56, 189, 248, 1)'; // sky-400 (intermediate nodes)
        size = 2;
      }

      nodes.push({
        x, y, z,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        vz: (Math.random() - 0.5) * 0.15,
        type,
        color,
        size
      });
    }
    nodesRef.current = nodes;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    const cx = w / 2;
    const cy = h / 2;
    const fov = 600;

    // Smooth camera rotation to mouse target
    rotYRef.current += (mouseRef.current.targetRotY - rotYRef.current) * 0.05;
    rotXRef.current += (mouseRef.current.targetRotX - rotXRef.current) * 0.05;

    // Constant auto rotation
    rotYRef.current += 0.001;
    rotXRef.current += 0.0005;

    ctx.clearRect(0, 0, w, h);

    const ry = rotYRef.current;
    const rx = rotXRef.current;
    const nodes = nodesRef.current;

    // Outer faint glow of the network
    const glowGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.min(w, h) * 0.5);
    glowGrad.addColorStop(0, "rgba(56, 189, 248, 0.05)");
    glowGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // Update node physical positions
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.z += n.vz;
      // Boundary check (bouncing off the inner sphere)
      const distSq = n.x * n.x + n.y * n.y + n.z * n.z;
      if (distSq > Math.pow(220, 2)) {
        n.vx *= -1;
        n.vy *= -1;
        n.vz *= -1;
      }
    });

    // Compute screen coordinates and sort by Z depth
    const projectedNodes = nodes.map(n => {
      let [px, py, pz] = [n.x, n.y, n.z];
      [px, py, pz] = rotateX(px, py, pz, rx);
      [px, py, pz] = rotateY(px, py, pz, ry);

      const [sx, sy, sz] = project(px, py, pz, cx, cy, fov);
      return { ...n, sx, sy, sz, px, py, pz };
    });

    // Sort far to near
    projectedNodes.sort((a, b) => b.sz - a.sz);

    // Draw lines between close nodes
    ctx.lineWidth = 1;
    const maxDist = 70;

    for (let i = 0; i < projectedNodes.length; i++) {
      const u = projectedNodes[i];
      for (let j = i + 1; j < projectedNodes.length; j++) {
        const v = projectedNodes[j];
        const distSq = (u.px - v.px) ** 2 + (u.py - v.py) ** 2 + (u.pz - v.pz) ** 2;

        if (distSq < maxDist * maxDist) {
          const opacity = (1 - Math.sqrt(distSq) / maxDist) * 0.4;
          const depthAlpha = Math.max(0.01, 1 - (u.sz + 220) / 440);
          const finalOpacity = opacity * depthAlpha;

          if (finalOpacity > 0.02) {
            ctx.beginPath();
            ctx.moveTo(u.sx, u.sy);
            ctx.lineTo(v.sx, v.sy);

            let strokeColor = `rgba(148, 163, 184, ${finalOpacity})`; // Default subtle
            // Make connections from Policies/Clauses brighter
            if (u.type === 'policy' || v.type === 'policy') {
              strokeColor = `rgba(96, 165, 250, ${finalOpacity * 1.8})`;
            } else if (u.type === 'clause' || v.type === 'clause') {
              strokeColor = `rgba(56, 189, 248, ${finalOpacity * 1.2})`;
            }

            ctx.strokeStyle = strokeColor;
            ctx.stroke();
          }
        }
      }
    }

    // Add random data pulses between close nodes
    if (Math.random() < 0.1 && nodes.length > 0) {
      const source = nodes[Math.floor(Math.random() * nodes.length)];
      const targets = nodes.filter(n => {
        const dist = Math.sqrt((source.x - n.x) ** 2 + (source.y - n.y) ** 2 + (source.z - n.z) ** 2);
        return dist > 20 && dist < 90;
      });
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        pulsesRef.current.push({
          source,
          target,
          progress: 0,
          speed: 0.015 + Math.random() * 0.02
        });
      }
    }

    // Update and draw pulses
    for (let i = pulsesRef.current.length - 1; i >= 0; i--) {
      const p = pulsesRef.current[i];
      p.progress += p.speed;
      if (p.progress >= 1) {
        pulsesRef.current.splice(i, 1);
        continue;
      }

      // Interpolate physical 3D pos
      let tx = p.source.x + (p.target.x - p.source.x) * p.progress;
      let ty = p.source.y + (p.target.y - p.source.y) * p.progress;
      let tz = p.source.z + (p.target.z - p.source.z) * p.progress;

      [tx, ty, tz] = rotateX(tx, ty, tz, rx);
      [tx, ty, tz] = rotateY(tx, ty, tz, ry);

      const [sx, sy, sz] = project(tx, ty, tz, cx, cy, fov);
      if (sz > 0) continue; // Behind camera cull

      const depthAlpha = Math.max(0.1, 1 - (sz + 220) / 440);

      ctx.beginPath();
      ctx.arc(sx, sy, 2 * (1 + depthAlpha), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha + 0.2})`;
      ctx.shadowColor = 'rgba(56, 189, 248, 1)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw nodes
    projectedNodes.forEach(n => {
      if (n.sz > 0) return; // Behind camera

      const depthAlpha = Math.max(0.1, 1 - (n.sz + 220) / 440);
      const mappedSize = n.size * (0.5 + depthAlpha * 0.8);

      ctx.beginPath();
      ctx.arc(n.sx, n.sy, mappedSize, 0, Math.PI * 2);

      if (n.type === 'policy') {
        ctx.fillStyle = n.color.replace('1)', `${depthAlpha})`);
        ctx.shadowColor = 'rgba(96, 165, 250, 0.6)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (n.type === 'clause') {
        ctx.fillStyle = n.color.replace('1)', `${depthAlpha})`);
        ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = n.color.replace('1)', `${depthAlpha * 0.7})`);
        ctx.fill();
      }
    });

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Map mouse to rotation targets (drag-free parallax effect)
    mouseRef.current.targetRotY = x * 1.5;
    mouseRef.current.targetRotX = y * 1.5;
  };

  const handlePointerLeave = () => {
    mouseRef.current.targetRotY = 0;
    mouseRef.current.targetRotX = 0;
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-full", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    />
  );
}
