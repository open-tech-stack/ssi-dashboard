// components/ui/AnimatedBackground.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';

interface AnimatedBackgroundProps {
  intensity?: number;
  particleCount?: number;
  showGrid?: boolean;
  className?: string;
}

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  drift: number;
}

export default function AnimatedBackground({
  intensity = 1,
  particleCount = 28,
  showGrid = true,
  className = '',
}: AnimatedBackgroundProps) {
  const { colors } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ⚠️ État initial vide : identique côté serveur et côté client (hydration OK)
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  // Génération des particules uniquement côté client, après le mount
  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 8,
        duration: 10 + Math.random() * 12,
        opacity: 0.15 + Math.random() * 0.5,
        drift: Math.random() > 0.5 ? 1 : -1,
      })),
    );
  }, [particleCount]);

  // Canvas étoiles — déjà dans useEffect donc safe
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const stars = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.02,
    }));

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.a += s.da;
        if (s.a <= 0 || s.a >= 1) s.da *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, s.a * 0.6 * intensity)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [intensity]);

  const primary = colors.primary;
  const primarySoft = colors.primarySoft;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`}
      style={{ backgroundColor: colors.background }}
    >
      {/* Halos radiaux pulsants */}
      <div
        className="absolute rounded-full blur-3xl animate-halo-pulse"
        style={{
          top: '-15%',
          left: '-10%',
          width: '55vw',
          height: '55vw',
          background: `radial-gradient(circle, ${primary}55 0%, transparent 65%)`,
          opacity: 0.7 * intensity,
        }}
      />
      <div
        className="absolute rounded-full blur-3xl animate-halo-pulse"
        style={{
          bottom: '-20%',
          right: '-15%',
          width: '60vw',
          height: '60vw',
          background: `radial-gradient(circle, ${primarySoft}44 0%, transparent 65%)`,
          opacity: 0.7 * intensity,
          animationDelay: '2s',
        }}
      />
      <div
        className="absolute rounded-full blur-3xl animate-halo-pulse"
        style={{
          top: '35%',
          right: '25%',
          width: '30vw',
          height: '30vw',
          background: `radial-gradient(circle, ${primary}33 0%, transparent 70%)`,
          opacity: 0.6 * intensity,
          animationDelay: '4s',
        }}
      />

      {/* Blobs SVG morphing */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="blobGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={primary} stopOpacity="0.55" />
            <stop offset="100%" stopColor={primarySoft} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="blobGrad2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primarySoft} stopOpacity="0.4" />
            <stop offset="100%" stopColor={primary} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <path fill="url(#blobGrad1)">
          <animate
            attributeName="d"
            dur="18s"
            repeatCount="indefinite"
            values="
              M420,180 C560,120 760,180 820,340 C880,500 760,660 600,700 C440,740 280,660 240,500 C200,340 300,240 420,180 Z;
              M440,200 C600,140 800,220 840,380 C880,540 720,700 560,720 C400,740 260,640 220,480 C180,320 300,260 440,200 Z;
              M420,180 C560,120 760,180 820,340 C880,500 760,660 600,700 C440,740 280,660 240,500 C200,340 300,240 420,180 Z
            "
          />
        </path>

        <path fill="url(#blobGrad2)">
          <animate
            attributeName="d"
            dur="22s"
            repeatCount="indefinite"
            values="
              M800,520 C900,460 1040,500 1080,620 C1120,740 1020,820 900,800 C780,780 700,700 700,600 C700,500 720,560 800,520 Z;
              M820,540 C920,480 1060,520 1100,640 C1140,760 1040,840 920,820 C800,800 720,720 720,620 C720,520 740,580 820,540 Z;
              M800,520 C900,460 1040,500 1080,620 C1120,740 1020,820 900,800 C780,780 700,700 700,600 C700,500 720,560 800,520 Z
            "
          />
        </path>
      </svg>

      {/* Grille lumineuse */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(${primary} 1px, transparent 1px),
              linear-gradient(90deg, ${primary} 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage:
              'radial-gradient(ellipse at center, black 20%, transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 20%, transparent 75%)',
          }}
        />
      )}

      {/* Canvas étoiles */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Particules flottantes — rendues uniquement après le mount */}
      {mounted &&
        particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full animate-float-up"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              backgroundColor: primarySoft,
              opacity: p.opacity * intensity,
              boxShadow: `0 0 ${p.size * 4}px ${primarySoft}`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              // @ts-expect-error CSS var custom
              '--drift': `${p.drift * 30}px`,
            }}
          />
        ))}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}