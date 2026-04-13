/* ============================================================
   canvas.js — Hero Particle Field
   Renders an animated particle constellation on the hero canvas
   ============================================================ */

(function () {
  'use strict';

  const canvas  = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');

  let W, H, particles, mouse, animId;
  const PARTICLE_COUNT = 90;
  const CONNECTION_DIST = 140;
  const MOUSE_REPEL = 120;

  mouse = { x: -9999, y: -9999 };

  /* ── Resize ── */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    if (!particles) initParticles();
    particles.forEach(p => {
      if (p.x > W) p.x = Math.random() * W;
      if (p.y > H) p.y = Math.random() * H;
    });
  }

  /* ── Particle Factory ── */
  function createParticle() {
    return {
      x:   Math.random() * (W || window.innerWidth),
      y:   Math.random() * (H || window.innerHeight),
      vx:  (Math.random() - .5) * .35,
      vy:  (Math.random() - .5) * .35,
      r:   Math.random() * 1.5 + .5,
      opacity: Math.random() * .5 + .15,
    };
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  /* ── Draw ── */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* optional very faint radial glow at bottom */
    const grad = ctx.createRadialGradient(W * .5, H, 0, W * .5, H, H * .6);
    grad.addColorStop(0,   'rgba(200,255,0,.03)');
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    /* connections */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * .18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(200,255,0,${alpha})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }

    /* particles */
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,255,0,${p.opacity})`;
      ctx.fill();
    });
  }

  /* ── Update ── */
  function update() {
    particles.forEach(p => {
      /* mouse repel */
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_REPEL) {
        const force = (MOUSE_REPEL - dist) / MOUSE_REPEL;
        p.vx += (dx / dist) * force * .6;
        p.vy += (dy / dist) * force * .6;
      }

      /* velocity damping */
      p.vx *= .98;
      p.vy *= .98;

      /* clamp speed */
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 1.5) { p.vx = (p.vx / speed) * 1.5; p.vy = (p.vy / speed) * 1.5; }

      p.x += p.vx;
      p.y += p.vy;

      /* wrap edges */
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });
  }

  /* ── Loop ── */
  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  /* ── Mouse ── */
  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  /* ── Init ── */
  window.addEventListener('resize', resize);
  resize();
  loop();

})();
