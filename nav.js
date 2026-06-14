/* =========================================================
   KooldLabAI — Navigation JS
   Sticky nav, mobile hamburger, active page highlight,
   scroll-triggered fade-in animations
   ========================================================= */

(function () {
  'use strict';

  /* --- Active nav link --- */
  function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-links a, .nav-mobile a');
    links.forEach(function (link) {
      const href = link.getAttribute('href');
      if (
        href === currentPage ||
        (currentPage === '' && href === 'index.html') ||
        (currentPage === 'index.html' && href === 'index.html')
      ) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* --- Mobile hamburger toggle --- */
  function initHamburger() {
    const btn = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('nav-mobile');
    if (!btn || !mobileMenu) return;

    btn.addEventListener('click', function () {
      const isOpen = btn.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', isOpen);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !mobileMenu.contains(e.target)) {
        btn.classList.remove('open');
        mobileMenu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        btn.classList.remove('open');
        mobileMenu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --- Scroll-triggered fade-in --- */
  function initFadeIn() {
    const els = document.querySelectorAll('.fade-in');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach(function (el) { observer.observe(el); });
  }

  /* --- Hero domain text cycler --- */
  function initDomainCycler() {
    const el = document.getElementById('hero-domain');
    if (!el) return;

    const domains = [
      'wireless communications',
      'signal processing',
      'edge AI systems',
      'neural transceivers',
      'robotics & control',
      'AI for engineering',
    ];

    let idx = 0;
    function cycle() {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s ease';
      setTimeout(function () {
        idx = (idx + 1) % domains.length;
        el.textContent = domains[idx];
        el.style.opacity = '1';
      }, 300);
    }

    // Initial value already set in HTML; start cycling
    setInterval(cycle, 2400);
  }

  /* --- Nav shadow on scroll --- */
  function initNavShadow() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        nav.style.borderBottomColor = 'rgba(30,30,46,0.8)';
      } else {
        nav.style.borderBottomColor = 'var(--border)';
      }
    }, { passive: true });
  }

  /* --- Init all --- */
  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initHamburger();
    initFadeIn();
    initDomainCycler();
    initNavShadow();
  });
})();
