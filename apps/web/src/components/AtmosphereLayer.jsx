
import React, { useMemo } from 'react';
import { motion, useTransform } from 'framer-motion';

function AtmosphereLayer({ scrollProgress }) {
  // Gradually increase opacity of the entire atmosphere from 0% to 25% of scroll
  const layerOpacity = useTransform(scrollProgress, [0, 0.25], [0, 1]);

  // Generate a small, performant number of floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15, // Slow drift
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-[60] pointer-events-none overflow-hidden"
      style={{ opacity: layerOpacity }}
    >
      {/* Deep ocean gradient overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#001a33_0%,#000000_100%)] opacity-95" />
      
      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-50"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            filter: 'blur(1px)',
          }}
          animate={{
            y: ["0%", "-30%", "0%"],
            x: ["0%", "10%", "0%"],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </motion.div>
  );
}

export default AtmosphereLayer;
