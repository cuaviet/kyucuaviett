/* Bước 7 của cả 5 Chạm: thay chính biểu mẫu cảm nhận bằng nhập tên + bài viết
 * lưu công khai trên Firebase. Không thêm biểu mẫu thứ hai.
 * Ghi chép riêng đã lưu từ trước vẫn nằm trong Hộ chiếu ký ức.
 */
(function () {
  'use strict';
  const cfg = window.CHAM_CUA_VIET_COMMUNITY;
  if (!cfg || !cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) return;
  if (typeof stepMarkup !== 'function') return;

  const originalStepMarkup = stepMarkup;
  stepMarkup = function (point) {
    const markup = originalStepMarkup(point);
    if (currentStep !== 6 || !point || !Number.isInteger(point.id)) return markup;
    const formStart = markup.indexOf('<form class="note-form" id="note-form">');
    if (formStart < 0) return markup;
    const touchId = point.id;
    const formattedId = String(touchId).padStart(2, '0');

    // Giữ nguyên câu hỏi "Điều gì ở lại trong bạn?" và câu gợi mở từng Chạm.
    // Chỉ thay biểu mẫu lưu trên trình duyệt bằng biểu mẫu trực tuyến duy nhất.
    return markup.slice(0, formStart) + `
<section class="community-touch" id="community-touch" data-touch-id="${touchId}">
  <form id="community-touch-form" class="note-form community-touch-form" data-touch-id="${touchId}">
    <label for="community-touch-name">Tên của bạn</label>
    <input id="community-touch-name" type="text" name="name" minlength="2" maxlength="40" autocomplete="nickname" required placeholder="Nhập tên hoặc biệt danh của bạn">
    <label for="community-touch-message">Cảm nhận của bạn</label>
    <textarea id="community-touch-message" name="message" rows="4" minlength="10" maxlength="580" required placeholder="Một điều đã học, một cảm nhận, một câu hỏi…"></textarea>
    <label class="community-accept" for="community-touch-consent"><input id="community-touch-consent" type="checkbox" required><span>Tôi đồng ý để tên hiển thị và cảm nhận này xuất hiện công khai cho mọi người cùng đọc.</span></label>
    <p class="community-note">Hãy dùng biệt danh nếu muốn; không ghi địa chỉ, số điện thoại hay thông tin riêng tư.</p>
    <div class="community-honeypot" aria-hidden="true"><label for="community-touch-website">Website cá nhân</label><input id="community-touch-website" type="text" autocomplete="off" tabindex="-1"></div>
    <button class="btn btn-primary" id="community-touch-submit" type="submit" disabled>Lưu và chia sẻ cảm nhận</button>
    <p class="community-status" id="community-touch-status" role="status">Đang kết nối nơi lưu ký ức trực tuyến…</p>
  </form>
  <div class="community-touch-recent">
    <h4>Những cảm nhận được chia sẻ ở Chạm ${formattedId}</h4>
    <p class="community-note" id="community-touch-feed-status" role="status">Đang tải bài viết…</p>
    <div id="community-touch-feed" class="community-feed" aria-live="polite"></div>
  </div>
</section>`;
  };
})();
