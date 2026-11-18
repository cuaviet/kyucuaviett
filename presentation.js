(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let frame = 0;
  function updateProgress() {
    frame = 0;
    const page = document.documentElement;
    const scrollable = page.scrollHeight - page.clientHeight;
    const progress = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
    header.style.setProperty('--journey-progress', progress);
  }

  function scheduleProgress() {
    if (!frame) frame = requestAnimationFrame(updateProgress);
  }

  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress);
  window.addEventListener('pageshow', scheduleProgress);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleProgress).observe(document.body);
  updateProgress();
})();
