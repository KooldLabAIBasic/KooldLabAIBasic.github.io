/* =========================================================
   KooldLabAI — Background Animations
   Layer 1: Canvas particle network (hero, index only)
   Layer 2: Drifting glow blobs (all pages)
   Layer 3: Scroll parallax via --scroll-y custom property
   ========================================================= */

(function () {
  'use strict';

  var reducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     LAYER 2 & 3 — Glow blobs + scroll parallax (all pages)
  ------------------------------------------------------- */
  function initBlobs() {
    if (reducedMotion) return;

    [1, 2, 3].forEach(function (n) {
      var blob = document.createElement('div');
      blob.className = 'glow-blob glow-blob-' + n;
      blob.setAttribute('aria-hidden', 'true');
      document.body.appendChild(blob);
    });
  }

  function initScrollParallax() {
    if (reducedMotion) return;

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          document.documentElement.style.setProperty(
            '--scroll-y',
            window.scrollY
          );
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Set initial value
    document.documentElement.style.setProperty('--scroll-y', window.scrollY);
  }

  /* -------------------------------------------------------
     LAYER 1 — Canvas particle network (hero section only)
     Only runs on pages that have a #hero-canvas element.
  ------------------------------------------------------- */
  function initParticles() {
    if (reducedMotion) return;

    var heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    // Inject canvas into the hero section
    var canvas = document.createElement('canvas');
    canvas.id = 'hero-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    heroSection.insertBefore(canvas, heroSection.firstChild);

    var ctx = canvas.getContext('2d');
    var particles = [];
    var animId = null;
    var isVisible = true;

    var CONFIG = {
      count: 75,
      maxDist: 140,       // max distance to draw a connecting line
      speed: 0.35,
      dotRadius: 1.8,
      lineOpacityMax: 0.18,
      dotOpacity: 0.55,
      color: '0, 212, 255',  // cyan — matches --accent
      colorPurple: '120, 80, 255',
    };

    /* Size canvas to hero bounds */
    function resize() {
      var rect = heroSection.getBoundingClientRect();
      canvas.width  = heroSection.offsetWidth;
      canvas.height = heroSection.offsetHeight;
    }

    /* Build particle pool */
    function buildParticles() {
      particles = [];
      for (var i = 0; i < CONFIG.count; i++) {
        var isPurple = i % 7 === 0; // occasional purple node for variety
        particles.push({
          x:  Math.random() * canvas.width,
          y:  Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * CONFIG.speed,
          vy: (Math.random() - 0.5) * CONFIG.speed,
          r:  CONFIG.dotRadius * (0.6 + Math.random() * 0.8),
          purple: isPurple,
        });
      }
    }

    /* Move particles, wrap at edges */
    function update() {
      var W = canvas.width;
      var H = canvas.height;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10)  p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10)  p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }
    }

    /* Draw one frame */
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var maxDist2 = CONFIG.maxDist * CONFIG.maxDist;

      // Lines between nearby particles
      for (var i = 0; i < particles.length; i++) {
        var a = particles[i];
        for (var j = i + 1; j < particles.length; j++) {
          var b = particles[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var dist2 = dx * dx + dy * dy;
          if (dist2 < maxDist2) {
            var ratio = 1 - Math.sqrt(dist2) / CONFIG.maxDist;
            var alpha = ratio * CONFIG.lineOpacityMax;
            var col = (a.purple || b.purple) ? CONFIG.colorPurple : CONFIG.color;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(' + col + ', ' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 0.8;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Dots
      for (var k = 0; k < particles.length; k++) {
        var p = particles[k];
        var c = p.purple ? CONFIG.colorPurple : CONFIG.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + c + ', ' + CONFIG.dotOpacity + ')';
        ctx.fill();
      }
    }

    /* Animation loop */
    function loop() {
      if (!isVisible) return;
      update();
      draw();
      animId = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (!animId) {
        isVisible = true;
        loop();
      }
    }

    function stopLoop() {
      isVisible = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    /* Pause when hero scrolls out of view */
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            startLoop();
          } else {
            stopLoop();
          }
        },
        { threshold: 0 }
      );
      observer.observe(heroSection);
    } else {
      startLoop();
    }

    /* Handle resize */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        buildParticles();
      }, 150);
    });

    /* Subtle scroll tilt — shift particle field slightly on scroll */
    window.addEventListener('scroll', function () {
      var scrollRatio = Math.min(window.scrollY / (heroSection.offsetHeight || 600), 1);
      // Nudge all particle y positions proportionally (visual only, not physics)
      canvas.style.transform = 'translateY(' + (scrollRatio * 40) + 'px)';
      canvas.style.opacity   = (1 - scrollRatio * 0.7).toFixed(2);
    }, { passive: true });

    // Kick off
    resize();
    buildParticles();
  }

  /* -------------------------------------------------------
     Section entrance animations (scroll-triggered)
     Adds a ripple-glow highlight to section titles when
     they enter the viewport.
  ------------------------------------------------------- */
  function initSectionGlow() {
    if (reducedMotion) return;
    if (!('IntersectionObserver' in window)) return;

    var titles = document.querySelectorAll('.section-title, .page-hero-title');
    var glowObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('title-glow');
            glowObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    titles.forEach(function (el) { glowObserver.observe(el); });
  }

  /* -------------------------------------------------------
     Boot
  ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initBlobs();
    initScrollParallax();
    initParticles();
    initSectionGlow();
  });
})();
