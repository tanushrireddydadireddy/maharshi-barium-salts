/**
 * Maharshi Barium Salts - Interactive Enhancements
 * - Rapid Animated Stat Counters
 * - Single-Page Continuous Navigation & Scroll-Spy
 */

(function () {
  'use strict';

  /* ==========================================================
     1. RAPID STAT COUNTERS (Count up from zero on scroll)
     ========================================================== */
  function initStatCounters() {
    const statItems = document.querySelectorAll('.stat-item');
    if (!statItems.length) return;

    let hasAnimated = false;

    function startCounting() {
      if (hasAnimated) return;
      hasAnimated = true;

      statItems.forEach((item) => {
        const numEl = item.querySelector('.stat-num');
        if (!numEl) return;

        const target = parseFloat(numEl.getAttribute('data-target'));
        const decimals = parseInt(numEl.getAttribute('data-decimals') || '0', 10);
        const suffix = numEl.getAttribute('data-suffix') || '';
        const prefix = numEl.getAttribute('data-prefix') || '';
        const duration = 1800; // ms
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const currentVal = easeOutProgress * target;

          let formatted;
          if (decimals > 0) {
            formatted = currentVal.toFixed(decimals);
          } else {
            formatted = Math.floor(currentVal).toLocaleString('en-US');
          }

          numEl.textContent = `${prefix}${formatted}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            const finalVal = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString('en-US');
            numEl.textContent = `${prefix}${finalVal}${suffix}`;
            item.classList.add('stat-animated');
          }
        }

        requestAnimationFrame(updateCounter);
      });
    }

    const statsSection = document.querySelector('.stats-container') || document.querySelector('.stats-wrapper');
    if (statsSection) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startCounting();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );
      observer.observe(statsSection);
    } else {
      setTimeout(startCounting, 500);
    }
  }

  /* ==========================================================
     3. SINGLE-PAGE CONTINUOUS NAVIGATION & SCROLL-SPY
     ========================================================== */
  function initPageInteractions() {
    // Ensure page reload/refresh always stays at the top of the page
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Scroll to top immediately on page load / reload
    window.scrollTo(0, 0);

    // If loaded with a hash anchor, clear it so future refreshes always start at top
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    window.addEventListener('beforeunload', () => {
      window.scrollTo(0, 0);
    });

    const navLinks = document.querySelectorAll('.navbar a[href^="#"]');
    const sections = [
      { id: 'home', el: document.getElementById('home') },
      { id: 'about', el: document.getElementById('about') },
      { id: 'products', el: document.getElementById('products') },
      { id: 'contact', el: document.getElementById('contact') }
    ].filter(item => item.el !== null);

    const navbar = document.querySelector('.navbar');
    const getNavHeight = () => (navbar ? navbar.offsetHeight : 60);

    let isClickScrolling = false;
    let clickScrollTimer = null;

    function setActiveTab(targetHref) {
      navLinks.forEach((l) => {
        if (l.getAttribute('href') === targetHref) {
          l.classList.add('active');
        } else {
          l.classList.remove('active');
        }
      });
    }

    // Smooth scroll on any anchor link click
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId) || document.querySelector(`.${targetId}`);
        
        if (targetEl) {
          e.preventDefault();
          
          // Lock scroll-spy updates while smooth scrolling to the target section
          isClickScrolling = true;
          setActiveTab(href);

          const navOffset = getNavHeight() + 16;
          const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = Math.max(0, elementPosition - navOffset);

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Release the lock after smooth scroll settles
          clearTimeout(clickScrollTimer);
          clickScrollTimer = setTimeout(() => {
            isClickScrolling = false;
            setActiveTab(href);
          }, 700);
        }
      });
    });

    // Handle scrollend if supported to instantly release click lock
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', () => {
        if (isClickScrolling) {
          isClickScrolling = false;
        }
      });
    }

    // Dynamic Scroll-Spy: Highlight active navbar link ONLY during manual user scrolling
    function updateActiveNav() {
      if (isClickScrolling) return;

      const scrollY = window.pageYOffset;
      const navOffset = getNavHeight() + 80;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // If at the very bottom, activate contact
      if (scrollY + windowHeight >= docHeight - 40) {
        setActiveTab('#contact');
        return;
      }

      // If at top of page, activate home
      if (scrollY < 200) {
        setActiveTab('#home');
        return;
      }

      let currentSectionId = 'home';
      sections.forEach(({ id, el }) => {
        const top = el.offsetTop - navOffset;
        if (scrollY >= top) {
          currentSectionId = id;
        }
      });

      setActiveTab(`#${currentSectionId}`);
    }

    let isScrolling = false;
    window.addEventListener('scroll', () => {
      if (isClickScrolling) return;

      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          updateActiveNav();
          isScrolling = false;
        });
        isScrolling = true;
      }
    }, { passive: true });
  }

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initStatCounters();
      initPageInteractions();
    });
  } else {
    initStatCounters();
    initPageInteractions();
  }
})();
