# HƯỚNG DẪN THỐNG KÊ — CHẠM CỬA VIỆT

## Đã triển khai
- `analytics.js`: ghi nhận các sự kiện không chứa câu trả lời, tên, email hay ghi chú; chỉ hoạt động sau khi khách truy cập đồng ý. Hỗ trợ Global Privacy Control và Do Not Track.
- `analytics-config.js`: chỗ nhập **Website ID** của Umami Cloud. ID này không phải mật khẩu hay API key. Nếu còn trống thì **không có dữ liệu được gửi đi**, không hiện bảng xin đồng ý.
- `bao-cao-khao-sat.html`: phân tích CSV trước/sau xuất từ Google Forms trực tiếp trong trình duyệt, không tải tệp đi nơi khác, xuất bảng tổng hợp và in PDF. Truy cập đường dẫn `https://chamcuaviet.site/bao-cao-khao-sat.html` hoặc `https://cuaviet.github.io/kyucuaviett/bao-cao-khao-sat.html`.
- `index.html` giữ nguyên bố cục/5 Chạm và gọi 2 tệp thống kê bằng script defer.

## Kích hoạt thống kê bằng Umami Cloud (gói Hobby miễn phí)
1. Tạo tài khoản tại https://cloud.umami.is/signup và chọn **Hobby** (miễn phí; không phải trial gói trả phí).
2. Thêm Website (Add website), tên `CHẠM CỬA VIỆT`, domain `chamcuaviet.site`. Nếu vẫn chạy qua GitHub, cấu hình cho phép cả `cuaviet.github.io` nếu Umami yêu cầu.
3. Sao chép **Website ID** (chuỗi UUID) từ Settings → Websites.
4. Vào repo GitHub `cuaviet/kyucuaviett` → `analytics-config.js` → Edit (bút chì), dán UUID vào sau `websiteId:` thay cho chuỗi rỗng. KHÔNG nhập password, secret, API key.
5. Commit thay đổi. Sau khi GitHub Pages cập nhật, mở `https://chamcuaviet.site` bằng cửa sổ ẩn danh. Trình duyệt sẽ hiện dải thông báo gọn xin đồng ý thống kê. Chọn **Đồng ý thống kê** và thử vào vài Chạm, trả lời câu hỏi, mở video.
6. Mở Umami → website vừa tạo → **Realtime / Events** để kiểm tra sau vài phút. Không có số liệu trước thời điểm kích hoạt hoặc từ người từ chối.
7. Bảng thống kê Umami chỉ mở từ tài khoản chủ website; không tạo trang thống kê công khai. Không chia sẻ mật khẩu.

## Tên các sự kiện (không chứa thông tin định danh)
| Sự kiện | Ý nghĩa | Thuộc tính |
| --- | --- | --- |
| pageview mặc định của Umami | Lượt tải trang của khách đã đồng ý | không gửi hash/query |
| `cham_mo` | Mở 1 trong 5 Chạm, tối đa một lần mỗi Chạm/mỗi lần tải trang | `cham` (1–5) |
| `buoc_xem` | Mở một bước, tối đa một lần mỗi Chạm/bước/mỗi lần tải trang | `cham`, `buoc` (1–8) |
| `cau_hoi_tra_loi` | Một lượt trả lời câu hỏi | `cham`, `loai`, `dung` (0 hoặc 1) |
| `cham_hoan_thanh` | Nhận dấu hộ chiếu mới lần đầu trên thiết bị này | `cham` |
| `video_phat` | Phát video, tối đa một lần mỗi Chạm/mỗi lần tải trang | `cham` |
| `khao_sat_luu` | Một lượt lưu khảo sát nội bộ Chạm 5 | `cham=5` |
| `phieu_khao_sat_tai` | Một lượt tải bản phiếu về máy | `cham=5` |
| `cam_nhan_luu` | Một lượt lưu cảm nhận | `cham` |
| `nhat_ky_tai` | Một lượt tải nhật ký hộ chiếu | không có |
| `thuyet_minh_mo` | Lượt bấm nghe thuyết minh | không có |

**Chỉ số cần giải thích đúng:**
- `pageview` ≠ số học sinh duy nhất. Dữ liệu chỉ gồm người đã đồng ý, không tính người bật DNT/GPC.
- `cham_mo` là số lượt Chạm được mở, không phải số người xem độc nhất. Vì giới hạn một lần mỗi Chạm/một lần tải trang, số liệu không phải số lần bấm tuyệt đối.
- `cau_hoi_tra_loi` ghi *lượt làm bài*, không phải điểm thi chính thức hay điểm TB riêng từng học sinh.
- `cham_hoan_thanh` ghi việc nhận dấu mới của một thiết bị; không đồng nhất với số học sinh vì một máy có thể dùng chung.
- `khao_sat_luu` chỉ đếm số lần lưu phiếu **bên trong website**; nội dung tự luận vẫn lưu cục bộ. **KHÔNG** tự tổng hợp kết quả Google Forms.
- Dữ liệu CSV kết quả khảo sát từ Google Forms phải được nhập thủ công vào `bao-cao-khao-sat.html`; so sánh chỉ hợp lệ khi câu hỏi, cách hỏi và các lựa chọn tương đương.
- Tính năng không nhận biết được giới tính, khối/lớp, tên hay vị trí GPS của học sinh và không nên bổ sung các thông tin đó vào sự kiện.
- Để nghiên cứu có giá trị, nên ghi ngày bắt đầu triển khai, tổng số học sinh được mời và số thực tế hoàn tất phiếu qua quy trình khảo sát riêng.

## Thay đổi quyền riêng tư
Người xem có thể chọn lại trong mục **Quyền riêng tư** đã có sẵn ở chân trang. Nếu chọn tắt sau khi đã bật, trang sẽ tải lại để dừng việc gửi dữ liệu. Tắt về sau không tự xóa dữ liệu thống kê đã gửi; người quản lý cần xóa trên tài khoản Umami khi có yêu cầu hợp lệ.

Thống kê được thiết kế tối thiểu nhưng việc sử dụng với học sinh cần thực hiện theo quy định về quyền riêng tư của nhà trường; xem chính sách Umami và điều khoản dịch vụ trước khi kích hoạt. Umami là bên thứ ba và có thể xử lý dữ liệu kỹ thuật phục vụ dịch vụ dù mã trang không gửi thông tin định danh.

## Vì sao dùng một nền tảng ngoài?
GitHub Pages chỉ cung cấp trang tĩnh, không có máy chủ hoặc cơ sở dữ liệu riêng để nhận và tổng hợp thống kê. Không đưa token bí mật hoặc tài khoản quản trị lên GitHub public. Trang báo cáo CSV hoạt động độc lập và có thể dùng ngay cả khi chưa tạo Umami.
