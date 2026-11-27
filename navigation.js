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
  if (!compactSteps.matches) nav.setAttribute('aria-orientation', 'vertical');
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
function mePhotoGallery() {
  const photos = [
    ['ba-tu-lieu-bang-khen.webp', 'Bằng khen của Ủy ban Nhân dân Cách mạng tỉnh Quảng Trị trong bộ tư liệu được lưu giữ'],
    ['ba-tu-lieu-giay-chung-nhan.webp', 'Những giấy chứng nhận danh hiệu Dũng sĩ trong bộ tư liệu'],
    ['ba-gap-nhom-hoc-sinh.webp', 'Học sinh gặp gỡ và lắng nghe người kể chuyện trong chuyến sưu tầm tư liệu']
  ];
  return `<section class="interview-photo-section interview-photo-section--archive" aria-labelledby="cham-two-me-photo-heading">
    <h4 id="cham-two-me-photo-heading">Hình ảnh tư liệu từ cuộc gặp gỡ người kể chuyện</h4>
    <p>Những tấm ảnh, giấy chứng nhận và kỷ niệm do nhóm dự án sưu tầm, ghi lại. Chọn ảnh để xem nguyên bản.</p>
    <div class="interview-photo-grid interview-photo-grid--archive">${photos.map(([name, description]) =>
      `<figure class="interview-archive-card"><a href="assets/cham-3-anh-tu-lieu/${name}" target="_blank" rel="noopener noreferrer" aria-label="Xem lớn: ${esc(description)}"><img src="assets/cham-3-anh-tu-lieu/${name}" alt="${esc(description)}" loading="lazy"></a><figcaption>${esc(description)}</figcaption></figure>`).join('')}</div>
  </section>`;
}

const creativeWritingTemplates = [
  {title: 'Bưu thiếp quê hương', file: 'Buu_thiep_que_huong.txt', hint: 'Viết 50–80 chữ gửi một người bạn. Chọn một hình ảnh hoặc kỷ niệm ở Cửa Việt và kể vì sao bạn nhớ.', fields: ['Lời nhắn trên bưu thiếp']},
  {title: 'Phóng viên làng biển', file: 'Phong_vien_lang_bien.txt', hint: 'Chọn một người bạn muốn phỏng vấn và viết ba câu hỏi mở để người ấy kể lại trải nghiệm của mình.', fields: ['Câu hỏi 1', 'Câu hỏi 2', 'Câu hỏi 3']},
  {title: 'Một phút giới thiệu Cửa Việt', file: 'Mot_phut_gioi_thieu_Cua_Viet.txt', hint: 'Viết lời dẫn để đọc trong khoảng một phút. Đọc thử thành tiếng để chọn chi tiết đáng nhớ nhất.', fields: ['Mở đầu – Chào và giới thiệu chủ đề', 'Nội dung – Kể một câu chuyện hoặc giới thiệu một địa điểm', 'Kết – Gửi lời mời hoặc thông điệp']}
];

