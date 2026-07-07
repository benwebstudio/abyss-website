import React, { useEffect, useRef } from 'react';

const VIDEO_SRC = '/video/ocean-descent-scrub.mp4';
const TRANSITION_OVERLAP = '100vh';
const TRANSITION_FADE_AHEAD = 1.26;
const END_FRAME_HOLD_MS = 900;
const FINAL_FRAME_SHADE = 0.24;
const LOCAL_PREVIEW_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const TEXT_CUES = [
  { text: '95% remains unexplored', start: 0.07, end: 0.33 },
  { text: 'Millions of species.\nStill undiscovered.', start: 0.39, end: 0.66 },
  { text: 'Protect what lies beneath', start: 0.73, end: 1, hold: true },
];

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function ScrollVideoSection() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const videoRef = useRef(null);
  const returnShadeRef = useRef(null);
  const overlayRefs = useRef([]);
  const skipRef = useRef(null);
  const scrollHintRef = useRef(null);
  const scrollFrameRef = useRef(null);
  const playbackFrameRef = useRef(null);
  const letterWaitFrameRef = useRef(null);
  const finishTimerRef = useRef(null);
  const durationRef = useRef(0);
  const hasStartedRef = useRef(false);
  const hasFinishedRef = useRef(false);
  const isScrollLockedRef = useRef(false);
  const lockedScrollYRef = useRef(0);
  const savedStylesRef = useRef(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const video = videoRef.current;
    const returnShade = returnShadeRef.current;
    const skip = skipRef.current;
    const scrollHint = scrollHintRef.current;
    const goDeeperLayer = document.querySelector('[data-go-deeper-layer]');
    const discoverBackdrop = document.querySelector('[data-discover-backdrop]');
    const discoverContent = document.querySelector('[data-discover-content]');
    const discoverCards = [...document.querySelectorAll('[data-discover-card]')];
    if (
      !section ||
      !viewport ||
      !video ||
      !returnShade ||
      !skip ||
      !scrollHint ||
      !discoverBackdrop ||
      !discoverContent ||
      discoverCards.length === 0
    ) {
      return undefined;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // The in-app localhost preview reports reduced motion by default. Keep the
    // production accessibility fallback, but allow the requested cinematic
    // autoplay while the site is being reviewed locally.
    const isLocalPreview = LOCAL_PREVIEW_HOSTS.has(window.location.hostname);
    reducedMotionRef.current = motionQuery.matches && !isLocalPreview;
    let playRequested = false;
    let isNavigationBypass = false;

    const setSkipVisible = (visible, label = 'Skip exploration ↓') => {
      skip.textContent = label;
      skip.style.opacity = visible ? '1' : '0';
      skip.style.transform = visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 8px, 0)';
      skip.style.pointerEvents = visible ? 'auto' : 'none';
    };

    const setScrollHintVisible = (visible, opacity = visible ? 1 : 0) => {
      scrollHint.style.opacity = String(opacity);
      scrollHint.style.transform = visible
        ? 'translate3d(-50%, 0, 0)'
        : 'translate3d(-50%, 8px, 0)';
    };

    const renderTextCue = (cue, element, progress) => {
      if (!element) return;

      const localProgress = clamp(
        (progress - cue.start) / (cue.end - cue.start)
      );
      const fadeIn = smoothstep(localProgress / 0.18);
      const fadeOut = cue.hold
        ? 1
        : smoothstep((1 - localProgress) / 0.18);
      const isInRange = progress >= cue.start && progress <= cue.end;
      const opacity = isInRange ? Math.min(fadeIn, fadeOut) : 0;

      element.style.opacity = String(opacity);
      element.style.filter = `blur(${(1 - opacity) * 8}px)`;
      element.style.transform = `translate3d(0, ${(1 - opacity) * 16}px, 0)`;
    };

    const renderOverlays = (progress) => {
      overlayRefs.current.forEach((element, index) => {
        renderTextCue(TEXT_CUES[index], element, progress);
      });
    };

    const hideOverlays = () => {
      overlayRefs.current.forEach((element) => {
        if (!element) return;
        element.style.opacity = '0';
        element.style.filter = 'blur(8px)';
        element.style.transform = 'translate3d(0, 16px, 0)';
      });
    };

    const lockScroll = () => {
      if (isScrollLockedRef.current) return;

      const sectionTop = section.getBoundingClientRect().top;
      const lockY = Math.max(0, window.scrollY + sectionTop);
      const bodyStyle = document.body.style;
      const htmlStyle = document.documentElement.style;

      savedStylesRef.current = {
        body: {
          position: bodyStyle.position,
          top: bodyStyle.top,
          left: bodyStyle.left,
          right: bodyStyle.right,
          width: bodyStyle.width,
          overflow: bodyStyle.overflow,
          touchAction: bodyStyle.touchAction,
          paddingRight: bodyStyle.paddingRight,
        },
        html: {
          overflowX: htmlStyle.overflowX,
          overflowY: htmlStyle.overflowY,
          scrollBehavior: htmlStyle.scrollBehavior,
        },
      };

      htmlStyle.scrollBehavior = 'auto';
      window.scrollTo(0, lockY);
      lockedScrollYRef.current = lockY;

      bodyStyle.position = 'fixed';
      bodyStyle.top = `-${lockY}px`;
      bodyStyle.left = '0';
      bodyStyle.right = '0';
      bodyStyle.width = '100%';
      bodyStyle.overflow = 'hidden';
      bodyStyle.touchAction = 'none';
      // Keep the scrollbar gutter present while the body is fixed. Removing
      // it changes the layout viewport width and nudges the video sideways.
      htmlStyle.overflowX = 'hidden';
      htmlStyle.overflowY = 'scroll';
      isScrollLockedRef.current = true;
    };

    const unlockScroll = () => {
      if (!isScrollLockedRef.current || !savedStylesRef.current) return;

      const { body, html } = savedStylesRef.current;
      const bodyStyle = document.body.style;
      const htmlStyle = document.documentElement.style;

      bodyStyle.position = body.position;
      bodyStyle.top = body.top;
      bodyStyle.left = body.left;
      bodyStyle.right = body.right;
      bodyStyle.width = body.width;
      bodyStyle.overflow = body.overflow;
      bodyStyle.touchAction = body.touchAction;
      bodyStyle.paddingRight = body.paddingRight;
      htmlStyle.overflowX = html.overflowX;
      htmlStyle.overflowY = html.overflowY;
      htmlStyle.scrollBehavior = 'auto';

      window.scrollTo(0, lockedScrollYRef.current);
      isScrollLockedRef.current = false;
      savedStylesRef.current = null;

      requestAnimationFrame(() => {
        htmlStyle.scrollBehavior = html.scrollBehavior;
      });
    };

    const pinLastFrameToSection = () => {
      const sectionDocumentTop = window.scrollY + section.getBoundingClientRect().top;
      viewport.style.position = 'absolute';
      viewport.style.inset = 'auto 0 auto 0';
      viewport.style.top = `${sectionDocumentTop}px`;
      viewport.style.opacity = '1';
    };

    const keepViewportFixed = () => {
      viewport.style.position = 'fixed';
      viewport.style.inset = '0';
    };

    const clearReturnBlend = () => {
      returnShade.style.opacity = '0';
      if (goDeeperLayer) goDeeperLayer.style.opacity = '';
    };

    const clearDiscoverBlend = () => {
      discoverBackdrop.style.opacity = '0';
      discoverContent.style.opacity = '0';
      discoverContent.style.transform = 'translate3d(0, 44px, 0)';
      discoverContent.style.pointerEvents = 'none';
      discoverCards.forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translate3d(0, 34px, 0)';
      });
    };

    const renderDiscoverBlend = (progress) => {
      const blendProgress = smoothstep(clamp(progress));
      const contentProgress = smoothstep(clamp((progress - 0.52) / 0.43));
      const textOpacity = 1 - smoothstep(clamp(progress / 0.24));
      const hintOpacity = 1 - smoothstep(clamp(progress / 0.16));

      viewport.style.opacity = String(1 - blendProgress);
      returnShade.style.opacity = String(
        FINAL_FRAME_SHADE + blendProgress * 0.34
      );
      discoverBackdrop.style.opacity = String(blendProgress);
      discoverContent.style.opacity = String(contentProgress);
      discoverContent.style.transform = `translate3d(0, ${(1 - contentProgress) * 44}px, 0)`;
      discoverContent.style.pointerEvents = progress > 0.78 ? 'auto' : 'none';

      overlayRefs.current.forEach((element, index) => {
        if (!element) return;
        const opacity = index === TEXT_CUES.length - 1 ? textOpacity : 0;
        element.style.opacity = String(opacity);
        element.style.filter = `blur(${(1 - opacity) * 8}px)`;
        element.style.transform = `translate3d(0, ${(1 - opacity) * 12}px, 0)`;
      });

      setScrollHintVisible(hintOpacity > 0.01, hintOpacity);

      discoverCards.forEach((card, index) => {
        const cardProgress = smoothstep(
          clamp((progress - (0.6 + index * 0.045)) / 0.3)
        );
        card.style.opacity = String(cardProgress);
        card.style.transform = cardProgress >= 0.999
          ? ''
          : `translate3d(0, ${(1 - cardProgress) * 34}px, 0)`;
      });
    };

    const renderReturnBlend = (sectionTop, viewportHeight) => {
      const returnProgress = clamp(
        sectionTop / (viewportHeight * TRANSITION_FADE_AHEAD)
      );
      const videoOpacity = 1 - smoothstep(returnProgress);
      const shadeOpacity = FINAL_FRAME_SHADE + smoothstep(returnProgress) * 0.22;
      const textProgress = clamp(sectionTop / (viewportHeight * 0.42));
      const textOpacity = 1 - smoothstep(textProgress);
      const goDeeperOpacity = smoothstep(
        (returnProgress - 0.5) / 0.38
      );
      const hintOpacity = 1 - smoothstep(clamp(returnProgress / 0.18));

      viewport.style.opacity = String(videoOpacity);
      returnShade.style.opacity = String(shadeOpacity);

      overlayRefs.current.forEach((element, index) => {
        if (!element) return;
        const opacity = index === TEXT_CUES.length - 1 ? textOpacity : 0;
        element.style.opacity = String(opacity);
        element.style.filter = `blur(${(1 - opacity) * 8}px)`;
        element.style.transform = `translate3d(0, ${(1 - opacity) * 12}px, 0)`;
      });

      if (goDeeperLayer) {
        goDeeperLayer.style.opacity = String(goDeeperOpacity);
      }
      setScrollHintVisible(hintOpacity > 0.01, hintOpacity);

      return returnProgress;
    };

    const finishCinematic = () => {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;

      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
        finishTimerRef.current = null;
      }
      if (playbackFrameRef.current !== null) {
        cancelAnimationFrame(playbackFrameRef.current);
        playbackFrameRef.current = null;
      }
      if (letterWaitFrameRef.current !== null) {
        cancelAnimationFrame(letterWaitFrameRef.current);
        letterWaitFrameRef.current = null;
      }

      video.pause();
      renderOverlays(1);
      setSkipVisible(false);
      setScrollHintVisible(true);
      unlockScroll();
      keepViewportFixed();
      returnShade.style.opacity = String(FINAL_FRAME_SHADE);
      clearDiscoverBlend();
      if (goDeeperLayer) goDeeperLayer.style.opacity = '0';
    };

    const resetCinematicCycle = () => {
      if (!hasFinishedRef.current) return;

      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
        finishTimerRef.current = null;
      }
      if (playbackFrameRef.current !== null) {
        cancelAnimationFrame(playbackFrameRef.current);
        playbackFrameRef.current = null;
      }
      if (letterWaitFrameRef.current !== null) {
        cancelAnimationFrame(letterWaitFrameRef.current);
        letterWaitFrameRef.current = null;
      }

      video.pause();
      if (video.readyState >= 1) video.currentTime = 0;
      hideOverlays();
      setSkipVisible(false);
      setScrollHintVisible(false);
      playRequested = false;
      hasStartedRef.current = false;
      hasFinishedRef.current = false;
      keepViewportFixed();
      viewport.style.opacity = '0';
      clearReturnBlend();
      clearDiscoverBlend();
    };

    const renderPlaybackFrame = () => {
      playbackFrameRef.current = null;
      if (!hasStartedRef.current || hasFinishedRef.current) return;

      const duration = durationRef.current || video.duration || 0;
      const progress = duration > 0 ? clamp(video.currentTime / duration) : 0;
      renderOverlays(progress);

      if (video.currentTime >= 2) setSkipVisible(true);

      if (!video.paused && !video.ended) {
        playbackFrameRef.current = requestAnimationFrame(renderPlaybackFrame);
      }
    };

    const requestPlaybackFrame = () => {
      if (playbackFrameRef.current !== null) return;
      playbackFrameRef.current = requestAnimationFrame(renderPlaybackFrame);
    };

    const beginPlayback = () => {
      if (playRequested || hasFinishedRef.current) return;
      playRequested = true;

      const playPromise = video.play();
      if (playPromise) {
        playPromise
          .then(requestPlaybackFrame)
          .catch(() => {
            setSkipVisible(true, 'Continue ↓');
          });
      } else {
        requestPlaybackFrame();
      }
    };

    const waitForLettersToExit = (startedAt) => {
      letterWaitFrameRef.current = null;
      if (hasFinishedRef.current) return;

      const letters = [...document.querySelectorAll('h2 span')];
      const allLettersHaveExited = letters.length === 0 || letters.every((letter) => {
        const bounds = letter.getBoundingClientRect();
        return bounds.top >= window.innerHeight || bounds.bottom <= 0;
      });
      const waitLimitReached = window.performance.now() - startedAt >= 700;

      if (allLettersHaveExited || waitLimitReached) {
        beginPlayback();
        return;
      }

      letterWaitFrameRef.current = requestAnimationFrame(() => {
        waitForLettersToExit(startedAt);
      });
    };

    const startCinematic = () => {
      if (
        hasStartedRef.current ||
        hasFinishedRef.current ||
        reducedMotionRef.current
      ) {
        return;
      }

      hasStartedRef.current = true;
      viewport.style.opacity = '1';
      hideOverlays();
      setSkipVisible(false);
      setScrollHintVisible(false);
      clearDiscoverBlend();
      lockScroll();

      if (video.currentTime > 0.04) video.currentTime = 0;
      waitForLettersToExit(window.performance.now());
    };

    const updateTransition = () => {
      scrollFrameRef.current = null;
      if (isScrollLockedRef.current) return;

      const viewportHeight = window.innerHeight;
      const sectionTop = section.getBoundingClientRect().top;

      if (hasFinishedRef.current) {
        if (isNavigationBypass) {
          clearReturnBlend();
          keepViewportFixed();

          if (sectionTop >= 0) {
            viewport.style.opacity = '0';
            clearDiscoverBlend();
            return;
          }

          const navigationProgress = clamp(-sectionTop / viewportHeight);
          renderDiscoverBlend(navigationProgress);
          if (navigationProgress >= 0.999) isNavigationBypass = false;
          return;
        }

        if (sectionTop < 0) {
          clearReturnBlend();
          keepViewportFixed();
          renderDiscoverBlend(clamp(-sectionTop / viewportHeight));
          return;
        }

        clearDiscoverBlend();
        // Hold the final frame fullscreen and dissolve it into the GO DEEPER
        // background. The video only resets after it is fully transparent.
        keepViewportFixed();
        const returnProgress = renderReturnBlend(sectionTop, viewportHeight);
        if (returnProgress >= 1) {
          resetCinematicCycle();
        }
        return;
      }

      clearReturnBlend();
      clearDiscoverBlend();

      // Never let the video layer travel into view with its section while the
      // GO DEEPER transition is active. In reduced-motion mode it only releases
      // after the static-frame section has completely left the viewport.
      if (
        reducedMotionRef.current &&
        sectionTop <= -section.offsetHeight
      ) {
        pinLastFrameToSection();
      } else {
        keepViewportFixed();
      }

      const transitionOpacity = smoothstep(
        (viewportHeight * TRANSITION_FADE_AHEAD - sectionTop) /
        (viewportHeight * TRANSITION_FADE_AHEAD)
      );

      viewport.style.opacity = String(transitionOpacity);

      if (sectionTop > 0) {
        video.pause();
        if (video.readyState >= 1 && video.currentTime > 0.04) {
          video.currentTime = 0;
        }
        hideOverlays();
        setSkipVisible(false);
        return;
      }

      viewport.style.opacity = '1';
      if (reducedMotionRef.current) {
        video.pause();
        if (sectionTop < 0) {
          renderDiscoverBlend(clamp(-sectionTop / viewportHeight));
        }
        return;
      }

      startCinematic();
    };

    const requestTransitionUpdate = () => {
      if (scrollFrameRef.current !== null || isScrollLockedRef.current) return;
      scrollFrameRef.current = requestAnimationFrame(updateTransition);
    };

    const handleLoadedMetadata = () => {
      durationRef.current = Number.isFinite(video.duration) ? video.duration : 0;
      if (!hasStartedRef.current) {
        video.pause();
        video.currentTime = 0;
      }
      requestTransitionUpdate();
    };

    const handlePlaying = () => requestPlaybackFrame();

    const handleEnded = () => {
      renderOverlays(1);
      setSkipVisible(false);
      finishTimerRef.current = window.setTimeout(
        () => finishCinematic(),
        END_FRAME_HOLD_MS
      );
    };

    const handleSkip = () => {
      const duration = durationRef.current || video.duration || 0;
      video.pause();
      if (duration > 0) video.currentTime = Math.max(duration - 0.04, 0);
      renderOverlays(1);
      finishCinematic();
    };

    const handleSectionNavigation = (event) => {
      const selector = event.detail?.selector;
      if (
        selector !== '[data-discover-section]' &&
        selector !== '[data-contact-section]'
      ) {
        return;
      }

      isNavigationBypass = true;
      const duration = durationRef.current || video.duration || 0;
      video.pause();
      if (duration > 0) video.currentTime = Math.max(duration - 0.04, 0);
      renderOverlays(1);
      finishCinematic();
    };

    const handleMotionPreferenceChange = (event) => {
      const shouldReduceMotion = event.matches && !isLocalPreview;
      reducedMotionRef.current = shouldReduceMotion;
      if (shouldReduceMotion && hasStartedRef.current && !hasFinishedRef.current) {
        finishCinematic();
      } else {
        requestTransitionUpdate();
      }
    };

    window.addEventListener('scroll', requestTransitionUpdate, { passive: true });
    window.addEventListener('resize', requestTransitionUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);
    skip.addEventListener('click', handleSkip);
    window.addEventListener('abyss:navigate', handleSectionNavigation);
    motionQuery.addEventListener('change', handleMotionPreferenceChange);

    if (video.readyState >= 1) handleLoadedMetadata();
    requestTransitionUpdate();

    return () => {
      window.removeEventListener('scroll', requestTransitionUpdate);
      window.removeEventListener('resize', requestTransitionUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
      skip.removeEventListener('click', handleSkip);
      window.removeEventListener('abyss:navigate', handleSectionNavigation);
      motionQuery.removeEventListener('change', handleMotionPreferenceChange);
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
      if (playbackFrameRef.current !== null) {
        cancelAnimationFrame(playbackFrameRef.current);
      }
      if (letterWaitFrameRef.current !== null) {
        cancelAnimationFrame(letterWaitFrameRef.current);
      }
      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
      }
      video.pause();
      unlockScroll();
      clearReturnBlend();
      clearDiscoverBlend();
      setScrollHintVisible(false);
    };
  }, []);

  return (
    <>
      <div
        ref={viewportRef}
        className="fixed inset-0 z-[65] h-screen w-full overflow-hidden bg-black opacity-0 pointer-events-none"
      >
        <video
          ref={videoRef}
          data-testid="cinematic-video"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          style={{ willChange: 'transform' }}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.35)_100%)] pointer-events-none"
          aria-hidden="true"
        />

        <div
          ref={returnShadeRef}
          className="absolute inset-0 z-[5] bg-black opacity-0 pointer-events-none"
          aria-hidden="true"
        />

        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pointer-events-none">
          {TEXT_CUES.map((cue, index) => (
            <p
              key={cue.text}
              ref={(element) => {
                overlayRefs.current[index] = element;
              }}
              className="absolute max-w-[min(82vw,56rem)] whitespace-pre-line text-center text-[clamp(2.2rem,11vw,4rem)] font-medium leading-[1.02] text-white opacity-0 sm:text-5xl md:text-6xl lg:text-7xl"
              style={{
                letterSpacing: '-0.045em',
                willChange: 'opacity, filter, transform',
              }}
            >
              {cue.text}
            </p>
          ))}
        </div>

        <button
          ref={skipRef}
          data-testid="cinematic-skip"
          type="button"
          className="abyss-button absolute bottom-5 right-5 z-20 rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] opacity-0 pointer-events-none sm:text-[11px]"
          style={{ transform: 'translate3d(0, 8px, 0)' }}
          aria-label="Skip exploration and continue"
        >
          Skip exploration ↓
        </button>

        <div
          ref={scrollHintRef}
          className="abyss-scroll-hint absolute bottom-6 left-1/2 z-20 opacity-0 pointer-events-none"
          aria-hidden="true"
        >
          <span className="abyss-scroll-hint__text">
            Scroll to discover
          </span>
          <span className="abyss-scroll-hint__mouse">
            <span className="abyss-scroll-hint__dot" />
          </span>
        </div>
      </div>

      <section
        ref={sectionRef}
        className="relative h-screen w-full bg-transparent"
        style={{ marginTop: `-${TRANSITION_OVERLAP}` }}
        aria-label="Cinematic ocean descent"
      >
      </section>
    </>
  );
}

export default ScrollVideoSection;
