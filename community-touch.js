/* Hiển thị trực tiếp biểu mẫu chia sẻ công khai ở Bước 7. */
(function () {
  'use strict';
  const cfg = window.CHAM_CUA_VIET_COMMUNITY;
  if (!cfg || !cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) return;
  if (typeof stepMarkup !== 'function') return;

  const originalStepMarkup = stepMarkup;
  stepMarkup = function (point) {
    const markup = originalStepMarkup(point);
    if (currentStep !== 6 || !point || !Number.isInteger(point.id)) return markup;
    const touchId = point.id;
    const formattedId = String(touchId).padStart(2, '0');

    return markup + `
<section class="community-touch" id="community-touch" data-touch-id="${touchId}">
  <h4>Chia sẻ cảm nhận của bạn</h4>
  <p>Bài xuất hiện trên Bảng ký ức chung. Chỉ viết nội dung bạn muốn chia sẻ với mọi người.</p>
  <form id="community-touch-form" class="note-form community-touch-form" data-touch-id="${touchId}">
    <label for="community-touch-author">Tên hiển thị hoặc biệt danh (không bắt buộc)</label>
    <input id="community-touch-author" name="author" type="text" maxlength="34" autocomplete="off" placeholder="Nhập tên hiển thị hoặc để trống nếu muốn ẩn danh">
    <label for="community-touch-message">Cảm nhận của bạn</label>
    <textarea id="community-touch-message" name="message" rows="4" minlength="10" maxlength="580" required placeholder="Một điều đã học, một cảm nhận, một câu hỏi…"></textarea>
    <label class="community-accept" for="community-touch-consent"><input id="community-touch-consent" type="checkbox" required><span>Tôi đồng ý công khai cảm nhận và tên hiển thị nếu tôi đã điền.</span></label>
    <p class="community-note">Bạn có thể dùng biệt danh. Không ghi họ tên, lớp, mã học sinh, địa chỉ hay số điện thoại trong nội dung cảm nhận.</p>
    <div class="community-honeypot" aria-hidden="true"><label for="community-touch-website">Website cá nhân</label><input id="community-touch-website" type="text" autocomplete="off" tabindex="-1"></div>
    <button class="btn btn-primary" id="community-touch-submit" type="submit" disabled>Đăng công khai</button>
    <p class="community-status" id="community-touch-status" role="status">Đang kết nối nơi lưu ký ức trực tuyến…</p>
  </form>
  <div class="community-touch-recent">
    <h4>Những cảm nhận được chia sẻ ở Chạm ${formattedId}</h4>
    <p class="community-note" id="community-touch-feed-status" role="status">Đang tải bài viết…</p>
    <div id="community-touch-feed" class="community-feed" aria-live="polite"></div>
  </div>
</section>`;
  };
  if (experience.open && currentStep === 6) renderExperience();
})();
