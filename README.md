# LibManager Pro - Hệ Thống Quản Lý Thư Viện

**LibManager Pro** là ứng dụng quản lý thư viện tập trung vào quy trình nghiệp vụ thực tế, được phát triển cho học phần **Kỹ thuật phần mềm**.

## Demo Trực Tuyến
Trải nghiệm ứng dụng tại: https://github.com/AnhHius/Project-deadline

## Tính Năng Nổi Bật
Hệ thống sử dụng cơ chế **Phân quyền người dùng (RBAC)** với các nghiệp vụ tự động:

* **Độc giả (Reader):** Tra cứu sách, đặt mượn trực tuyến, quản lý sách yêu thích và theo dõi hạn trả cá nhân.
* **Thủ thư (Librarian):** Quản lý kho sách (CRUD), duyệt mượn/thu hồi sách. Hệ thống tự động tính **Hạn trả (14 ngày)** và cập nhật tồn kho thực tế.
* **Quản trị viên (Admin):** Quản lý tài khoản toàn hệ thống, xem thống kê doanh thu và nhật ký hoạt động (System Logs).

## Công Nghệ Sử Dụng
* **Frontend:** HTML5, CSS3, JavaScript (ES6+).
* **Lưu trữ:** `LocalStorage` (Dữ liệu bền vững) và `SessionStorage` (Phiên đăng nhập).
* **Giao diện:** Kiến trúc Client-side Rendering (CSR) linh hoạt.

## Tài Khoản Kiểm Thử
| Vai trò | Tài khoản | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `admin` | `123` |
| **Thủ thư** | `thuvien_A` | `123` |
| **Độc giả** | `docgia_B` | `123` |

---
*Dự án được thực hiện bởi AnhHius - 2024*
