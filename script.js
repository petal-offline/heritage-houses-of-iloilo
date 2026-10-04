(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const navigationEntry = performance.getEntriesByType('navigation')[0];
  if (navigationEntry?.type === 'reload') {
    if (window.location.hash) history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    window.scrollTo(0, 0);
    window.addEventListener('pageshow', () => window.scrollTo(0, 0), { once: true });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const welcome = document.querySelector('.welcome');
  const skipWelcome = document.querySelector('.welcome__skip');
  let welcomeTimer;

  function dismissWelcome() {
    if (!welcome || welcome.classList.contains('is-gone')) return;
    window.clearTimeout(welcomeTimer);
    welcome.classList.add('is-gone');
    window.setTimeout(() => welcome.remove(), 800);
  }

  welcomeTimer = window.setTimeout(dismissWelcome, reduceMotion ? 900 : 3300);
  skipWelcome?.addEventListener('click', dismissWelcome);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dismissWelcome();
  });

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const header = document.querySelector('.site-header');

  function setMenu(open) {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close destination navigation' : 'Open destination navigation');
    nav.classList.toggle('is-open', open);
  }

  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', (event) => {
    if (nav?.classList.contains('is-open') && !nav.contains(event.target) && !menuButton?.contains(event.target)) setMenu(false);
  });

  let hideTimer;
  let previousY = window.scrollY;
  header?.classList.remove('is-away');
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    if (Math.abs(currentY - previousY) > 1 && currentY > 64) {
      header?.classList.add('is-away');
      setMenu(false);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => header?.classList.remove('is-away'), 2500);
    } else if (currentY <= 64) {
      header?.classList.remove('is-away');
    }
    previousY = currentY;
  }, { passive: true });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -4% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const progressFill = document.querySelector('#reading-progress-fill');
  let frameRequested = false;
  function updateScrollEffects() {
    frameRequested = false;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    if (progressFill) progressFill.style.width = `${progress * 100}%`;

    if (!reduceMotion && window.innerWidth > 720) {
      document.querySelectorAll('.parallax').forEach((figure) => {
        const rect = figure.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
        const distance = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        figure.style.setProperty('--image-offset', `${Math.round(distance * -20)}px`);
      });
    }
  }

  window.addEventListener('scroll', () => {
    if (!frameRequested) {
      frameRequested = true;
      window.requestAnimationFrame(updateScrollEffects);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScrollEffects, { passive: true });
  updateScrollEffects();

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
