/* Thu gọn / mở rộng danh sách ký ức cộng đồng.
 * - Mỗi danh sách chỉ hiện SHOW_FIRST bài đầu, kèm nút "Xem tất cả" / "Thu gọn".
 * - Bài dài được rút gọn vài dòng, kèm nút "Đọc tiếp".
 * Hoạt động với cả bảng ở trang chủ và danh sách ở Bước 7 của mỗi Chạm.
 */
(() => {
  'use strict';

  const SHOW_FIRST = 4;
  const LONG_TEXT = 240;

  function clampEntry(entry) {
    if (entry.dataset.clampReady) return;
    entry.dataset.clampReady = 'true';
    const text = entry.querySelector(':scope > p');
    if (!text || text.textContent.trim().length < LONG_TEXT) return;
    entry.classList.add('is-clamped');
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'community-readmore';
    more.textContent = 'Đọc tiếp';
    more.setAttribute('aria-expanded', 'false');
    more.addEventListener('click', () => {
      const open = entry.classList.toggle('is-open');
      more.textContent = open ? 'Thu gọn bài' : 'Đọc tiếp';
      more.setAttribute('aria-expanded', String(open));
    });
    text.after(more);
  }

  function enhance(feed) {
    if (feed.dataset.collapseReady) return;
    feed.dataset.collapseReady = 'true';
    if (!feed.id) feed.id = 'community-feed-' + Math.random().toString(36).slice(2, 8);

    const list = feed.closest('.community-list');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'btn btn-outline community-toggle';
    toggle.setAttribute('aria-controls', feed.id);
    toggle.hidden = true;
    feed.after(toggle);

    let expanded = false;

    function update() {
      const entries = [...feed.children].filter(child => child.classList.contains('community-entry'));
      entries.forEach(clampEntry);
      const total = entries.length;
      const collapsible = total > SHOW_FIRST;
      const collapsed = collapsible && !expanded;
      feed.classList.toggle('is-collapsed', collapsed);
      list?.classList.toggle('feed-collapsed', collapsed);
      toggle.hidden = !collapsible;
      if (!collapsible) return;
      toggle.textContent = expanded ? 'Thu gọn ▲' : `Xem tất cả ${total} ký ức ▼`;
      toggle.setAttribute('aria-expanded', String(expanded));
    }

    toggle.addEventListener('click', () => {
      expanded = !expanded;
      update();
      if (!expanded) {
        const top = (list?.querySelector('.community-list-header') || feed).getBoundingClientRect().top;
        if (top < 0) (list?.querySelector('.community-list-header') || feed).scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    });

    new MutationObserver(update).observe(feed, { childList: true });
    update();
  }

  function scan() {
    document.querySelectorAll('.community-feed').forEach(enhance);
  }

  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  }).observe(document.body, { childList: true, subtree: true });
  scan();
})();
