/* CHẠM CỬA VIỆT - bốn góc ảnh sáng tạo ở Chạm 05 / Khám phá.
 * Ảnh được nén thành JPEG hoặc WebP nhỏ và lưu trực tiếp trong Firestore.
 * Mỗi bài được giữ ở trạng thái pending cho đến khi giáo viên duyệt.
 */
(function () {
  'use strict';
  const cfg = window.CHAM_CUA_VIET_COMMUNITY;
  if (!cfg || !cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) return;
  if (typeof stepMarkup !== 'function') return;

  const TOPICS = [
    'Cửa Việt qua ống kính trẻ',
    'Cửa Việt qua sắc màu nghệ thuật',
    'Cửa Việt – Điểm hẹn du lịch',
    'Cửa Việt xanh trong tương lai'
  ];
  const MAX_FILE_BYTES = 12 * 1024 * 1024;
  const MAX_DATA_LENGTH = 220000;
  const cooldownKey = 'cham_cua_viet_photo_last_submit';
  let canPost = false;
  let db = null;
  let auth = null;
  let store = null;
  let authApi = null;
  let publicPhotos = [];
  let ownPhotos = [];
  let galleryLoaded = false;
  const previews = new WeakMap();

  function formMarkup(category) {
    return '<div class="creative-photo-area" data-photo-category="' + category + '">' +
      '<form class="creative-photo-form" data-photo-category="' + category + '">' +
        '<h4>Gửi hình ảnh về Cửa Việt</h4>' +
        '<label for="creative-photo-file-' + category + '">1. Chọn ảnh của bạn</label>' +
        '<input id="creative-photo-file-' + category + '" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required>' +
        '<div class="creative-photo-preview" aria-live="polite"></div>' +
        '<label for="creative-photo-caption-' + category + '">2. Ghi chú dưới ảnh</label>' +
        '<textarea id="creative-photo-caption-' + category + '" name="caption" rows="3" minlength="5" maxlength="220" required placeholder="Ảnh chụp ở đâu? Khi nào? Điều gì khiến bạn muốn chia sẻ?"></textarea>' +
        '<label class="creative-photo-consent"><input type="checkbox" name="consent" required> ' +
        '<span>Tôi có quyền chia sẻ ảnh này và đồng ý công khai ảnh sau khi giáo viên duyệt.</span></label>' +
        '<p class="creative-photo-tip">Mỗi lần gửi một ảnh JPG, PNG hoặc WebP (tối đa 12 MB trước khi nén). Không gửi ảnh nhạy cảm hay ảnh người khác khi chưa được đồng ý.</p>' +
        '<input class="creative-photo-trap" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button type="submit" class="btn btn-primary creative-photo-submit" disabled>Lưu ảnh và ghi chú</button>' +
        '<p class="creative-photo-status" role="status">Đang kiểm tra kết nối nơi lưu ảnh…</p>' +
      '</form>' +
      '<div class="creative-photo-gallery">' +
        '<h4>Ảnh và lời giới thiệu đã được chia sẻ</h4>' +
        '<div class="creative-photo-items" data-photos-gallery="' + category + '"></div>' +
        '<div class="creative-photo-personal" data-photos-mine="' + category + '"></div>' +
      '</div>' +
    '</div>';
  }

  const priorStepMarkup = stepMarkup;
  stepMarkup = function (point) {
    const original = priorStepMarkup(point);
    if (!point || point.id !== 5 || currentStep !== 4) return original;
    // Chỉ giữ tiêu đề bốn chủ đề và phần tải ảnh / tên / ghi chú.
    // Chấp nhận cả giao diện cũ trong thời gian GitHub Pages cập nhật bộ nhớ đệm.
    let category = 0;
    let updated = original.replace(
      /<div data-community-photo-slot="([0-3])"><\/div>/g,
      function (match, id) {
        category++;
        return formMarkup(Number(id));
      }
    );
    if (category === TOPICS.length) return updated;
    category = 0;
    updated = original.replace(
      /(<details><summary>[^<]+<\/summary>)<p>[^<]*<\/p><button class="btn btn-outline" data-action="project" data-type="[^"]+">Viết ý tưởng<\/button>(<\/details>)/g,
      function (match, heading, closeDetails) {
        return heading + formMarkup(category++) + closeDetails;
      }
    );
    return category === TOPICS.length ? updated : original;
  };

  function setStatus(form, message, error) {
    const el = form.querySelector('.creative-photo-status');
    if (!el) return;
    el.textContent = message;
    el.dataset.error = error ? 'true' : 'false';
  }
  function updateFormState() {
    document.querySelectorAll('.creative-photo-form').forEach(function (form) {
      const button = form.querySelector('.creative-photo-submit');
      if (button && button.dataset.sending !== 'true') button.disabled = !canPost;
      const el = form.querySelector('.creative-photo-status');
      if (el && !el.dataset.result) {
        setStatus(form, canPost
          ? 'Sau khi lưu, bài sẽ được giữ an toàn để giáo viên xem và duyệt trước khi công khai.'
          : 'Chưa thể gửi ảnh: kiểm tra Firebase Authentication → Anonymous.', !canPost);
      }
    });
  }
  function isSafeImageUrl(url) {
    return typeof url === 'string' &&
      url.length <= MAX_DATA_LENGTH &&
      /^data:image\/(webp|jpeg);base64,[A-Za-z0-9+/=]+$/.test(url);
  }
  function timeValue(photo) {
    return photo.createdAt && typeof photo.createdAt.toMillis === 'function'
      ? photo.createdAt.toMillis() : 0;
  }
  function photoCard(photo, pending) {
    const card = document.createElement('figure');
    card.className = 'creative-photo-card';
    if (!isSafeImageUrl(photo.imageData)) return null;
    const image = document.createElement('img');
    image.src = photo.imageData;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.alt = 'Ảnh do người tham gia chia sẻ về Cửa Việt';
    const caption = document.createElement('figcaption');
    const author = document.createElement('strong');
    author.textContent = 'Người tham gia ẩn danh';
    const note = document.createElement('p');
    if (pending) note.textContent = String(photo.caption || '').slice(0, 220);
    caption.append(author, note);
    const submittedSource = document.createElement('small');
    submittedSource.className = 'creative-photo-submitted-source';
    submittedSource.textContent = 'Nguồn ảnh: Người tham gia gửi';
    caption.append(submittedSource);
    if (pending) {
      const label = document.createElement('small');
      label.className = 'creative-photo-pending-label';
      label.textContent = 'Đã lưu · Chờ giáo viên duyệt';
      caption.append(label);
    }
    card.append(image, caption);
    return card;
  }
  function appendCards(element, photos, pending) {
    if (!element) return;
    element.replaceChildren();
    const fragment = document.createDocumentFragment();
    photos.forEach(function (photo) {
      const card = photoCard(photo, pending);
      if (card) fragment.append(card);
    });
    element.append(fragment);
  }
  function paintGalleries() {
    const forms = document.querySelectorAll('.creative-photo-form');
    if (!forms.length) return;
    updateFormState();
    const sortedApproved = publicPhotos.slice().sort(function (a, b) { return timeValue(b) - timeValue(a); });
    const sortedOwned = ownPhotos.slice().sort(function (a, b) { return timeValue(b) - timeValue(a); });
    for (let category = 0; category < TOPICS.length; category++) {
      const gallery = document.querySelector('[data-photos-gallery="' + category + '"]');
      const mine = document.querySelector('[data-photos-mine="' + category + '"]');
      if (gallery) {
        const selected = sortedApproved.filter(function (p) { return p.category === category && p.status === 'approved'; }).slice(0, 12);
        appendCards(gallery, selected, false);
        if (!selected.length) {
          const empty = document.createElement('p');
          empty.className = 'creative-photo-empty';
          empty.textContent = galleryLoaded ? 'Chưa có ảnh được duyệt trong chủ đề này.' : 'Đang tải ảnh được chia sẻ…';
          gallery.append(empty);
        }
      }
      if (mine) {
        const pending = sortedOwned.filter(function (p) { return p.category === category && p.status === 'pending'; }).slice(0, 10);
        mine.replaceChildren();
        if (pending.length) {
          const title = document.createElement('h5');
          title.textContent = 'Ảnh bạn đã gửi, đang chờ duyệt';
          mine.append(title);
          const area = document.createElement('div');
          area.className = 'creative-photo-items';
          appendCards(area, pending, true);
          mine.append(area);
        }
      }
    }
  }

  function refreshOnStepChange() {
    const container = document.getElementById('experience-content');
    if (!container) return;
    const observer = new MutationObserver(function () { paintGalleries(); });
    observer.observe(container, { childList: true });
    paintGalleries();
  }
  refreshOnStepChange();

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Không đọc được ảnh. Hãy thử một ảnh JPG hoặc PNG khác.'));
      };
      img.src = url;
    });
  }
  async function compressImage(file) {
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Chỉ nhận ảnh JPG, PNG hoặc WebP.');
    }
    if (file.size > MAX_FILE_BYTES) throw new Error('Ảnh gốc quá 12 MB. Hãy chọn ảnh nhỏ hơn.');
    const photo = await loadImage(file);
    if (photo.width < 1 || photo.height < 1) throw new Error('Ảnh không hợp lệ.');
    const attempts = [
      [1200, 0.82], [1000, 0.78], [900, 0.73], [800, 0.68],
      [720, 0.62], [640, 0.55], [520, 0.5], [440, 0.43]
    ];
    for (const attempt of attempts) {
      const maxEdge = attempt[0];
      const scale = Math.min(1, maxEdge / Math.max(photo.width, photo.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(photo.width * scale));
      canvas.height = Math.max(1, Math.round(photo.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Thiết bị không hỗ trợ nén ảnh.');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
      let dataUrl = canvas.toDataURL('image/webp', attempt[1]);
      if (!dataUrl.startsWith('data:image/webp;')) dataUrl = canvas.toDataURL('image/jpeg', attempt[1]);
      canvas.width = 0;
      canvas.height = 0;
      if (isSafeImageUrl(dataUrl)) return dataUrl;
    }
    throw new Error('Không thể nén ảnh đủ nhỏ để lưu miễn phí. Hãy chọn ảnh khác.');
  }

  document.addEventListener('change', function (event) {
    const input = event.target;
    if (!input.matches('.creative-photo-form input[type="file"]')) return;
    const area = input.closest('.creative-photo-form').querySelector('.creative-photo-preview');
    const old = previews.get(input);
    if (old) URL.revokeObjectURL(old);
    area.replaceChildren();
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      area.textContent = 'Chỉ sử dụng ảnh JPG, PNG hoặc WebP.';
      return;
    }
    const url = URL.createObjectURL(file);
    previews.set(input, url);
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Xem trước ảnh sẽ được gửi';
    area.append(img);
  });

  async function fetchPhotos() {
    if (!store || !db) return;
    try {
      const collection = store.collection(db, 'community_photos');
      const publicQuery = store.query(
        collection, store.where('status', '==', 'approved'), store.limit(80)
      );
      const snapshot = await store.getDocs(publicQuery);
      publicPhotos = snapshot.docs.map(function (doc) { return doc.data(); });
      galleryLoaded = true;
    } catch (error) {
      console.warn('Ảnh được duyệt chưa tải được:', error.code || error.message);
      galleryLoaded = false;
    }
    paintGalleries();
  }
  async function fetchMine() {
    if (!store || !db || !auth || !auth.currentUser) return;
    try {
      const mineQuery = store.query(
        store.collection(db, 'community_photos'),
        store.where('authorUid', '==', auth.currentUser.uid),
        store.limit(30)
      );
      const snapshot = await store.getDocs(mineQuery);
      ownPhotos = snapshot.docs.map(function (doc) { return doc.data(); });
    } catch (error) {
      console.warn('Chưa tải được các ảnh riêng đang chờ duyệt:', error.code || error.message);
    }
    paintGalleries();
  }

  document.addEventListener('submit', async function (event) {
    const form = event.target;
    if (!form.matches('.creative-photo-form')) return;
    event.preventDefault();
    const file = form.elements.photo.files[0];
    const name = 'Người tham gia ẩn danh';
    const caption = String(form.elements.caption.value || '').normalize('NFC').trim();
    const category = Number(form.dataset.photoCategory);
    const consent = form.elements.consent.checked;
    const button = form.querySelector('.creative-photo-submit');
    const status = form.querySelector('.creative-photo-status');
    if (form.elements.website.value) return;
    if (!canPost || !store || !db || !auth || !auth.currentUser) {
      setStatus(form, 'Chưa có quyền lưu trực tuyến. Kiểm tra Firebase Authentication → Anonymous.', true);
      return;
    }
    if (!Number.isInteger(category) || category < 0 || category > 3 ||
        caption.length < 5 || caption.length > 220 ||
        !file || !consent) {
      setStatus(form, 'Hãy chọn ảnh, ghi chú và xác nhận quyền chia sẻ.', true);
      return;
    }
    let lastSent = 0;
    try { lastSent = Number(localStorage.getItem(cooldownKey) || 0); } catch {}
    if (lastSent && Date.now() - lastSent < 120000) {
      setStatus(form, 'Bạn có thể gửi ảnh tiếp theo sau khoảng 2 phút.', true);
      return;
    }
    button.disabled = true;
    button.dataset.sending = 'true';
    delete status.dataset.result;
    try {
      setStatus(form, 'Đang nén ảnh để lưu trực tuyến…', false);
      const imageData = await compressImage(file);
      setStatus(form, 'Đang lưu ảnh và ghi chú lên Firebase…', false);
      await store.addDoc(store.collection(db, 'community_photos'), {
        category: category,
        name: name,
        caption: caption,
        imageData: imageData,
        authorUid: auth.currentUser.uid,
        status: 'pending',
        createdAt: store.serverTimestamp()
      });
      try { localStorage.setItem(cooldownKey, String(Date.now())); } catch {}
      const imgInput = form.elements.photo;
      const url = previews.get(imgInput);
      if (url) URL.revokeObjectURL(url);
      previews.delete(imgInput);
      form.reset();
      form.querySelector('.creative-photo-preview').replaceChildren();
      status.dataset.result = 'true';
      setStatus(form, 'Đã lưu ảnh và ghi chú trên Firebase! Giáo viên sẽ duyệt trước khi ảnh hiện cho mọi người.', false);
      await fetchMine();
    } catch (error) {
      status.dataset.result = 'true';
      setStatus(form, error instanceof Error && !error.code
        ? error.message
        : 'Chưa lưu được. Kiểm tra Firestore Rules và thử lại.', true);
      console.warn('Lỗi lưu ảnh:', error.code || error.message);
    } finally {
      delete button.dataset.sending;
      button.disabled = !canPost;
    }
  });

  (async function initialize() {
    // Tải Firebase sau khi trang đã tải xong, để ảnh đầu trang hiện ra nhanh hơn trên điện thoại.
    await new Promise(resolve => {
      const go = () => ('requestIdleCallback' in window ? requestIdleCallback(resolve, { timeout: 1500 }) : setTimeout(resolve, 1));
      if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    });
    try {
      const modules = await Promise.all([
        import('https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js')
      ]);
      const firebaseApp = modules[0];
      authApi = modules[1];
      store = modules[2];
      const app = firebaseApp.getApps().length ? firebaseApp.getApp() :
        firebaseApp.initializeApp({
          apiKey: cfg.apiKey, authDomain: cfg.authDomain,
          projectId: cfg.projectId, appId: cfg.appId
        });
      db = store.getFirestore(app);
      auth = authApi.getAuth(app);
      await fetchPhotos();
      try {
        if (typeof auth.authStateReady === 'function') await auth.authStateReady();
        if (!auth.currentUser) await authApi.signInAnonymously(auth);
        canPost = true;
        await fetchMine();
      } catch (error) {
        console.warn('Hãy bật Anonymous Authentication để gửi ảnh:', error.code || error.message);
        canPost = false;
      }
      paintGalleries();
    } catch (error) {
      console.warn('Không kết nối được phần ảnh sáng tạo:', error.code || error.message);
      canPost = false;
      paintGalleries();
    }
  })();
})();
