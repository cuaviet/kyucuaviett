/* Liquid Glass 2 — hiệu ứng động cho kính:
 * 1. Đo chiều cao thanh trên cùng để ảnh đầu trang tràn ra phía sau nó.
 * 2. Vệt sáng trên kính chạy theo con trỏ / ngón tay.
 * 3. Khúc xạ ở mép kính (chỉ trình duyệt nhân Chromium: Chrome, Edge, Cốc Cốc...).
 *    Trình duyệt khác tự dùng kính mờ thường, không lỗi.
 */
(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const reduceTransparency = matchMedia('(prefers-reduced-transparency: reduce)');

  /* 1. Chiều cao thanh trên cùng */
  function syncHeader() {
    if (!header) return;
    const style = getComputedStyle(header);
    const height = header.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    root.style.setProperty('--lg-header-h', Math.round(height) + 'px');
  }
  syncHeader();
  if (header && 'ResizeObserver' in window) new ResizeObserver(syncHeader).observe(header);
  else window.addEventListener('resize', syncHeader);

  /* 2. Vệt sáng theo con trỏ */
  const SHINE = [
    '.site-header', '.mobile-bottom', '.hero-card', '.hero-play-icon', '.btn', '.filter', '.icon-btn',
    '.btn-passport', '.point-card', '.gallery-card button', '.creation-options button',
    '.journey-editorial', '.audio-card', '.about-accordions details', '.search',
    '.story-shortcuts a', '.community-form'
  ].join(',');
  let pending = null;
  let frame = 0;

  function paintSheen() {
    frame = 0;
    if (!pending) return;
    const { el, x, y } = pending;
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) return;
    el.style.setProperty('--lg-x', ((x - box.left) / box.width * 100).toFixed(1) + '%');
    el.style.setProperty('--lg-y', ((y - box.top) / box.height * 100).toFixed(1) + '%');
  }

  function track(event) {
    if (reduceMotion.matches || !event.target.closest) return;
    const el = event.target.closest(SHINE);
    if (!el) return;
    pending = { el, x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(paintSheen);
  }

  document.addEventListener('pointermove', track, { passive: true });
  document.addEventListener('pointerdown', track, { passive: true });
  document.addEventListener('pointerout', event => {
    if (!event.target.closest) return;
    const el = event.target.closest(SHINE);
    if (el && !el.contains(event.relatedTarget)) {
      el.style.removeProperty('--lg-x');
      el.style.removeProperty('--lg-y');
    }
  }, { passive: true });

  /* 3. Khúc xạ mép kính (Chromium) */
  const brands = navigator.userAgentData?.brands || [];
  const isChromium = brands.some(item => /Chromium|Google Chrome|Microsoft Edge/.test(item.brand));
  if (!isChromium || !('ResizeObserver' in window)) return;

  // [bộ chọn, độ rộng mép cong (px), độ bẻ cong]
  const LENSES = [
    ['.site-header', 24, 56],
    ['.hero-actions .btn', 20, 44],
    ['.hero-play-icon', 14, 30],
    ['.hero-card', 22, 46],
    ['.btn-passport', 16, 34],
    ['.mobile-bottom', 24, 52]
  ];

  const SVG = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  document.body.append(svg);

  const lenses = new Map();
  let uid = 0;

  // Bản đồ dịch chuyển: R/G = hướng pháp tuyến của mép kính, mạnh dần ra phía viền.
  function displacementMap(width, height, radius, bezel) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const image = context.createImageData(width, height);
    const data = image.data;
    const halfW = width / 2;
    const halfH = height / 2;
    const r = Math.min(radius, halfW, halfH);

    for (let y = 0; y < height; y++) {
      const dy = y + .5 - halfH;
      const qy = Math.abs(dy) - (halfH - r);
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        data[i + 3] = 255;
        const dx = x + .5 - halfW;
        const qx = Math.abs(dx) - (halfW - r);
        let nx = 0;
        let ny = 0;
        let inside;
        if (qx > 0 && qy > 0) {
          const length = Math.hypot(qx, qy);
          inside = r - length;
          nx = qx / length;
          ny = qy / length;
        } else if (qx > qy) {
          inside = r - qx;
          nx = 1;
        } else {
          inside = r - qy;
          ny = 1;
        }
        if (inside >= bezel || inside < 0) {
          data[i] = 128;
          data[i + 1] = 128;
          data[i + 2] = 128;
          continue;
        }
        // Mặt cắt cong như giọt nước: bẻ mạnh sát mép, mượt dần vào giữa.
        const t = 1 - inside / bezel;
        const strength = Math.pow(t, 1.6);
        data[i] = 128 + Math.sign(dx) * nx * strength * 127;
        data[i + 1] = 128 + Math.sign(dy) * ny * strength * 127;
        data[i + 2] = 128;
      }
    }
    context.putImageData(image, 0, 0);
    return canvas.toDataURL();
  }

  function buildLens(el, bezel, scale) {
    const width = Math.round(el.offsetWidth);
    const height = Math.round(el.offsetHeight);
    if (width < 8 || height < 8) return;
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    const signature = [width, height, radius].join('x');
    let lens = lenses.get(el);
    if (lens && lens.signature === signature) return;

    if (!lens) {
      const id = 'lg-lens-' + (++uid);
      const filter = document.createElementNS(SVG, 'filter');
      filter.id = id;
      filter.setAttribute('filterUnits', 'userSpaceOnUse');
      filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
      filter.setAttribute('color-interpolation-filters', 'sRGB');
      const map = document.createElementNS(SVG, 'feImage');
      map.setAttribute('result', 'map');
      map.setAttribute('preserveAspectRatio', 'none');
      const shift = document.createElementNS(SVG, 'feDisplacementMap');
      shift.setAttribute('in', 'SourceGraphic');
      shift.setAttribute('in2', 'map');
      shift.setAttribute('xChannelSelector', 'R');
      shift.setAttribute('yChannelSelector', 'G');
      filter.append(map, shift);
      svg.append(filter);
      lens = { id, filter, map, shift };
      lenses.set(el, lens);
    }

    lens.signature = signature;
    for (const [name, value] of [['x', 0], ['y', 0], ['width', width], ['height', height]]) {
      lens.filter.setAttribute(name, value);
      lens.map.setAttribute(name, value);
    }
    lens.map.setAttribute('href', displacementMap(width, height, radius, Math.min(bezel, width / 2, height / 2)));
    lens.shift.setAttribute('scale', scale);
    el.style.setProperty('--lg-refract', `url(#${lens.id})`);
    el.classList.add('lg-refract');
  }

  const observer = new ResizeObserver(entries => {
    if (reduceTransparency.matches) return;
    for (const entry of entries) {
      const config = entry.target.__lgLens;
      if (config) buildLens(entry.target, config[0], config[1]);
    }
  });

  function attach() {
    if (reduceTransparency.matches) return;
    for (const [selector, bezel, scale] of LENSES) {
      for (const el of document.querySelectorAll(selector)) {
        if (!el.__lgLens) {
          el.__lgLens = [bezel, scale];
          observer.observe(el);
        }
        buildLens(el, bezel, scale);
      }
    }
  }

  function detach() {
    for (const [el, lens] of lenses) {
      lens.signature = '';
      el.style.removeProperty('--lg-refract');
      el.classList.remove('lg-refract');
    }
  }

  reduceTransparency.addEventListener('change', () => (reduceTransparency.matches ? detach() : attach()));
  if (document.readyState === 'complete') attach();
  else window.addEventListener('load', attach);
  // Chú thích ảnh đầu trang được tạo sau khi trang tải.
  setTimeout(attach, 1500);
})();
