/* CHẠM CỬA VIỆT — thống kê sự kiện ẩn danh, tùy chọn, không có nội dung học sinh.
 * Giữ nguyên app.js/navigation.js và không thay đổi giao diện 5 Chạm.
 * Umami thống kê ẩn danh mặc định, không bật hộp thoại; cho phép tắt trong Quyền riêng tư, tôn trọng DNT/GPC.
 */
(() => {
  'use strict';
  const config = window.CHAM_CUA_VIET_ANALYTICS || {};
  const allowedHosts = Array.isArray(config.allowedHosts) ? config.allowedHosts : [];
  const websiteId = typeof config.websiteId === 'string' ? config.websiteId.trim() : '';
  const configured = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(websiteId)
    && allowedHosts.includes(location.hostname);
  const consentKey = 'cham-cua-viet-thong-ke-dong-y-v1';
  const excluded = navigator.globalPrivacyControl === true
    || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  const viewedTouches = new Set();
  const viewedSteps = new Set();
  const playedVideos = new Set();
  const earnedStamps = new Set();
  let consent = '';
  let loaded = false;
  let loading = false;
  const queue = [];

  try {
    consent = localStorage.getItem(consentKey) || '';
    const saved = JSON.parse(localStorage.getItem('cham_cua_viet_5cham_v1') || '{}');
    for (let id = 1; id <= 5; id++) if (saved.stamps && saved.stamps[id] === true) earnedStamps.add(id);
  } catch (_) {}

  const active = () => configured && !excluded && consent !== 'no';
  const validTouch = id => Number.isInteger(id) && id >= 1 && id <= 5;
  const currentTouch = () => {
    if (typeof currentPoint === 'number' && validTouch(currentPoint)) return currentPoint;
    const match = location.hash.match(/^#cham-([1-5])/);
    return match ? Number(match[1]) : 0;
  };

  function send(name, details) {
    if (!active()) return;
    // Chỉ các trường số/thống kê cố định. Không gửi tên, email, câu trả lời,
    // cảm nhận, đường dẫn video, thông tin lớp hoặc mã thiết bị.
    const event = { name, details: details || undefined };
    if (loaded && window.umami && typeof window.umami.track === 'function') {
      window.umami.track(event.name, event.details);
    } else if (queue.length < 100) {
      queue.push(event);
    }
  }

  function loadTracker() {
    if (!active() || loading) return;
    loading = true;
    const script = document.createElement('script');
    script.src = config.scriptUrl || 'https://cloud.umami.is/script.js';
    script.async = true;
    script.dataset.websiteId = websiteId;
    script.dataset.autoPageview = 'false';
    script.dataset.excludeHash = 'true';
    script.dataset.excludeSearch = 'true';
    script.dataset.doNotTrack = 'true';
    script.dataset.domains = allowedHosts.join(',');
    script.onload = () => {
      if (!active() || !window.umami || typeof window.umami.track !== 'function') return;
      loaded = true;
      window.umami.track();
      queue.splice(0).forEach(event => window.umami.track(event.name, event.details));
      const current = currentTouch();
      if (validTouch(current)) visitTouch(current);
    };
    script.onerror = () => { loading = false; queue.length = 0; };
    document.head.appendChild(script);
  }

  function saveChoice(value) {
    consent = value;
    try { localStorage.setItem(consentKey, value); } catch (_) {}
    if (value === 'yes') loadTracker();
    else if (loaded) location.reload(); // Ngừng tracker đã khởi tạo
  }

  function makeButton(text, handler, outline) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = outline ? 'btn btn-outline' : 'btn btn-primary';
    button.textContent = text;
    button.addEventListener('click', handler);
    return button;
  }

  function appendPrivacyControl() {
    const container = document.getElementById('utility-content');
    if (!container || container.querySelector('#cham-analytics-privacy')) return;
    const section = document.createElement('section');
    section.id = 'cham-analytics-privacy';
    section.style.cssText = 'margin-top:18px;padding-top:12px;border-top:1px solid #ccd';
    const title = document.createElement('h3');
    title.textContent = 'Thống kê ẩn danh';
    const p = document.createElement('p');
    p.textContent = !configured
      ? 'Chưa kích hoạt hệ thống thống kê từ xa. Hoạt động và phiếu khảo sát vẫn chỉ lưu trên thiết bị.'
      : excluded
        ? 'Thiết bị yêu cầu không theo dõi (DNT/GPC). Website tôn trọng lựa chọn này.'
        : 'Website thống kê ẩn danh lượt truy cập, lượt xem Chạm, kết quả đúng/sai và số phiếu được lưu để đánh giá hiệu quả. Không gửi họ tên, nội dung câu trả lời hay ghi chú. Bạn có thể tắt thống kê ngay tại đây.';
    section.append(title, p);
    if (configured && !excluded) {
      const status = document.createElement('p');
      status.textContent = consent === 'yes' ? 'Trạng thái: đã bật theo lựa chọn của bạn.' : consent === 'no' ? 'Trạng thái: đã tắt.' : 'Trạng thái: đang bật mặc định (ẩn danh).';
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
      actions.append(
        makeButton('Bật thống kê', () => { saveChoice('yes'); status.textContent = 'Trạng thái: đã bật theo lựa chọn của bạn.'; }),
        makeButton('Tắt thống kê', () => { saveChoice('no'); status.textContent = 'Trạng thái: đã tắt.'; }, true)
      );
      section.append(status, actions);
    }
    container.appendChild(section);
  }

  function visitTouch(id) {
    if (!validTouch(id) || viewedTouches.has(id)) return;
    viewedTouches.add(id);
    send('cham_mo', { cham: id });
    visitStep(id, 1);
  }

  function visitStep(id, step) {
    if (!validTouch(id) || !Number.isInteger(step) || step < 1 || step > 8) return;
    const key = id + ':' + step;
    if (viewedSteps.has(key)) return;
    viewedSteps.add(key);
    send('buoc_xem', { cham: id, buoc: step });
  }

  // Đăng ký sau app.js/navigation.js; các handler gốc vẫn chạy bình thường.
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const id = Number(button.dataset.id);
    if (action === 'privacy') appendPrivacyControl();
    if (action === 'open-point' || action === 'select' || action === 'continue') {
      visitTouch(validTouch(id) ? id : currentTouch());
    }
    if (action === 'step') {
      visitStep(currentTouch(), Number(button.dataset.step) + 1);
    }
    if (action === 'answer' || action === 'bank-answer') {
      const cham = action === 'answer' ? id : currentTouch();
      const kind = button.dataset.kind === 'memory' ? 'ghi_nho' : 'thu_doan';
      let correct = false;
      if (action === 'answer') {
        correct = button.classList.contains('correct');
      } else {
        const bank = typeof questionBanks !== 'undefined' && questionBanks[cham]
          ? questionBanks[cham][button.dataset.kind] : null;
        const item = bank && bank[Number(button.dataset.q)];
        correct = !!item && Number(button.dataset.value) === item.correct;
      }
      if (validTouch(cham)) {
        send('cau_hoi_tra_loi', { cham, loai: kind, dung: correct ? 1 : 0 });
        if (kind === 'ghi_nho' && correct) {
          // Chỉ đếm lần đầu học sinh nhận dấu trên trình duyệt này,
          // không đếm đi đếm lại mỗi lần bấm câu trả lời đúng.
          let stamped = false;
          try { stamped = !!(JSON.parse(localStorage.getItem('cham_cua_viet_5cham_v1') || '{}').stamps || {})[cham]; } catch (_) {}
          if (stamped && !earnedStamps.has(cham)) {
            earnedStamps.add(cham);
            send('cham_hoan_thanh', { cham });
          }
        }
      }
    }
    if (action === 'survey-download') send('phieu_khao_sat_tai', { cham: 5 });
    if (action === 'download') send('nhat_ky_tai');
    if (action === 'narrate') send('thuyet_minh_mo');
  }, false);

  document.addEventListener('submit', event => {
    if (!event.target.checkValidity()) return;
    if (event.target.id === 'station-survey') {
      // Chỉ ghi số lượt hoàn tất phiếu; toàn bộ nội dung ở localStorage.
      send('khao_sat_luu', { cham: 5 });
    }
    if (event.target.id === 'note-form') send('cam_nhan_luu', { cham: currentTouch() });
  }, false);

  document.addEventListener('play', event => {
    if (!event.target.matches || !event.target.matches('#experience-dialog video')) return;
    const id = currentTouch();
    if (!validTouch(id) || playedVideos.has(id)) return;
    playedVideos.add(id);
    send('video_phat', { cham: id });
  }, true);

  // navigation.js có thể chặn sự kiện "continue" ở capture phase.
  // Theo dõi sau khi điều hướng hoàn tất để không bỏ sót lượt mở Chạm.
  window.addEventListener('click', event => {
    const button = event.target.closest && event.target.closest('[data-action="continue"]');
    if (!button) return;
    queueMicrotask(() => visitTouch(currentTouch()));
  }, true);

  window.addEventListener('hashchange', () => {
    const match = location.hash.match(/^#cham-([1-5])(?:\/([a-z-]+))?/);
    if (match) visitTouch(Number(match[1]));
  });

  window.CHAM_ANALYTICS_STATUS = () => ({
    configured, consent: excluded ? 'do-not-track' : consent || 'automatic',
    active: active(), scriptLoaded: loaded
  });

  if (active()) loadTracker();
})();