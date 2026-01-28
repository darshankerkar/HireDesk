import React, { useEffect } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

// 1. Noise Filter (The film grain look)
const NoiseOverlay = () => (
  <div 
    className="absolute inset-0 pointer-events-none opacity-[0.03] z-[10] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
    }}
  />
);

// 2. Mouse Glow (Radially tracks cursor)
const MouseSpotlight = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    // Track mouse relative to the container if possible, or global if easier. 
    // Since this is "absolute" in the hero, we might want it to track global mouse but be clipped by the container.
    // Tracking global mouse is fine, but we need to ensure the gradient is relative to the *viewport* if using fixed, 
    // BUT we want it absolute. 
    // If it's absolute, `mouseX` / `mouseY` should be relative to the element or we just accept it's "screen" coordinates 
    // mapped to the element. 
    // Let's stick to the user's code but use absolute. 
    // However, if we use `clientX/Y`, they are viewport coordinates. 
    // If the div is absolute and top-0 left-0 of the page, viewport coords match local coords (mostly, until scroll).
    // Actually, "inset-0" of the Hero section means it moves with scroll.
    // If we want the spotlight to follow the mouse *over the content*, and content scrolls, 
    // then `clientX` (fixed) + scrollY = absolute position.
    // 
    // The user's code used `fixed` and `clientX`. 
    // If I change to `absolute`, I should probably adjust the coordinates to account for scroll 
    // OR just use `clientX` and rely on `background-attachment: fixed` logic? 
    // No, `radial-gradient` moves with the element.
    // Let's use `pageX` and `pageY` which includes scroll, so it maps correctly to absolute positioning.
    
    const handleMouseMove = (e) => {
        // e.pageX and e.pageY include scroll
        mouseX.set(e.pageX);
        mouseY.set(e.pageY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
      style={{
        background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(132, 204, 22, 0.03), transparent 80%)`,
      }}
    />
  );
};

// 3. The Main Background Container
export const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
       {/* Global Effects specific to this section */}
       <NoiseOverlay />
       <MouseSpotlight />

       {/* Dark Radial Gradient Base - adjusted opacity to blend */}
       <div className="absolute inset-0 bg-gradient-radial from-neutral-800/20 via-transparent to-transparent opacity-40" />
       
       {/* The Lime Glow Blob */}
       <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#84cc16]/10 rounded-full blur-[120px]" />
       
       {/* Floating Particles Animation */}
       <div className="absolute inset-0 z-0">
          {[...Array(20)].map((_, i) => (
              <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-[#84cc16] rounded-full opacity-20"
                  initial={{ 
                      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000) 
                  }}
                  animate={{ 
                      y: [null, Math.random() * -100],
                      opacity: [0.1, 0.5, 0]
                  }}
                  transition={{ 
                      duration: Math.random() * 10 + 10, 
                      repeat: Infinity,
                      ease: "linear" 
                  }}
              />
          ))}
       </div>
    </div>
  );
};
