/* CHẠM CỬA VIỆT – chú thích nguồn ảnh cho website và 5 Chạm.
 * Chỉ nêu tác giả/trang báo nếu tài liệu dự án có thông tin hỗ trợ.
 * Không suy diễn quyền tác giả từ tên tệp hoặc việc nhóm cung cấp ảnh.
 * Giữ nguyên ghi nguồn bên ngoài và ảnh lịch sử có xuất xứ riêng.
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

  const groupPhotographer = { label: 'Tư liệu do nhóm nghiên cứu cung cấp; chưa xác nhận người chụp.' };

  const exact = {
    'assets/ben-cang-hien-nay.webp': { label: 'Nhóm nghiên cứu CHẠM CỬA VIỆT thực hiện.', prefix: 'Ảnh: ' },
    'assets/nhip-song-ben-ca.webp': { label: 'VOV', url: links.fishing },
    'assets/cua-viet-keo-luoi-rung.jpg': { label: 'S.H / XANH EWEC', url: links.xanh },
    'assets/cua-viet-u-chuop-nuoc-mam.avif': { label: 'Viết Hảo / Báo Nhà báo và Công luận', url: links.nuocmam },
    'assets/vietship-01-cuu-nan.jpg': { label: 'Báo Thanh Niên', url: links.thanhNien },
    'assets/anh-chien-su-1973.webp': { label: 'Ảnh tư liệu đăng trên Báo Dân Việt; chưa rõ tác giả gốc' },
    'assets/tu-lieu-62.webp': { label: 'Kenneth L. Fuller / U.S. DefenseImagery, 15/3/1967 · DM-ST-85-09352', url: 'https://commons.wikimedia.org/wiki/File:LCVP_LCU_and_LCM_on_Cua_Viet_river_1967.JPEG' },
    'assets/cua-viet-1967.webp': { label: 'Tư liệu năm 1967, ghi chú US Navy; chưa xác minh ảnh gốc' },
    'assets/song-thach-han-moi.webp': groupPhotographer,
    'assets/toan-canh-cua-viet.webp': groupPhotographer,
    'assets/cham-1-toan-canh-cua-viet.webp': groupPhotographer,
    'assets/cau-cua-viet.webp': groupPhotographer,
    'assets/cham-5-bai-bien-cong-chao-2026.jpg': groupPhotographer,
    'assets/cham-4-hai-san-ven-bien.webp': groupPhotographer
  };
  Object.assign(exact, {
  "assets/bo-bien-cua-viet.webp": {
    "label": "Sovaba Travel (trang đăng lại; chưa rõ tác giả gốc)",
    "url": "https://sovaba.travel/blog/bai-viet-nhung-diem-den-hot-trend-tai-quang-tri-nam-2025",
    "caption": "Bờ biển Cửa Việt nhìn từ trên cao, với thuyền nhỏ trên bãi cát."
  },
  "assets/cang-cua-viet.webp": {
    "label": "Ngọc Tân / Báo Đầu tư, 04/12/2025 (ngày đăng)",
    "url": "https://baodautu.vn/quang-tri-co-them-3-cang-bien-duoc-ap-dung-thi-thuc-dien-tu-e-visa-d451059.html",
    "caption": "Khu cảng Cửa Việt nhìn từ trên cao."
  },
  "assets/tuong-dai-chien-thang.webp": {
    "label": "Hoàng Diệu / Báo Hải quân Việt Nam, tháng 4/2025",
    "url": "https://baohaiquanvietnam.vn/tin-tuc/vung-3-hoan-thanh-cong-trinh-ton-tao-chinh-trang-tuong-dai-chien-thang-dac-cong-hai-quan-tai-cua-viet",
    "caption": "Cán bộ, chiến sĩ và đoàn viên chỉnh trang Đài Chiến thắng Đặc công Hải quân tại Cửa Việt."
  },
  "assets/anh-chien-su-1973.webp": {
    "label": "Báo Dân Việt (đăng lại từ Kiến Thức; chưa xác minh tác giả, ngày và địa điểm chụp)",
    "url": "https://danviet.vn/tran-cua-viet-vong-cung-kursk-trong-chien-tranh-viet-nam-7777949448-d689523.html",
    "caption": "Ảnh xe tăng và binh sĩ được dùng minh họa trong bài viết về trận Cửa Việt năm 1973."
  },
  "assets/cang-ca.webp": {
    "label": "Thiên Sơn / XANH EWEC, 02/07/2021 (ngày đăng)",
    "url": "https://xanhx.vn/media/mot-som-mai-hoi-ha-o-cang-ca-lon-nhat-quang-tri-10719.html",
    "caption": "Cảng cá Cửa Việt (xã Triệu An, huyện Triệu Phong theo địa danh khi bài đăng) lúc rạng sáng."
  },
  "assets/cho-ca.webp": {
    "label": "XANH EWEC, chùm ảnh của Thiên Sơn, 02/07/2021 (ngày đăng)",
    "url": "https://xanhx.vn/media/mot-som-mai-hoi-ha-o-cang-ca-lon-nhat-quang-tri-10719.html",
    "caption": "Hoạt động mua bán hải sản tại bến cá Cửa Việt."
  },
  "assets/thuyen-thung.webp": {
    "label": "Lữ Hành Việt Nam (bài ghi ảnh Internet; chưa rõ tác giả gốc)",
    "url": "https://luhanhvietnam.com.vn/du-lich/kham-pha-lang-chai-cua-viet-quang-tri.html",
    "caption": "Thuyền gỗ và thuyền thúng trên bãi biển; trang đăng giới thiệu làng chài Cửa Việt."
  },
  "assets/tau-thuyen.webp": {
    "label": "VOV, bài Ngư dân Quảng Trị rộn ràng phiên biển cuối năm (14/01/2025)",
    "url": "https://vov.vn/kinh-te/ngu-dan-quang-tri-ron-rang-phien-bien-cuoi-nam-post1148171.vov",
    "caption": "Tàu cá QT 92756-TS tại cảng cá Bắc Cửa Việt."
  },
  "assets/tu-lieu-22.webp": {
    "label": "Biểu trưng VOV; không phải ảnh tư liệu Cửa Việt"
  },
  "assets/anh-chup-ban-do.webp": {
    "label": "Google Earth; ảnh chụp màn hình, không phải ảnh thực địa"
  },
  "assets/le-hoi.webp": {
    "label": "Ảnh minh họa lễ cầu ngư; chưa xác minh địa điểm, thời điểm và nguồn gốc"
  },
  "assets/le-hoi-lang-bien.webp": {
    "label": "Ảnh minh họa nghi lễ ven biển; chưa xác minh địa điểm, thời điểm và nguồn gốc"
  },
  "assets/ben-cang-hien-nay.webp": {
    "label": "Nhóm nghiên cứu CHẠM CỬA VIỆT thực hiện.", "prefix": "Ảnh: "
  },
  "assets/cua-song-thach-han.webp": {
    "label": "Ảnh khu vực cảng/cửa sông; chưa tìm được bản đăng khớp chính xác"
  }
});
  Object.assign(exact, {
  "assets/tu-lieu-32.webp": {
    "caption": "Mã QR dẫn đến nội dung tham khảo.",
    "label": "Mã QR; không phải ảnh tư liệu."
  },
  "assets/tu-lieu-33.webp": {
    "caption": "Hình ảnh quảng bá du lịch có cổng chào Cửa Việt.",
    "label": "Chưa xác minh ảnh gốc; không dùng làm minh chứng thực địa."
  },
  "assets/tu-lieu-34.webp": {
    "caption": "Hoạt động mua bán cá.",
    "label": "Chưa xác minh tác giả, địa điểm, thời điểm chụp."
  },
  "assets/tu-lieu-35.webp": {
    "caption": "Người dân kéo lưới trên bãi biển.",
    "label": "Ảnh minh họa nghề đánh cá; chưa xác minh địa điểm, năm chụp và tác giả; không khẳng định chụp tại Cửa Việt."
  },
  "assets/tu-lieu-36.webp": {
    "caption": "Người dân mang lưới đánh cá.",
    "label": "Ảnh minh họa nghề đánh cá; chưa xác minh địa điểm, năm chụp và tác giả; không khẳng định chụp tại Cửa Việt."
  },
  "assets/tu-lieu-37.webp": {
    "caption": "Người đánh cá bằng dụng cụ nâng lưới.",
    "label": "Ảnh minh họa nghề đánh cá; chưa xác minh địa điểm, năm chụp và tác giả; không khẳng định chụp tại Cửa Việt."
  },
  "assets/tu-lieu-38.webp": {
    "caption": "Các đội đua thuyền rồng trên sông.",
    "label": "Chưa xác minh tác giả, địa điểm, thời điểm chụp."
  },
  "assets/tu-lieu-39.webp": {
    "caption": "Hoạt động đua thuyền truyền thống.",
    "label": "Chưa xác minh tác giả, địa điểm, thời điểm chụp."
  },
  "assets/tu-lieu-40.webp": {
    "caption": "Trao giải đua thuyền truyền thống tại Cửa Việt, ngày 29/3/2024 (theo phông sự kiện trong ảnh).",
    "label": "Chưa xác minh tác giả ảnh."
  },
  "assets/tu-lieu-41.webp": {
    "caption": "Thuyền cá và người lao động dưới ánh mặt trời.",
    "label": "Chưa xác minh tác giả, địa điểm, thời điểm chụp."
  },
  "assets/tu-lieu-44.webp": {
    "caption": "Cá được phơi trên các vỉ, nhìn từ trên cao.",
    "label": "Chưa xác minh tác giả, địa điểm, thời điểm chụp."
  },
  "assets/tu-lieu-47.webp": {
    "caption": "Người lao động phân loại cá tại bến vào sáng sớm.",
    "label": "XANH EWEC (theo dấu nhận diện trên ảnh; chưa xác minh chính xác bài đăng)."
  },
  "assets/tu-lieu-51.webp": {
    "caption": "Thuyền gỗ trên bãi cát ven biển.",
    "label": "Chưa xác minh tác giả, địa điểm, thời điểm chụp."
  },
  "assets/tu-lieu-52.webp": {
    "caption": "Hình ảnh quảng bá du lịch có cổng chào Cửa Việt.",
    "label": "Chưa xác minh ảnh gốc; không dùng làm minh chứng thực địa."
  },
  "assets/thuyen-va-ngu-cu.webp": {
    "caption": "Thuyền gỗ và ngư cụ trong ảnh đen trắng.",
    "label": "Ảnh minh họa nghề đánh cá; chưa xác minh địa điểm, năm chụp và tác giả; không khẳng định chụp tại Cửa Việt."
  },
  "assets/thuyen-danh-ca.webp": {
    "caption": "Tàu cá trên mặt nước.",
    "label": "Chưa xác minh tác giả, địa điểm, thời điểm chụp."
  },
  "assets/cua-bien-tu-tren-cao.webp": {
    "caption": "Khu vực cửa sông và cảng nhìn từ trên cao.",
    "label": "Chưa xác minh tác giả và thời điểm chụp."
  },
  "assets/anh-nhom/img-3986.webp": {
    "caption": "Cổng chào du lịch Cửa Việt và đoàn xe.",
    "label": "Tư liệu nhóm cung cấp; chưa xác nhận người chụp."
  },
  "assets/anh-nhom/img-4006.webp": {
    "caption": "Người dân và lực lượng hỗ trợ bên các thuyền thúng.",
    "label": "Tư liệu nhóm cung cấp; chưa xác nhận người chụp."
  },
  "assets/tuong-dai-lich-su.webp": {
    "caption": "Công trình tưởng niệm chiến thắng Cửa Việt.",
    "label": "Chưa xác minh tác giả và thời điểm chụp."
  }
});
  const groupPrefixes = [
    'assets/anh-nhom/',
    'assets/cham-2-anh-tu-lieu/',
    'assets/cham-3-anh-tu-lieu/'
  ];
  const groupSource = groupPhotographer;
  const unknownSource = { label: 'Ảnh sưu tầm; chưa xác minh tác giả, thời điểm và nguồn gốc.' };

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
    fragment.append(document.createTextNode(prefix || meta.prefix || 'Nguồn ảnh: '));
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
      if (meta.caption) { cap.textContent = meta.caption; cap.append(creditNode(meta)); }
      else if (!hasAttribution(cap)) cap.append(creditNode(meta));
    } else {
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'generated-photo-caption';
      if (meta.caption) figcaption.append(document.createTextNode(meta.caption+' '));
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
    // Chạm 02 đã có chú thích ngay dưới ảnh; tránh thêm dòng chữ nhỏ trùng lặp.
    if (comparison.hasAttribute('data-consolidated-caption')) return;
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
      if (meta.caption) note.append(meta.caption + ' ');
      note.append(creditText(meta, 'Nguồn ảnh: '));
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
    const galleryCard = img.closest('.gallery-card');
    if (galleryCard) {
      galleryCard.append(creditNode(meta, 'image-source-gallery'));
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
