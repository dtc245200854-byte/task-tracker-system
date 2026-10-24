# Hệ thống Quản lý Công việc (Task Tracker) - Đề 24

## 1. Giới thiệu
Dự án triển khai hệ thống Task Tracker hoàn chỉnh trên nền tảng Docker Compose, tích hợp cơ sở dữ liệu PostgreSQL, Nginx Reverse Proxy với các tiêu chuẩn Hardening bảo mật, hệ thống giám sát Prometheus + Grafana và hệ thống logging tập trung Loki + Promtail.

## 2. Kiến trúc Hệ thống & Danh mục Cổng Dịch vụ
| Dịch vụ | Container Name | Cổng Host | Cổng Container | Mô tả |
|---|---|---|---|---|
| **Nginx** | task_nginx | 8081 | 80 | Reverse Proxy & Security Headers |
| **Web App** | task_web | - | 3000 | Ứng dụng Node.js Task Tracker (Non-root) |
| **PostgreSQL** | task_db | - | 5432 | Cơ sở dữ liệu chính (Mạng nội bộ) |
| **pgAdmin** | task_pgadmin | 5050 | 80 | Giao diện quản trị database |
| **Prometheus** | task_prometheus | 9091 | 9090 | Thu thập metrics hệ thống |
| **Grafana** | task_grafana | 3002 | 3000 | Dashboard trực quan hóa metrics & logs |
| **cAdvisor** | task_cadvisor | - | 8080 | Thu thập metrics container |
| **postgres-exporter** | task_postgres_exporter | - | 9187 | Thu thập metrics PostgreSQL |
| **Loki** | task_loki | - | 3100 | Máy chủ gom và lập chỉ mục logs (Nội bộ) |
| **Promtail** | task_promtail | - | 9080 | Agent thu thập logs container |

## 3. Biện pháp Bảo mật (Hardening)
- Chạy container ứng dụng với tài khoản non-root (UID 10001).
- Phân tách 2 vùng mạng Docker Network (frontend_net và backend_net), không công khai cổng PostgreSQL 5432 ra host.
- Thiết lập Security Headers trên Nginx (X-Frame-Options, X-Content-Type-Options, CSP).
- Quản lý thông tin xác thực an toàn qua biến môi trường (.env), loại trừ khỏi Git repository.

## 4. Hướng dẫn Triển khai
```bash
# 1. Cấu hình file môi trường
cp .env.example .env

# 2. Khởi chạy toàn bộ hệ thống
docker compose up -d --build

# 3. Kiểm tra trạng thái
docker compose ps
