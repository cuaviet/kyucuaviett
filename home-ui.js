/* Giao diện trang chủ:
 * 1. Nút "Nguồn ảnh" ở góc ảnh đầu trang (điện thoại): bấm để xem/ẩn chú thích ảnh.
 * 2. Danh sách 5 chạm thu gọn thành một dòng; tự mở khi đi tới #points.
 */
(() => {
  'use strict';

  /* 1. Nguồn ảnh đầu trang */
  const frame = document.querySelector('.hero .cover-frame');
  const creditButton = frame?.querySelector('.hero-credit-toggle');
  if (frame && creditButton) {
    const setCredit = open => {
      frame.classList.toggle('credit-open', open);
      creditButton.setAttribute('aria-expanded', String(open));
    };
    creditButton.addEventListener('click', event => {
      event.stopPropagation();
      setCredit(!frame.classList.contains('credit-open'));
    });
    document.addEventListener('click', event => {
      if (frame.classList.contains('credit-open') && !event.target.closest('#hero-credit')) setCredit(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && frame.classList.contains('credit-open')) {
        setCredit(false);
        creditButton.focus();
      }
    });
  }

  /* 1b. Thanh trên cùng trong suốt khi đang ở ảnh đầu trang */
  const hero = document.querySelector('.hero');
  const topBar = document.querySelector('.site-header');
  if (hero && topBar) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const limit = hero.offsetTop + hero.offsetHeight - topBar.offsetHeight - 24;
      document.body.classList.toggle('on-hero', window.scrollY < limit);
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* 1c. Đặt rặng phi lao sao cho cành cây chỉ đè lên phần cuối chữ "Cửa Việt" (máy tính) */
  const photo = document.querySelector('.hero-v2 .hero-photo');
  const trees = document.querySelector('.hero-v2 .hero-fg');
  const title = document.getElementById('hero-heading');
  if (hero && photo && trees && title) {
    const CW = 4000, CH = 1800, TREE_X = 2206; // mép trái rặng cây trong ảnh gốc (px)
    const place = () => {
      const wide = window.matchMedia('(min-width: 901px)').matches;
      for (const el of [photo, trees]) el.classList.toggle('is-placed', wide);
      if (!wide) { for (const el of [photo, trees]) el.removeAttribute('style'); return; }
      const W = hero.clientWidth, H = hero.clientHeight;
      const t = title.getBoundingClientRect(), h = hero.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(title).fontSize) || 100;
      const target = t.left - h.left + title.querySelector('strong').getBoundingClientRect().width - fs * 0.55;
      let s = H / CH;
      let left = target - TREE_X * s;
      if (left + CW * s < W) s = (W - target) / (CW - TREE_X), left = target - TREE_X * s; // không để hở bên phải
      if (left > 0) left = 0;
      const css = `left:${left.toFixed(1)}px;bottom:0;top:auto;width:${(CW * s).toFixed(1)}px;height:${(CH * s).toFixed(1)}px`;
      for (const el of [photo, trees]) el.style.cssText = css;
    };
    window.addEventListener('resize', place);
    if (document.fonts) document.fonts.ready.then(place);
    window.addEventListener('load', place);
    place();
  }

  /* 2. Danh sách 5 chạm */
  const section = document.getElementById('points');
  const toggle = section?.querySelector('.points-toggle');
  if (!section || !toggle) return;
  const label = toggle.querySelector('.points-toggle-label');

  function setList(open) {
    section.classList.toggle('is-collapsed', !open);
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Thu gọn danh sách' : 'Xem danh sách 5 chạm';
  }

  toggle.addEventListener('click', () => {
    const open = section.classList.contains('is-collapsed');
    setList(open);
    if (!open) section.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });

  // Nút "Hành trình" ở thanh dưới và mọi liên kết tới #points sẽ mở sẵn danh sách.
  document.addEventListener('click', event => {
    if (event.target.closest('a[href="#points"]')) setList(true);
  }, true);
  window.addEventListener('hashchange', () => {
    if (location.hash === '#points') setList(true);
  });
  if (location.hash === '#points') setList(true);
})();
