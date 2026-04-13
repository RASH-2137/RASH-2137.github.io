/* ============================================================
   animations.js — Loader, Scroll Reveals, Counters, Nav
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     LOADER
     ============================================================ */
  const loader    = document.getElementById('loader');
  const loaderPct = document.getElementById('loader-pct');
  const loaderFill = document.querySelector('.loader-fill');

  let pct = 0;
  document.body.classList.add('loading');

  const loaderInterval = setInterval(() => {
    /* fast at start, slow near end */
    const increment = pct < 60 ? 4 : pct < 85 ? 2 : 0.8;
    pct = Math.min(pct + increment, 100);

    if (loaderPct)  loaderPct.textContent = Math.floor(pct);
    if (loaderFill) loaderFill.style.width = pct + '%';

    if (pct >= 100) {
      clearInterval(loaderInterval);
      setTimeout(() => {
        if (loader) loader.classList.add('done');
        document.body.classList.remove('loading');
        /* trigger entrance animations */
        startReveal();
      }, 300);
    }
  }, 22);

  /* ============================================================
     NAV SCROLL STATE
     ============================================================ */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });
  }

  /* ============================================================
     INTERSECTION OBSERVER — REVEAL
     ============================================================ */
  function startReveal() {
    const revealEls = document.querySelectorAll(
      '.reveal-text, .reveal-fade, .skill-group'
    );

    const observer = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          /* stagger children within same parent */
          const el = entry.target;
          const siblings = el.parentElement
            ? [...el.parentElement.children].filter(c =>
                c.classList.contains('reveal-fade') ||
                c.classList.contains('reveal-text')
              )
            : [];
          const idx = siblings.indexOf(el);
          const delay = el.dataset.delay || (idx >= 0 ? idx * 0.1 : 0);
          el.style.transitionDelay = delay + 's';
          el.classList.add('visible');
          observer.unobserve(el);

          /* skill bars need their group class */
          if (el.classList.contains('skill-group')) {
            el.classList.add('visible');
          }
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /* Also run reveal on DOMContentLoaded in case loader is skipped */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startReveal);
  }

  /* ============================================================
     COUNTER ANIMATION
     ============================================================ */
  function animateCounter(el, target, duration) {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      /* ease out quart */
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (!isNaN(target)) animateCounter(el, target, 1600);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: .5 });

  document.querySelectorAll('.stat-n[data-target]').forEach(el => {
    counterObserver.observe(el);
  });

  /* ============================================================
     SMOOTH ACTIVE NAV HIGHLIGHTING
     ============================================================ */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active',
            link.getAttribute('href') === '#' + id
          );
        });
      }
    });
  }, { threshold: .35 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ============================================================
     MARQUEE PAUSE ON HOVER
     ============================================================ */
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    const strip = marqueeTrack.closest('.marquee-strip');
    if (strip) {
      strip.addEventListener('mouseenter', () => {
        marqueeTrack.style.animationPlayState = 'paused';
      });
      strip.addEventListener('mouseleave', () => {
        marqueeTrack.style.animationPlayState = 'running';
      });
    }
  }

  /* ============================================================
     SCROLL PROGRESS IN NAV (optional thin line at top)
     ============================================================ */
  const scrollBar = document.createElement('div');
  scrollBar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px; z-index: 200;
    background: #c8ff00; width: 0%; transition: width .1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(scrollBar);

  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
    scrollBar.style.width = pct + '%';
  }, { passive: true });

})();
