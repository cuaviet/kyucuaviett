/* Chú thích ảnh dùng chung cho trang chủ, các chạm và cửa sổ phóng to. */
(function () {
  'use strict';
  const processed = new WeakMap();
  const unknown = {label: 'Chưa xác định người chụp và nguồn ảnh gốc.'};

  function makeLink(url, label) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = label;
    return a;
  }

  function sourceLine(photo, className, allowLinks = true) {
    const el = document.createElement('small');
    el.className = 'image-source-credit photo-reference ' + (className || '');
    el.append(photo.url && allowLinks ? makeLink(photo.url, photo.label) : photo.label);
    if (photo.license) {
      el.append(' · ', allowLinks ? makeLink(photo.license, 'CC BY-SA 4.0') : 'CC BY-SA 4.0');
    }
    return el;
  }

  function annotate(img) {
    const src = img.getAttribute('src');
    if (!src || processed.get(img) === src || /^(data:|blob:)/i.test(src)) return;
    processed.set(img, src);
    if (img.closest('.creative-photo-preview,.creative-photo-card,.svg-library')) return;
    if (img.classList.contains('hero-fg')) return; // lớp cây tách từ ảnh nền, đã ghi nguồn ở ảnh nền
    const photo = findPhoto(src) || unknown;
    const caption = photo.caption || img.alt;
    const button = img.closest('button[data-action="station-photo"],button[data-action="gallery"]');
    if (button && caption) {
      button.dataset.caption = caption;
      button.setAttribute('aria-label', 'Xem ảnh lớn: ' + caption);
    }
    if (img.closest('.map-pin')) { img.title = caption; return; }
    const heroCard = img.closest('.hero-card');
    if (heroCard) {
      // Thẻ kính ở đầu trang: ghi nguồn vào ô "Nguồn ảnh" thay vì đè chữ lên thẻ.
      img.alt = caption || '';
      const box = document.getElementById('hero-credit');
      if (box) {
        box.querySelector('[data-for="' + heroCard.dataset.id + '"]')?.remove();
        const line = sourceLine(photo, 'hero-card-credit');
        line.dataset.for = heroCard.dataset.id;
        line.prepend((heroCard.dataset.label || 'Ảnh thẻ') + ': ');
        box.append(line);
      }
      return;
    }
    if (caption) img.alt = caption;
    if (img.closest('.compare-wrap')) return;
    const figure = img.closest('figure');
    if (figure) {
      const cap = figure.querySelector(':scope > figcaption') || figure.appendChild(document.createElement('figcaption'));
      const coverLink = cap.querySelector('.photo-credit');
      cap.replaceChildren();
      if (coverLink) cap.append(coverLink);
      else if (caption) cap.append(caption);
      cap.append(sourceLine(photo));
      const zoom = img.closest('a[aria-label^="Xem"]');
      if (zoom && caption) zoom.setAttribute('aria-label', 'Xem ảnh lớn: ' + caption);
      return;
    }
    const postcard = img.closest('.cover-postcard');
    if (postcard) {
      postcard.querySelector('small')?.remove();
      postcard.append(sourceLine(photo, '', false));
      return;
    }
    const frame = img.closest('.touch-image,.route-image,.point-card-image,.experience-head,.editorial-image');
    if (frame) {
      const prev = frame.nextElementSibling;
      if (prev?.classList.contains('image-source-under')) prev.remove();
      const note = sourceLine(photo, 'image-source-under', !frame.closest('button,a'));
      if (caption) note.prepend(caption + ' ');
      frame.after(note);
      return;
    }
    const story = img.closest('.story-visual');
    if (story) {
      story.querySelector('.image-source-overlay')?.remove();
      const note = sourceLine(photo, 'image-source-overlay');
      if (caption) note.prepend(caption + ' ');
      story.append(note);
      return;
    }
    const card = img.closest('.gallery-card');
    if (card) {
      card.querySelector('.image-source-gallery')?.remove();
      const note = sourceLine(photo, 'image-source-gallery');
      if (caption) note.prepend(caption + ' ');
      card.append(note);
      return;
    }
    const target = img.closest('a') || img;
    const next = target.nextElementSibling;
    if (next?.classList.contains('photo-reference')) next.remove();
    const note = sourceLine(photo);
    if (img.classList.contains('full-photo') && next?.tagName === 'P') {
      next.textContent = caption || '';
      next.append(note);
    } else {
      if (caption) note.prepend(caption + ' ');
      target.after(note);
    }
  }

  let scheduled = false;
  function queue() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      document.querySelectorAll('img').forEach(annotate);
    });
  }
  new MutationObserver(queue).observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['src']});
  queue();
})();
