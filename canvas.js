/* ============================================================
   canvas.js — Hero Particle Field (Playful Edition ✨)
   Renders an animated particle constellation on the hero canvas
   ============================================================ */

(function () {
  'use strict';

  const canvas  = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');

  let W, H, particles, mouse, animId, tick;
  const PARTICLE_COUNT  = 220;   // increased from 90
  const CONNECTION_DIST = 150;
  const MOUSE_REPEL     = 140;
  const MOUSE_ATTRACT   = 200;

  // Multi-color neon palette
  const COLORS = [
    [200, 255,   0],   // original lime
    [ 80, 220, 255],   // cyan
    [255, 100, 220],   // pink
    [255, 200,  80],   // gold
    [120, 255, 180],   // mint
  ];

  const EMOJIS = ['✨', '⚡', '💥', '🌟', '🎉', '💫', '🔥', '🚀'];

  let burstParticles = [];
  let emojiPops      = [];
  let attractPoint   = null;

  mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    if (!particles) initParticles();
    particles.forEach(p => {
      if (p.x > W) p.x = Math.random() * W;
      if (p.y > H) p.y = Math.random() * H;
    });
  }

  function createParticle(x, y) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const r = Math.random() * 2.2 + 0.6;
    return {
      x:   x !== undefined ? x : Math.random() * (W || window.innerWidth),
      y:   y !== undefined ? y : Math.random() * (H || window.innerHeight),
      vx:  (Math.random() - .5) * .4,
      vy:  (Math.random() - .5) * .4,
      r, baseR: r,
      opacity: Math.random() * .55 + .2,
      color,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.018 + Math.random() * 0.022,
      twinkle: Math.random() < 0.15,
    };
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle());
    tick = 0;
  }

  function spawnBurst(cx, cy) {
    const count = 18 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * .4;
      const speed = 1.5 + Math.random() * 3.5;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      burstParticles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 3 + 1,
        life: 1.0,
        decay: 0.022 + Math.random() * 0.018,
        color,
      });
    }
  }

  function spawnEmoji(cx, cy) {
    emojiPops.push({
      x: cx, y: cy,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      vy: -1.2 - Math.random(),
      life: 1.0,
      decay: 0.016,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createRadialGradient(W * .5, H, 0, W * .5, H, H * .6);
    grad.addColorStop(0, 'rgba(200,255,0,.04)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * .2;
          const cr = (a.color[0] + b.color[0]) >> 1;
          const cg = (a.color[1] + b.color[1]) >> 1;
          const cb = (a.color[2] + b.color[2]) >> 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      const glowR = p.r * (3.5 + 1.5 * Math.sin(p.phase));
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
      grd.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.opacity * .5})`);
      grd.addColorStop(1, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.opacity})`;
      ctx.fill();
    });

    burstParticles.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * b.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${b.color[0]},${b.color[1]},${b.color[2]},${b.life})`;
      ctx.fill();
    });

    ctx.textAlign = 'center';
    emojiPops.forEach(e => {
      ctx.globalAlpha = e.life;
      ctx.font = `${Math.floor(22 + (1 - e.life) * 8)}px serif`;
      ctx.fillText(e.emoji, e.x, e.y);
    });
    ctx.globalAlpha = 1;
  }

  function update() {
    tick++;

    particles.forEach(p => {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_REPEL && dist > 0) {
        const force = (MOUSE_REPEL - dist) / MOUSE_REPEL;
        p.vx += (dx / dist) * force * .7;
        p.vy += (dy / dist) * force * .7;
      }

      if (attractPoint) {
        const ax = p.x - attractPoint.x;
        const ay = p.y - attractPoint.y;
        const ad = Math.sqrt(ax * ax + ay * ay);
        if (ad < MOUSE_ATTRACT && ad > 1) {
          const force = (MOUSE_ATTRACT - ad) / MOUSE_ATTRACT;
          p.vx -= (ax / ad) * force * .45;
          p.vy -= (ay / ad) * force * .45;
        }
      }

      p.phase += p.pulseSpeed;
      p.r = p.baseR * (1 + .35 * Math.sin(p.phase));
      if (p.twinkle) p.opacity = .15 + .6 * Math.abs(Math.sin(p.phase * 3.5));

      p.vx *= .978;
      p.vy *= .978;

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 2) { p.vx = (p.vx / speed) * 2; p.vy = (p.vy / speed) * 2; }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });

    burstParticles.forEach(b => {
      b.x  += b.vx;
      b.y  += b.vy;
      b.vx *= .93;
      b.vy *= .93;
      b.life -= b.decay;
    });
    burstParticles = burstParticles.filter(b => b.life > 0);

    emojiPops.forEach(e => {
      e.y    += e.vy;
      e.life -= e.decay;
    });
    emojiPops = emojiPops.filter(e => e.life > 0);

    if (attractPoint) {
      attractPoint.ttl--;
      if (attractPoint.ttl <= 0) attractPoint = null;
    }
  }

  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const cx   = e.clientX - rect.left;
    const cy   = e.clientY - rect.top;
    spawnBurst(cx, cy);
    spawnEmoji(cx, cy);
    attractPoint = { x: cx, y: cy, ttl: 48 };
  });

  canvas.addEventListener('touchstart', e => {
    const rect  = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const cx    = touch.clientX - rect.left;
    const cy    = touch.clientY - rect.top;
    spawnBurst(cx, cy);
    spawnEmoji(cx, cy);
    attractPoint = { x: cx, y: cy, ttl: 48 };
    mouse.x = cx;
    mouse.y = cy;
  }, { passive: true });

  window.addEventListener('resize', resize);
  resize();
  loop();

})();
