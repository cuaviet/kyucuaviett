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
    top.append(author, time);
    const paragraph = document.createElement('p');
    paragraph.textContent = String(data.message || '').slice(0, 600);
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
    if (typeof auth.authStateReady === 'function') await auth.authStateReady();
    if (!auth.currentUser) await firebaseAuth.signInAnonymously(auth);
    sendButton.disabled = false;
    statusText(status, 'Tên và nội dung bạn đăng sẽ được hiển thị công khai để mọi người cùng đọc.', false);

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
    }

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

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (honeypot.value) return;
      const name = cleanText(nameField.value);
      const message = String(messageField.value || '').normalize('NFC').trim();
      if (name.length < 2 || name.length > 40) {
        statusText(status, 'Tên hiển thị cần có từ 2 đến 40 ký tự.', true);
        nameField.focus();
        return;
      }
      if (message.length < 10 || message.length > 600) {
        statusText(status, 'Nội dung cần có từ 10 đến 600 ký tự.', true);
        messageField.focus();
        return;
      }
      if (!consent.checked) {
        statusText(status, 'Bạn cần đồng ý công khai tên hiển thị và nội dung trước khi đăng.', true);
        consent.focus();
        return;
      }
      let lastSent = 0;
      try { lastSent = Number(localStorage.getItem(cooldownKey) || 0); } catch {}
      if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
        statusText(status, 'Vui lòng đợi khoảng 2 phút trước khi gửi lời nhắn tiếp theo.', true);
        return;
      }
      sendButton.disabled = true;
      statusText(status, 'Đang lưu ký ức lên hệ thống…', false);
      try {
        const user = auth.currentUser || (await firebaseAuth.signInAnonymously(auth)).user;
        await firebaseStore.addDoc(collectionRef, {
          name: name,
          message: message,
          authorUid: user.uid,
          createdAt: firebaseStore.serverTimestamp()
        });
        try { localStorage.setItem(cooldownKey, String(Date.now())); } catch {}
        messageField.value = '';
        consent.checked = false;
        statusText(status, 'Đã lưu thành công! Lời nhắn của bạn hiện trong bảng ký ức chung.', false);
      } catch (error) {
        statusText(status, 'Chưa lưu được nội dung. Hãy thử lại hoặc báo cho giáo viên kiểm tra kết nối Firebase.', true);
        console.warn('Shared memories write failed:', error.code || error.message);
      } finally {
        sendButton.disabled = false;
      }
    });
  } catch (error) {
    sendButton.disabled = true;
    statusText(status, 'Bảng ký ức hiện chưa kết nối được dịch vụ lưu trực tuyến. Vui lòng thử lại sau.', true);
    statusText(feedStatus, 'Chưa tải được lời nhắn.', true);
    console.warn('Shared memories init failed:', error.code || error.message);
  }
})();
