
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import RevealLayer from './RevealLayer.jsx';
import darkOceanImage from '../assets/reef-dark.png';
import revealOceanImage from '../assets/reef-reveal.png';

// Updated to receive compressed uiOpacity and overlayOpacity from the transition coordinator
function HeroSection({ uiOpacity = 1, overlayOpacity = 0.1 }) {
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const mouseRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);

  useEffect(() => {
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const hoverPointer = window.matchMedia('(hover: hover)');
    const prefersTouchExperience = coarsePointer.matches || !hoverPointer.matches;

    const handlePointerMove = (e) => {
      if (prefersTouchExperience) return;
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    if (prefersTouchExperience) {
      setCursorPos({
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.49,
      });
      return undefined;
    }

    const animate = () => {
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.1;
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.1;

      setCursorPos({
        x: smoothRef.current.x,
        y: smoothRef.current.y,
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black" style={{ letterSpacing: '-0.02em' }}>
      <section
        className="relative w-full overflow-hidden h-screen bg-black"
        style={{ height: '100dvh' }}
      >
        {/* Persistent background ocean imagery */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
          style={{
            backgroundImage: `url(${darkOceanImage})`,
          }}
        />

        {/* Persistent cursor reveal effect */}
        <RevealLayer
          image={revealOceanImage}
          cursorX={cursorPos.x}
          cursorY={cursorPos.y}
          className="hero-pointer-reveal"
        />

        <RevealLayer
          image={revealOceanImage}
          cursorX={0}
          cursorY={0}
          animatedTouch
        />

        {/* Dynamic Dark Ocean Overlay appearing faster based on scroll */}
        <motion.div 
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-black pointer-events-none z-40" 
        />

        {/* UI Container - Fades out seamlessly during Phase 1 (0-12%) */}
        <motion.div 
          style={{ opacity: uiOpacity }}
          className="absolute inset-0 pointer-events-none z-50"
        >
          <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none">
            <h1 className="text-white leading-[0.95]">
              <span
                className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
                style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
              >
                Beneath
              </span>
              <span
                className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
                style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
              >
                the surface
              </span>
            </h1>
          </div>

          <p
            className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[280px] text-sm text-white/80 leading-relaxed hero-anim hero-fade"
            style={{ animationDelay: '0.7s' }}
          >
            Over 95% of our ocean remains unexplored. Beneath the waves exists a
            hidden world waiting to be discovered.
          </p>

          <div
            className="absolute bottom-10 left-5 right-5 max-w-full hero-anim hero-fade sm:bottom-14 sm:left-auto sm:right-10 sm:max-w-[280px] md:right-14"
            style={{ animationDelay: '0.85s' }}
          >
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              We explore and protect the ecosystems that keep our blue planet
              alive.
            </p>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

export default HeroSection;
