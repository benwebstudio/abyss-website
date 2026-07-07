
import React from 'react';
import { motion, useTransform, useSpring } from 'framer-motion';

function CharacterAnimation({ char, index, scrollProgress }) {
  // Reveal later, then keep the compact fall: the final letter exits at 98%.
  const stagger = 0.04;
  const fallStart = 0.44 + index * stagger;
  
  const fallEnd = fallStart + 0.22;

  // Stop compositing a blur layer once the reveal is complete. Keeping
  // `blur(0)` on transformed glyphs can create faint one-pixel edge lines.
  const filter = useTransform(scrollProgress, value => {
    if (value >= 0.34) return 'none';
    const reveal = Math.min(1, Math.max(0, (value - 0.22) / 0.12));
    return `blur(${6 * (1 - reveal)}px)`;
  });

  const scale = useTransform(scrollProgress, [0.22, 0.34], [0.97, 1]);

  // Phase 4: Gravity fall. Displacement up to 1200px ensures it drops entirely off the viewport.
  const rawY = useTransform(
    scrollProgress,
    [fallStart, fallEnd],
    [0, 1200]
  );
  
  // Apply spring physics for organic, gravity-like acceleration
  const y = useSpring(rawY, { 
    stiffness: 45, 
    damping: 14, 
    mass: 1 
  });

  const opacity = useTransform(
    scrollProgress,
    [0, 0.21, 0.22, 0.34],
    [0, 0, 0, 1]
  );

  return (
    <motion.span
      style={{
        opacity,
        scale,
        filter,
        y,
        display: 'inline-block',
        whiteSpace: char === ' ' ? 'pre' : 'normal',
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {char}
    </motion.span>
  );
}

export default CharacterAnimation;
