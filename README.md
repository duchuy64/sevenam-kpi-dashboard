# SEVEN.AM – Combined Dashboard Hub

Một Hub duy nhất chứa 2 tool báo cáo hiện có, mỗi tool chạy độc lập trong module riêng để không xung đột CSS/JS/localStorage.

## Module 1 – Commercial Dashboard
- Nguồn: `SEVENAM_Dashboard_AutoPeriod_V7`
- Có sẵn 2 tab nội bộ: Báo cáo tuần / Báo cáo tháng.
- Giữ nguyên parser dữ liệu, tự nhận kỳ, validation, Canvas và export PNG 2560×1707.

## Module 2 – KPI Dashboard
- Nguồn: `sevenam-kpi-dashboard-main`
- Có sẵn 2 tab nội bộ: BC1 – Tiến độ theo kênh / BC2 – Báo cáo Ban Giám đốc.
- Giữ nguyên parser, rule hệ thống, validation và export từng BC.

## Cách dùng
1. Mở `index.html`.
2. Chọn một trong 2 tab lớn ở thanh đầu Hub.
3. Dùng tool bên trong như bản gốc.

Có thể mở trực tiếp từng module bằng hash:
- `index.html#commercial`
- `index.html#kpi`

## Deploy GitHub Pages
Upload toàn bộ thư mục này lên repository và bật GitHub Pages từ branch chứa `index.html`.

Không đổi tên hoặc di chuyển các thư mục bên trong `modules/` nếu không cập nhật lại `hub.js`.
