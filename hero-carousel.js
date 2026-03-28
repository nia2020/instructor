(() => {
  const section = document.querySelector('.hero');
  const slides = section?.querySelectorAll('.hero-slide');
  const dots = section?.querySelectorAll('.hero-dot');
  if (!section || !slides?.length || !dots?.length || slides.length !== dots.length) return;

  const len = slides.length;
  const AUTO_MS = 6500;
  let index = 0;
  let timer = null;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function goTo(i) {
    index = ((i % len) + len) % len;
    slides.forEach((el, j) => {
      el.classList.toggle('is-active', j === index);
    });
    dots.forEach((el, j) => {
      const on = j === index;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-current', on ? 'true' : 'false');
    });
  }

  function next() {
    goTo(index + 1);
  }

  function stop() {
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    if (motionQuery.matches) return;
    stop();
    timer = window.setInterval(next, AUTO_MS);
  }

  dots.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      goTo(i);
      start();
    });
  });

  section.addEventListener('mouseenter', stop);
  section.addEventListener('mouseleave', start);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  motionQuery.addEventListener('change', () => {
    if (motionQuery.matches) stop();
    else start();
  });

  start();
})();
