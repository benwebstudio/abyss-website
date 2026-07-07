
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroSection from './HeroSection.jsx';
import Navigation from './Navigation.jsx';
import AtmosphereLayer from './AtmosphereLayer.jsx';
import GoDeeper from './GoDeeper.jsx';

function TransitionSection() {
  const containerRef = useRef(null);
  
  // A compact transition keeps the cinematic pacing without excessive scrolling.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Phase 1 (0-12%): Fade out the hero UI and navigation.
  const uiOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const overlayOpacity = useTransform(scrollYProgress, [0, 0.12], [0.1, 0.65]);
  
  // Disable interaction on navigation once it starts fading significantly
  const pointerEvents = useTransform(scrollYProgress, v => v > 0.05 ? "none" : "auto");

  // The original background stays still and disappears before its sticky
  // container releases. The fixed video layer covers it during this fade.
  const backgroundOpacity = useTransform(
    scrollYProgress,
    [0, 0.88, 0.98],
    [1, 1, 0]
  );

  return (
    <div ref={containerRef} className="relative w-full h-[325vh] bg-black">
      {/* Sticky viewport wrapper */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        
        {/* Layer 1: Existing ocean background and atmosphere */}
        <motion.div className="absolute inset-0 z-0" style={{ opacity: backgroundOpacity }}>
          <HeroSection uiOpacity={uiOpacity} overlayOpacity={overlayOpacity} />
          <AtmosphereLayer scrollProgress={scrollYProgress} />
        </motion.div>
        
        {/* Layer 3: Cinematic Typography Reveal & Gravity Fall */}
        <GoDeeper scrollProgress={scrollYProgress} />

        {/* Layer 4: Navigation (Fades out completely in Phase 1) */}
        <motion.div 
          className="absolute inset-0 pointer-events-none z-[100]"
          style={{ opacity: uiOpacity }}
        >
          <motion.div style={{ pointerEvents }} className="w-full h-full">
            <Navigation />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default TransitionSection;
