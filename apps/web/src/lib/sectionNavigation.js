export function navigateToSection(selector) {
  const target = document.querySelector(selector);
  if (!target) return;

  window.dispatchEvent(
    new CustomEvent('abyss:navigate', { detail: { selector } })
  );

  window.requestAnimationFrame(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    target.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
      block: 'start',
    });
  });
}