const creativeStorageKey = index => 'cham-cua-viet-creative-' + index;
function readCreativeEntry(index) {
  try { return JSON.parse(localStorage.getItem(creativeStorageKey(index))); }
  catch { return null; }
}
function creativeEntryMarkup(entry, template) {
  if (!entry) return '';
  return `<h3>Bài đã lưu</h3><p><strong>Họ và tên:</strong> ${esc(entry.name)}</p>
    ${template.fields.map((label, i) => `<p><strong>${esc(label)}</strong><br>${esc(entry.answers[i]).replace(/\n/g, '<br>')}</p>`).join('')}`;
}
document.addEventListener('click', event => {
  const button = event.target.closest('button[data-creative-template]');
  if (!button) return;
  const index = Number(button.dataset.creativeTemplate);
  const template = creativeWritingTemplates[index];
  if (!template) return;
  const saved = readCreativeEntry(index);
  showUtility(template.title, `<p>${template.hint}</p>
    <form class="note-form" data-creative-writing="${index}">
      <label for="creative-author">Họ và tên</label>
      <input id="creative-author" name="author" type="text" maxlength="100" autocomplete="name" value="${esc(saved?.name ?? '')}" required>
      ${template.fields.map((label, field) => `<label for="creative-${index}-${field}">${label}</label>
        <textarea id="creative-${index}-${field}" rows="${index === 0 ? 5 : 3}" maxlength="2000" required>${esc(saved?.answers?.[field] ?? '')}</textarea>`).join('')}
      <button class="btn btn-primary" type="submit">Lưu bài</button>
      <button class="btn btn-outline" type="submit" value="download">Tải bài về (.txt)</button>
      <p>Họ tên và bài viết được lưu riêng trên trình duyệt này.</p>
      <p role="status"></p>
    </form><section data-creative-saved>${creativeEntryMarkup(saved, template)}</section>`);
});
document.addEventListener('submit', event => {
  const form = event.target;
  if (!form.matches('[data-creative-writing]')) return;
  event.preventDefault();
  const index = Number(form.dataset.creativeWriting);
  const template = creativeWritingTemplates[index];
  const fields = [...form.querySelectorAll('textarea')];
  const answers = fields.map(field => field.value.trim());
  const status = form.querySelector('[role="status"]');
  const name = form.elements.author.value.trim();
  if (!name) {
    status.textContent = 'Hãy nhập họ và tên.';
    form.elements.author.focus();
    return;
  }
  const emptyIndex = answers.findIndex(answer => !answer);
  if (emptyIndex >= 0) {
    status.textContent = 'Hãy điền các mục còn trống trước khi tiếp tục.';
    fields[emptyIndex].focus();
    return;
  }
  if (index === 0) {
    const wordCount = answers[0].match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu)?.length || 0;
    if (wordCount < 50 || wordCount > 80) {
      status.textContent = `Bài có ${wordCount} chữ. Hãy chỉnh về 50–80 chữ trước khi tiếp tục.`;
      fields[0].focus();
      return;
    }
  }
  if (event.submitter?.value !== 'download') {
    const entry = { name, answers };
    try {
      localStorage.setItem(creativeStorageKey(index), JSON.stringify(entry));
      form.nextElementSibling.innerHTML = creativeEntryMarkup(entry, template);
      status.textContent = 'Đã lưu bài.';
    } catch {
      status.textContent = 'Trình duyệt không cho lưu bài. Bạn có thể tải bài về.';
    }
    return;
  }
  const content = [template.title, 'Họ và tên: ' + name, ...answers.map((answer, i) => template.fields[i] + '\n' + answer)].join('\n\n');
  const url = URL.createObjectURL(new Blob([content], {type: 'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = template.file;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'Đã yêu cầu tải bài.';
});

const interviewPrompts = [
  'Theo lời kể, điều gì đã thay đổi nhiều nhất ở vùng cửa biển?',
  'Chi tiết nào trong lời kể giúp em hiểu thêm về Cửa Việt? Vì sao?',
  'Nếu được hỏi thêm một câu, bạn muốn hỏi người kể chuyện điều gì?',
  'Người kể đã nhắc đến những kinh nghiệm hoặc nếp sinh hoạt nào của cư dân làng biển?',
  'Bạn muốn giới thiệu Cửa Việt với người lần đầu đến đây bằng câu chuyện nào?'
];
const geographicTopics = [
  ['Sông Thạch Hãn', 'Dòng sông dẫn nước từ đất liền về Cửa Việt rồi đổ ra biển Đông. Đường thủy gắn vùng cửa biển với các địa bàn ở phía trong.', {
    src: 'assets/toan-canh-cua-viet.webp',
    width: 1440,
    height: 704,
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
  ['Thời chúa Nguyễn', 'Năm 1558, đoàn thuyền của Nguyễn Hoàng đi qua Cửa Việt trước khi ông lập dinh ở Ái Tử. Từ cửa biển này, thuyền bè có thể theo sông Thạch Hãn vào sâu trong đất liền.'],
  ['Thời kỳ chiến tranh', 'Trong chiến tranh, cảng Cửa Việt giữ vị trí quan trọng trên tuyến đường thủy nối biển với vùng đất phía trong. Cuối tháng 1/1973, nơi đây diễn ra trận Cửa Việt, một dấu mốc trong lịch sử Quảng Trị.'],
  ['Từ thời kỳ đổi mới đến nay', 'Sau mỗi chuyến biển, ngư dân đưa hải sản về bến bán cho thương lái. Cùng với nghề cá, vận tải biển và du lịch mở thêm cơ hội làm ăn cho người dân Cửa Việt.']
];
/* Chạm 05: form ảnh là nội dung chính của từng mục, không cần JavaScript bổ sung để vẽ lên. */
function chamFivePhotoForm(category) {
  return `<div class="creative-photo-area" data-photo-category="${category}">
    <form class="creative-photo-form" data-photo-category="${category}">
      <label for="creative-photo-file-${category}">Tải ảnh lên</label>
      <input id="creative-photo-file-${category}" type="file" name="photo" accept="image/jpeg,image/png,image/webp" required>
      <div class="creative-photo-preview" aria-live="polite"></div>
      <label for="creative-photo-caption-${category}">Ghi chú dưới ảnh</label>
      <textarea id="creative-photo-caption-${category}" name="caption" rows="3" minlength="5" maxlength="220" required placeholder="Viết vài dòng về hình ảnh của bạn…"></textarea>
      <label class="creative-photo-consent"><input type="checkbox" name="consent" required>
        <span>Tôi đồng ý chia sẻ ảnh sau khi giáo viên duyệt.</span>
      </label>
      <p class="creative-photo-tip">Ảnh JPG, PNG hoặc WebP, tối đa 12 MB trước khi nén. Không đăng ảnh người khác nếu chưa được đồng ý.</p>
      <input class="creative-photo-trap" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn-primary creative-photo-submit" type="submit" disabled>Lưu ảnh và ghi chú</button>
      <p class="creative-photo-status" role="status">Đang kiểm tra kết nối lưu ảnh trực tuyến…</p>
    </form>
    <div class="creative-photo-gallery">
      <h4>Ảnh đã được chia sẻ</h4>
      <div class="creative-photo-items" data-photos-gallery="${category}"></div>
      <div class="creative-photo-personal" data-photos-mine="${category}"></div>
    </div>
  </div>`;
}

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
          <img src="${src}" width="${photo.width}" height="${photo.height}" alt="${caption}" loading="lazy" decoding="async" referrerpolicy="no-referrer"${photo.fallback ? ` onerror="this.onerror=null;this.parentElement.href='${esc(photo.fallback)}';this.width=1200;this.height=675;this.src='${esc(photo.fallback)}'"` : ''}>
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
    mediaCatalog = fetch('media-catalog.json?v=13').then(response => {
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
  loadMediaCatalog().then(async catalog => {
    if (!container.isConnected) return;
    const key = container.dataset.video;
    const clips = catalog[key];
    if (key === 'cham-3-quyen' && (!Array.isArray(clips) || !clips.length)) {
      container.remove();
      return;
    }
    if (!Array.isArray(clips) || !clips.length) throw new Error("Không có video cho điểm chạm này.");
    if (key === 'cham-3-quyen') {
      const oldPhotos = container.previousElementSibling;
      if (oldPhotos && oldPhotos.classList.contains('war-old-media')) oldPhotos.remove();
    }
    const title = container.dataset.videoTitle;
    const choices = clips.length > 1 ? `<div class="station-chapters" role="group" aria-label="Chọn phần video">${clips.map((clip, i) =>
      `<button type="button" data-chapter="${i}" aria-pressed="${i === 0}">${esc(clip.title || `Phần ${i + 1}`)}<small>${formatTime(clip.start)}–${formatTime(clip.end)}</small></button>`).join('')}</div>` : '';
    container.innerHTML = `<figure>${choices}<video controls playsinline preload="none" aria-label="${esc(title)}">Trình duyệt chưa hỗ trợ phát video.</video>
      <p class="media-notice" role="status" hidden>Video tạm thời chưa tải được. <button type="button" class="btn btn-outline">Thử lại</button></p>
      <div class="video-toolbar"><button type="button" class="btn btn-primary video-toggle">Phát video</button></div>
      <figcaption>${key === 'cham-4' ? 'Phỏng vấn bác Chiến.' : key === 'cham-2'
        ? 'Phỏng vấn mệ Trần Thị Lành (bí danh Trần Thị Quyền), du kích từng hoạt động tại xã Cửa Việt (Gio Hải cũ) trong kháng chiến chống Mỹ. Những ký ức được mệ chia sẻ là tư liệu quý để thế hệ trẻ tìm hiểu và trân trọng lịch sử quê hương.'
        : 'Video tư liệu do nhóm dự án cung cấp.' + (clips.length > 1 ? ' Bạn có thể chuyển đến từng phần hoặc phát liên tục từ đầu.' : '')}</figcaption></figure>`;
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
      const cap = container.querySelector('figcaption');
      cap.querySelector('.poster-note')?.remove();
      if (clip.poster) {
        video.poster = clip.poster;
        const photo = findPhoto(clip.poster);
        if (photo) {
          const note = document.createElement('small');
          note.className = 'photo-reference poster-note';
          note.textContent = 'Ảnh đại diện: ' + photo.caption + ' ' + photo.label;
          cap.append(note);
        }
      }
      else video.removeAttribute('poster');
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
    video.addEventListener('error', () => {
      const clip = clips[currentIndex];
      if (clip.fallback && video.getAttribute('src') !== clip.fallback) {
        // Trong thời gian tệp video mới đang được đưa lên, vẫn phát được video cũ.
        video.src = clip.fallback;
        video.load();
        return;
      }
      notice.hidden = false;
    });
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
  4: [
    ['3959', 'Những đội đua thuyền đi qua dưới chân cầu.'],
    ['4006', 'Thuyền thúng và tàu cá bên bờ.']
  ]
};

function groupPhotoAlbum(id) {
  const figures = groupPhotoAlbums[id].map(([photo, caption]) => {
    const path = 'assets/anh-nhom/img-' + photo + '.webp';
    return `<figure><a href="${path}" target="_blank" rel="noopener noreferrer" aria-label="Xem ảnh lớn: ${esc(caption)}"><img src="${path}" alt="${esc(caption)}" loading="lazy"></a><figcaption>${esc(caption)}</figcaption></figure>`;
  }).join('');
  return `<section class="interview-photo-section" aria-labelledby="group-photo-heading"><h4 id="group-photo-heading">Ảnh trong bộ sưu tập của dự án</h4><p>Chọn ảnh để xem lớn.</p><div class="station-gallery">${figures}</div></section>`;
}

stepMarkup = function (point) {
  const { id } = point;
  // Chỉ để trống bước “Nghe người thật kể” của Chạm 3.
  // Các bước khác của Chạm 3 vẫn hoạt động bình thường.
  if (id === 3 && currentStep === 3) {
    return `<div class="station-body"><h3>Nghe người thật kể</h3><video controls playsinline preload="metadata" aria-label="Video nghe người thật kể tại Chạm 3" style="display:block;width:100%;height:auto;aspect-ratio:16/9;background:#102526;border-radius:12px"><source src="media/cham-3-nghe-nguoi-that-ke.mp4?v=hd" type="video/mp4">Trình duyệt không hỗ trợ phát video MP4.</video><p class="source-note">Video do nhóm dự án CHẠM CỬA VIỆT cung cấp.</p></div>`;
  }
  if (currentStep === 3 && id === 2) {
    // Chỉ hiển thị đúng video + ảnh chuyển từ Chạm 03; không dùng tư liệu Chạm 02 cũ.
    return `<div class="station-body"><h3>Nghe người thật kể</h3>
      ${mediaShell('cham-2', 'Phỏng vấn mệ Trần Thị Lành (bí danh Trần Thị Quyền)')}
      ${mePhotoGallery()}
      <div class="read-prompt"><strong>Sau khi xem</strong><p>${interviewPrompts[1]}</p></div>
      <div class="station-quicklinks"><button class="btn btn-outline" data-action="step" data-step="6">Ghi lại cảm nhận</button><button class="btn btn-outline" data-action="step" data-step="4">Mở phần khám phá</button></div></div>`;
  }
  if (currentStep === 3) {
    const prompts = id >= 3 ? stationDocuments[id][4].html : '';
    return `<div class="station-body"><h3>Nghe người thật kể</h3>
      ${mediaShell('cham-' + id, id === 4 ? 'Phỏng vấn bác Chiến' : 'Nghe người thật kể — Chạm ' + two(id))}
      <div class="read-prompt"><strong>Sau khi xem</strong><p>${interviewPrompts[id - 1]}</p></div>
      ${prompts ? `<div class="station-topics"><details><summary>Gợi ý phỏng vấn</summary>${prompts}</details></div>` : ''}
      <div class="station-quicklinks"><button class="btn btn-outline" data-action="step" data-step="6">Ghi lại cảm nhận</button><button class="btn btn-outline" data-action="step" data-step="4">Mở phần khám phá</button></div></div>`;
  }
  if (currentStep === 4 && id === 1) {
    return `<div class="station-body"><h3>Nơi dòng sông gặp biển</h3><p>Cửa Việt nằm ở phía đông Quảng Trị, nơi sông Thạch Hãn đổ ra biển Đông. Chọn từng chủ đề để tìm hiểu mối liên hệ giữa dòng sông, cảng và đời sống cư dân ven biển.</p>
      ${topicMarkup(geographicTopics)}
      <h4>Cửa Việt qua các thời kỳ</h4>${topicMarkup(geographyTimeline)}
      <form class="cham-one-discovery-note" id="cham-one-discovery-note-form">
        <h4>Ghi chú của bạn</h4>
        <label for="cham-one-discovery-note-text">Điều gì về Cửa Việt khiến bạn nhớ nhất? Bạn muốn gìn giữ nét đẹp nào của vùng cửa biển?</label>
        <textarea id="cham-one-discovery-note-text" name="note" rows="4" minlength="3" maxlength="800" required placeholder="Viết cảm nhận hoặc chú thích của bạn tại đây…">${esc(state.notes[1]?.text || '')}</textarea>
        <div class="cham-one-discovery-note-actions">
          <button class="btn btn-primary" type="submit">Lưu ghi chú</button>
          <span class="cham-one-discovery-note-count"><span data-cham-one-note-length>${(state.notes[1]?.text || '').length}</span>/800 ký tự</span>
        </div>
        <p class="cham-one-discovery-note-status" role="status" aria-live="polite">${state.notes[1]?.text ? 'Đã có ghi chú được lưu trên thiết bị này. Bạn có thể chỉnh sửa rồi lưu lại.' : 'Ghi chú được lưu trên thiết bị của bạn và có thể xem lại trong Hộ chiếu ký ức.'}</p>
      </form>
      <div class="station-quicklinks"><a class="btn btn-outline" href="${stationHash(2, 4)}">Tìm hiểu lịch sử ở Chạm 02</a></div></div>`;
  }
  if (currentStep === 4 && id === 2) {
    const copy = originalStationMarkup(point).split('<section class="discovery-video">')[0];
    return `${copy}<h3>Tư liệu trận Cửa Việt năm 1973</h3>${mediaShell('cham-2-tu-lieu', 'Tư liệu trận Cửa Việt năm 1973')}`;
  }
  if (currentStep === 4 && id === 5) {
    // Mở sẵn bốn khu vực tải ảnh; không giấu biểu mẫu trong các thẻ details đóng.
    // Giữ nguyên chức năng lưu ảnh vào Firebase và duyệt của giáo viên.
    return `<div class="station-body cham-five-explore"><h3>Bốn không gian sáng tạo</h3>
      <figure class="station-monument"><img src="${stationAssets['5_image1']}" alt="Dải bờ biển Cửa Việt nhìn từ trên cao"><figcaption>Bờ biển Cửa Việt · Góc nhìn hôm nay.</figcaption></figure>
      <p class="cham-five-upload-guide">Chọn một trong bốn chủ đề dưới đây để tải ảnh, ghi chú và chia sẻ. Các mục tải ảnh được mở sẵn để bạn dễ sử dụng.</p>
      <div class="cham-five-upload-grid">${creativeTopics.map(([title, description], index) =>
        `<section class="cham-five-upload-card" aria-labelledby="cham-five-upload-title-${index}">
          <h4 id="cham-five-upload-title-${index}"><span class="cham-five-upload-number">${String(index + 1).padStart(2, '0')}</span> ${esc(title)}</h4>
          <p class="cham-five-upload-description">${esc(description)}</p>
          ${chamFivePhotoForm(index)}
        </section>`).join('')}</div>
      <button class="btn btn-primary" data-action="step" data-step="7" data-open-survey>Mở phiếu khảo sát ${icon('arrow')}</button>
      <p class="station-source">Mỗi chủ đề có chọn ảnh, xem trước, ghi chú và gửi ảnh để giáo viên duyệt trước khi công khai.</p></div>`;
  }
  const markup = originalStationMarkup(point);
  if (currentStep === 2 && id !== 4 && groupPhotoAlbums[id]) return markup + groupPhotoAlbum(id);
  if (currentStep === 0) {
    return markup + `<div class="station-quicklinks" aria-label="Lối tắt trong chạm"><button class="btn btn-outline" data-action="step" data-step="2">Xem hình ảnh</button><button class="btn btn-outline" data-action="step" data-step="3">Xem video lời kể</button><button class="btn btn-outline" data-action="step" data-step="4">Đọc nội dung</button></div>`;
  }
  return markup;
};

// Chạm 01 / Khám phá – lưu ghi chú vào chính Hộ chiếu ký ức của người học.
document.addEventListener('input', event => {
  if (event.target.id !== 'cham-one-discovery-note-text') return;
  const count = event.target.closest('form')?.querySelector('[data-cham-one-note-length]');
  if (count) count.textContent = String(event.target.value.length);
});
document.addEventListener('submit', event => {
  const form = event.target;
  if (form.id !== 'cham-one-discovery-note-form') return;
  event.preventDefault();
  const text = form.elements.note.value.trim();
  const status = form.querySelector('.cham-one-discovery-note-status');
  if (text.length < 3 || text.length > 800) {
    status.textContent = 'Vui lòng ghi ít nhất 3 và không quá 800 ký tự.';
    form.elements.note.focus();
    return;
  }
  state.notes[1] = { text: text, at: new Date().toISOString() };
  const saved = persist();
  status.textContent = saved
    ? 'Đã lưu ghi chú vào Hộ chiếu ký ức trên thiết bị này. Bạn có thể chỉnh sửa và lưu lại.'
    : 'Ghi chú chưa thể lưu vào trình duyệt. Hãy kiểm tra chế độ riêng tư hoặc quyền lưu trữ.';
});

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
