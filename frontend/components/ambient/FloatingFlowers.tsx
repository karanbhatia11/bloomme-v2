"use client";

import { useEffect, useState } from "react";

interface FloatingFlower {
  id: number;
  type: "rose-petal" | "cherry-blossom" | "marigold" | "lotus";
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  drift: number;
  rotate: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const TYPES = ["rose-petal", "cherry-blossom", "marigold", "lotus"] as const;

function generateFlowers(): FloatingFlower[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    type: TYPES[i % TYPES.length],
    left: 2 + (i / 16) * 96 + (seededRandom(i * 7.3) * 6 - 3),
    delay: seededRandom(i * 13.1) * 25,
    duration: 16 + seededRandom(i * 5.7) * 10, // 16–26s
    size: 24 + seededRandom(i * 3.9) * 28,
    opacity: 0.18 + seededRandom(i * 9.1) * 0.14, // subtle — behind text feel
    drift: seededRandom(i * 11.3) * 60 - 30,
    rotate: seededRandom(i * 17.2) * 360,
  }));
}

// Nav height: py-2 + logo h-16 ≈ 80px mobile, h-24 ≈ 112px desktop → use 88px
// Footer: py-12 + content ≈ 260px
const HEADER_HEIGHT = 88;
const FOOTER_HEIGHT = 260;

export function FloatingFlowers() {
  const [flowers, setFlowers] = useState<FloatingFlower[]>([]);

  useEffect(() => {
    setFlowers(generateFlowers());
  }, []);

  if (flowers.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes petalFall {
          0%   { transform: translateY(-60px) translateX(0) rotate(0deg); opacity: 0; }
          6%   { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px + 20px)) translateX(var(--drift)) rotate(var(--rotate)); opacity: 0; }
        }
      `}</style>

      {/* Container clipped exactly between header bottom and footer top */}
      <div
        style={{
          position: "fixed",
          top: HEADER_HEIGHT,
          left: 0,
          right: 0,
          bottom: FOOTER_HEIGHT,
          zIndex: 1,
          pointerEvents: "none",
          overflow: "hidden",
          mixBlendMode: "multiply", // blends with page — text always reads on top
        }}
        aria-hidden="true"
      >
        {flowers.map((flower) => (
          <div
            key={flower.id}
            style={{
              position: "absolute",
              top: 0,
              left: `${flower.left}%`,
              width: flower.size,
              height: flower.size,
              opacity: 0,
              ["--drift" as string]: `${flower.drift}px`,
              ["--rotate" as string]: `${flower.rotate}deg`,
              animation: `petalFall ${flower.duration}s ease-in ${flower.delay}s infinite`,
            }}
          >
            <FlowerSVG type={flower.type} />
          </div>
        ))}
      </div>
    </>
  );
}

function FlowerSVG({ type }: { type: FloatingFlower["type"] }) {
  switch (type) {
    case "rose-petal":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
          <ellipse cx="32" cy="38" rx="14" ry="20" fill="#E8728A" opacity="0.9" />
          <ellipse cx="32" cy="30" rx="10" ry="14" fill="#F2A0B0" opacity="0.8" />
          <ellipse cx="32" cy="24" rx="6" ry="9" fill="#FFD0DC" opacity="0.7" />
          <path d="M32 16 Q33 32 32 50" stroke="#C85070" strokeWidth="0.7" opacity="0.3" />
        </svg>
      );
    case "cherry-blossom":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
          <ellipse cx="32" cy="16" rx="7" ry="11" fill="#FFB7C5" opacity="0.95" transform="rotate(0,32,32)" />
          <ellipse cx="32" cy="16" rx="7" ry="11" fill="#FFC8D2" opacity="0.9" transform="rotate(72,32,32)" />
          <ellipse cx="32" cy="16" rx="7" ry="11" fill="#FFB7C5" opacity="0.95" transform="rotate(144,32,32)" />
          <ellipse cx="32" cy="16" rx="7" ry="11" fill="#FFC8D2" opacity="0.9" transform="rotate(216,32,32)" />
          <ellipse cx="32" cy="16" rx="7" ry="11" fill="#FFB7C5" opacity="0.95" transform="rotate(288,32,32)" />
          <circle cx="32" cy="32" r="5" fill="#FFF0F4" opacity="1" />
          <circle cx="32" cy="32" r="2.5" fill="#E8829A" opacity="0.9" />
        </svg>
      );
    case "marigold":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
          <ellipse cx="32" cy="13" rx="5" ry="10" fill="#F4C84E" opacity="0.95" transform="rotate(0,32,32)" />
          <ellipse cx="32" cy="13" rx="5" ry="10" fill="#E8A020" opacity="0.9" transform="rotate(45,32,32)" />
          <ellipse cx="32" cy="13" rx="5" ry="10" fill="#F4C84E" opacity="0.95" transform="rotate(90,32,32)" />
          <ellipse cx="32" cy="13" rx="5" ry="10" fill="#E8A020" opacity="0.9" transform="rotate(135,32,32)" />
          <ellipse cx="32" cy="13" rx="5" ry="10" fill="#F4C84E" opacity="0.95" transform="rotate(180,32,32)" />
          <ellipse cx="32" cy="13" rx="5" ry="10" fill="#E8A020" opacity="0.9" transform="rotate(225,32,32)" />
          <ellipse cx="32" cy="13" rx="5" ry="10" fill="#F4C84E" opacity="0.95" transform="rotate(270,32,32)" />
          <ellipse cx="32" cy="13" rx="5" ry="10" fill="#E8A020" opacity="0.9" transform="rotate(315,32,32)" />
          <circle cx="32" cy="32" r="8" fill="#C4880A" opacity="0.95" />
          <circle cx="32" cy="32" r="4" fill="#F4E080" opacity="0.9" />
        </svg>
      );
    case "lotus":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
          <ellipse cx="32" cy="17" rx="6" ry="15" fill="#C9A0DC" opacity="0.9" transform="rotate(-25,32,32)" />
          <ellipse cx="32" cy="17" rx="6" ry="15" fill="#B882CC" opacity="0.85" transform="rotate(0,32,32)" />
          <ellipse cx="32" cy="17" rx="6" ry="15" fill="#C9A0DC" opacity="0.9" transform="rotate(25,32,32)" />
          <ellipse cx="32" cy="21" rx="5" ry="11" fill="#DFC0EE" opacity="0.85" transform="rotate(-12,32,32)" />
          <ellipse cx="32" cy="21" rx="5" ry="11" fill="#DFC0EE" opacity="0.85" transform="rotate(12,32,32)" />
          <circle cx="32" cy="32" r="5" fill="#F0E0FF" opacity="0.95" />
          <circle cx="32" cy="32" r="2.5" fill="#9B60C0" opacity="0.8" />
        </svg>
      );
  }
}
