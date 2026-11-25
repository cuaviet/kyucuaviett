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
  const anonymousAuthor = 'Người tham gia ẩn danh';
  const containsIdentityLabel = value => /(?:họ\s*(?:và\s*)?tên|(?:em|tôi|mình)\s+tên|lớp\s*[:–-]?\s*\d{1,2}\s*[a-zđ](?:\s*\d{1,2})?\b|mã học sinh|\b0\d{9}\b)/iu.test(value);
  const isVisiblePost = data => data.name === anonymousAuthor && !containsIdentityLabel(data.message || '');
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
  // Nút sửa chỉ hiển thị với tác giả đã đăng nhập bằng phiên Firebase Anonymous gốc.
  // Quyền thực sự do Firestore Security Rules kiểm tra.
  let viewerUid = null;

  function statusText(el, message, isError) {
    if (!el) return;
    el.textContent = message;
    el.dataset.error = isError ? 'true' : 'false';
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
    author.textContent = anonymousAuthor;
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
    paragraph.textContent = isVisiblePost(data)
      ? rawMessage.slice(touchPrefix?.[0].length || 0)
      : 'Bài cũ đang ẩn. Bạn có thể sửa nội dung và đồng ý đăng lại, hoặc xóa bài.';
    article.append(top, paragraph);
    if (data.editedAt) {
      const edited = document.createElement('small');
      edited.className = 'community-edited-label';
      edited.textContent = 'Đã chỉnh sửa · ' + dateText(data.editedAt);
      article.append(edited);
    }
    if (viewerUid && data.authorUid === viewerUid) {
      const actions = document.createElement('div');
      actions.className = 'community-entry-actions';
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'community-edit-btn';
      edit.dataset.communityEdit = snapshot.id;
      edit.textContent = 'Chỉnh sửa';
      edit.setAttribute('aria-label', 'Chỉnh sửa cảm nhận đã đăng của bạn');
      actions.append(edit);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'community-delete-btn';
      remove.dataset.communityDelete = snapshot.id;
      remove.textContent = 'Xóa';
      remove.setAttribute('aria-label', 'Xóa cảm nhận đã đăng của bạn');
      actions.append(remove);
      article.append(actions);
    }
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
        viewerUid = auth.currentUser ? auth.currentUser.uid : null;
        sendButton.disabled = false;
        watchOwnPosts();
        paintFeed();
        statusText(status, 'Nội dung bạn đồng ý đăng sẽ hiển thị công khai dưới tên ẩn danh.', false);
      } catch (error) {
        firebaseReady = false;
        viewerUid = null;
        sendButton.disabled = true;
        statusText(status, 'Chưa thể đăng bài. Hãy bật Anonymous trong Firebase Authentication rồi thử tải lại trang.', true);
        console.warn('Anonymous Firebase sign-in failed:', error.code || error.message);
      }
      updateTouchStatus();
    }

    const collectionRef = firebaseStore.collection(db, 'public_memories');
    let newest = [];
    let older = [];
    let ownPosts = [];
    let ownPostsListener = null;
    let canLoadMore = false;

    // Cửa sổ sửa nội dung luôn nằm ngoài khung Chạm để không mất bản sửa khi chuyển bước.
    const editDialog = document.createElement('dialog');
    editDialog.className = 'community-edit-dialog';
    editDialog.setAttribute('aria-labelledby', 'community-edit-title');
    editDialog.innerHTML = `
      <form class="community-edit-form" id="community-edit-form">
        <h3 id="community-edit-title">Chỉnh sửa cảm nhận của bạn</h3>
        <p class="community-edit-intro">Xóa họ tên, lớp và các thông tin nhận diện trước khi cập nhật bài.</p>
        <label for="community-edit-message">Câu chuyện hoặc cảm nhận</label>
        <textarea id="community-edit-message" minlength="10" maxlength="600" rows="6" required></textarea>
        <label class="community-accept"><input id="community-edit-consent" type="checkbox" required><span>Tôi đồng ý công khai nội dung đã chỉnh sửa dưới tên ẩn danh.</span></label>
        <p class="community-edit-status" role="status"></p>
        <div class="community-edit-actions">
          <button class="btn btn-outline" type="button" id="community-edit-cancel">Hủy</button>
          <button class="btn btn-primary" type="submit" id="community-edit-save">Lưu chỉnh sửa</button>
        </div>
      </form>`;
    document.body.append(editDialog);
    const editForm = editDialog.querySelector('#community-edit-form');
    const editConsent = editDialog.querySelector('#community-edit-consent');
    const editMessage = editDialog.querySelector('#community-edit-message');
    const editStatus = editDialog.querySelector('.community-edit-status');
    const editSave = editDialog.querySelector('#community-edit-save');
    let editingId = null;
    let editingPrefix = '';
    editDialog.querySelector('#community-edit-cancel').addEventListener('click', () => editDialog.close());
    editDialog.addEventListener('close', () => {
      editingId = null;
      editingPrefix = '';
      statusText(editStatus, '', false);
    });

    // Chỉ mở bài của chính tác giả đang đăng nhập trên trình duyệt này.
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-community-edit]');
      if (!button) return;
      const entry = allLoadedPosts().find(item => item.id === button.dataset.communityEdit);
      const user = auth.currentUser;
      if (!entry || !user || entry.data().authorUid !== user.uid) return;
      const data = entry.data();
      const message = String(data.message || '');
      const prefixMatch = message.match(/^\[Chạm (0[1-5])\]\s*/);
      editingPrefix = prefixMatch ? prefixMatch[0] : '';
      editingId = entry.id;
      editConsent.checked = false;
      editMessage.value = editingPrefix ? message.slice(editingPrefix.length) : message;
      editMessage.maxLength = 600 - editingPrefix.length;
      statusText(editStatus, '', false);
      editSave.disabled = false;
      if (!editDialog.open) editDialog.showModal();
      editMessage.focus();
    });


    // Xác nhận xóa độc lập để tránh mất bài khi bấm nhầm.
    const deleteDialog = document.createElement('dialog');
    deleteDialog.className = 'community-edit-dialog community-delete-dialog';
    deleteDialog.setAttribute('aria-labelledby', 'community-delete-title');
    deleteDialog.innerHTML = `
      <div class="community-edit-form">
        <h3 id="community-delete-title">Xóa bài viết này?</h3>
        <p class="community-edit-intro">Bài sẽ bị xóa vĩnh viễn khỏi Bảng ký ức chung và các điểm Chạm. Hành động này không thể hoàn tác.</p>
        <p class="community-delete-preview" id="community-delete-preview"></p>
        <label class="community-accept"><input id="community-edit-consent" type="checkbox" required><span>Tôi đồng ý công khai nội dung đã chỉnh sửa dưới tên ẩn danh.</span></label>
        <p class="community-edit-status" id="community-delete-status" role="status"></p>
        <div class="community-edit-actions">
          <button class="btn btn-outline" id="community-delete-cancel" type="button">Giữ lại</button>
          <button class="btn btn-primary community-delete-confirm" id="community-delete-confirm" type="button">Xóa bài viết</button>
        </div>
      </div>`;
    document.body.append(deleteDialog);
    let deletingId = null;
    const deleteStatus = deleteDialog.querySelector('#community-delete-status');
    const deleteConfirm = deleteDialog.querySelector('#community-delete-confirm');
    deleteDialog.querySelector('#community-delete-cancel').addEventListener('click', () => deleteDialog.close());
    deleteDialog.addEventListener('close', () => {
      deletingId = null;
      deleteConfirm.disabled = false;
      statusText(deleteStatus, '', false);
    });

    document.addEventListener('click', event => {
      const button = event.target.closest('[data-community-delete]');
      if (!button) return;
      const entry = allLoadedPosts().find(item => item.id === button.dataset.communityDelete);
      const user = auth.currentUser;
      if (!entry || !user || entry.data().authorUid !== user.uid) return;
      deletingId = entry.id;
      const summary = String(entry.data().message || '').replace(/^\[Chạm (0[1-5])\]\s*/, '').trim();
      deleteDialog.querySelector('#community-delete-preview').textContent = summary.slice(0, 180) + (summary.length > 180 ? '…' : '');
      statusText(deleteStatus, '', false);
      deleteConfirm.disabled = false;
      if (!deleteDialog.open) deleteDialog.showModal();
      deleteConfirm.focus();
    });

    deleteConfirm.addEventListener('click', async () => {
      if (!deletingId || !auth.currentUser || deleteConfirm.disabled) return;
      const docId = deletingId;
      const entry = allLoadedPosts().find(item => item.id === docId);
      if (!entry || entry.data().authorUid !== auth.currentUser.uid) {
        statusText(deleteStatus, 'Bạn chỉ được xóa bài đăng của chính mình trên trình duyệt này.', true);
        return;
      }
      deleteConfirm.disabled = true;
      statusText(deleteStatus, 'Đang xóa bài viết trên Firebase…', false);
      try {
        await firebaseStore.deleteDoc(firebaseStore.doc(db, 'public_memories', docId));
        newest = newest.filter(item => item.id !== docId);
        older = older.filter(item => item.id !== docId);
        ownPosts = ownPosts.filter(item => item.id !== docId);
        deleteDialog.close();
        paintFeed();
        statusText(feedStatus, 'Đã xóa bài viết thành công khỏi Bảng ký ức chung.', false);
      } catch (error) {
        statusText(deleteStatus, 'Chưa xóa được bài. Hãy kiểm tra kết nối hoặc Publish Firestore Rules mới rồi thử lại.', true);
        console.warn('Shared memory delete failed:', error.code || error.message);
      } finally {
        deleteConfirm.disabled = false;
      }
    });

    editForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (!editingId || !auth.currentUser) return;
      const newContent = String(editMessage.value || '').normalize('NFC').trim();
      if (newContent.length < 10 || (editingPrefix + newContent).length > 600) {
        statusText(editStatus, 'Nội dung cần có từ 10 ký tự và không vượt quá 600 ký tự.', true);
        return;
      }
      const entry = allLoadedPosts().find(item => item.id === editingId);
      if (!entry || entry.data().authorUid !== auth.currentUser.uid) {
        statusText(editStatus, 'Không tìm thấy bài viết thuộc phiên đăng nhập của bạn.', true);
        return;
      }
      if (!editConsent.checked || containsIdentityLabel(newContent)) {
        statusText(editStatus, 'Hãy bỏ thông tin nhận diện và tích đồng ý trước khi cập nhật bài.', true);
        return;
      }
      editSave.disabled = true;
      statusText(editStatus, 'Đang lưu bản chỉnh sửa…', false);
      try {
        await firebaseStore.updateDoc(
          firebaseStore.doc(db, 'public_memories', editingId),
          {
            name: anonymousAuthor,
            message: editingPrefix + newContent,
            editedAt: firebaseStore.serverTimestamp()
          }
        );
        editDialog.close();
        statusText(feedStatus, 'Đã chỉnh sửa cảm nhận thành công. Nội dung mới sẽ hiển thị cho mọi người.', false);
      } catch (error) {
        statusText(editStatus, 'Chưa sửa được bài. Hãy kiểm tra kết nối và bảo đảm Firebase Rules mới đã được Publish.', true);
        console.warn('Shared memory edit failed:', error.code || error.message);
      } finally {
        editSave.disabled = false;
      }
    });

    function allLoadedPosts() {
      const seen = new Set();
      return newest.concat(older, ownPosts).filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    }

    function watchOwnPosts() {
      const uid = auth.currentUser && auth.currentUser.uid;
      if (!uid || ownPostsListener) return;
      const ownQuery = firebaseStore.query(
        collectionRef,
        firebaseStore.where('authorUid', '==', uid),
        firebaseStore.limit(150)
      );
      ownPostsListener = firebaseStore.onSnapshot(
        ownQuery,
        snapshot => {
          ownPosts = snapshot.docs;
          paintTouchFeed();
        },
        error => console.warn('Unable to load your older memories:', error.code || error.message)
      );
    }

    function paintFeed() {
      feed.replaceChildren();
      const seen = new Set();
      const all = newest.concat(older);
      let shown = 0;
      for (const item of all) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        if (!isVisiblePost(item.data()) && (!viewerUid || item.data().authorUid !== viewerUid)) continue;
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
      const related = allLoadedPosts().filter(item =>
        String(item.data().message || '').startsWith(prefix)
      );
      // Hiển thị bài của chính người đăng trước để họ luôn tìm được nút sửa/xóa,
      // kể cả khi bài đã cũ và không còn trong 30 ký ức mới nhất.
      const byCreatedAt = (a, b) => {
        const dateA = a.data().createdAt;
        const dateB = b.data().createdAt;
        const timeA = dateA && typeof dateA.toMillis === 'function' ? dateA.toMillis() : 0;
        const timeB = dateB && typeof dateB.toMillis === 'function' ? dateB.toMillis() : 0;
        return timeB - timeA;
      };
      const mine = related.filter(item => viewerUid && item.data().authorUid === viewerUid).sort(byCreatedAt);
      const others = related.filter(item => isVisiblePost(item.data()) && item.data().authorUid !== viewerUid).sort(byCreatedAt);
      const recent = mine.slice(0, 12).concat(others.slice(0, 8));
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
      let lastTouchPanel = null;
      // Chỉ cập nhật khi Bước 7 được mở/thay thế. Không quan sát lại những
      // thẻ bài mình tự thêm, tránh vòng lặp render làm đơ trang.
      const boardObserver = new MutationObserver(() => {
        const activePanel = stepRoot.querySelector('#community-touch');
        if (activePanel !== lastTouchPanel) {
          lastTouchPanel = activePanel;
          if (activePanel) paintTouchFeed();
        }
      });
      boardObserver.observe(stepRoot, { childList: true, subtree: true });
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

      const message = String(messageInput?.value || '').normalize('NFC').trim();
      const touchId = fromTouch ? Number(submittedForm.dataset.touchId) : 0;
      const prefix = fromTouch ? '[Chạm ' + String(touchId).padStart(2, '0') + '] ' : '';
      if (fromTouch && (!Number.isInteger(touchId) || touchId < 1 || touchId > 5)) {
        statusText(statusTarget, 'Không xác định được điểm Chạm. Hãy mở lại phần này.', true);
        return;
      }
      if (message.length < 10 || (prefix + message).length > 600) {
        statusText(statusTarget, 'Nội dung cần có ít nhất 10 ký tự và không vượt quá giới hạn cho phép.', true);
        messageInput.focus();
        return;
      }
      if (!consentInput?.checked) {
        statusText(statusTarget, 'Bạn cần đồng ý công khai nội dung trước khi đăng.', true);
        consentInput.focus();
        return;
      }

      if (containsIdentityLabel(message)) {
        statusText(statusTarget, 'Hãy bỏ thông tin nhận diện trước khi đăng.', true);
        messageInput.focus();
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
          name: anonymousAuthor,
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
