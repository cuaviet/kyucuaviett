# CHẠM CỬA VIỆT

Website giáo dục lịch sử, văn hóa và con người Cửa Việt (Quảng Trị) qua 5 điểm chạm tương tác.

- Trang chính: https://chamcuaviet.site
- Trang tĩnh (HTML/CSS/JS thuần), triển khai bằng GitHub Pages (`CNAME`, `.nojekyll`).
- Bảng ký ức chung dùng Firebase (Anonymous Auth + Firestore, quy tắc ở `firestore.rules`).
- Thống kê tùy chọn bằng Umami Cloud, chỉ chạy khi khách đồng ý (xem `HUONG_DAN_THONG_KE.md`).
- Nguồn ảnh: xem `nguon-anh.html` và `photo-sources-audit.md`.

## Thế giới 3D (sa bàn Cửa Việt)

- Phía sau toàn trang là một sa bàn 3D Cửa Việt dựng bằng mã (three.js tự lưu trong `vendor/three/`, không dùng CDN):
  sông Thạch Hãn đổ ra biển, hai bờ, cầu, cảng cá, đài tưởng niệm, rừng phi lao, làng. Vị trí mang tính minh họa.
- Khi cuộn, camera bay quanh sa bàn theo từng phần; nắng đi từ buổi sáng tới hoàng hôn. Ở "Bản đồ ký ức",
  5 cột mốc Chạm bấm được (mở đúng nội dung Chạm), có thể kéo để xoay sa bàn.
- `world3d.js` (nhỏ) kiểm tra máy có WebGL2 tăng tốc phần cứng không và chỉ tải `world3d-scene.js` khi người xem
  bắt đầu tương tác. Máy không hỗ trợ, hoặc người xem bấm nút **3D** để tắt, thì trang dùng bản đồ 2D như cũ.
- Khi trình chiếu: thêm `?3d=1` (luôn bật, kể cả máy không có card đồ họa) hoặc `?3d=0` (luôn tắt) vào địa chỉ.

## Chạy thử trên máy

```bash
python3 -m http.server 8000
```

Mở http://localhost:8000.
