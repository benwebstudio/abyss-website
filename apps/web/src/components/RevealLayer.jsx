
import React from 'react';

const SPOTLIGHT_R = 260;

function RevealLayer({ image, cursorX, cursorY, radius = SPOTLIGHT_R }) {
  const mask = `radial-gradient(circle ${radius}px at ${cursorX}px ${cursorY}px, black 0%, black 40%, rgba(0, 0, 0, 0.75) 60%, rgba(0, 0, 0, 0.4) 75%, rgba(0, 0, 0, 0.12) 88%, transparent 100%)`;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
      style={{
        backgroundImage: `url(${image})`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

export default RevealLayer;
