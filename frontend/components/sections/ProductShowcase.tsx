"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS } from "@/constants";
import { useCart } from "@/context/CartContext";

const RADIUS = 272;
const ORBIT_PERIOD_MS = 42000;
const CARD_W = 200;
const CARD_GAP = 12;
const SET_W = PRODUCTS.length * (CARD_W + CARD_GAP);
const TRIPLED = [...PRODUCTS, ...PRODUCTS, ...PRODUCTS];

export const ProductShowcase: React.FC = () => {
  const { addAddon, decrementAddon, cart } = useCart();
  const [selected, setSelected] = useState<number | null>(null);

  const selectedProduct = selected !== null ? PRODUCTS[selected] : null;
  const inCart = selectedProduct ? cart.addons.find((a) => a.id === selectedProduct.id) : null;

  const itemRefs = useRef<(HTMLDivElement | null)[]>(new Array(PRODUCTS.length).fill(null));
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = carouselRef.current;
    if (el) el.scrollLeft = SET_W;
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollLeft < CARD_W * 2) el.scrollLeft += SET_W;
      else if (el.scrollLeft > SET_W * 2 - CARD_W) el.scrollLeft -= SET_W;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const animState = useRef({
    orbitAngle: 0,
    baseAngles: PRODUCTS.map((_, i) => (i / PRODUCTS.length) * 360 - 90),
    targetBaseAngles: PRODUCTS.map((_, i) => (i / PRODUCTS.length) * 360 - 90),
    lastTime: null as number | null,
  });

  // Recompute target base angles whenever selection changes
  useEffect(() => {
    const visible = PRODUCTS.map((_, i) => i).filter((i) => i !== selected);
    const targets = [...animState.current.targetBaseAngles];
    visible.forEach((productIndex, visibleIndex) => {
      targets[productIndex] = (visibleIndex / visible.length) * 360 - 90;
    });
    if (selected === null) {
      PRODUCTS.forEach((_, i) => {
        targets[i] = (i / PRODUCTS.length) * 360 - 90;
      });
    }
    animState.current.targetBaseAngles = targets;
  }, [selected]);

  // Single RAF loop: orbit + spread
  useEffect(() => {
    let raf: number;

    const tick = (timestamp: number) => {
      const s = animState.current;
      if (s.lastTime === null) s.lastTime = timestamp;
      const dt = Math.min(timestamp - s.lastTime, 50);
      s.lastTime = timestamp;

      s.orbitAngle = (s.orbitAngle + (dt / ORBIT_PERIOD_MS) * 360) % 360;

      // Frame-rate-independent exponential lerp toward target base angles
      const lerpFactor = 1 - Math.exp(-(dt / 120));
      s.baseAngles = s.baseAngles.map((angle, i) => {
        let diff = s.targetBaseAngles[i] - angle;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return angle + diff * lerpFactor;
      });

      // Push positions straight to DOM — no React re-render
      PRODUCTS.forEach((_, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        const rad = ((s.baseAngles[i] + s.orbitAngle) * Math.PI) / 180;
        el.style.left = `calc(50% + ${Math.cos(rad) * RADIUS}px)`;
        el.style.top = `calc(50% + ${Math.sin(rad) * RADIUS}px)`;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      id="add-ons"
      className="py-24 relative overflow-hidden"
      className="bg-surface-container-low"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">

        {/* Mobile header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-center lg:hidden"
        >
          <span className="editorial-accent text-lg text-primary block mb-1">Sacred Offerings</span>
          <h2 className="text-2xl font-black tracking-tight text-on-surface">Add Ons</h2>
          <p className="text-sm text-on-surface-variant/60 mt-2 italic">Tap an offering to place it on the thali</p>
        </motion.div>

        {/* ── Desktop: Ring + Card ── */}
        <div className="hidden lg:flex w-full items-center justify-center gap-10">

          {/* Ring */}
          <div className="relative flex-shrink-0" style={{ width: 720, height: 720 }}>

            {/* Centre text */}
            <div
              className="absolute text-center pointer-events-none z-10"
              style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
            >
              <span className="editorial-accent text-base text-primary block mb-1">Sacred Offerings</span>
              <h2 className="text-2xl font-black tracking-tight text-on-surface leading-tight">Add Ons</h2>
              <p className="text-xs text-on-surface-variant/60 mt-2 italic">Tap an offering to place it on the thali</p>
            </div>

            {/* Orbiting items — kept in DOM; hidden when selected */}
            {PRODUCTS.map((product, index) => {
              const isSelected = index === selected;
              const inCartItem = cart.addons.find((a) => a.id === product.id);

              return (
                <div
                  key={product.id}
                  ref={(el) => { itemRefs.current[index] = el; }}
                  className="absolute"
                  style={{
                    transform: "translate(-50%, -50%)",
                    opacity: isSelected ? 0 : 1,
                    pointerEvents: isSelected ? "none" : "auto",
                    transition: "opacity 0.25s ease",
                    willChange: "left, top",
                  }}
                >
                  <motion.button
                    onClick={() => setSelected(index)}
                    whileHover={{ scale: 1.18 }}
                    whileTap={{ scale: 0.88 }}
                    className="flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center gap-1.5 relative">
                      <div
                        className="w-[80px] h-[80px] rounded-full overflow-hidden"
                        style={{
                          border: `2px solid ${inCartItem ? "#775a11" : "rgba(119,90,17,0.25)"}`,
                          background: "#ffeadd",
                          boxShadow: inCartItem
                            ? "0 0 14px rgba(119,90,17,0.35)"
                            : "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={80}
                          height={80}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <p className="text-[9px] text-on-surface-variant font-medium text-center leading-tight max-w-[70px]">
                        {product.title.length > 20 ? product.title.slice(0, 20) + "…" : product.title}
                      </p>
                      {inCartItem && (
                        <span
                          className="absolute -top-1 -right-0.5 w-4 h-4 rounded-full text-[#0d0600] text-[9px] font-black flex items-center justify-center"
                          style={{ background: "#c9a227" }}
                        >
                          {inCartItem.quantity}
                        </span>
                      )}
                    </div>
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* Product card — slides in from right */}
          <AnimatePresence mode="wait">
            {selectedProduct && (
              <motion.div
                key={selectedProduct.id}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 80 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="flex-shrink-0 relative rounded-3xl overflow-hidden flex flex-col"
                style={{
                  width: 340,
                  background: "#ffeadd",
                  border: "1px solid rgba(119,90,17,0.25)",
                  boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(119,90,17,0.08)",
                }}
              >
                {/* Nav buttons */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5">
                  <button
                    onClick={() => setSelected((selected! - 1 + PRODUCTS.length) % PRODUCTS.length)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                    style={{ background: "rgba(119,90,17,0.1)", color: "#775a11" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_left</span>
                  </button>
                  <button
                    onClick={() => setSelected((selected! + 1) % PRODUCTS.length)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
                    style={{ background: "rgba(119,90,17,0.1)", color: "#775a11" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_right</span>
                  </button>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ background: "rgba(119,90,17,0.1)", color: "#775a11" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
                </button>

                {/* Image */}
                <div
                  className="w-full flex items-center justify-center"
                  style={{ background: "#ffe3d0", height: 280, padding: "24px" }}
                >
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    width={280}
                    height={232}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">
                      {selectedProduct.category}
                    </span>
                    <h3 className="text-lg font-black text-on-surface mt-1 leading-snug">
                      {selectedProduct.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2 border-t" style={{ borderColor: "rgba(119,90,17,0.15)" }}>
                    <span className="text-2xl font-black text-primary">₹{selectedProduct.price}</span>
                    {inCart ? (
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => decrementAddon(selectedProduct.id)}
                          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-lg"
                          style={{ background: "rgba(119,90,17,0.1)", color: "#775a11", border: "1px solid rgba(119,90,17,0.25)" }}
                        >
                          −
                        </motion.button>
                        <span className="text-lg font-black text-on-surface min-w-[20px] text-center">{inCart.quantity}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => addAddon({ id: selectedProduct.id, title: selectedProduct.title, price: selectedProduct.price, image: selectedProduct.image })}
                          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-lg"
                          style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0d0600" }}
                        >
                          +
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addAddon({ id: selectedProduct.id, title: selectedProduct.title, price: selectedProduct.price, image: selectedProduct.image })}
                        className="px-6 py-2.5 rounded-full text-sm font-black tracking-wide"
                        style={{
                          background: "linear-gradient(135deg, #c9a227, #e8c547, #c9a227)",
                          color: "#0d0600",
                          boxShadow: "0 4px 16px rgba(201,162,39,0.3)",
                        }}
                      >
                        Add to Order
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ── Mobile carousel ── */}
        <style>{`
          .addon-carousel::-webkit-scrollbar { display: none; }
          .addon-carousel { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <div
          ref={carouselRef}
          className="addon-carousel lg:hidden flex gap-3 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {TRIPLED.map((product, globalIndex) => {
            const inCartItem = cart.addons.find((a) => a.id === product.id);
            return (
              <div
                key={globalIndex}
                className="flex-shrink-0 rounded-2xl overflow-hidden flex flex-col"
                style={{
                  width: CARD_W,
                  scrollSnapAlign: "center",
                  background: "linear-gradient(160deg, #ffffff 0%, #fff8f0 100%)",
                  border: "1px solid rgba(201,162,39,0.35)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                }}
              >
                <div className="flex items-center justify-center" style={{ background: "#fff5e8", height: 140, padding: "12px" }}>
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={120}
                    height={116}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div>
                    <p className="text-xs font-bold text-[#3a1a00] leading-tight line-clamp-2">{product.title}</p>
                    <p className="text-[#b8860b] font-black text-sm mt-1">₹{product.price}</p>
                  </div>
                  {inCartItem ? (
                    <div className="flex items-center justify-between mt-auto">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => decrementAddon(product.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm"
                        style={{ background: "rgba(201,162,39,0.2)", color: "#7c4a00", border: "1px solid rgba(201,162,39,0.4)" }}>−</motion.button>
                      <span className="text-sm font-black text-[#3a1a00]">{inCartItem.quantity}</span>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => addAddon({ id: product.id, title: product.title, price: product.price, image: product.image })}
                        className="w-7 h-7 rounded-full flex items-center justify-center font-black text-[#0d0600] text-sm"
                        style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)" }}>+</motion.button>
                    </div>
                  ) : (
                    <motion.button whileTap={{ scale: 0.94 }}
                      onClick={() => addAddon({ id: product.id, title: product.title, price: product.price, image: product.image })}
                      className="mt-auto w-full py-1.5 rounded-full text-xs font-black text-[#0d0600] flex items-center justify-center gap-1"
                      style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>add</span>
                      Add
                    </motion.button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
