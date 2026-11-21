/* Mở rộng Bước 7 ở cả 5 Chạm: giữ chức năng lưu riêng, thêm chia sẻ công khai.
 * Không tự động công khai nội dung người dùng nhập trong "Lưu cảm nhận của tôi".
 */
(function () {
  'use strict';
  const cfg = window.CHAM_CUA_VIET_COMMUNITY;
  if (!cfg || !cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) return;
  if (typeof stepMarkup !== 'function') return;
  const originalMarkup = stepMarkup;
  stepMarkup = function (point) {
    const original = originalMarkup(point);
    if (currentStep !== 6 || !point || !Number.isInteger(point.id)) return original;
    const id = point.id;
    const no = String(id).padStart(2, '0');
    return original + `
<section class="community-touch" id="community-touch" data-touch-id="${id}" aria-labelledby="community-touch-title">
  <div class="community-touch-heading">
    <p class="eyebrow">CHIA SẺ CÔNG KHAI · CHẠM ${no}</p>
    <h3 id="community-touch-title">Gửi một lời, giữ một ký ức chung</h3>
    <p>Bạn vừa có thể lưu cảm nhận riêng bằng nút phía trên, vừa có thể chia sẻ câu chuyện với mọi người tại đây. Bài đăng công khai được lưu trực tuyến, không phụ thuộc vào bộ nhớ của trình duyệt.</p>
  </div>
  <form id="community-touch-form" class="community-form community-touch-form" data-touch-id="${id}">
    <label for="community-touch-name">1. Tên hiển thị hoặc biệt danh</label>
    <input id="community-touch-name" type="text" name="name" minlength="2" maxlength="40" autocomplete="nickname" required placeholder="Ví dụ: Bạn An, Người yêu Cửa Việt">
    <label for="community-touch-message">2. Điều bạn muốn chia sẻ về Cửa Việt</label>
    <textarea id="community-touch-message" name="message" rows="4" minlength="10" maxlength="580" required placeholder="Điều để lại trong tôi nhiều cảm xúc nhất là…"></textarea>
    <label class="community-accept" for="community-touch-consent"><input id="community-touch-consent" type="checkbox" required><span>Tôi đồng ý công khai tên hiển thị và nội dung trên website để mọi người cùng đọc.</span></label>
    <p class="community-note">Không ghi số điện thoại, địa chỉ, lớp học hoặc thông tin riêng tư. Bạn có thể dùng biệt danh.</p>
    <div class="community-honeypot" aria-hidden="true"><label for="community-touch-website">Trang cá nhân</label><input id="community-touch-website" type="text" autocomplete="off" tabindex="-1"></div>
    <button class="btn btn-primary" id="community-touch-submit" type="submit" disabled>Lưu và chia sẻ với mọi người</button>
    <p class="community-status" id="community-touch-status" role="status">Đang kết nối kho ký ức chung…</p>
  </form>
  <div class="community-touch-recent">
    <h4>Mọi người đã chia sẻ gì ở Chạm ${no}?</h4>
    <p class="community-note" id="community-touch-feed-status">Đang tải những ký ức gần đây…</p>
    <div id="community-touch-feed" class="community-feed" aria-live="polite"></div>
  </div>
</section>`;
  };
})();
