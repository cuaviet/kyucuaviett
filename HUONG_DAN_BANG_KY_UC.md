# Kích hoạt Bảng ký ức chung cho website CHẠM CỬA VIỆT

Đây là chức năng **lưu trực tuyến thật**, khác với “Hộ chiếu ký ức” vốn chỉ lưu trên máy người xem. Học sinh nhập tên hiển thị, nội dung và bấm **Lưu và chia sẻ**. Lời nhắn được lưu trong Cloud Firestore, hiện cho mọi người tại website. Có thể xem thêm các lời nhắn cũ. Ảnh/video không được tải lên ở tính năng này.

## Bước 1: Tạo dự án Firebase miễn phí
1. Vào https://console.firebase.google.com/ và tạo một dự án, ví dụ cham-cua-viet.
2. Thêm ứng dụng Web (biểu tượng </>) trong dự án; không cần cài Firebase Hosting vì website vẫn chạy trên GitHub Pages.
3. Trong Project settings > Your apps > SDK setup and configuration chọn **Config**. Sao chép 4 thông tin công khai: `apiKey`, `authDomain`, `projectId`, `appId`.
4. Gửi các thông tin trên cho trợ lý để điền vào file `community-config.js` trên GitHub, hoặc tự điền vào file này. **Không gửi mật khẩu tài khoản, service account JSON hay private key.**

## Bước 2: Bật dữ liệu và xác thực
1. Menu **Build > Firestore Database > Create database**; chọn vị trí phù hợp, chế độ Production.
2. Vào **Build > Authentication > Get started > Sign-in method**, bật **Anonymous**.
3. Vào **Authentication > Settings > Authorized domains**, nếu cần thêm `chamcuaviet.site`, `www.chamcuaviet.site`, và `cuaviet.github.io`.
4. Mở **Firestore Database > Rules**, dán nội dung file `firestore.rules` của repository, nhấn **Publish**.
5. Không đặt Security Rules theo kiểu `allow read, write: if true` vì dễ bị lạm dụng.

## Bước 3: Kiểm tra chức năng
1. Truy cập https://chamcuaviet.site/; khi kết nối xong, mục **Bảng ký ức chung** xuất hiện gần Góc sáng tạo.
2. Điền tên hiển thị, nội dung và đồng ý công khai; nhấn **Lưu và chia sẻ**.
3. Mở website trên điện thoại hoặc cửa sổ ẩn danh khác để kiểm tra bài có hiện hay không.
4. Giáo viên quản lý, xóa bài vi phạm trực tiếp tại **Firestore Database > Data > public_memories** trong Firebase console.

## An toàn và giới hạn
- Mọi bài gửi được **công khai ngay sau khi lưu**; vì website phục vụ học sinh, giáo viên cần thường xuyên kiểm tra nội dung và cân nhắc bổ sung chế độ duyệt trước khi đăng.
- Hãy yêu cầu học sinh dùng tên ngắn hoặc biệt danh; **không đăng số điện thoại, địa chỉ, lớp cụ thể, thông tin cá nhân nhạy cảm**. Biểu mẫu có ô xác nhận nội dung sẽ công khai.
- Nội dung được lưu trên Firebase, không phụ thuộc vào xóa bộ nhớ trình duyệt. Tuy nhiên không dịch vụ nào cam kết lưu **vĩnh viễn**: cần duy trì dự án Firebase, quản lý tài khoản và sao lưu dữ liệu định kỳ.
- Quy tắc bảo mật hiện giới hạn cấu trúc bài đăng, quyền sửa/xóa; hạn chế 2 phút là trên trình duyệt, **không chặn được mọi spam**. Nên bật Firebase **App Check** và giám sát lưu lượng trước khi mở cho số lượng lớn học sinh.
- Firebase có hạn mức dùng miễn phí cho Cloud Firestore. Kiểm tra https://firebase.google.com/docs/firestore/quotas.
- Không thay thế bảng khảo sát nghiên cứu và không ghi tự động nội dung công khai vào thống kê Umami.

File triển khai: `community-config.js`, `community.js`, `community.css`, `firestore.rules`.
