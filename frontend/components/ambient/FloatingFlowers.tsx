"use client";

import React, { useState, useEffect } from "react";
import "./floating-flowers.css";

type FlowerType = "marigold" | "lotus-leaf" | "minimal-petal";

interface FloatingFlower {
  id: number;
  type: FlowerType;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

// Seeded random number generator for deterministic randomness
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function FloatingFlowers() {
  const [flowers, setFlowers] = useState<FloatingFlower[]>([]);

  useEffect(() => {
    // Generate flowers deterministically using seeded random
    const generated: FloatingFlower[] = [];
    const flowerTypes: FlowerType[] = ["marigold", "lotus-leaf", "minimal-petal"];
    const flowerCount = 14;

    for (let i = 0; i < flowerCount; i++) {
      // Use seeded random based on flower index for deterministic values
      const seed1 = i * 73.156;
      const seed2 = i * 42.823;
      const seed3 = i * 91.447;
      const seed4 = i * 37.281;

      generated.push({
        id: i,
        type: flowerTypes[i % flowerTypes.length],
        left: (i / flowerCount) * 100 + (seededRandom(seed1) * 15 - 7.5),
        delay: i * 3.5 + seededRandom(seed2) * 2,
        duration: 45 + seededRandom(seed3) * 25, // 45-70 seconds
        size: 20 + seededRandom(seed4) * 30, // 20-50px
        opacity: 0.35 + seededRandom(seed1 + 1000) * 0.15, // 0.35-0.50 (MAX testing - reduce to 0.04-0.08 for premium subtle effect)
      });
    }

    setFlowers(generated);
    console.log("🌸 FloatingFlowers mounted with", generated.length, "flowers");
  }, []);

  return (
    <div className="floating-flowers-container" aria-hidden="true">
      {flowers.map((flower) => (
        <div
          key={flower.id}
          className={`floating-flower flower-${flower.type}`}
          style={{
            left: `${flower.left}%`,
            "--delay": `${flower.delay}s`,
            "--duration": `${flower.duration}s`,
            "--size": `${flower.size}px`,
            "--opacity": flower.opacity,
          } as React.CSSProperties}
        >
          {flower.type === "marigold" && <MarigoldSVG />}
          {flower.type === "lotus-leaf" && <LotusLeafSVG />}
          {flower.type === "minimal-petal" && <MinimalPetalSVG />}
        </div>
      ))}
    </div>
  );
}

// SVG Components - Ultra-lightweight
function MarigoldSVG() {
  return (
    <svg
      viewBox="0 0 64 64"
      width="100%"
      height="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Marigold petals - warm golden tones */}
      <circle cx="32" cy="20" r="6" fill="#D4A574" opacity="0.8" />
      <circle cx="42" cy="26" r="6" fill="#DEB887" opacity="0.7" />
      <circle cx="44" cy="36" r="6" fill="#D4A574" opacity="0.75" />
      <circle cx="32" cy="44" r="6" fill="#DEB887" opacity="0.7" />
      <circle cx="20" cy="36" r="6" fill="#D4A574" opacity="0.75" />
      <circle cx="22" cy="26" r="6" fill="#DEB887" opacity="0.7" />
      {/* Center */}
      <circle cx="32" cy="32" r="5" fill="#C4A052" opacity="0.9" />
    </svg>
  );
}

function LotusLeafSVG() {
  return (
    <svg
      viewBox="0 0 64 64"
      width="100%"
      height="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Lotus leaf outline - minimal sacred geometry */}
      <path
        d="M 32 8 Q 48 20 48 32 Q 48 48 32 56 Q 16 48 16 32 Q 16 20 32 8"
        stroke="#A8956B"
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Inner vein detail */}
      <path
        d="M 32 16 Q 40 24 40 32 Q 40 44 32 50 Q 24 44 24 32 Q 24 24 32 16"
        stroke="#A8956B"
        strokeWidth="0.8"
        opacity="0.4"
      />
      {/* Dew drop accent */}
      <circle cx="32" cy="28" r="2" fill="#C4A052" opacity="0.5" />
    </svg>
  );
}

function MinimalPetalSVG() {
  return (
    <svg
      viewBox="0 0 64 64"
      width="100%"
      height="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Minimal organic petal shape */}
      <ellipse cx="32" cy="32" rx="14" ry="22" fill="#D4A574" opacity="0.7" />
      {/* Subtle vein */}
      <path
        d="M 32 12 Q 32 32 32 54"
        stroke="#A8956B"
        strokeWidth="0.5"
        opacity="0.3"
      />
    </svg>
  );
}
