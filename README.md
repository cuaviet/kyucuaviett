# CHẠM CỬA VIỆT

Website giáo dục lịch sử, văn hóa và con người Cửa Việt (Quảng Trị) qua 5 điểm chạm tương tác.

- Trang chính: https://chamcuaviet.site
- Trang tĩnh (HTML/CSS/JS thuần), triển khai bằng GitHub Pages (`CNAME`, `.nojekyll`).
- Bảng ký ức chung dùng Firebase (Anonymous Auth + Firestore, quy tắc ở `firestore.rules`).
- Thống kê tùy chọn bằng Umami Cloud, chỉ chạy khi khách đồng ý (xem `HUONG_DAN_THONG_KE.md`).
- Nguồn ảnh: xem `nguon-anh.html` và `photo-sources-audit.md`.

## Chạy thử trên máy

```bash
python3 -m http.server 8000
```

Mở http://localhost:8000.
