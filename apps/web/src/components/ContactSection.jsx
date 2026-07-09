import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Globe2,
  Mail,
  MessageSquare,
  Orbit,
  PenLine,
  Radio,
  UserRound,
  Waves,
} from 'lucide-react';
import deepSeaBackground from '../assets/discover/deep-sea-background.webp';

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const LOCAL_PREVIEW_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const STATS = [
  {
    value: '5%',
    label: 'of the ocean\nhas been explored',
    icon: Orbit,
  },
  {
    value: '91%',
    label: 'of marine species\nremain undiscovered',
    icon: Waves,
  },
  {
    value: '70%',
    label: 'of our planet\nis ocean',
    icon: Globe2,
  },
];

function ContactSection() {
  const sectionRef = useRef(null);
  const backdropRef = useRef(null);
  const introRef = useRef(null);
  const panelRef = useRef(null);
  const statsRef = useRef(null);
  const sentTimerRef = useRef(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const backdrop = backdropRef.current;
    const intro = introRef.current;
    const panel = panelRef.current;
    const stats = statsRef.current;
    if (!section || !backdrop || !intro || !panel || !stats) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isLocalPreview = LOCAL_PREVIEW_HOSTS.has(window.location.hostname);
    let frame = null;

    const setStage = (element, progress, distance, blur) => {
      element.style.opacity = String(progress);
      const reduceAnimations = reducedMotion.matches && !isLocalPreview;
      element.style.transform = reduceAnimations
        ? 'translate3d(0, 0, 0)'
        : `translate3d(0, ${(1 - progress) * distance}px, 0)`;
      element.style.filter = reduceAnimations
        ? 'none'
        : `blur(${(1 - progress) * blur}px)`;
      element.style.pointerEvents = progress > 0.82 ? 'auto' : 'none';
    };

    const render = () => {
      frame = null;
      const top = section.getBoundingClientRect().top;
      const progress = smoothstep(
        clamp((window.innerHeight - top) / (window.innerHeight * 0.8))
      );
      const introProgress = smoothstep(clamp(progress / 0.46));
      const panelProgress = smoothstep(clamp((progress - 0.22) / 0.56));
      const statsProgress = smoothstep(clamp((progress - 0.58) / 0.42));

      section.style.pointerEvents = progress >= 0.62 ? 'auto' : 'none';
      backdrop.style.opacity = String(smoothstep(clamp(progress / 0.68)));
      setStage(intro, introProgress, 34, 8);
      setStage(panel, panelProgress, 44, 10);
      setStage(stats, statsProgress, 24, 5);
    };

    const requestRender = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(render);
    };

    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', requestRender);
    reducedMotion.addEventListener('change', requestRender);
    requestRender();

    return () => {
      window.removeEventListener('scroll', requestRender);
      window.removeEventListener('resize', requestRender);
      reducedMotion.removeEventListener('change', requestRender);
      section.style.pointerEvents = '';
      if (frame !== null) window.cancelAnimationFrame(frame);
      if (sentTimerRef.current !== null) window.clearTimeout(sentTimerRef.current);
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
    if (sentTimerRef.current !== null) window.clearTimeout(sentTimerRef.current);
    sentTimerRef.current = window.setTimeout(() => setSent(false), 2600);
  };

  const fieldClassName =
    'abyss-field peer w-full rounded-xl py-4 pl-12 pr-4 text-sm transition-[border-color,box-shadow,background] duration-500';

  return (
    <section
      ref={sectionRef}
      data-contact-section
      className="relative z-[75] -mt-[20vh] min-h-screen w-full bg-transparent px-4 pb-12 pt-[15vh] sm:px-6 lg:-mt-[80vh] lg:px-10"
      aria-labelledby="contact-title"
    >
      <div
        ref={backdropRef}
        className="absolute -top-[38vh] bottom-0 left-0 right-0 overflow-hidden opacity-0"
        style={{
          willChange: 'opacity',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)',
        }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{ backgroundImage: `url(${deepSeaBackground})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,3,10,0.54)_0%,rgba(0,5,15,0.72)_30%,rgba(0,2,8,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(0,137,210,0.14),transparent_44%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_18%_22%,#bae6fd_0_0.6px,transparent_0.9px),radial-gradient(circle_at_76%_37%,#38bdf8_0_0.7px,transparent_1px)] [background-size:47px_47px,71px_71px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-15vh)] w-full max-w-5xl flex-col justify-center">
        <header
          ref={introRef}
          data-contact-intro
          className="mx-auto max-w-4xl text-center opacity-0"
          style={{ willChange: 'opacity, filter, transform' }}
        >
          <p className="abyss-eyebrow text-[9px] sm:text-[11px]">
            The deep is not empty.
          </p>
          <h2
            id="contact-title"
            className="mt-3 text-[clamp(2.65rem,6.4vw,6rem)] font-semibold uppercase leading-[0.92] tracking-[-0.07em] text-white drop-shadow-[0_0_22px_rgba(80,190,255,0.1)]"
          >
            It is waiting.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 drop-shadow-[0_0_12px_rgba(125,211,252,0.1)] sm:text-lg">
            Join the mission to uncover and protect the worlds hidden beneath the waves.
          </p>
        </header>

        <form
          ref={panelRef}
          data-transmission-panel
          className="relative mx-auto mt-8 w-full max-w-4xl rounded-[1.4rem] border border-cyan-200/25 bg-[linear-gradient(145deg,rgba(7,26,43,0.66),rgba(1,7,17,0.86))] p-4 opacity-0 shadow-[0_26px_90px_rgba(0,0,0,0.58),0_0_36px_rgba(0,133,210,0.08),inset_0_1px_0_rgba(207,250,254,0.13)] backdrop-blur-xl sm:p-6 lg:p-7"
          style={{ willChange: 'opacity, filter, transform' }}
          onSubmit={handleSubmit}
        >
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/55 to-transparent" />
          <div className="absolute inset-0 overflow-hidden rounded-[1.4rem] opacity-[0.09] [background-image:radial-gradient(circle_at_18%_22%,white_0_0.65px,transparent_0.9px)] [background-size:37px_37px]" />

          <div className="relative mb-5 flex items-center justify-center gap-3 text-[9px] font-medium uppercase tracking-[0.32em] text-cyan-200/65 sm:text-[10px]">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-300/45" />
            <Radio className="h-3.5 w-3.5" strokeWidth={1.4} />
            <span>Transmission panel</span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-300/45" />
          </div>

          <div className="relative grid gap-3 md:grid-cols-2">
            <div className="grid gap-3">
              <label className="relative block">
                <UserRound className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-200/50 transition-colors peer-focus:text-cyan-100" strokeWidth={1.3} />
                <span className="sr-only">Your Name</span>
                <input className={fieldClassName} type="text" name="name" autoComplete="name" placeholder="Your Name" required />
              </label>

              <label className="relative block">
                <Mail className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-200/50" strokeWidth={1.3} />
                <span className="sr-only">Your Email</span>
                <input className={fieldClassName} type="email" name="email" autoComplete="email" placeholder="Your Email" required />
              </label>

              <label className="relative block">
                <MessageSquare className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-200/50" strokeWidth={1.3} />
                <span className="sr-only">Subject</span>
                <input className={fieldClassName} type="text" name="subject" placeholder="Subject" required />
              </label>
            </div>

            <label className="relative block min-h-44 md:min-h-0">
              <PenLine className="absolute left-4 top-5 z-10 h-4 w-4 text-cyan-200/50" strokeWidth={1.3} />
              <span className="sr-only">Your Message</span>
              <textarea
                className={`${fieldClassName} h-full min-h-44 resize-none leading-relaxed`}
                name="message"
                placeholder="Your Message"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="abyss-button group relative mx-auto mt-5 flex w-full max-w-sm items-center justify-center gap-5 overflow-hidden rounded-xl px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.28em]"
          >
            <span>{sent ? 'Transmission ready' : 'Send transmission'}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.3} />
          </button>
        </form>

        <div
          ref={statsRef}
          data-contact-stats
          className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-1 gap-5 opacity-0 sm:grid-cols-3 sm:divide-x sm:divide-cyan-100/10 sm:gap-0"
          style={{ willChange: 'opacity, filter, transform' }}
        >
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={value} className="flex flex-col items-center px-6 text-center">
              <Icon className="mb-2 h-5 w-5 text-cyan-200/60" strokeWidth={1.1} />
              <span className="text-2xl font-light tracking-[-0.04em] text-white/90">{value}</span>
              <span className="mt-1 max-w-[12rem] whitespace-pre-line text-[9px] font-medium uppercase leading-relaxed tracking-[0.2em] text-white/60 sm:text-[8px] sm:tracking-[0.23em]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
