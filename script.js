window.gabyState = { clickCount: 0, isOpen: false };

(function () {
  const giftBtn    = document.getElementById('gift-btn');
  const heartsEl   = document.getElementById('progress-hearts');
  const heartIcons = heartsEl.querySelectorAll('.progress-hearts__heart');
  const prefRed    = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const AMPLITUDES = [0, 4, 7, 10, 14];

  function fillHeart(idx) {
    const icon = heartIcons[idx];
    icon.classList.replace('progress-hearts__heart--empty', 'progress-hearts__heart--filled');
    heartsEl.setAttribute('aria-label', `Progreso: ${idx + 1} de 5 clics`);
    if (!prefRed && typeof gsap !== 'undefined') {
      gsap.fromTo(icon, { scale: 1.5 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' });
    }
  }

  function shakeGift(n) {
    if (prefRed || typeof gsap === 'undefined') return;
    const amp  = AMPLITUDES[n];
    const step = 0.065;
    gsap.killTweensOf(giftBtn);
    gsap.to(giftBtn, {
      keyframes: [
        { x:  amp,        duration: step },
        { x: -amp,        duration: step * 1.4 },
        { x:  amp * 0.65, duration: step * 1.2 },
        { x: -amp * 0.45, duration: step },
        { x:  amp * 0.25, duration: step * 0.8 },
        { x:  0,          duration: step * 0.6 },
      ],
      ease: 'none',
    });
  }

  giftBtn.addEventListener('click', () => {
    if (window.gabyState.isOpen || window.gabyState.clickCount >= 5) return;

    window.gabyState.clickCount++;
    const n = window.gabyState.clickCount;

    giftBtn.setAttribute('aria-label', `Abrir el regalo — clic ${n} de 5`);
    fillHeart(n - 1);

    if (n < 5) {
      shakeGift(n);
    } else {
      window.gabyState.isOpen = true;
      document.dispatchEvent(new CustomEvent('gift:open'));
    }
  });
})();


window.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const giftBox = document.querySelector('.gift-box');
  const decos   = document.querySelectorAll('.ambient-layer__element');

  gsap.set(giftBox, { opacity: 0, scale: 0.8 });
  gsap.set(decos,   { opacity: 0 });

  gsap.timeline({ defaults: { ease: 'power2.out' } })
    .to(giftBox, { opacity: 1, scale: 1,  duration: 0.8 })
    .to(decos,   { opacity: 0.55, duration: 0.5, stagger: 0.1, ease: 'power1.out' }, 0.2);
});


document.addEventListener('gift:open', () => {
  const prefRed       = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const screenInitial = document.getElementById('screen-initial');
  const screenOpen    = document.getElementById('screen-open');
  const lid           = document.getElementById('gift-lid');

  if (prefRed || typeof gsap === 'undefined') {
    document.body.classList.add('is-open');
    document.dispatchEvent(new CustomEvent('gift:opened'));
    return;
  }

  gsap.timeline()
    .to(lid, {
      y: -90,
      rotation: -12,
      duration: 0.55,
      ease: 'back.out(1.2)',
      svgOrigin: '100 118',
    })
    .to(screenInitial, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0.1')
    .call(() => {
      gsap.set(screenOpen, { opacity: 0, display: 'block' });
      document.body.classList.add('is-open');
    })
    .to(screenOpen, { opacity: 1, duration: 0.6, ease: 'power2.out' })
    .call(() => document.dispatchEvent(new CustomEvent('gift:opened')));
});


(function () {
  const prefRed = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefRed) return;

  const COLORS       = ['#f8a5c2', '#f3d9a4', '#ffffff', '#e91e63'];
  const confettiRoot = document.getElementById('confetti-root');
  const glassPanel   = document.querySelector('.glass-panel');

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createConfetti() {
    for (let i = 0; i < 50; i++) {
      const el       = document.createElement('div');
      const size     = rand(4, 12);
      const isCircle = Math.random() > 0.5;
      const color    = COLORS[Math.floor(Math.random() * COLORS.length)];

      el.className = 'confetti-particle';
      el.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `background-color:${color}`,
        `border-radius:${isCircle ? '50%' : '2px'}`,
        `left:${rand(0, 100)}%`,
        `animation-duration:${rand(4, 7).toFixed(2)}s`,
        `animation-delay:${rand(0, 5).toFixed(2)}s`,
      ].join(';');

      el.addEventListener('animationend', () => el.remove(), { once: true });
      confettiRoot.appendChild(el);
    }
  }

  document.addEventListener('gift:open', () => {
    createConfetti();
    setInterval(createConfetti, 4000);
  });

  if (glassPanel) {
    glassPanel.addEventListener('click', createConfetti);
  }
})();


(function () {
  const photos     = document.querySelectorAll('.photo-card');
  const glassPanel = document.querySelector('.glass-panel');
  const prefRed    = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('gift:open', () => {
    if (prefRed || typeof gsap === 'undefined') return;
    gsap.set(photos,     { opacity: 0, scale: 0.8 });
    gsap.set(glassPanel, { opacity: 0, y: 20 });
  });

  document.addEventListener('gift:opened', () => {
    if (prefRed || typeof gsap === 'undefined') return;
    gsap.timeline()
      .to(glassPanel, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      .to(photos, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', stagger: 0.06 }, '>0.2');
  });
})();
