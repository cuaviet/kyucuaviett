/* CHẠM CỬA VIỆT — thống kê sự kiện ẩn danh, tùy chọn, không có nội dung học sinh.
 * Giữ nguyên app.js/navigation.js và không thay đổi giao diện 5 Chạm.
 * Umami chỉ tải sau khi người xem đồng ý; tôn trọng DNT/GPC.
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

  const active = () => configured && !excluded && consent === 'yes';
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
    const prompt = document.getElementById('cham-stats-consent');
    if (prompt) prompt.remove();
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

  function showConsentPrompt() {
    if (!configured || excluded || consent || document.getElementById('cham-stats-consent')) return;
    const bar = document.createElement('section');
    bar.id = 'cham-stats-consent';
    bar.setAttribute('aria-label', 'Lựa chọn thống kê ẩn danh');
    bar.setAttribute('role', 'region');
    bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;box-sizing:border-box;max-width:680px;margin:auto;background:#fff;color:#143c3e;border:1px solid #b7d0cd;box-shadow:0 8px 35px #0003;border-radius:14px;padding:14px 16px;font:14px/1.5 system-ui,sans-serif';
    const title = document.createElement('strong');
    title.textContent = 'Thống kê trải nghiệm ẩn danh';
    const desc = document.createElement('p');
    desc.style.margin = '5px 0 10px';
    desc.textContent = 'Bạn có đồng ý chia sẻ số lượt xem và thao tác ở 5 Chạm để nhóm đánh giá hiệu quả website? Không gửi tên, nội dung cảm nhận hay câu trả lời tự luận.';
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
    actions.append(
      makeButton('Đồng ý thống kê', () => saveChoice('yes')),
      makeButton('Không đồng ý', () => saveChoice('no'), true)
    );
    bar.append(title, desc, actions);
    document.body.appendChild(bar);
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
        : 'Bạn có thể cho phép hoặc từ chối gửi số lượt truy cập, lượt xem Chạm, kết quả đúng/sai và số phiếu được lưu. Không gửi họ tên, nội dung câu trả lời hay ghi chú.';
    section.append(title, p);
    if (configured && !excluded) {
      const status = document.createElement('p');
      status.textContent = consent === 'yes' ? 'Trạng thái: đã đồng ý.' : consent === 'no' ? 'Trạng thái: đã từ chối.' : 'Trạng thái: chưa lựa chọn.';
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
      actions.append(
        makeButton('Cho phép thống kê', () => { saveChoice('yes'); status.textContent = 'Trạng thái: đã đồng ý.'; }),
        makeButton('Tắt thống kê', () => { saveChoice('no'); status.textContent = 'Trạng thái: đã từ chối.'; }, true)
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

  window.addEventListener('hashchange', () => {
    const match = location.hash.match(/^#cham-([1-5])(?:\/([a-z-]+))?/);
    if (match) visitTouch(Number(match[1]));
  });

  window.CHAM_ANALYTICS_STATUS = () => ({
    configured, consent: excluded ? 'do-not-track' : consent || 'pending',
    active: active(), scriptLoaded: loaded
  });

  if (configured && !excluded) {
    if (consent === 'yes') loadTracker();
    else if (!consent) showConsentPrompt();
  }
})();