// Troca automática a cada três segundos, inclusive com o mouse sobre o banner.
export function initHero(root) {
  if (!root) return;
  const slides = [...root.querySelectorAll('.hero-slide')];
  let current = 0;
  let start;
  let timer;
  let inView = true;

  // Mantém os links do slide que está saindo fora da navegação por teclado.
  for (const slide of slides) {
    slide.inert = slide.hidden;
    slide.setAttribute('aria-hidden', String(slide.hidden));
  }

  function schedule() {
    clearTimeout(timer);
    if (slides.length < 2 || document.hidden || !inView || root.contains(document.activeElement)) return;
    timer = setTimeout(() => {
      show(current + 1);
      schedule();
    }, 3000);
  }

  function show(index) {
    current = (index + slides.length) % slides.length;
    for (let i = 0; i < slides.length; i++) {
      slides[i].hidden = i !== current;
      slides[i].inert = i !== current;
      slides[i].setAttribute('aria-hidden', String(i !== current));
    }
    root.querySelector('.hero-slide-status').textContent = `Destaque ${slides[current].getAttribute('aria-label')}`;
  }

  root.addEventListener('focusin', schedule);
  root.addEventListener('focusout', () => queueMicrotask(schedule));
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('pagehide', () => clearTimeout(timer));
  window.addEventListener('pageshow', schedule);
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    schedule();
  }, {threshold: 0.1});
  observer.observe(root);
  root.addEventListener('pointerdown', event => {
    start = event.pointerType === 'touch' && !event.target.closest('a,button')
      ? {x: event.clientX, y: event.clientY, id: event.pointerId} : null;
  });
  root.addEventListener('pointerup', event => {
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      show(current + (dx < 0 ? 1 : -1));
      schedule();
    }
  });
  root.addEventListener('pointercancel', () => { start = null; });
  schedule();
}
