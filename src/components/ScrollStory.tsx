"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart-context";
import { withBasePath } from "@/lib/base-path";

const CHAR_ASPECT = 4668 / 7013; // fyl-guy.png natural width / height
const TORSO_CENTER_FRAC = 0.43; // vertical anchor point (collar~0.28 to belt~0.575) to center during shirt-cycle

// Scroll budget per phase, expressed as a multiple of viewport height.
const VH = {
  panToTorso: 1.0,
  perShirt: 0.45,
  panToFeet: 1.0,
  zoomToGrid: 1.3,
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function ScrollStory() {
  const heroRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const charWrapRef = useRef<HTMLDivElement>(null);
  const shirtSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridOverlayRef = useRef<HTMLDivElement>(null);
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    function layout() {
      const vh = window.innerHeight;
      const panToTorso = VH.panToTorso * vh;
      const cycleShirts = VH.perShirt * vh * PRODUCTS.length;
      const panToFeet = VH.panToFeet * vh;
      const zoomToGrid = VH.zoomToGrid * vh;
      return {
        vh,
        panToTorso,
        cycleShirts,
        panToFeet,
        zoomToGrid,
        total: panToTorso + cycleShirts + panToFeet + zoomToGrid,
      };
    }

    function update() {
      const wrapper = wrapperRef.current;
      const charWrap = charWrapRef.current;
      if (!wrapper || !charWrap) return;

      const L = layout();
      setWrapperHeight(L.total + L.vh);

      const rect = wrapper.getBoundingClientRect();
      const scrolled = clamp(-rect.top, 0, L.total);

      // Character is rendered tall enough to pan across head -> torso -> feet.
      const charH = L.vh * 2.3;
      const charW = charH * CHAR_ASPECT;
      const midY = -(TORSO_CENTER_FRAC * charH - L.vh / 2);
      const maxY = -(charH - L.vh);
      const torsoY = clamp(midY, maxY, 0);

      let translateY = 0;
      let scale = 1;
      let cycleActive = false;
      let cycleProgress = 0;
      let gridProgress = 0;

      if (scrolled <= L.panToTorso) {
        translateY = lerp(0, torsoY, scrolled / L.panToTorso);
      } else if (scrolled <= L.panToTorso + L.cycleShirts) {
        translateY = torsoY;
        cycleActive = true;
        cycleProgress = (scrolled - L.panToTorso) / L.cycleShirts;
      } else if (scrolled <= L.panToTorso + L.cycleShirts + L.panToFeet) {
        const p = (scrolled - L.panToTorso - L.cycleShirts) / L.panToFeet;
        translateY = lerp(torsoY, maxY, p);
      } else {
        translateY = maxY;
        const p =
          (scrolled - L.panToTorso - L.cycleShirts - L.panToFeet) /
          L.zoomToGrid;
        scale = lerp(1, 0.52, p);
        gridProgress = p;
      }

      charWrap.style.width = `${charW}px`;
      charWrap.style.height = `${charH}px`;
      charWrap.style.transform = `translate(-50%, ${translateY}px) scale(${scale})`;

      const raw = clamp(cycleProgress, 0, 1) * PRODUCTS.length;
      const idx = clamp(Math.floor(raw), 0, PRODUCTS.length - 1);
      const frac = raw - idx;

      shirtSlotRefs.current.forEach((el, i) => {
        if (!el) return;
        let opacity = 0;
        if (cycleActive) {
          if (i === idx) opacity = 1 - frac;
          else if (i === idx + 1) opacity = frac;
          else if (i === PRODUCTS.length - 1 && idx === PRODUCTS.length - 1)
            opacity = 1;
        }
        el.style.opacity = String(opacity);
        el.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
      });

      if (gridOverlayRef.current) {
        gridOverlayRef.current.style.opacity = String(gridProgress);
        gridOverlayRef.current.style.transform = `scale(${lerp(0.92, 1, gridProgress)})`;
        gridOverlayRef.current.style.pointerEvents =
          gridProgress > 0.5 ? "auto" : "none";
      }

      if (heroRef.current) {
        const heroFade = 1 - clamp(window.scrollY / L.vh, 0, 1);
        heroRef.current.style.opacity = String(heroFade);
      }
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div
        ref={heroRef}
        className="flex h-screen items-center justify-center px-6"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, no optimization needed */}
        <img
          src={withBasePath("/banner-logo.svg")}
          alt="FYL Custom Clothing"
          className="w-full max-w-3xl"
        />
      </div>

      <div ref={wrapperRef} style={{ height: wrapperHeight }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            ref={charWrapRef}
            className="absolute left-1/2 top-0 will-change-transform"
          >
            <Image
              src={withBasePath("/fyl-guy.png")}
              alt="FYL guy mascot"
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />

            {PRODUCTS.map((product, i) => (
              <div
                key={product.id}
                ref={(el) => {
                  shirtSlotRefs.current[i] = el;
                }}
                className="absolute flex flex-col items-center gap-2"
                style={{
                  top: "27%",
                  left: "28%",
                  width: "44%",
                  opacity: 0,
                }}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-xl">
                  <Image
                    src={withBasePath(product.image)}
                    alt={product.name}
                    fill
                    sizes="30vw"
                    className="object-contain"
                  />
                </div>
                <button
                  onClick={() => addItem(product.id)}
                  className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white"
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>

          <div
            ref={gridOverlayRef}
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--fyl-bg-mauve)]/70 opacity-0"
          >
            <div className="grid w-full max-w-5xl grid-cols-4 gap-4 px-8">
              {PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
