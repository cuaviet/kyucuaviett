(() => {
  'use strict';

  const cover = document.querySelector('.cover-frame');
  const coverWindow = cover.querySelector('.cover-image');
  const photo = cover.querySelector('.hero-photo');
  const map = document.querySelector('.map-scene');
  const landscape = map.querySelector('.landscape');
  const pins = map.querySelector('#map-pins');
  const lenses = new WeakMap();
  const stopMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const reduceTransparency = matchMedia('(prefers-reduced-transparency: reduce)');
  let mapImage;
  let mapRaster;
  let coverSignature;
  let frame = 0;

  function edgeCanvas(target) {
    if (lenses.has(target)) return lenses.get(target);
    const canvas = document.createElement('canvas');
    canvas.className = 'glass-refraction';
    canvas.setAttribute('aria-hidden', 'true');
    const context = canvas.getContext('2d');
    if (!context) return null;
    target.prepend(canvas);
    target.classList.add('has-glass-refraction');
    const lens = { canvas, context };
    lenses.set(target, lens);
    return lens;
  }

  function rasterize(image, bounds, style) {
    const width = Math.round(bounds.width);
    const height = Math.round(bounds.height);
    if (!width || !height || !image.naturalWidth) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;

    if (style) {
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const imageWidth = image.naturalWidth * scale;
      const imageHeight = image.naturalHeight * scale;
      const [x, y] = style.objectPosition.split(' ').map(value => parseFloat(value) / 100);
      context.filter = style.filter;
      context.drawImage(image, (width - imageWidth) * x, (height - imageHeight) * y, imageWidth, imageHeight);
    } else {
      context.drawImage(image, 0, 0, width, height);
    }
    try {
      return { width, height, pixels: context.getImageData(0, 0, width, height).data };
    } catch (error) {
      if (error.name === 'SecurityError') return null;
      throw error;
    }
  }

  function channel(source, x, y, index) {
    const column = Math.max(0, Math.min(source.width - 1, Math.round(x)));
    const row = Math.max(0, Math.min(source.height - 1, Math.round(y)));
    return source.pixels[(row * source.width + column) * 4 + index];
  }

  function paintEdge(target, targetBounds, shapeBounds, radii, sourceBounds, source, depth, strength) {
    if (!source || targetBounds.width < 2 || targetBounds.height < 2) return;
    const lens = edgeCanvas(target);
    if (!lens) return;

    const { canvas, context } = lens;
    const width = canvas.width = Math.round(targetBounds.width);
    const height = canvas.height = Math.round(targetBounds.height);
    const result = context.createImageData(width, height);
    const offsetX = targetBounds.left - shapeBounds.left;
    const offsetY = targetBounds.top - shapeBounds.top;
    const sourceX = targetBounds.left - sourceBounds.left;
    const sourceY = targetBounds.top - sourceBounds.top;
    const scaleX = source.width / sourceBounds.width;
    const scaleY = source.height / sourceBounds.height;

    for (let row = 0; row < height; row++) {
      const y = row + offsetY + .5;
      const onTop = y < shapeBounds.height / 2;
      const vertical = onTop ? y : shapeBounds.height - y;
      for (let column = 0; column < width; column++) {
        const x = column + offsetX + .5;
        const onLeft = x < shapeBounds.width / 2;
        const horizontal = onLeft ? x : shapeBounds.width - x;
        const radius = radii[onTop ? (onLeft ? 0 : 1) : (onLeft ? 3 : 2)];
        if (horizontal > radius + depth || vertical > radius + depth) {
          if (Math.min(horizontal, vertical) >= depth) continue;
        }

        // Find the nearest bevel normal. The flat center is left fully transparent.
        const cornerX = Math.max(0, radius - horizontal);
        const cornerY = Math.max(0, radius - vertical);
        const cornerLength = Math.hypot(cornerX, cornerY);
        const curved = cornerX > 0 && cornerY > 0;
        const normalX = (onLeft ? 1 : -1) * (curved ? cornerX / cornerLength : Number(horizontal <= vertical));
        const normalY = (onTop ? 1 : -1) * (curved ? cornerY / cornerLength : Number(vertical < horizontal));
        const distance = curved ? radius - cornerLength : Math.min(horizontal, vertical);
        if (distance < 0 || distance >= depth) continue;

        const amount = 1 - distance / depth;
        const bend = strength * amount ** 1.7;
        const fringe = 1.9 * amount;
        const px = (column + sourceX) * scaleX;
        const py = (row + sourceY) * scaleY;
        const pixel = (row * width + column) * 4;

        // The colour channels bend by slightly different amounts near the edge.
        result.data[pixel] = channel(source, px + normalX * (bend + fringe), py + normalY * (bend + fringe), 0);
        result.data[pixel + 1] = channel(source, px + normalX * bend, py + normalY * bend, 1);
        result.data[pixel + 2] = channel(source, px + normalX * (bend - fringe), py + normalY * (bend - fringe), 2);
        result.data[pixel + 3] = Math.round(240 * Math.min(1, amount * 2));
      }
    }

    context.putImageData(result, 0, 0);
  }

  function draw() {
    frame = 0;
    if (reduceTransparency.matches) return;

    if (photo.complete && photo.naturalWidth) {
      const bounds = coverWindow.getBoundingClientRect();
      const shape = cover.getBoundingClientRect();
      const style = getComputedStyle(cover);
      const keys = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'];
      const radii = keys.map(key => parseFloat(style[key]));
      const photoStyle = getComputedStyle(photo);
      const signature = [photo.currentSrc, bounds.width, bounds.height, shape.height,
        ...radii, photoStyle.objectPosition, photoStyle.filter].join('|');
      if (coverSignature !== signature) {
        coverSignature = signature;
        paintEdge(coverWindow, bounds, shape, radii, bounds, rasterize(photo, bounds, photoStyle), 16, 19);
      }
    }

    if (!mapImage) return;
    const mapBounds = map.getBoundingClientRect();
    if (!mapRaster || mapRaster.width !== Math.round(mapBounds.width) || mapRaster.height !== Math.round(mapBounds.height)) {
      mapRaster = rasterize(mapImage, mapBounds);
    }
    for (const pin of pins.querySelectorAll('.map-pin')) {
      const bounds = pin.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(pin).borderTopLeftRadius);
      paintEdge(pin, bounds, bounds, [radius, radius, radius, radius], mapBounds, mapRaster, 13, 20);
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function prepareMapImage() {
    const illustration = landscape.cloneNode(true);
    const { width, height } = map.getBoundingClientRect();
    illustration.setAttribute('width', Math.max(1, Math.round(width)));
    illustration.setAttribute('height', Math.max(1, Math.round(height)));
    const routeStyle = getComputedStyle(landscape.querySelector('.map-route'));
    const route = illustration.querySelector('.map-route');
    route.setAttribute('stroke', routeStyle.stroke);
    route.setAttribute('stroke-width', routeStyle.strokeWidth);
    route.setAttribute('stroke-linecap', routeStyle.strokeLinecap);
    const markup = new XMLSerializer().serializeToString(illustration);
    const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      mapImage = image;
      schedule();
    };
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  }

  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(schedule);
    resize.observe(coverWindow);
    resize.observe(map);
  } else {
    window.addEventListener('resize', schedule);
  }
  photo.addEventListener('load', schedule);
  new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 && node.matches('.map-pin')))) {
      schedule();
    }
  }).observe(pins, { childList: true });
  pins.addEventListener('transitionend', event => {
    if (event.propertyName === 'transform') schedule();
  });
  reduceTransparency.addEventListener('change', schedule);
  prepareMapImage();
  schedule();

  // A single rounded lens travels between the existing controls.
  for (const nav of document.querySelectorAll('.desktop-nav, .mobile-bottom')) {
    const indicator = document.createElement('span');
    indicator.className = 'glass-nav-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    nav.prepend(indicator);

    function moveTo(control) {
      if (!control || !control.offsetWidth) return;
      indicator.style.setProperty('--glass-nav-x', control.offsetLeft + 'px');
      indicator.style.setProperty('--glass-nav-y', control.offsetTop + 'px');
      indicator.style.setProperty('--glass-nav-width', control.offsetWidth + 'px');
      indicator.style.setProperty('--glass-nav-height', control.offsetHeight + 'px');
      indicator.classList.add('is-visible');
    }

    function current() {
      return [...nav.querySelectorAll('a')].find(a => a.hash === location.hash) || nav.querySelector('a');
    }

    function onPoint(event) {
      const control = event.target.closest('a, button');
      if (control?.parentElement === nav) moveTo(control);
    }

    nav.addEventListener('focusin', onPoint);
    nav.addEventListener('click', onPoint);
    nav.addEventListener('pointerover', event => {
      if (event.pointerType === 'mouse' && !stopMotion.matches) onPoint(event);
    });
    nav.addEventListener('pointerleave', () => moveTo(current()));
    window.addEventListener('hashchange', () => moveTo(current()));
    if ('ResizeObserver' in window) new ResizeObserver(() => moveTo(current())).observe(nav);
    else window.addEventListener('resize', () => moveTo(current()));
    moveTo(current());
  }
})();
