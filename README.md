<div align="center">
  
  <h1>DTGen V2 - Vietnamese Genealogy System</h1>
  <p>Hệ thống quản lý gia phả truyền thống, tích hợp Âm Lịch, Phả đồ thông minh và tự động sinh Phả ký.</p>
</div>

---

## 🌟 Giới thiệu

DTGen V2 (Dòng Tộc Genealogy) là một ứng dụng mã nguồn mở giúp các dòng họ Việt Nam số hoá việc quản lý gia phả một cách dễ dàng, trực quan và bảo mật. Đặc biệt, hệ thống xử lý hoàn hảo các trường hợp đa thê, sắp xếp con cái theo từng người mẹ - một đặc thù rất phổ biến trong gia phả truyền thống Việt Nam.

## ✨ Tính năng nổi bật

- 🌳 **Phả đồ tương tác thông minh**: Giao diện cây gia phả (Tree UI) cho phép kéo thả, thu phóng (Zoom & Pan), và highlight thành viên khi tìm kiếm.
- 👥 **Quản lý đa thê & con cái**: Giải quyết bài toán khó nhất trong gia phả Việt Nam: Sắp xếp sơ đồ vợ/chồng phụ, phân loại con cái theo từng người mẹ.
- 📆 **Đồng bộ Âm - Dương lịch**: Nhập ngày Dương tự động quy ra ngày Âm (sử dụng thư viện `lunarcalendar`).
- 📜 **Tự động sinh Phả ký**: Thay vì tự gõ tay, hệ thống sẽ tự động ghép nối thông tin ngày tháng, quê quán, vợ con để xuất thành đoạn văn phả ký truyền thống.
- 🔐 **Phân quyền bảo mật**: Tự động tạo tài khoản khi thêm thành viên (chờ kích hoạt). Tự động khóa tài khoản khi thành viên qua đời. Trang chủ (Landing Page) bảo mật thông tin nội bộ.
- 🎨 **CMS Landing Page**: Giao diện Admin cho phép tuỳ biến 100% Landing Page (Đổi màu chủ đạo, sửa tính năng, đổi Footer) mà không cần code.

## 🛠️ Công nghệ sử dụng

- **Backend:** FastAPI (Python), SQLAlchemy, PostgreSQL
- **Frontend:** React, Vite, TailwindCSS, Zustand, React-Zoom-Pan-Pinch
- **Infrastructure:** Docker & Docker Compose

## 🚀 Hướng dẫn Cài đặt & Chạy (Bằng Docker)

Dự án được đóng gói sẵn với Docker, giúp bạn triển khai chỉ với vài dòng lệnh.

### Yêu cầu hệ thống:
- Đã cài đặt [Docker](https://www.docker.com/) và Docker Compose.

### Các bước thực hiện:

1. **Clone mã nguồn:**
   ```bash
   git clone https://github.com/your-username/DTGen-v2.git
   cd DTGen-v2
   ```

2. **Khởi động các dịch vụ (Database, Backend, Frontend):**
   ```bash
   docker compose up -d --build
   ```
   *Quá trình này có thể mất vài phút cho lần đầu tiên tải image và cài đặt thư viện.*

3. **Thiết lập Database (Bắt buộc ở lần đầu tiên):**
   Hệ thống sử dụng kiểu dữ liệu cấu trúc cây (ltree) của PostgreSQL. Chạy 3 lệnh sau để khởi tạo:
   ```bash
   # Tạo extension ltree cho PostgreSQL
   docker exec dtgen_db psql -U postgres -d dtgen -c "CREATE EXTENSION IF NOT EXISTS ltree;"
   docker exec dtgen_db psql -U postgres -d dtgen -c "CREATE CAST (character varying AS ltree) WITH INOUT AS IMPLICIT;"
   
   # Khởi tạo dữ liệu mẫu và tài khoản Admin
   docker exec dtgen_backend python -m app.seed
   docker exec dtgen_backend python -m app.seed_admin
   ```

4. **Truy cập ứng dụng:**
   - **Giao diện Web:** http://localhost:5173
   - **API Docs (Swagger UI):** http://localhost:8000/docs

> **🔑 Tài khoản Admin mặc định:**
> - **Username:** `admin`
> - **Password:** `123456`


## ☕ Ủng hộ tác giả (Donate)

DTGen V2 là dự án hoàn toàn miễn phí và phi lợi nhuận nhằm gìn giữ văn hóa dòng họ Việt. Nếu bạn thấy dự án hữu ích, hãy ủng hộ để tôi có thêm động lực duy trì và phát triển tính năng mới nhé!

💳 **Thông tin Donate:**
- **Ngân hàng:** TPBank
- **Số tài khoản:** `89325010618`
- **Chủ tài khoản:** Nguyen Duc Thanh

Cảm ơn bạn rất nhiều! ❤️

## 📄 License (Giấy phép)

Dự án được phân phối dưới giấy phép **GNU AGPLv3 License**. Đây là giấy phép mã nguồn mở mạnh mẽ, đảm bảo rằng mọi biến thể của phần mềm khi cung cấp qua mạng (SaaS) đều phải công khai mã nguồn. Bạn có thể tự do sử dụng, chỉnh sửa và phân phối lại theo các điều khoản của giấy phép. Xem chi tiết tại file [LICENSE](LICENSE).

---
**Tác giả:** DucThanh
