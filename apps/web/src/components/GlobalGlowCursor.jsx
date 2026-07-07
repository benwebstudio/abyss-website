import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function GlobalGlowCursor() {
  const cursorRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia('(any-pointer: fine)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const hoverPointer = window.matchMedia('(hover: hover)');
    const touchExperience = coarsePointer.matches || !hoverPointer.matches;

    if (!cursor || touchExperience || !finePointer.matches) return undefined;

    let currentX = -60;
    let currentY = -60;
    let targetX = -60;
    let targetY = -60;
    let hasPointerPosition = false;

    const updateCursorState = (element) => {
      const insideDiscover = Boolean(element?.closest('[data-discover-section]'));
      cursor.dataset.interactive = element?.closest(
        'button, a, input, textarea, select, label, [role="button"]'
      )
        ? 'true'
        : 'false';
      cursor.style.opacity = insideDiscover ? '0' : '1';
    };

    const renderCursor = () => {
      currentX += (targetX - currentX) * 0.46;
      currentY += (targetY - currentY) * 0.46;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

      if (
        Math.abs(targetX - currentX) > 0.1 ||
        Math.abs(targetY - currentY) > 0.1
      ) {
        frameRef.current = window.requestAnimationFrame(renderCursor);
      } else {
        currentX = targetX;
        currentY = targetY;
        frameRef.current = null;
      }
    };

    const handlePointerMove = (event) => {
      const element = event.target instanceof Element ? event.target : null;

      targetX = event.clientX;
      targetY = event.clientY;
      hasPointerPosition = true;
      updateCursorState(element);

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(renderCursor);
      }
    };

    const handleWindowLeave = (event) => {
      if (event.relatedTarget === null) cursor.style.opacity = '0';
    };

    const handleScroll = () => {
      if (!hasPointerPosition) return;
      updateCursorState(document.elementFromPoint(targetX, targetY));
    };

    document.body.classList.add('global-glow-cursor-active');
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mouseout', handleWindowLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mouseout', handleWindowLeave);
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      document.body.classList.remove('global-glow-cursor-active');
    };
  }, []);

  return createPortal(
    <div
      ref={cursorRef}
      data-global-glow-cursor
      data-interactive="false"
      className="pointer-events-none fixed left-0 top-0 z-[999] block h-6 w-6 rounded-full border border-cyan-100/32 bg-cyan-200/[0.055] opacity-0 mix-blend-screen shadow-[0_0_18px_rgba(34,211,238,0.38),inset_0_0_10px_rgba(165,243,252,0.12)] backdrop-blur-[1px] transition-[width,height,opacity,box-shadow,border-color] duration-150 data-[interactive=true]:h-8 data-[interactive=true]:w-8 data-[interactive=true]:border-cyan-50/55 data-[interactive=true]:shadow-[0_0_28px_rgba(34,211,238,0.62),inset_0_0_14px_rgba(165,243,252,0.2)]"
      aria-hidden="true"
    >
      <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-[0_0_9px_rgba(103,232,249,1)]" />
    </div>,
    document.body
  );
}

export default GlobalGlowCursor;
