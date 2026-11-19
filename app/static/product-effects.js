// Inclinação com retorno por mola, sem dependências de framework.
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

export function enableProductEffect(card) {
  let bounds;
  let frame = 0;
  let previousTime = 0;
  let x = 0, y = 0, velocityX = 0, velocityY = 0;
  let targetX = 0, targetY = 0;
  let hovering = false;

  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    hovering = false;
    x = y = velocityX = velocityY = targetX = targetY = 0;
    card.classList.remove('is-tilting', 'is-pointer-over');
    for (const property of ['--tilt-x', '--tilt-y', '--glow-x', '--glow-y']) card.style.removeProperty(property);
  }

  function animate(time) {
    if (!card.isConnected || reducedMotion.matches || !finePointer.matches) { clear(); return; }
    const dt = Math.min((time - (previousTime || time - 16)) / 1000, 0.032);
    previousTime = time;
    velocityX += ((targetX - x) * 240 - velocityX * 26) * dt;
    velocityY += ((targetY - y) * 240 - velocityY * 26) * dt;
    x += velocityX * dt;
    y += velocityY * dt;
    card.style.setProperty('--tilt-x', `${x.toFixed(3)}deg`);
    card.style.setProperty('--tilt-y', `${y.toFixed(3)}deg`);
    const settled = Math.abs(x - targetX) + Math.abs(y - targetY) + Math.abs(velocityX) + Math.abs(velocityY) < 0.015;
    if (settled) {
      frame = 0;
      previousTime = 0;
      if (!hovering) clear();
    } else frame = requestAnimationFrame(animate);
  }

  function start() {
    if (!frame) frame = requestAnimationFrame(animate);
  }

  function move(event) {
    if (!hovering) return;
    const relativeX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const relativeY = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    targetX = (0.5 - relativeY) * 12;
    targetY = (relativeX - 0.5) * 12;
    card.style.setProperty('--glow-x', `${(relativeX * bounds.width).toFixed(1)}px`);
    card.style.setProperty('--glow-y', `${(relativeY * bounds.height).toFixed(1)}px`);
    start();
  }

  card.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || reducedMotion.matches) return;
    // Mede a superfície sem rotação para evitar oscilações sob o cursor.
    clear();
    bounds = card.getBoundingClientRect();
    hovering = true;
    card.classList.add('is-tilting', 'is-pointer-over');
    move(event);
  });
  card.addEventListener('pointermove', move);
  card.addEventListener('pointerleave', () => {
    if (!hovering) return;
    hovering = false;
    card.classList.remove('is-pointer-over');
    targetX = targetY = 0;
    start();
  });
  card.addEventListener('pointercancel', clear);
}
