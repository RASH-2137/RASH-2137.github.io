/* ============================================================
   projects.js — 3D Tilt + Project Interactions
   ============================================================ */

(function () {
  'use strict';

  const TILT_MAX   = 6;    /* max tilt degrees */
  const GLARE_OP   = 0.08; /* glare max opacity */
  const SCALE_ON   = 1.01;

  document.querySelectorAll('.tilt-card').forEach(card => {
    /* create glare element */
    const glare = document.createElement('div');
    glare.style.cssText = `
      position: absolute; inset: 0; pointer-events: none; z-index: 3;
      background: radial-gradient(circle at 30% 30%, rgba(200,255,0,${GLARE_OP}), transparent 60%);
      opacity: 0; transition: opacity .3s;
      border-radius: inherit;
    `;
    card.style.position = 'relative';
    card.appendChild(glare);

    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const x     = e.clientX - rect.left;
      const y     = e.clientY - rect.top;
      const cx    = rect.width  / 2;
      const cy    = rect.height / 2;
      const tiltX = ((y - cy) / cy) * -TILT_MAX;
      const tiltY = ((x - cx) / cx) *  TILT_MAX;

      card.style.transform    = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${SCALE_ON})`;
      card.style.transition   = 'transform .08s linear';

      /* move glare with cursor */
      const px = (x / rect.width)  * 100;
      const py = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(200,255,0,${GLARE_OP}), transparent 55%)`;
      glare.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.transition = 'transform .5s cubic-bezier(0.16, 1, 0.3, 1)';
      glare.style.opacity = '0';
    });
  });

  /* ============================================================
     ACHIEVEMENT CARDS — subtle magnetic float
     ============================================================ */
  document.querySelectorAll('.magnetic-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - .5) * 10;
      const y = ((e.clientY - rect.top)  / rect.height - .5) * 10;
      card.style.transform  = `translate(${x * .4}px, ${y * .4}px)`;
      card.style.transition = 'transform .1s linear';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform .5s cubic-bezier(0.16, 1, 0.3, 1), border-color .3s';
    });
  });

  /* ============================================================
     PROJECT ITEM — staggered entrance
     ============================================================ */
  const projectItems = document.querySelectorAll('.project-item');
  const projObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const idx = [...projectItems].indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 0.08) + 's';
        entry.target.classList.add('pi-visible');
        projObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  /* inject base styles for project entrance */
  const style = document.createElement('style');
  style.textContent = `
    .project-item {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity .8s cubic-bezier(0.16,1,0.3,1),
                  transform .8s cubic-bezier(0.16,1,0.3,1),
                  border-color .4s, background .4s;
    }
    .project-item.pi-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .nav-link.active {
      color: #c8ff00;
    }
  `;
  document.head.appendChild(style);

  projectItems.forEach(item => projObserver.observe(item));

})();
