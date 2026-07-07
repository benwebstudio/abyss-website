import React, { forwardRef, useEffect, useRef } from 'react';
import abyssJellyfish from '../assets/discover/abyss-jellyfish.webp';
import glassSquid from '../assets/discover/glass-squid.webp';
import dragonfish from '../assets/discover/dragonfish.webp';
import ghostRay from '../assets/discover/ghost-ray.webp';
import deepSeaBackground from '../assets/discover/deep-sea-background.webp';

const CREATURES = [
  {
    number: '01',
    name: 'Abyss Jellyfish',
    type: 'Bioluminescent drifter',
    detail: 'A drifting constellation, pulsing softly through the midnight zone.',
    image: abyssJellyfish,
    position: '50% 34%',
  },
  {
    number: '02',
    name: 'Glass Squid',
    type: 'Master of transparency',
    detail: 'Nearly invisible in open water, revealing only a trace of blue light.',
    image: glassSquid,
    position: '50% 44%',
  },
  {
    number: '03',
    name: 'Deep Sea Dragonfish',
    type: 'Midnight predator',
    detail: 'A silent hunter carrying its own cold-blue beacon into the dark.',
    image: dragonfish,
    position: '42% 42%',
  },
  {
    number: '04',
    name: 'Ghost Ray',
    type: 'Phantom of the deep',
    detail: 'A weightless silhouette gliding beyond the reach of sunlight.',
    image: ghostRay,
    position: '50% 48%',
  },
];

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const LOCAL_PREVIEW_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const DiscoverSection = forwardRef(function DiscoverSection(_, forwardedRef) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const scanner = scannerRef.current;
    const contact = document.querySelector('[data-contact-section]');
    if (!section || !stage || !scanner || !contact) return undefined;

    const finePointer = window.matchMedia('(pointer: fine)');
    const hoverPointer = window.matchMedia('(hover: hover)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isLocalPreview = LOCAL_PREVIEW_HOSTS.has(window.location.hostname);
    const touchExperience = coarsePointer.matches || !hoverPointer.matches;
    const scannerEnabled =
      finePointer.matches &&
      hoverPointer.matches &&
      !touchExperience &&
      (!reducedMotion.matches || isLocalPreview);
    let scrollFrame = null;
    let cursorFrame = null;
    let currentX = -80;
    let currentY = -80;
    let targetX = -80;
    let targetY = -80;

    const renderContactTransition = () => {
      scrollFrame = null;
      const contactTop = contact.getBoundingClientRect().top;
      const progress = smoothstep(
        clamp((window.innerHeight - contactTop) / (window.innerHeight * 0.78))
      );
      const reduceAnimations = reducedMotion.matches && !isLocalPreview;

      stage.style.opacity = String(1 - progress);
      stage.style.filter = reduceAnimations ? 'none' : `blur(${progress * 8}px)`;
      stage.style.transform = reduceAnimations
        ? 'translate3d(0, 0, 0)'
        : `translate3d(0, ${-progress * 26}px, 0)`;
      stage.style.pointerEvents = progress > 0.08 ? 'none' : 'auto';
      if (progress > 0.04) scanner.style.opacity = '0';
    };

    const requestContactTransition = () => {
      if (scrollFrame !== null) return;
      scrollFrame = window.requestAnimationFrame(renderContactTransition);
    };

    const renderScanner = () => {
      currentX += (targetX - currentX) * 0.46;
      currentY += (targetY - currentY) * 0.46;
      scanner.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      if (
        Math.abs(targetX - currentX) > 0.12 ||
        Math.abs(targetY - currentY) > 0.12
      ) {
        cursorFrame = window.requestAnimationFrame(renderScanner);
      } else {
        currentX = targetX;
        currentY = targetY;
        cursorFrame = null;
      }
    };

    const handlePointerMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      scanner.style.opacity = '1';
      if (cursorFrame === null) {
        cursorFrame = window.requestAnimationFrame(renderScanner);
      }
    };

    const handlePointerLeave = () => {
      scanner.style.opacity = '0';
      scanner.dataset.active = 'false';
    };

    const handlePointerOver = (event) => {
      scanner.dataset.active = event.target.closest('[data-discover-card]')
        ? 'true'
        : 'false';
    };

    if (scannerEnabled) {
      section.style.cursor = 'none';
      section.addEventListener('pointermove', handlePointerMove, { passive: true });
      section.addEventListener('pointerleave', handlePointerLeave);
      section.addEventListener('pointerover', handlePointerOver, { passive: true });
    }

    let revealObserver = null;
    const cards = [...section.querySelectorAll('[data-discover-card]')];
    if (touchExperience && cards.length > 0) {
      cards.forEach((card) => {
        card.dataset.revealed = 'false';
      });

      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const card = entry.target;
            const index = Number(card.getAttribute('data-card-index') || 0);
            const isTablet = window.matchMedia('(min-width: 640px)').matches;
            const rowIndex = isTablet ? Math.floor(index / 2) : index;
            const withinRowIndex = isTablet ? index % 2 : 0;
            const delay = reducedMotion.matches && !isLocalPreview
              ? 0
              : isTablet
                ? rowIndex * 120 + withinRowIndex * 130
                : index * 80;

            window.setTimeout(() => {
              card.dataset.revealed = 'true';
            }, delay);

            revealObserver.unobserve(card);
          });
        },
        {
          threshold: 0.34,
          rootMargin: '0px 0px -10% 0px',
        }
      );

      cards.forEach((card) => revealObserver.observe(card));
    }

    window.addEventListener('scroll', requestContactTransition, { passive: true });
    window.addEventListener('resize', requestContactTransition);
    reducedMotion.addEventListener('change', requestContactTransition);
    requestContactTransition();

    return () => {
      window.removeEventListener('scroll', requestContactTransition);
      window.removeEventListener('resize', requestContactTransition);
      reducedMotion.removeEventListener('change', requestContactTransition);
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      section.removeEventListener('pointerover', handlePointerOver);
      section.style.cursor = '';
      if (revealObserver) revealObserver.disconnect();
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);
      if (cursorFrame !== null) window.cancelAnimationFrame(cursorFrame);
    };
  }, []);

  const setSectionRef = (node) => {
    sectionRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  return (
    <>
      <div
        data-discover-backdrop
        className="fixed inset-0 z-[55] bg-cover bg-center opacity-0 pointer-events-none"
        style={{
          backgroundImage: `url(${deepSeaBackground})`,
          willChange: 'opacity',
        }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,5,14,0.48)_0%,rgba(0,8,20,0.64)_48%,rgba(0,2,8,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(0,119,190,0.12),transparent_42%)]" />
      </div>

      <section
        ref={setSectionRef}
        data-discover-section
        className="relative z-[70] min-h-screen w-full overflow-clip px-4 pb-[35vh] pt-10 sm:px-6 sm:pt-12 lg:h-[250vh] lg:px-10 lg:pb-0 lg:pt-0 xl:px-12"
        aria-labelledby="discover-title"
      >
        <div
          data-discover-content
          className="relative mx-auto w-full max-w-[1600px] opacity-0 pointer-events-none lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center"
          style={{
            transform: 'translate3d(0, 44px, 0)',
            willChange: 'opacity, transform',
          }}
        >
          <div
            ref={stageRef}
            data-discover-stage
            className="relative w-full flex-none"
            style={{ willChange: 'opacity, filter, transform' }}
          >
          <header data-discover-intro className="mx-auto max-w-4xl text-center">
            <h2
              id="discover-title"
              className="text-[clamp(2.8rem,5.8vw,5.4rem)] font-semibold uppercase leading-[0.84] tracking-[-0.075em] text-white drop-shadow-[0_0_18px_rgba(85,190,255,0.08)]"
            >
              <span className="block">
                DISCOVER
              </span>
              <span className="mt-2 block">
                THE UNSEEN
              </span>
            </h2>

            <p className="mx-auto mt-5 text-[10px] font-medium uppercase tracking-[0.25em] text-white/50 sm:text-xs sm:tracking-[0.3em]">
              95% remains unexplored.
            </p>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-4">
            {CREATURES.map((creature, index) => (
              <article
                key={creature.number}
                data-discover-card
                data-card-index={index}
                tabIndex={0}
                className="discover-card group relative aspect-square overflow-hidden rounded-[1.15rem] border border-cyan-300/30 bg-[linear-gradient(145deg,rgba(7,26,43,0.72),rgba(1,7,17,0.9))] opacity-0 shadow-[0_20px_68px_rgba(0,0,0,0.55),0_0_26px_rgba(0,139,214,0.06),inset_0_1px_0_rgba(185,238,255,0.14),inset_0_-1px_0_rgba(56,189,248,0.05)] outline-none backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-700 ease-out hover:-translate-y-1.5 hover:border-cyan-200/60 hover:shadow-[0_26px_78px_rgba(0,0,0,0.62),0_0_38px_rgba(0,164,255,0.2),inset_0_1px_0_rgba(210,247,255,0.27)] focus:-translate-y-1.5 focus:border-cyan-200/65 focus:ring-1 focus:ring-cyan-200/50"
                style={{
                  transform: 'translate3d(0, 34px, 0)',
                  willChange: 'opacity, transform',
                }}
              >
                <div className="discover-card__glow absolute inset-x-[15%] top-[8%] h-[60%] rounded-full bg-cyan-400/[0.09] blur-[36px] transition-[opacity,transform] duration-1000 group-hover:scale-110 group-hover:bg-cyan-300/[0.16] group-focus:scale-110 group-focus:bg-cyan-300/[0.16] sm:blur-[44px]" />

                <img
                  src={creature.image}
                  alt={creature.name}
                  className="discover-card__image absolute inset-0 h-full w-full scale-[1.22] object-cover brightness-[0.34] saturate-[0.48] blur-[0.6px] transition-[filter,transform] duration-1000 ease-out group-hover:scale-[1.1] group-hover:brightness-100 group-hover:saturate-[1.15] group-hover:blur-0 group-focus:scale-[1.1] group-focus:brightness-100 group-focus:saturate-[1.15] group-focus:blur-0"
                  style={{ objectPosition: creature.position }}
                />

                <div className="discover-card__shade absolute inset-0 bg-[linear-gradient(180deg,rgba(0,8,22,0.46)_0%,rgba(0,10,26,0.54)_45%,rgba(0,3,12,0.96)_100%)] transition-opacity duration-1000 group-hover:opacity-45 group-focus:opacity-45" />
                <div className="discover-card__bio absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(18,168,255,0.16),transparent_50%)] opacity-55 mix-blend-screen transition-opacity duration-1000 group-hover:opacity-100 group-focus:opacity-100" />
                <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent opacity-70" />
                <div className="discover-card__sweep absolute inset-0 bg-[linear-gradient(118deg,transparent_20%,rgba(190,239,255,0.06)_43%,transparent_57%)] opacity-50 transition-transform duration-1000 group-hover:translate-x-5 group-focus:translate-x-5" />
                <div className="absolute inset-0 opacity-[0.11] mix-blend-screen [background-image:radial-gradient(circle_at_20%_25%,white_0_0.7px,transparent_0.9px),radial-gradient(circle_at_73%_62%,#67e8f9_0_0.6px,transparent_0.9px)] [background-size:31px_31px,43px_43px]" />

                <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
                  <div className="flex items-center gap-3 text-[9px] font-medium uppercase tracking-[0.26em] text-cyan-200/60">
                    <span>{creature.number}</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-cyan-300/38 to-transparent" />
                  </div>

                  <h3 className="mt-2 text-sm font-medium uppercase tracking-[0.08em] text-white sm:text-base xl:text-[1.05rem]">
                    {creature.name}
                  </h3>

                  <p className="discover-card__hidden mt-2 text-[9px] font-medium uppercase tracking-[0.21em] text-cyan-300/50 transition-opacity duration-500 group-hover:opacity-0 group-focus:opacity-0">
                    Hidden in darkness
                  </p>

                  <div className="discover-card__info max-h-0 translate-y-3 overflow-hidden opacity-0 transition-[max-height,opacity,transform] duration-700 ease-out group-hover:max-h-28 group-hover:translate-y-0 group-hover:opacity-100 group-focus:max-h-28 group-focus:translate-y-0 group-focus:opacity-100">
                    <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
                      {creature.type}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                      {creature.detail}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div data-discover-hint className="abyss-scroll-hint relative left-auto mt-7 opacity-100">
            <span className="abyss-scroll-hint__text">
              Scroll to continue
            </span>
            <span className="abyss-scroll-hint__mouse">
              <span className="abyss-scroll-hint__dot" />
            </span>
          </div>
          </div>
        </div>

        <div
          ref={scannerRef}
          data-discover-scanner
          data-active="false"
          className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-12 w-12 items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-300/[0.05] opacity-0 shadow-[0_0_18px_rgba(34,211,238,0.28),inset_0_0_14px_rgba(125,211,252,0.12)] backdrop-blur-[2px] transition-[opacity,width,height,box-shadow] duration-200 data-[active=true]:h-14 data-[active=true]:w-14 data-[active=true]:shadow-[0_0_28px_rgba(34,211,238,0.48),inset_0_0_18px_rgba(125,211,252,0.2)] md:flex"
          aria-hidden="true"
        >
          <span className="absolute inset-[6px] rounded-full border border-cyan-100/15" />
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-100/90 shadow-[0_0_9px_rgba(103,232,249,0.95)]" />
          <span className="absolute left-[calc(100%+8px)] text-[7px] font-semibold uppercase tracking-[0.24em] text-cyan-100/65 drop-shadow-[0_0_7px_rgba(34,211,238,0.75)]">
            Scan
          </span>
        </div>
      </section>
    </>
  );
});

export default DiscoverSection;
