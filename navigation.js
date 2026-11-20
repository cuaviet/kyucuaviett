'use strict';

const stepPaths = ['bat-dau', 'thu-doan', 'hinh-anh', 'nghe', 'kham-pha', 'ghi-nho', 'ky-uc', 'di-tiep'];
const stationHash = (id, step) => '#cham-' + id + (step ? '/' + stepPaths[step] : '');
const homeHash = () => location.hash.match(/^#cham-[1-5](?:\/[^/]+)?$/);
const resumeKey = 'cham-cua-viet-last-step';
const compactSteps = matchMedia('(max-width: 800px)');
let returnHash = '#memory-map';
let stationOpener = null;

function pauseStationVideos() {
  experience.querySelectorAll('video').forEach(video => video.pause());
}

document.addEventListener('click', event => {
  if (experience.open || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const opener = event.target.closest('[data-action="select"], [data-action="open-point"], [data-action="continue"], a[href^="#cham-"]');
  if (!opener || opener.closest('dialog')) return;
  stationOpener = opener;
  if (opener.matches('a')) returnHash = location.hash;
}, true);

function lastStep() {
  try {
    const saved = JSON.parse(localStorage.getItem(resumeKey));
    if (saved && points.some(point => point.id === saved.id) && stepPaths[saved.step]) return saved;
  } catch {}
  return null;
}

function writeStationAddress() {
  const hash = stationHash(currentPoint, currentStep);
  if (location.hash !== hash) history.replaceState(null, '', hash);
  try {
    localStorage.setItem(resumeKey, JSON.stringify({ id: currentPoint, step: currentStep }));
  } catch {}
}

const showOriginalPoint = openPoint;
openPoint = function (id, step = 0) {
  if (!points.some(point => point.id === id)) return;
  if (!homeHash()) {
    returnHash = location.hash;
    history.pushState(null, '', stationHash(id, step));
  }
  showOriginalPoint(id);
  if (step) {
    currentStep = step;
    renderExperience();
  }
  writeStationAddress();
  experience.scrollTop = 0;
  $('.experience-head [data-action="close"]')?.focus({ preventScroll: true });
  revealActiveStep();
};

function revealActiveStep() {
  const nav = $('.step-nav', experience);
  const active = $('.step-tab.active', experience);
  if (!nav || !active) return;
  nav.setAttribute('aria-orientation', compactSteps.matches ? 'horizontal' : 'vertical');
  if (compactSteps.matches && nav.scrollWidth > nav.clientWidth) {
    const tab = active.getBoundingClientRect();
    const rail = nav.getBoundingClientRect();
    nav.scrollLeft += tab.left - rail.left + (tab.width - rail.width) / 2;
  }
}

compactSteps.addEventListener?.('change', revealActiveStep);

function openAddress() {
  const requested = homeHash()?.[0].match(/^#cham-([1-5])(?:\/([a-z-]+))?$/);
  if (requested) {
    const step = Math.max(0, stepPaths.indexOf(requested[2]));
    openPoint(Number(requested[1]), step);
  } else if (experience.open) {
    closeDialog(experience);
  }
}

window.addEventListener('hashchange', openAddress);
experience.addEventListener('close', () => {
  if (experience.open) return;
  if (homeHash()) history.replaceState(null, '', returnHash || location.pathname + location.search);
  pauseStationVideos();
  const opener = stationOpener;
  stationOpener = null;
  if (opener?.isConnected) opener.focus({ preventScroll: true });
  else if (opener?.dataset.id) {
    const className = opener.matches('.map-pin') ? '.map-pin' : '.point-card';
    $(className + '[data-id="' + opener.dataset.id + '"]')?.focus({ preventScroll: true });
  }
});
window.addEventListener('pagehide', pauseStationVideos);

const openOriginalUtility = showUtility;
showUtility = function (title, markup) {
  pauseStationVideos();
  openOriginalUtility(title, markup);
};

const originalStationMarkup = stepMarkup;
const chamTwoPhotos = [
  ['IMG_3733.jpeg', 'Học sinh chụp ảnh cùng người kể chuyện'],
  ['IMG_3728.jpeg', 'Ảnh các giấy chứng nhận dũng sĩ'],
  ['IMG_3723.jpeg', 'Ảnh giấy chứng nhận huy hiệu 50 năm tuổi Đảng'],
  ['IMG_3722.jpeg', 'Ảnh huân chương kháng chiến'],
  ['IMG_3721.jpeg', 'Ảnh kỷ niệm chương chiến sĩ cách mạng bị địch bắt tù, đày'],
  ['IMG_3720.jpeg', 'Ảnh huân chương độc lập'],
  ['IMG_3719.jpeg', 'Ảnh tập thể được lưu giữ trong khung'],
  ['IMG_3726.jpeg', 'Ảnh tư liệu các giấy chứng nhận dũng sĩ'],
  ['IMG_3727.jpeg', 'Ảnh các giấy chứng nhận dũng sĩ chụp trực diện']
];

function chamTwoPhotoGallery() {
  return `<section class="interview-photo-section" aria-labelledby="interview-photo-heading">
    <h4 id="interview-photo-heading">Hình ảnh tư liệu</h4>
    <p>Hình ảnh do nhóm dự án cung cấp. Chọn ảnh để xem lớn.</p>
    <div class="interview-photo-grid">${chamTwoPhotos.map(([name, description]) =>
      `<a href="assets/cham-2-anh-tu-lieu/${name}" target="_blank" rel="noopener noreferrer" aria-label="Xem lớn: ${esc(description)}"><img src="assets/cham-2-anh-tu-lieu/${name}" alt="${esc(description)}" loading="lazy"></a>`).join('')}</div>
  </section>`;
}

function chamThreePhotoGallery() {
  const photos = [
    ['anh-2.webp', 'Hình ảnh các bằng khen và giấy chứng nhận trong nhà'],
    ['anh-3.webp', 'Hình ảnh tư liệu về các bằng khen được lưu giữ'],
    ['anh-4.webp', 'Hình ảnh các giấy khen được lưu giữ'],
    ['anh-5.webp', 'Hình ảnh nhóm học sinh chụp cùng người kể chuyện']
  ];
  return `<section class="interview-photo-section" aria-labelledby="cham-three-photo-heading">
    <h4 id="cham-three-photo-heading">Hình ảnh tư liệu</h4>
    <p>Hình ảnh do nhóm dự án cung cấp. Chọn ảnh để xem lớn.</p>
    <div class="interview-photo-grid">${photos.map(([name, description]) =>
      `<a href="assets/cham-3-anh-tu-lieu/${name}" target="_blank" rel="noopener noreferrer" aria-label="Xem lớn: ${esc(description)}"><img src="assets/cham-3-anh-tu-lieu/${name}" alt="${esc(description)}" loading="lazy"></a>`).join('')}</div>
  </section>`;
}

const interviewPrompts = [
  'Theo lời kể, điều gì đã thay đổi nhiều nhất ở vùng cửa biển?',
  'Chi tiết nào trong lời kể giúp bạn hiểu thêm về Cửa Việt? Bạn sẽ đối chiếu với tư liệu nào?',
  'Nếu được hỏi thêm một câu, bạn muốn hỏi người kể chuyện điều gì?',
  'Người kể đã nhắc đến những kinh nghiệm hoặc nếp sinh hoạt nào của cư dân làng biển?',
  'Bạn muốn giới thiệu Cửa Việt với người lần đầu đến đây bằng câu chuyện nào?'
];
const geographicTopics = [
  ['Sông Thạch Hãn', 'Dòng sông dẫn nước từ đất liền về Cửa Việt rồi đổ ra biển Đông. Đường thủy gắn vùng cửa biển với các địa bàn ở phía trong.', {
    src: 'assets/cua-song-thach-han.webp',
    width: 1200,
    height: 675,
    caption: 'Cửa sông Thạch Hãn tại Cửa Việt nhìn từ trên cao.'
  }],
  ['Cảng Cửa Việt', 'Vị trí ở cửa sông giúp cảng kết nối vận tải đường biển, vận chuyển hàng hóa và dịch vụ phục vụ kinh tế địa phương.', {
    src: 'https://cdn.congluan.vn/images/eK-uuSns_cDGy6VYdfZhUFXXZk7nVbY8TrzVSIE-c5k/anh-41.jpg.avif',
    width: 1000,
    height: 586,
    caption: 'Hoạt động bốc xếp hàng hóa tại cảng Cửa Việt.',
    source: 'https://congluan.vn/quang-tri-hang-chuc-ho-dan-song-mon-vi-du-an-mo-rong-cang-cua-viet-post326674.html',
    credit: 'V.T / Nhà báo và Công luận'
  }],
  ['Biển Đông và cư dân ven biển', 'Khai thác thủy sản, dịch vụ và du lịch là những hoạt động giúp nhận ra nhịp sống hôm nay ở vùng cửa biển.', {
    src: 'assets/nhip-song-ben-ca.webp',
    width: 1200,
    height: 800,
    caption: 'Người dân đưa cá lên bờ tại cảng cá Bắc Cửa Việt.',
    source: 'https://vov.vn/kinh-te/ngu-dan-quang-tri-ron-rang-phien-bien-cuoi-nam-post1148171.vov',
    credit: 'VOV'
  }]
];
const geographyTimeline = [
  ['Thời chúa Nguyễn', 'Tài liệu Chạm 01 ghi lại việc Nguyễn Hoàng đi qua vùng cửa biển trên đường đến Ái Tử năm 1558, cùng vai trò giao thương của bến thuyền.'],
  ['Thời kỳ chiến tranh', 'Cảng là đầu mối giao thông đường thủy và địa bàn có ý nghĩa chiến lược. Tư liệu về tháng 1/1973 được trình bày tại Chạm 02.'],
  ['Từ thời kỳ đổi mới đến nay', 'Hoạt động cảng biển, nghề cá, hậu cần thủy sản, dịch vụ và du lịch góp phần thay đổi diện mạo vùng cửa biển.']
];
const creativeTopics = [
  ['Cửa Việt qua ống kính trẻ', 'Chọn một góc biển hoặc một hoạt động đời thường. Chụp ảnh và viết chú thích ghi địa điểm, thời gian, điều bạn muốn giới thiệu.'],
  ['Cửa Việt qua sắc màu nghệ thuật', 'Thử phác một tranh, poster, bài thơ hoặc bài viết ngắn về chi tiết khiến mình nhớ nhất.'],
  ['Cửa Việt – Điểm hẹn du lịch', 'Đề xuất một trải nghiệm về cảnh quan, văn hóa hoặc ẩm thực. Ghi rõ ai có thể tham gia và cần chuẩn bị gì.'],
  ['Cửa Việt xanh trong tương lai', 'Chọn một việc cụ thể để giảm rác nhựa, giữ bờ biển sạch hoặc giới thiệu du lịch có trách nhiệm.']
];

function topicMarkup(items) {
  return '<div class="station-topics">' + items.map(([title, description, photo]) => {
    let figure = '';
    if (photo) {
      const src = esc(photo.src);
      const caption = esc(photo.caption);
      const credit = photo.source
        ? ` · <a href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer">${esc(photo.credit)}</a>`
        : '';
      figure = `<figure class="station-monument">
        <a href="${src}" target="_blank" rel="noopener noreferrer" aria-label="Xem ảnh lớn: ${caption}">
          <img src="${src}" width="${photo.width}" height="${photo.height}" alt="${caption}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        </a>
        <figcaption>${caption}${credit}</figcaption>
      </figure>`;
    }
    return `<details><summary>${esc(title)}</summary><p>${esc(description)}</p>${figure}</details>`;
  }).join('') + '</div>';
}

let mediaCatalog;
function loadMediaCatalog() {
  if (!mediaCatalog) {
    mediaCatalog = fetch('media-catalog.json').then(response => {
      if (!response.ok) throw new Error('Không tải được danh sách video.');
      return response.json();
    }).catch(error => {
      mediaCatalog = null;
      throw error;
    });
  }
  return mediaCatalog;
}

function formatTime(seconds) {
  return Math.floor(seconds / 60) + ':' + two(seconds % 60);
}

function mediaShell(key, title) {
  return `<div class="station-video" data-video="${key}" data-video-title="${esc(title)}"><p role="status">Đang chuẩn bị video…</p></div>`;
}

function initPlayer(container) {
  loadMediaCatalog().then(catalog => {
    if (!container.isConnected) return;
    const clips = catalog[container.dataset.video];
    if (!Array.isArray(clips) || !clips.length) throw new Error("Không có video cho điểm chạm này.");
    const title = container.dataset.videoTitle;
    const choices = clips.length > 1 ? `<div class="station-chapters" role="group" aria-label="Chọn phần video">${clips.map((clip, i) =>
      `<button type="button" data-chapter="${i}" aria-pressed="${i === 0}">Phần ${i + 1}<small>${formatTime(clip.start)}–${formatTime(clip.end)}</small></button>`).join('')}</div>` : '';
    container.innerHTML = `<figure>${choices}<video controls playsinline preload="none" aria-label="${esc(title)}">Trình duyệt chưa hỗ trợ phát video.</video>
      <p class="media-notice" role="status" hidden>Video tạm thời chưa tải được. <button type="button" class="btn btn-outline">Thử lại</button></p>
      <div class="video-toolbar"><button type="button" class="btn btn-primary video-toggle">Phát video</button></div>
      <figcaption>Video tư liệu do nhóm dự án cung cấp.${clips.length > 1 ? ' Bạn có thể chuyển đến từng phần hoặc phát liên tục từ đầu.' : ''}</figcaption></figure>`;
    const video = $('video', container);
    const notice = $('.media-notice', container);
    const toggle = $('.video-toggle', container);
    let currentIndex = 0;
    let playRequest = 0;

    function playSelected() {
      const request = ++playRequest;
      video.play().catch(error => {
        if (request === playRequest && video.isConnected && error.name !== "AbortError") notice.hidden = false;
      });
    }

    function select(index, play = false) {
      const clip = clips[index];
      if (!clip) return;
      playRequest++;
      currentIndex = index;
      video.pause();
      notice.hidden = true;
      video.poster = clip.poster;
      video.src = clip.path;
      $$('[data-chapter]', container).forEach((choice, i) => choice.setAttribute('aria-pressed', String(i === index)));
      if (play) playSelected();
    }

    toggle.addEventListener('click', () => {
      if (video.paused) playSelected();
      else video.pause();
    });
    video.addEventListener('play', () => { toggle.textContent = 'Tạm dừng'; });
    video.addEventListener('pause', () => { toggle.textContent = 'Phát video'; });
    select(0);
    video.addEventListener('ended', () => {
      if (currentIndex + 1 < clips.length) select(currentIndex + 1, true);
      else toggle.textContent = 'Phát lại';
    });
    video.addEventListener('error', () => { notice.hidden = false; });
    $('button', notice).addEventListener('click', () => select(currentIndex, true));
    $$('[data-chapter]', container).forEach(choice => choice.addEventListener('click', () =>
      select(Number(choice.dataset.chapter))));
  }).catch(() => {
    if (!container.isConnected) return;
    container.innerHTML = '<p class="media-notice" role="status">Danh sách video chưa tải được. <button type="button" class="btn btn-outline">Thử tải lại</button></p>';
    $('button', container).addEventListener('click', () => {
      container.innerHTML = '<p role="status">Đang chuẩn bị video…</p>';
      initPlayer(container);
    });
  });
}

const groupPhotoAlbums = {
  1: [
    ['3985', 'Khu dân cư và đường giao nhau nhìn từ trên cao.'],
    ['3986', 'Cổng chào với hình sóng biển ở khu du lịch Cửa Việt.']
  ],
  2: [
    ['4016', 'Các chiến sĩ dâng hương tại nơi tưởng niệm. Ảnh hoạt động tri ân hiện nay.']
  ],
  3: [
    ['3994', 'Các chiến sĩ và người dân trên tàu. Ảnh minh họa cho những câu chuyện về người gắn bó với vùng biển.']
  ],
  4: [
    ['3959', 'Những đội đua thuyền đi qua dưới chân cầu.'],
    ['4006', 'Thuyền thúng và tàu cá bên bờ.']
  ],
  5: [
    ['3961', 'Toàn cảnh khu cổng chào ven biển nhìn từ trên cao.'],
    ['3992', 'Sân khấu và không gian sự kiện ven biển về đêm.']
  ]
};

function groupPhotoAlbum(id) {
  const figures = groupPhotoAlbums[id].map(([photo, caption]) => {
    const path = 'assets/anh-nhom/img-' + photo + '.webp';
    return `<figure><a href="${path}" target="_blank" rel="noopener noreferrer" aria-label="Xem ảnh lớn: ${esc(caption)}"><img src="${path}" alt="${esc(caption)}" loading="lazy"></a><figcaption>${esc(caption)}</figcaption></figure>`;
  }).join('');
  return `<section class="interview-photo-section" aria-labelledby="group-photo-heading"><h4 id="group-photo-heading">Ảnh do nhóm dự án cung cấp</h4><p>Chọn ảnh để xem lớn.</p><div class="station-gallery">${figures}</div></section>`;
}

stepMarkup = function (point) {
  const { id } = point;
  if (currentStep === 3) {
    const prompts = id >= 3 ? stationDocuments[id][4].html : '';
    const chapterNote = id === 2 ? '<p>Đối chiếu lời kể với các mốc và video tư liệu năm 1973 trong phần Khám phá.</p>' : '';
    return `<div class="station-body"><h3>Nghe người thật kể</h3>${chapterNote}${mediaShell('cham-' + id, 'Nghe người thật kể — Chạm ' + two(id))}${id === 2 ? chamTwoPhotoGallery() : id === 3 ? chamThreePhotoGallery() : ''}
      <div class="read-prompt"><strong>Sau khi xem</strong><p>${interviewPrompts[id - 1]}</p></div>
      ${prompts ? `<div class="station-topics"><details><summary>Gợi ý phỏng vấn</summary>${prompts}</details></div>` : ''}
      <div class="station-quicklinks"><button class="btn btn-outline" data-action="step" data-step="6">Ghi lại cảm nhận</button><button class="btn btn-outline" data-action="step" data-step="4">Mở phần khám phá</button></div></div>`;
  }
  if (currentStep === 4 && id === 1) {
    return `<div class="station-body"><h3>Nơi dòng sông gặp biển</h3><p>Cửa Việt nằm ở phía đông Quảng Trị, nơi sông Thạch Hãn đổ ra biển Đông. Chọn từng chủ đề để tìm hiểu mối liên hệ giữa dòng sông, cảng và đời sống cư dân ven biển.</p>
      ${topicMarkup(geographicTopics)}<figure class="station-monument"><img src="assets/toan-canh-cua-viet.webp" alt="Toàn cảnh vùng cửa sông và bờ biển Cửa Việt từ trên cao"><figcaption>Toàn cảnh Cửa Việt · Ảnh do nhóm dự án cung cấp.</figcaption></figure>
      <h4>Cửa Việt qua các thời kỳ</h4>${topicMarkup(geographyTimeline)}
      <div class="read-prompt">${point.prompt}</div><div class="station-quicklinks"><a class="btn btn-outline" href="${stationHash(2, 4)}">Tìm hiểu lịch sử ở Chạm 02</a></div>
      <p class="station-source">Theo tài liệu Chạm 01 – Hoàn thiện.</p></div>`;
  }
  if (currentStep === 4 && id === 2) {
    const copy = originalStationMarkup(point).split('<section class="discovery-video">')[0];
    return `${copy}<h3>Tư liệu trận Cửa Việt năm 1973</h3>${mediaShell('cham-2-tu-lieu', 'Tư liệu trận Cửa Việt năm 1973')}`;
  }
  if (currentStep === 4 && id === 5) {
    return `<div class="station-body"><h3>Bốn không gian sáng tạo</h3>
      <figure class="station-monument"><img src="${stationAssets['5_image1']}" alt="Dải bờ biển Cửa Việt nhìn từ trên cao"><figcaption>Bờ biển Cửa Việt · Tài liệu Chạm 05.</figcaption></figure>
      <div class="station-topics">${creativeTopics.map(([title, description]) =>
        `<details><summary>${esc(title)}</summary><p>${esc(description)}</p><button class="btn btn-outline" data-action="project" data-type="${esc(title)}">Viết ý tưởng</button></details>`).join('')}</div>
      <button class="btn btn-primary" data-action="step" data-step="7" data-open-survey>Mở phiếu khảo sát ${icon('arrow')}</button>
      <p class="station-source">Theo tài liệu Chạm 05 – Hoàn thiện.</p></div>`;
  }
  const markup = originalStationMarkup(point);
  if (currentStep === 2 && groupPhotoAlbums[id]) return markup + groupPhotoAlbum(id);
  if (currentStep === 0) {
    return markup + `<div class="station-quicklinks" aria-label="Lối tắt trong chạm"><button class="btn btn-outline" data-action="step" data-step="2">Xem hình ảnh</button><button class="btn btn-outline" data-action="step" data-step="3">Xem video lời kể</button><button class="btn btn-outline" data-action="step" data-step="4">Đọc nội dung</button></div>`;
  }
  return markup;
};

const drawExperience = renderExperience;
renderExperience = function (focus = false) {
  pauseStationVideos();
  drawExperience(focus);
  revealActiveStep();
  $$('[data-video]', experience).forEach(initPlayer);
};

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (['step', 'project'].includes(button.dataset.action)) {
    writeStationAddress();
    experience.scrollTop = button.dataset.action === 'project' ? experience.scrollTop : 0;
    revealActiveStep();
    if (button.hasAttribute('data-open-survey')) {
      const survey = $('#station-survey', experience)?.closest('details');
      if (survey) {
        survey.open = true;
        $('summary', survey)?.focus({ preventScroll: true });
        survey.scrollIntoView({ block: 'start' });
      }
    }
  }
  if (button.dataset.action === 'bank-answer') {
    const replacement = `[data-action="bank-answer"][data-q="${button.dataset.q}"][data-value="${button.dataset.value}"]`;
    $(replacement, experience)?.focus({ preventScroll: true });
  }
});
document.addEventListener('click', event => {
  const button = event.target.closest('[data-action="continue"]');
  if (!button) return;
  const saved = lastStep();
  if (!saved) return;
  event.stopImmediatePropagation();
  openPoint(saved.id, saved.step);
}, true);
document.addEventListener('keydown', event => {
  if (event.defaultPrevented && experience.open && event.target.matches('.step-tab')) writeStationAddress();
});

$('#story-shortcuts').innerHTML = '<p>Video lời kể theo điểm chạm</p><ul>' + points.map(point =>
  `<li><a href="${stationHash(point.id, 3)}" aria-label="Video Chạm ${two(point.id)}: ${esc(point.title)}">Chạm ${two(point.id)}</a></li>`).join('') + '</ul>';
openAddress();

// Replay entrances only after an item has fully left the viewport.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealSelector = '.section-heading, .route-card, .touch-tile, .map-canvas, .journey-editorial, .point-card, .story-visual, .story-copy, .new-gallery button, .creation-options button, .passport-banner, .about-intro, .about-accordions details, .closing h2, .closing .btn';
  const observed = new WeakSet();
  const entrySides = new WeakMap();

  // The gap between the two observer boundaries avoids replay as an item moves at the edge.
  const leaveObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting || !entry.target.isConnected) continue;
      const { target, boundingClientRect, rootBounds } = entry;
      entrySides.set(target, boundingClientRect.bottom <= (rootBounds?.top ?? 0) ? 'from-top' : 'from-bottom');
      delete target.dataset.revealEntry;
    }
  }, { rootMargin: '36px 0px' });

  const enterObserver = new IntersectionObserver(entries => {
    for (const { isIntersecting, target } of entries) {
      const side = entrySides.get(target);
      if (!isIntersecting || !side || !target.isConnected) continue;
      entrySides.delete(target);
      if (!target.matches(':focus-within')) target.dataset.revealEntry = side;
    }
  }, { rootMargin: '-26px 0px' });

  function registerRevealItems(root) {
    root.querySelectorAll(revealSelector).forEach(element => {
      if (observed.has(element)) return;
      observed.add(element);
      const rect = element.getBoundingClientRect();
      if (rect.bottom <= 0) entrySides.set(element, 'from-top');
      else if (rect.top >= window.innerHeight) entrySides.set(element, 'from-bottom');
      const position = Array.prototype.indexOf.call(element.parentElement.children, element);
      element.style.setProperty('--reveal-delay', (position % 3) * 60 + 'ms');
      leaveObserver.observe(element);
      enterObserver.observe(element);
    });
  }
  registerRevealItems(document);

  const grid = document.getElementById('point-grid');
  new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.removedNodes) {
        if (!observed.delete(node)) continue;
        leaveObserver.unobserve(node);
        enterObserver.unobserve(node);
        entrySides.delete(node);
      }
    }
    registerRevealItems(grid);
  }).observe(grid, { childList: true });

  // Replay the entrance when a visitor opens or switches a point.
  const openPointWithMotion = openPoint;
  openPoint = function (id, step = 0) {
    experience.classList.remove('point-enter');
    openPointWithMotion(id, step);
    void experience.offsetWidth;
    experience.classList.add('point-enter');
  };
}
