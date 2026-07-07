
import React from 'react';
import { motion, useTransform } from 'framer-motion';
import CharacterAnimation from './CharacterAnimation.jsx';

function GoDeeper({ scrollProgress }) {
  const text = 'GO DEEPER';
  const characters = text.split('');

  const subScale = useTransform(scrollProgress, [0.22, 0.34], [0.97, 1]);
  
  const subOpacity = useTransform(
    scrollProgress, 
    [0, 0.21, 0.22, 0.34, 0.44, 0.54],
    [0, 0, 0, 1, 1, 0]
  );

  const hintOpacity = useTransform(
    scrollProgress,
    [0, 0.26, 0.34, 0.46, 0.56],
    [0, 0, 1, 1, 0]
  );

  return (
    <div
      data-go-deeper-layer
      className="absolute inset-0 z-[70] flex flex-col items-center justify-center pointer-events-none px-4"
    >
      {/* Main Title */}
      <h2 
        className="flex text-[16vw] font-semibold leading-none text-white sm:text-[12vw] md:text-[8vw]"
        style={{ letterSpacing: '-0.08em' }}
      >
        {characters.map((char, index) => (
          <CharacterAnimation 
            key={index} 
            char={char} 
            index={index} 
            scrollProgress={scrollProgress} 
          />
        ))}
      </h2>
      
      {/* Subtitle */}
      <motion.p
        className="mt-6 md:mt-8 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-white/60"
        style={{
          opacity: subOpacity,
          scale: subScale
        }}
      >
        Into the Unknown
      </motion.p>

      <motion.div
        className="abyss-scroll-hint absolute bottom-8 left-1/2 sm:bottom-10"
        style={{ opacity: hintOpacity }}
        aria-hidden="true"
      >
        <span className="abyss-scroll-hint__text">
          Scroll to go deeper
        </span>
        <span className="abyss-scroll-hint__mouse">
          <span className="abyss-scroll-hint__dot" />
        </span>
      </motion.div>
    </div>
  );
}

export default GoDeeper;
