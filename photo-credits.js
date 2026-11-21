/* CHẠM CỬA VIỆT – chú thích nguồn ảnh cho website và 5 Chạm.
 * Chỉ nêu tác giả/trang báo nếu tài liệu dự án có thông tin hỗ trợ.
 * Ảnh thiếu xuất xứ được ghi rõ là chưa xác minh; không suy đoán.
 * Không thay đổi ảnh, câu hỏi, tính năng upload hoặc Firestore.
 */
(function () {
  'use strict';

  const links = {
    harbor: 'https://baodautu.vn/quang-tri-co-them-3-cang-bien-duoc-ap-dung-thi-thuc-dien-tu-e-visa-d451059.html',
    fishing: 'https://vov.vn/kinh-te/ngu-dan-quang-tri-ron-rang-phien-bien-cuoi-nam-post1148171.vov',
    fishing2: 'https://xanhx.vn/media/mot-som-mai-hoi-ha-o-cang-ca-lon-nhat-quang-tri-10719.html',
    coast: 'https://nongnghiepmoitruong.vn/ve-cua-viet-giup-cac-runner-trai-nghiem-bien-xanh-cat-trang-nang-vang-i383664.html',
    xanh: 'https://xanhx.vn/du-lich-az/keo-luoi-rung-cung-ngu-dan-29723.html',
    nuocmam: 'https://congluan.vn/quang-tri-nhoc-nhan-nghe-lam-nuoc-mam-truyen-thong-post324831.html',
    thanhNien: 'https://thanhnien.vn/26-gio-doi-dien-than-chet-cua-ngu-dan-dung-cam-ket-tren-tau-vietship-01-1851249445.htm',
    congLuan: 'https://congluan.vn/quang-tri-hang-chuc-ho-dan-song-mon-vi-du-an-mo-rong-cang-cua-viet-post326674.html'
  };

  const exact = {
    'assets/ben-cang-hien-nay.webp': { label: 'Ngọc Tân / Báo Đầu tư', url: links.harbor },
    'assets/nhip-song-ben-ca.webp': { label: 'VOV', url: links.fishing },
    'assets/cua-viet-keo-luoi-rung.jpg': { label: 'S.H / XANH EWEC', url: links.xanh },
    'assets/cua-viet-u-chuop-nuoc-mam.avif': { label: 'Viết Hảo / Báo Nhà báo và Công luận', url: links.nuocmam },
    'assets/vietship-01-cuu-nan.jpg': { label: 'Báo Thanh Niên', url: links.thanhNien },
    'assets/anh-chien-su-1973.webp': { label: 'Ảnh tư liệu đăng trên Báo Dân Việt; chưa rõ tác giả gốc' },
    'assets/tu-lieu-62.webp': { label: 'Tư liệu năm 1967, ghi chú US Navy; chưa xác minh ảnh gốc' },
    'assets/cua-viet-1967.webp': { label: 'Tư liệu năm 1967, ghi chú US Navy; chưa xác minh ảnh gốc' },
    'assets/toan-canh-cua-viet.webp': { label: 'Nhóm dự án cung cấp; chưa rõ tác giả ảnh gốc' },
    'assets/cham-1-toan-canh-cua-viet.webp': { label: 'Nhóm dự án cung cấp; chưa rõ tác giả ảnh gốc' },
    'assets/cau-cua-viet.webp': { label: 'Nhóm dự án cung cấp; chưa rõ tác giả ảnh gốc' },
    'assets/cham-5-bai-bien-cong-chao-2026.jpg': { label: 'Nhóm dự án cung cấp; chưa rõ tác giả ảnh gốc' },
    'assets/cham-4-hai-san-ven-bien.webp': { label: 'Nhóm dự án cung cấp; chưa rõ tác giả ảnh gốc' }
  };
  const groupPrefixes = [
    'assets/anh-nhom/',
    'assets/cham-2-anh-tu-lieu/',
    'assets/cham-3-anh-tu-lieu/'
  ];
  const groupSource = { label: 'Nhóm dự án cung cấp; chưa rõ tác giả ảnh gốc' };
  const unknownSource = { label: 'Tư liệu dự án sử dụng; chưa xác minh nguồn ảnh gốc' };

  function getSource(img) {
    const raw = img.getAttribute('src') || '';
    if (!raw || /^(data:|blob:)/i.test(raw)) return null;
    const normalized = raw.replace(/^\.\//, '').split(/[?#]/)[0];
    if (Object.prototype.hasOwnProperty.call(exact, normalized)) return exact[normalized];
    if (groupPrefixes.some(p => normalized.startsWith(p))) return groupSource;
    if (/^assets\//i.test(normalized)) return unknownSource;
    try {
      const url = new URL(raw, document.baseURI);
      const domain = url.hostname.toLowerCase();
      if (domain.endsWith('.thanhnien.vn') || domain === 'thanhnien.vn') return { label: 'Báo Thanh Niên; xem bài gốc để biết tác giả' };
      if (domain.endsWith('.tuoitre.vn') || domain === 'tuoitre.vn') return { label: 'Báo Tuổi Trẻ; xem bài gốc để biết tác giả' };
      if (domain.endsWith('.vov.vn') || domain === 'vov.vn') return { label: 'VOV; xem bài gốc để biết tác giả' };
      if (domain.endsWith('.xanhx.vn') || domain === 'xanhx.vn') return { label: 'XANH EWEC; xem bài gốc để biết tác giả' };
      if (domain.endsWith('.congluan.vn') || domain === 'congluan.vn') return { label: 'Báo Nhà báo và Công luận; xem bài gốc để biết tác giả' };
      if (domain.endsWith('.tuoitre.vn') || domain.endsWith('.baochinhphu.vn')) return { label: 'Báo Điện tử Chính phủ; xem bài gốc để biết tác giả' };
      if (domain.includes('wikimedia.org')) return { label: 'Wikimedia Commons; cần đối chiếu tác giả và giấy phép' };
      if (domain.includes('baomoi') || domain.includes('bmcdn.me')) return { label: 'Báo Mới (nguồn đăng lại); chưa rõ ảnh gốc' };
      return { label: 'Chưa xác minh tác giả và trang đăng gốc' };
    } catch {
      return unknownSource;
    }
  }

  function creditText(meta, prefix) {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(prefix || 'Nguồn ảnh: '));
    if (meta.url) {
      const a = document.createElement('a');
      a.href = meta.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = meta.label;
      fragment.append(a);
    } else {
      fragment.append(document.createTextNode(meta.label));
    }
    return fragment;
  }
  function creditNode(meta, extraClass) {
    const el = document.createElement('small');
    el.className = 'image-source-credit' + (extraClass ? ' ' + extraClass : '');
    el.append(creditText(meta));
    return el;
  }
  function hasAttribution(caption) {
    if (!caption) return false;
    if (caption.querySelector('.image-source-credit')) return true;
    const text = caption.textContent || '';
    return /(?:nguồn\s*(?:ảnh)?\s*:|ảnh\s*[:：]|ảnh do\s|tác giả\s*:|CC BY|Wikimedia Commons)/i.test(text) ||
      !!caption.querySelector('a[href^="https://"],a[href^="http://"]');
  }
  function placeForFigure(img, meta, figure) {
    const cap = Array.from(figure.children).find(el => el.tagName === 'FIGCAPTION');
    if (cap) {
      if (!hasAttribution(cap)) cap.append(creditNode(meta));
    } else {
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'generated-photo-caption';
      figcaption.append(creditNode(meta));
      figure.append(figcaption);
    }
  }
  function addOverlay(img, meta, container) {
    if (!container.querySelector(':scope > .image-source-credit')) {
      container.append(creditNode(meta, 'image-source-overlay'));
    }
  }
  function creditComparison(comparison) {
    if (comparison.dataset.imageCreditsDone === '1') return;
    comparison.dataset.imageCreditsDone = '1';
    const images = comparison.querySelectorAll('img');
    if (!images.length) return;
    const note = document.createElement('p');
    note.className = 'image-source-credit image-source-comparison';
    const sources = Array.from(images).map(img => getSource(img)).filter(Boolean);
    if (!sources.length) return;
    sources.forEach((meta, i) => {
      if (i) note.append(' · ');
      note.append(creditText(meta, sources.length > 1 ? 'Ảnh ' + (i + 1) + ': ' : 'Nguồn ảnh: '));
    });
    const help = comparison.nextElementSibling;
    (help && help.classList.contains('compare-help') ? help : comparison).insertAdjacentElement('afterend', note);
  }
  function processImage(img) {
    if (img.dataset.imageCreditDone === '1') return;
    img.dataset.imageCreditDone = '1';
    if (img.closest('.map-pin, .creative-photo-preview, .creative-photo-card, .cover-postcard, .station-video, .svg-library')) return;
    const meta = getSource(img);
    if (!meta) return;
    const comparison = img.closest('.compare-wrap');
    if (comparison) {
      creditComparison(comparison);
      return;
    }
    const figure = img.closest('figure');
    if (figure && !figure.classList.contains('cover-frame')) {
      placeForFigure(img, meta, figure);
      return;
    }
    if (figure && figure.classList.contains('cover-frame')) {
      placeForFigure(img, meta, figure);
      return;
    }
    // Với thẻ ảnh chính, ghi nguồn thành một dòng NGAY DƯỚI ảnh.
    const imageFrame = img.closest('.touch-image, .route-image, .point-card-image, .experience-head, .editorial-image');
    if (imageFrame) {
      if (!imageFrame.nextElementSibling || !imageFrame.nextElementSibling.classList.contains('image-source-under')) {
        imageFrame.insertAdjacentElement('afterend', creditNode(meta, 'image-source-under'));
      }
      return;
    }
    // Những khung ảnh phủ nội dung chỉ có thể đặt dòng nguồn gọn sát mép dưới.
    const overlay = img.closest('.story-visual');
    if (overlay) {
      addOverlay(img, meta, overlay);
      return;
    }
    const galleryButton = img.closest('button[data-action="gallery"]');
    if (galleryButton) {
      galleryButton.append(creditNode(meta, 'image-source-gallery'));
      return;
    }
    const photoLink = img.closest('.interview-photo-grid a');
    if (photoLink) {
      addOverlay(img, meta, photoLink);
      return;
    }
    const photoContainer = img.parentElement;
    if (photoContainer) {
      const node = creditNode(meta);
      (photoContainer.tagName === 'A' ? photoContainer : img).insertAdjacentElement('afterend', node);
    }
  }

  let scheduled = false;
  function refreshCredits() {
    scheduled = false;
    document.querySelectorAll('img').forEach(processImage);
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(refreshCredits);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });
})();
