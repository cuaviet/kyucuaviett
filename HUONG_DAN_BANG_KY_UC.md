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

## Cập nhật Bước 7 của cả 5 Chạm – chỉ một biểu mẫu cảm nhận

**Ô “Cảm nhận của bạn” ở Bước 7 đã được thay trực tiếp**; không tạo biểu mẫu mới ở dưới và không còn nút lưu riêng trong bước này. Câu hỏi gợi mở riêng của từng Chạm được giữ nguyên.

Thứ tự người dùng nhìn thấy: **Tên của bạn → Cảm nhận của bạn → Đồng ý công khai → Lưu và chia sẻ cảm nhận**. Khi lưu thành công, bài viết được đưa lên Cloud Firestore và hiện trong khu vực **“Những cảm nhận được chia sẻ ở Chạm XX”** ở ngay bên dưới. Tất cả các bài cũng có thể xem tại Bảng ký ức chung ở trang chủ. Cùng một collection `public_memories` và Firestore Rules; không tạo collection mới.

**Dữ liệu cá nhân cũ**: các cảm nhận đã lưu trước lần cập nhật này vẫn nằm trong dữ liệu trình duyệt và có thể xem trong **Hộ chiếu ký ức**. Nút “Lưu cảm nhận của tôi” trước đây được thay bằng “Lưu và chia sẻ cảm nhận”; người dùng phải đánh dấu đồng ý trước khi công khai, không tự đăng các ghi chép cũ.

**Điều kiện hoạt động**: Authentication → Sign-in method → **Anonymous phải Enabled**; Firestore → Rules phải là bản đã được Publish; kết nối mạng hoạt động. Nếu chưa đủ điều kiện, biểu mẫu báo lỗi và không đưa thông báo lưu thành công.

**Kiểm tra**: mở Chạm 01 → Bước 7, nhìn thấy một ô nhập tên và một ô nhập cảm nhận (không có hai biểu mẫu). Điền biệt danh, nội dung tối thiểu 10 ký tự, tích đồng ý, gửi. Xác nhận xuất hiện trong danh sách. Mở cửa sổ ẩn danh/thiết bị khác để xem. Lặp lại ở Chạm 02–05.

Lưu ý: phần Bước 7 chỉ hiển thị một số bài mới nhất thuộc từng Chạm. Các bài cũ hơn có thể tìm qua **Bảng ký ức chung** ở trang chủ bằng nút **Xem thêm ký ức cũ**.


File triển khai: `community-config.js`, `community-touch.js`, `community.js`, `community.css`, `firestore.rules`.

## Ảnh học sinh ở bốn không gian sáng tạo của Chạm 05

Trong **Chạm 05 → Khám phá**, mỗi chủ đề hiện có vẫn giữ nút **Viết ý tưởng** và được bổ sung trực tiếp một biểu mẫu **Chọn ảnh → Tên hiển thị → Ghi chú dưới ảnh → Đồng ý công khai → Lưu ảnh và ghi chú**. Hỗ trợ JPG/PNG/WebP, từng lần một ảnh tối đa 12 MB trước khi nén. Ảnh được nén xuống WebP/JPEG với chuỗi dữ liệu tối đa 220.000 ký tự để lưu trực tiếp vào **Cloud Firestore** (không phải Cloud Storage). Nhờ vậy dự án Spark không bắt buộc nâng cấp Blaze chỉ để thử nghiệm tính năng ảnh.

Bốn chủ đề có giá trị `category` cố định:
- `0`: Cửa Việt qua ống kính trẻ
- `1`: Cửa Việt qua sắc màu nghệ thuật
- `2`: Cửa Việt – Điểm hẹn du lịch
- `3`: Cửa Việt xanh trong tương lai

Dữ liệu trong collection **`community_photos`**, mỗi tài liệu gồm: `category` (số), `name` (tên/biệt danh), `caption` (ghi chú), `imageData` (ảnh đã nén), `authorUid` (người gửi ẩn danh), `status` (`pending` hoặc `approved`), `createdAt`.

### Bắt buộc: Cập nhật Firestore Rules lần nữa

Mã quy tắc đã mở rộng để hỗ trợ collection ảnh và **giữ nguyên rules cũ cho các bài viết `public_memories`**. Vì bạn đã đăng Rules trước khi bổ sung tính năng ảnh, cần:

1. Vào Firebase Console → Firestore Database → **Rules**.
2. Mở file `firestore.rules` MỚI NHẤT trong GitHub, **sao chép toàn bộ**, thay thế nội dung Rules đang có.
3. Nhấn **Publish**. Nếu không Publish, biểu mẫu ảnh sẽ bị từ chối và báo lỗi, không thể lưu.
4. Vào Firebase **Authentication → Sign-in method**, bảo đảm **Anonymous** đã bật.

### Cách giáo viên duyệt ảnh

1. Học sinh chọn ảnh, nhập biệt danh và chú thích, tích đồng ý rồi nhấn **Lưu ảnh và ghi chú**.
2. Hệ thống lưu ngay trên Firestore ở trạng thái **`pending`**. Người gửi có thể xem lại trong mục **Ảnh bạn đã gửi, đang chờ duyệt**, kể cả khi tải lại trang trên cùng trình duyệt đã giữ phiên đăng nhập ẩn danh.
3. Giáo viên vào **Firestore Database → Data → community_photos**, chọn bài mới, kiểm tra **ảnh**, tên và chú thích.
4. Để hiển thị công khai, thay đổi trường `status` từ chuỗi `pending` thành chuỗi **`approved`**, rồi **Save**.
5. Sau khi người xem tải lại website, ảnh duyệt sẽ xuất hiện kèm **tên và ghi chú ngay bên dưới**. Muốn gỡ một ảnh, giáo viên sửa `status` thành `pending` hoặc xóa tài liệu từ Firebase Console.

**Quyền riêng tư:** Mọi người chỉ được đọc ảnh `approved`; người gửi chỉ được xem bản `pending` của chính mình. Người dùng không thể tự ý duyệt, sửa hoặc xóa thông qua mã web. Giáo viên có quyền quản trị trong Firebase Console.

**Giới hạn và sao lưu:** Đây là phương án lưu **ảnh nhỏ** để trình diễn KHKT, không phù hợp cho thư viện hàng nghìn ảnh độ phân giải lớn. Không thể đảm bảo lưu “mãi mãi” nếu dịch vụ bị hủy hoặc dữ liệu bị xóa; nên định kỳ sao lưu bản gốc ảnh ở một nơi riêng. Firebase Storage dành cho ảnh gốc dung lượng lớn hiện yêu cầu Blaze; **không nâng cấp chỉ vì tính năng ảnh này**. Ảnh đã lưu chỉ được hiển thị cho mọi người sau khi giáo viên duyệt.

