(() => {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  const backdrop = document.getElementById('nav-backdrop');
  if (!toggle || !nav || !backdrop) return;

  const mq = window.matchMedia('(max-width: 768px)');

  function syncNavAriaHidden() {
    if (mq.matches) {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      nav.setAttribute('aria-hidden', open ? 'false' : 'true');
    } else {
      nav.removeAttribute('aria-hidden');
    }
  }

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    toggle.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('nav-open', open);
    syncNavAriaHidden();
  }

  function close() {
    setOpen(false);
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  backdrop.addEventListener('click', close);
  /* iOS などで click が遅い／取りこぼす端末向け */
  backdrop.addEventListener(
    'touchend',
    (e) => {
      if (!backdrop.classList.contains('is-open')) return;
      e.preventDefault();
      close();
    },
    { passive: false }
  );

  nav.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', () => {
      if (mq.matches) close();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  mq.addEventListener('change', (e) => {
    if (!e.matches) {
      close();
      nav.removeAttribute('aria-hidden');
    } else {
      syncNavAriaHidden();
    }
  });

  syncNavAriaHidden();
})();
