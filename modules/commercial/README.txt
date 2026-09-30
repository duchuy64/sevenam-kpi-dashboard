SEVEN.AM ONLINE PERFORMANCE DASHBOARD V25

Sửa từ V24 FIXED, giữ nguyên kiến trúc/giao diện chính.

1. FIX CSKH
- Sửa lỗi nhận diện "Doanh thu khách quay lại":
  V24 kiểm tra "Khách quay lại" trước nên dòng doanh thu bị gán nhầm sang chỉ tiêu Quay lại.
- V25 ưu tiên nhận diện dòng doanh thu trước.
- Với form mẫu:
  Doanh thu khách quay lại = 229.874 tr
  Target = 600 tr
  Khách quay lại = 139 KH
  DT bình quân / KH quay lại ≈ 1.654 tr/KH
  Tỷ lệ hoàn thành ≈ 38.3%

2. KỲ BÁO CÁO / TIẾN ĐỘ THỜI GIAN
- Ngày form 17/09/2026 = ngày tổng hợp.
- Kỳ dữ liệu = 01/09/2026–16/09/2026.
- Tháng 9 có 30 ngày.
- Đã chạy 16/30 ngày = 53.3% tiến độ thời gian.
- Còn 14 ngày.
- "KỲ BÁO CÁO" và khoảng ngày tăng độ đậm.
- Thêm dòng TIẾN ĐỘ THỜI GIAN ở header.
- Card DOANH SỐ TẠO ĐƠN và DỰ BÁO THÀNH CÔNG hiển thị chênh lệch so với tiến độ thời gian:
  KPI% >= TG% => Vượt
  KPI% < TG% => Chậm

3. GIỮ NGUYÊN LOGIC V24
- Dự báo TC = Đã về + 70% Đang giao
- ROAS = Dự báo TC / Chi phí
- CP/TC = Chi phí / Dự báo TC
- Mốc chi phí = 21.9% × Dự báo TC
- Đơn đã gửi = Đang giao + Thành công + Hoàn
