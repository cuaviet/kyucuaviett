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
  const authorField = document.getElementById('community-author');
  const publicNamePrefix = 'Tên: ';
  const validDisplayName = value => /^(?=.{2,34}$)[\p{L}\p{M}]+(?:[ ’'-][\p{L}\p{M}]+)*$/u.test(value);
  function displayAuthor(data) {
    if (data.name === anonymousAuthor) return anonymousAuthor;
    if (typeof data.name !== 'string' || !data.name.startsWith(publicNamePrefix)) return null;
    const name = data.name.slice(publicNamePrefix.length);
    return validDisplayName(name) ? name : null;
  }
  const containsIdentityLabel = value => /(?:họ\s*(?:và\s*)?tên|(?:em|tôi|mình)\s+tên|lớp\s*[:–-]?\s*\d{1,2}\s*[a-zđ](?:\s*\d{1,2})?\b|mã học sinh|\b0\d{9}\b)/iu.test(value);
  // Only reviewed versions of older public submissions may reappear anonymously.
  const reviewedLegacyVersions = new Set([
    '05a3f6c7eb97154eae21f026d3f7f8d394f47ea8650114a2eca1f35d2f92cccd',
    '091c474936221f6568180ce9c270984a40c5b885f4a59054655f17bd238fe0af',
    '15085f10d1a38e95e17f6bf41b57a47eb2d334b307218f3bef84fc559d55fe8f',
    '15b3eeb08bdbbd742675605606c6552391cccafbfa7f422361197b7fb2c6b375',
    '168228e3e6ece4c3d3a935f58caa8b1d6563d5ec2e9a03ea7d2920ad5ed46237',
    '22d9e281dadb5659b394f7305340d5ecb6f8d4d0265809ea9eb56c7b2c287f32',
    '331f5e2d734be22b7f8f30b1c5d7f6727f84034023a0133353a13b968196961c',
    '390a1692852f732f20d843a2a81f187245d32b7171675755b1b063be5f6dc5ce',
    '46a44319608092fc846f511ce6a089d2acdcdf4889093c755f6487014411e35e',
    '4cfcc25ad1c5cae5e87119260346794212b4c4160a88b41c7e05e0047d5018eb',
    '51610e6389bfd66b06f14682e977b947419b5e4557efbfc8c27b67be4ea9565b',
    '525841eff33116fb3b6b7aad4c31d9051e237377e26ab9d37eef173b88426a62',
    '52b647a58925b59ac58335a4b98c4bbffc2c0473cf6fa335a08f2a66e3ebc9d8',
    '5773fb6e7d4f82d4a2e1086d4890a55918fbfb73ce4d0a57b10ac3d3402993ff',
    '5e7733c2e61edec1c9676332ae922ff11e37411a2b07330e10600e517c0f7534',
    '6329ced3689f161c357ade67fcb3ca2383683a8f14c344169147743b5df6d0c3',
    '68108ec86ba82735bdb15a08e55507e4230506c8120878504c52ddcceb2c8f0e',
    '6e9613907c0a6de7542ad3d050418acb67b925a4145940c4455522e036908e79',
    '6f580f08998028ff660f95ca0746c5583525b4b1c236711cd2a030e976b2eda3',
    '84b3e4a626fb36ca752867d8bebad10cd5ffd2aec36eaab641d94aee7a261002',
    '909ae4b2703cbc5f9725d8663b1b3749666c6dee4f7e9665dd0c542fd85105e0',
    '92d58298fc8c9f6e0287c6640e211f9f8c13937bef173148760389a5c418e799',
    '9754f6a320d349f46a796b86011a2816a5ddd1473034fe57a8593f1a36d27658',
    '98da67375830cc6370aa7004af0e9c8dba7221cedabf5ac758d2536e159432b7',
    '9944278a5b6849b4122ba531855b500369857eed0dd5d20405a37c140b664884',
    'a2cc97641b80889db8c93e7d46d3e66173b711e3130f681d35aa1a2f4bee3e0c',
    'a3911fb66db3537adea72c5ff2aac94903ddbebef6f33d0d27453d9249a5895b',
    'a4d49405056b2bd692f194a2809158c516e7166f159cae438a8f980f3a3d4fcf',
    'a50c7a30e2a9afba2bb08f1519a8cce0a8f8bc03a107cf7af4ec3fa269cc23bf',
    'a6b24efe58910471ebad1d2f95f59a85344596be34b0da53351568d9f88bf4ea',
    'a94d8f1dbc7b6843ab97d20ad63ce441993c3b3b5778347457ede622840cef05',
    'abaebd1fe13b93985e154c349685ad9cb0607a5ba9953795567afc2878922b3e',
    'bbc9f4f634c3039c762711efb366e93d4bd474462b22e368da1a67d1b41554dc',
    'bf54bb9574ca93ffaa3f2590d9ea0899efe4f695268335bdbd3fc7d281e449ac',
    'c35ee1c975c029c66aafdc70e0015036b78f063ca51c0f7ec62f5770c14f8f16',
    'c4fcff3ea5ab05c63e779aab57953f894f7cdfa7134dfa56559f62701a1fa8a9',
    'ca8312f4640066c44a011f55b055fa2860e0765e0c216672061e29b7afa930a4',
    'd0ba4d17bdc3b9fec6495b27d80b83e40a4fc1515cfeaebd47d9402d0539d0b9',
    'd28b9920883c1308b5969e6dbcc2f116c9faa9b1d6fea6350db84c3cb2922cf9',
    'd48051fa4102c2364d2a0e63c7c5fefb130146d7d2c596be324262990b22a84b',
    'e07ef74054f850a880b9951a8e4d489d72624df6b56cbd2aa1110f466448eb72',
    'e234b92f7b3da79281b5a5deb834ab657ea89f4f83205b7a950ed40f3b32dfbd',
    'fcc2f61c091ccc633bd7d600f3914fe9e065d04a130ce7e3d4ef086b53d7a9c2',
    'fe2d2a3f9fbb3934f9356818c259e3faf62f90e5273a1a8d2018e540281db338',
    'ff0e7f75b371a48994f320f0fa8c3ef9bb5f427f8e29b6f78c4f5b51cebc76d8',
  ]);
  const reviewedSnapshots = new WeakSet();
  const isVisiblePost = snapshot => {
    const data = snapshot.data();
    return reviewedSnapshots.has(snapshot)
      || (Boolean(displayAuthor(data)) && !containsIdentityLabel(data.message || ''));
  };
  async function checkReviewedVersions(snapshots) {
    if (!window.crypto?.subtle) return;
    const encoder = new TextEncoder();
    await Promise.all(snapshots.map(async snapshot => {
      const data = snapshot.data();
      if (displayAuthor(data) || typeof data.message !== 'string') return;
      const bytes = encoder.encode(JSON.stringify([snapshot.id, data.message]));
      const digest = await window.crypto.subtle.digest('SHA-256', bytes);
      const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      if (reviewedLegacyVersions.has(hex)) reviewedSnapshots.add(snapshot);
    }));
  }
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
    author.textContent = isVisiblePost(snapshot) ? displayAuthor(data) || anonymousAuthor : anonymousAuthor;
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
    paragraph.textContent = isVisiblePost(snapshot)
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
        statusText(status, 'Bài đã đăng sẽ hiện công khai. Để trống ô tên nếu bạn muốn đăng ẩn danh.', false);
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
          paintFeed();
        },
        error => console.warn('Unable to load your older memories:', error.code || error.message)
      );
    }

    function paintFeed() {
      feed.replaceChildren();
      const seen = new Set();
      const all = allLoadedPosts();
      let shown = 0;
      for (const item of all) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        if (!isVisiblePost(item) && (!viewerUid || item.data().authorUid !== viewerUid)) continue;
        feed.append(renderCard(item));
        shown++;
      }
      if (!shown) {
        const note = document.createElement('p');
        note.className = 'community-empty';
        note.textContent = all.length
          ? 'Chưa có lời nhắn công khai trong các bài đã tải.'
          : 'Chưa có lời nhắn nào. Hãy chia sẻ một ký ức về Cửa Việt!';
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
      const others = related.filter(item => isVisiblePost(item) && item.data().authorUid !== viewerUid).sort(byCreatedAt);
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
        checkReviewedVersions(snapshot.docs).then(paintFeed).catch(console.warn);
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
        await checkReviewedVersions(snapshot.docs);
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
      const displayName = fromTouch ? '' : authorField.value.normalize('NFC').trim().replace(/\s+/g, ' ');
      if (displayName && !validDisplayName(displayName)) {
        statusText(statusTarget, 'Tên hiển thị cần từ 2 đến 34 ký tự và chỉ gồm chữ, khoảng trắng, dấu nháy hoặc dấu gạch nối.', true);
        authorField.focus();
        return;
      }
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
          name: displayName ? publicNamePrefix + displayName : anonymousAuthor,
          message: prefix + message,
          authorUid: user.uid,
          createdAt: firebaseStore.serverTimestamp()
        });
        try { localStorage.setItem(cooldownKey, String(Date.now())); } catch {}
        messageInput.value = '';
        if (!fromTouch) authorField.value = '';
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
