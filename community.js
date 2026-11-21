/* CHẠM CỬA VIỆT — Bảng ký ức chung.
 * Công khai nội dung có chủ đích, lưu trong Cloud Firestore.
 * Không sử dụng localStorage để giả lập lưu chia sẻ.
 */
(async function () {
  'use strict';
  const cfg = window.CHAM_CUA_VIET_COMMUNITY;
  const section = document.getElementById('community-board');
  if (!section || !cfg || !cfg.apiKey || !cfg.projectId || !cfg.appId || !cfg.authDomain) return;

  const form = document.getElementById('community-form');
  const nameField = document.getElementById('community-name');
  const messageField = document.getElementById('community-message');
  const status = document.getElementById('community-status');
  const feed = document.getElementById('community-feed');
  const feedStatus = document.getElementById('community-feed-status');
  const sendButton = document.getElementById('community-submit');
  const moreButton = document.getElementById('community-more');
  const consent = document.getElementById('community-consent');
  const honeypot = document.getElementById('community-website');
  const PAGE_SIZE = 30;
  const COOLDOWN_MS = 120000;
  const cooldownKey = 'cham_cua_viet_last_public_memory';

  function statusText(el, message, isError) {
    if (!el) return;
    el.textContent = message;
    el.dataset.error = isError ? 'true' : 'false';
  }
  function cleanText(value) {
    return String(value || '').normalize('NFC').trim().replace(/\s+/g, ' ');
  }
  function dateText(timestamp) {
    try {
      const date = timestamp && typeof timestamp.toDate === 'function' ? timestamp.toDate() : null;
      return date ? date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Vừa đăng';
    } catch { return 'Vừa đăng'; }
  }
  function renderCard(snapshot) {
    const data = snapshot.data();
    const article = document.createElement('article');
    article.className = 'community-entry';
    const top = document.createElement('div');
    top.className = 'community-entry-top';
    const author = document.createElement('strong');
    author.textContent = cleanText(data.name).slice(0, 40) || 'Người yêu Cửa Việt';
    const time = document.createElement('time');
    time.textContent = dateText(data.createdAt);
    const rawMessage = String(data.message || '').slice(0, 600);
    const touchPrefix = rawMessage.match(/^\[Chạm (0[1-5])\]\s*/);
    if (touchPrefix) {
      const tag = document.createElement('span');
      tag.className = 'community-touch-tag';
      tag.textContent = 'Chạm ' + touchPrefix[1];
      top.append(tag);
    }
    top.append(author, time);
    const paragraph = document.createElement('p');
    paragraph.textContent = touchPrefix ? rawMessage.slice(touchPrefix[0].length) : rawMessage;
    article.append(top, paragraph);
    return article;
  }

  section.hidden = false;
  sendButton.disabled = true;
  statusText(status, 'Đang kết nối nơi lưu giữ ký ức…', false);

  try {
    const modules = await Promise.all([
      import('https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js')
    ]);
    const firebaseApp = modules[0];
    const firebaseAuth = modules[1];
    const firebaseStore = modules[2];
    const app = firebaseApp.getApps().length
      ? firebaseApp.getApp()
      : firebaseApp.initializeApp({ apiKey: cfg.apiKey, authDomain: cfg.authDomain, projectId: cfg.projectId, appId: cfg.appId });
    const db = firebaseStore.getFirestore(app);
    const auth = firebaseAuth.getAuth(app);
    let firebaseReady = false;
    async function activatePosting() {
      try {
        if (typeof auth.authStateReady === 'function') await auth.authStateReady();
        if (!auth.currentUser) await firebaseAuth.signInAnonymously(auth);
        firebaseReady = true;
        sendButton.disabled = false;
        statusText(status, 'Tên và nội dung bạn đăng sẽ hiển thị công khai để mọi người cùng đọc.', false);
      } catch (error) {
        firebaseReady = false;
        sendButton.disabled = true;
        statusText(status, 'Chưa thể đăng bài. Hãy bật Anonymous trong Firebase Authentication rồi thử tải lại trang.', true);
        console.warn('Anonymous Firebase sign-in failed:', error.code || error.message);
      }
      updateTouchStatus();
    }

    const collectionRef = firebaseStore.collection(db, 'public_memories');
    let newest = [];
    let older = [];
    let canLoadMore = false;
    function paintFeed() {
      feed.replaceChildren();
      const seen = new Set();
      const all = newest.concat(older);
      let shown = 0;
      for (const item of all) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        feed.append(renderCard(item));
        shown++;
      }
      if (!shown) {
        const note = document.createElement('p');
        note.className = 'community-empty';
        note.textContent = 'Chưa có lời nhắn nào. Hãy trở thành người đầu tiên lưu một ký ức về Cửa Việt!';
        feed.append(note);
      }
      moreButton.hidden = !canLoadMore;
      paintTouchFeed();
    }

    function updateTouchStatus() {
      const touchForm = document.getElementById('community-touch-form');
      if (!touchForm) return;
      const button = touchForm.querySelector('#community-touch-submit');
      if (button && !button.dataset.sending) button.disabled = !firebaseReady;
      const el = touchForm.querySelector('#community-touch-status');
      if (el && !el.dataset.hasFeedback) {
        statusText(el, firebaseReady
          ? 'Bài bạn đăng sẽ được lưu trên Firebase và mọi người có thể đọc.'
          : 'Chưa kết nối quyền đăng bài. Hãy kiểm tra Firebase Authentication → Anonymous.', !firebaseReady);
      }
    }

    function paintTouchFeed() {
      const panel = document.getElementById('community-touch');
      if (!panel) return;
      updateTouchStatus();
      const touchId = Number(panel.dataset.touchId);
      const prefix = '[Chạm ' + String(touchId).padStart(2, '0') + '] ';
      const touchFeed = panel.querySelector('#community-touch-feed');
      const touchStatus = panel.querySelector('#community-touch-feed-status');
      if (!touchFeed) return;
      touchFeed.replaceChildren();
      const seen = new Set();
      const recent = newest.concat(older).filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return String(item.data().message || '').startsWith(prefix);
      }).slice(0, 8);
      if (recent.length) {
        recent.forEach(item => touchFeed.append(renderCard(item)));
        statusText(touchStatus, 'Các chia sẻ gần đây tại Chạm ' + String(touchId).padStart(2, '0'), false);
      } else {
        const empty = document.createElement('p');
        empty.className = 'community-empty';
        empty.textContent = 'Chưa thấy chia sẻ nào ở Chạm này trong các bài mới nhất. Hãy là người đầu tiên!';
        touchFeed.append(empty);
        statusText(touchStatus, 'Các bài cũ hơn có thể xem trong Bảng ký ức chung ở trang chủ.', false);
      }
    }

    const stepRoot = document.getElementById('experience-content');
    if (stepRoot && typeof MutationObserver !== 'undefined') {
      const boardObserver = new MutationObserver(() => paintTouchFeed());
      boardObserver.observe(stepRoot, { childList: true });
    }
    activatePosting();

    firebaseStore.onSnapshot(
      firebaseStore.query(collectionRef, firebaseStore.orderBy('createdAt', 'desc'), firebaseStore.limit(PAGE_SIZE)),
      snapshot => {
        newest = snapshot.docs;
        canLoadMore = newest.length === PAGE_SIZE || older.length > 0 && canLoadMore;
        statusText(feedStatus, 'Những ký ức mới nhất từ cộng đồng', false);
        paintFeed();
      },
      error => {
        statusText(feedStatus, 'Chưa thể tải lời nhắn từ máy chủ. Kiểm tra kết nối và quyền đọc dữ liệu.', true);
        console.warn('Shared memories read failed:', error.code || error.message);
      }
    );

    moreButton.addEventListener('click', async () => {
      const last = older.length ? older[older.length - 1] : newest[newest.length - 1];
      if (!last) return;
      moreButton.disabled = true;
      try {
        const snapshot = await firebaseStore.getDocs(
          firebaseStore.query(collectionRef, firebaseStore.orderBy('createdAt', 'desc'), firebaseStore.startAfter(last), firebaseStore.limit(PAGE_SIZE))
        );
        older = older.concat(snapshot.docs);
        canLoadMore = snapshot.docs.length === PAGE_SIZE;
        paintFeed();
      } catch {
        statusText(feedStatus, 'Không tải được các ký ức cũ. Bạn có thể thử lại.', true);
      } finally {
        moreButton.disabled = false;
      }
    });

    document.addEventListener('submit', async event => {
      const submittedForm = event.target;
      const fromTouch = submittedForm.id === 'community-touch-form';
      if (!fromTouch && submittedForm !== form) return;
      event.preventDefault();

      const nameInput = fromTouch ? submittedForm.querySelector('#community-touch-name') : nameField;
      const messageInput = fromTouch ? submittedForm.querySelector('#community-touch-message') : messageField;
      const consentInput = fromTouch ? submittedForm.querySelector('#community-touch-consent') : consent;
      const honeyInput = fromTouch ? submittedForm.querySelector('#community-touch-website') : honeypot;
      const submitButton = fromTouch ? submittedForm.querySelector('#community-touch-submit') : sendButton;
      const statusTarget = fromTouch ? submittedForm.querySelector('#community-touch-status') : status;

      if (honeyInput?.value) return;
      if (!firebaseReady) {
        statusText(statusTarget, 'Chưa thể gửi bài: cần bật Anonymous trong Firebase Authentication.', true);
        return;
      }

      const name = cleanText(nameInput?.value);
      const message = String(messageInput?.value || '').normalize('NFC').trim();
      const touchId = fromTouch ? Number(submittedForm.dataset.touchId) : 0;
      const prefix = fromTouch ? '[Chạm ' + String(touchId).padStart(2, '0') + '] ' : '';
      if (fromTouch && (!Number.isInteger(touchId) || touchId < 1 || touchId > 5)) {
        statusText(statusTarget, 'Không xác định được điểm Chạm. Hãy mở lại phần này.', true);
        return;
      }
      if (name.length < 2 || name.length > 40) {
        statusText(statusTarget, 'Tên hiển thị cần có từ 2 đến 40 ký tự.', true);
        nameInput.focus();
        return;
      }
      if (message.length < 10 || (prefix + message).length > 600) {
        statusText(statusTarget, 'Nội dung cần có ít nhất 10 ký tự và không vượt quá giới hạn cho phép.', true);
        messageInput.focus();
        return;
      }
      if (!consentInput?.checked) {
        statusText(statusTarget, 'Bạn cần đồng ý công khai tên hiển thị và nội dung trước khi đăng.', true);
        consentInput.focus();
        return;
      }

      let lastSent = 0;
      try { lastSent = Number(localStorage.getItem(cooldownKey) || 0); } catch {}
      if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
        statusText(statusTarget, 'Vui lòng đợi khoảng 2 phút trước khi gửi lời nhắn tiếp theo.', true);
        return;
      }

      submitButton.disabled = true;
      submitButton.dataset.sending = 'true';
      delete statusTarget.dataset.hasFeedback;
      statusText(statusTarget, 'Đang lưu ký ức lên Firebase…', false);
      try {
        const user = auth.currentUser || (await firebaseAuth.signInAnonymously(auth)).user;
        await firebaseStore.addDoc(collectionRef, {
          name,
          message: prefix + message,
          authorUid: user.uid,
          createdAt: firebaseStore.serverTimestamp()
        });
        try { localStorage.setItem(cooldownKey, String(Date.now())); } catch {}
        messageInput.value = '';
        consentInput.checked = false;
        statusTarget.dataset.hasFeedback = 'true';
        statusText(statusTarget, 'Đã lưu thành công! Lời nhắn của bạn được chia sẻ với mọi người.', false);
      } catch (error) {
        statusTarget.dataset.hasFeedback = 'true';
        statusText(statusTarget, 'Chưa lưu được bài. Hãy kiểm tra kết nối, quyền Firestore và thử lại.', true);
        console.warn('Shared memories write failed:', error.code || error.message);
      } finally {
        delete submitButton.dataset.sending;
        submitButton.disabled = !firebaseReady;
      }
    });
  } catch (error) {
    sendButton.disabled = true;
    statusText(status, 'Bảng ký ức hiện chưa kết nối được dịch vụ lưu trực tuyến. Vui lòng thử lại sau.', true);
    statusText(feedStatus, 'Chưa tải được lời nhắn.', true);
    console.warn('Shared memories init failed:', error.code || error.message);
  }
})();
