/* ============================================================
   cursor.js — Custom Magnetic Cursor
   Smooth lagging ring + dot, magnetic pull, context states
   ============================================================ */

(function () {
  'use strict';

  const dot   = document.getElementById('cursor-dot');
  const ring  = document.getElementById('cursor-ring');
  const label = document.getElementById('cursor-text');
  if (!dot || !ring) return;

  let mx = -100, my = -100;   /* mouse target */
  let rx = -100, ry = -100;   /* ring current */
  let rafId;

  /* ── Track mouse ── */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  /* ── Animate loop ── */
  function animLoop() {
    /* dot snaps fast */
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';

    /* ring lags */
    rx += (mx - rx) * .1;
    ry += (my - ry) * .1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    if (label.style.opacity === '1') {
      label.style.left = mx + 'px';
      label.style.top  = my + 'px';
    }

    rafId = requestAnimationFrame(animLoop);
  }
  animLoop();

  /* ── Magnetic elements ── */
  const magnetStrength = 0.35;

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-link');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-link');
      el.style.transform = '';
    });
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * magnetStrength;
      const dy = (e.clientY - cy) * magnetStrength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = 'transform .1s';
    });
  });

  /* ── Hover state for any clickable ── */
  const hoverEls = document.querySelectorAll('a, button, .magnetic, .tilt-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  /* ── Project cards: show "VIEW" label ── */
  document.querySelectorAll('.project-item').forEach(card => {
    card.addEventListener('mouseenter', () => {
      label.textContent = 'VIEW';
      label.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      label.style.opacity = '0';
    });
  });

  /* ── Hide on leave window ── */
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

})();
