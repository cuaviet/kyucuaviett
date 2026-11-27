(() => {
  const journey = document.querySelector('.scroll-journey');
  if (!journey) return;

  const stage = journey.querySelector('.journey-stage');
  const scenes = [...journey.querySelectorAll('.journey-scene')];
  const segments = [...journey.querySelectorAll('.journey-progress span')];
  const hero = document.querySelector('.hero');
  const motion = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 541px)');
  const clamp = value => Math.min(1, Math.max(0, value));
  const ease = value => value * value * (3 - 2 * value);
  let frame = 0;
  let lastProgress;
  let lastCover;

  function render() {
    frame = 0;
    if (!motion.matches) return;

    const bounds = journey.getBoundingClientRect();
    const stickyTop = parseFloat(getComputedStyle(journey).getPropertyValue('--journey-top'));
    const progress = clamp((stickyTop - bounds.top) / Math.max(1, bounds.height - stage.offsetHeight));
    const heroBounds = hero?.getBoundingClientRect();
    const cover = heroBounds ? clamp(-heroBounds.top / heroBounds.height) : 0;

    if (progress !== lastProgress) {
      lastProgress = progress;
      const position = progress * scenes.length;
      scenes.forEach((scene, index) => {
        // Crossfade across each chapter boundary while the photo and text travel at different speeds.
        const enter = index === 0 ? 1 : ease(clamp((position - index + 0.21) / 0.42));
        const textIn = index === 0 ? 1 : ease(clamp((position - index) / 0.13));
        const textOut = index === scenes.length - 1 ? 1 : ease(clamp((index + 1 - position) / 0.13));
        const local = clamp((position - index + 0.21) / 1.42);
        scene.style.setProperty('--scene-opacity', enter.toFixed(3));
        scene.style.setProperty('--scene-text-opacity', (textIn * textOut).toFixed(3));
        scene.style.setProperty('--scene-zoom', (1.045 + local * 0.06).toFixed(3));
        scene.style.setProperty('--scene-drift', (2 - local * 4).toFixed(2) + '%');
        scene.style.setProperty('--scene-copy-drift', (16 - local * 38).toFixed(1) + 'px');
        segments[index].style.setProperty('--segment-progress', clamp(position - index).toFixed(3));
      });
    }

    if (hero && cover !== lastCover) {
      lastCover = cover;
      hero.style.setProperty('--cover-drift', (cover * 24).toFixed(1) + 'px');
      hero.style.setProperty('--cover-zoom', (1 + cover * 0.065).toFixed(3));
      hero.style.setProperty('--postcard-drift', (cover * -39).toFixed(1) + 'px');
    }
  }

  function schedule() {
    if (motion.matches && !frame) frame = requestAnimationFrame(render);
  }

  function applyPreference() {
    journey.toggleAttribute('data-motion', motion.matches);
    schedule();
  }

  motion.addEventListener('change', applyPreference);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  applyPreference();
})();
