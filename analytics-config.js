/* Cấu hình thống kê CHẠM CỬA VIỆT.
 * Chỉ điền websiteId nhận từ Umami Cloud khi đã sẵn sàng.
 * KHÔNG điền API key, mật khẩu hay mã bí mật vào kho GitHub công khai.
 */
window.CHAM_CUA_VIET_ANALYTICS = Object.freeze({
  websiteId: '',
  scriptUrl: 'https://cloud.umami.is/script.js',
  allowedHosts: ['chamcuaviet.site', 'www.chamcuaviet.site', 'cuaviet.github.io']
});
