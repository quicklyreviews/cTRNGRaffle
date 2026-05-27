# 🛰️ Hướng Dẫn Cài Đặt Dự Án cTRNG Raffle Standalone

Dự án này là phiên bản độc lập (standalone) của hệ thống rút thăm Cosmic Raffle từ GigaWork. Toàn bộ logic tương tác với **Arc blockchain đã được loại bỏ hoàn toàn**, thay thế bằng cơ chế xác thực Admin bằng mật khẩu đơn giản, nhưng **giữ nguyên 100% giao diện (UI/UX) cyberpunk cao cấp, hệ thống SpaceComputer cTRNG (Cosmic True Random Number Generator), IPNS beacon gateway, và cơ chế Merkle Tree chứng minh tính minh bạch tuyệt đối**.

---

## 🌌 Kiến Trúc Rút Thăm Minh Bạch (Off-chain Provably Fair)

```mermaid
graph TD
    A[Admin tạo Campaign] -->|1. Freeze danh sách| B[Merkle Tree Root Hash]
    B -->|2. Lưu DB| C[(PostgreSQL Database)]
    D[Đợi Target Lock Time] -->|3. Hết thời gian chờ| E[Trigger Draw]
    E -->|4. Lấy Entropy vũ trụ| F[SpaceComputer Satellite cTRNG]
    F -->|5. Trộn Entropy| G[Keccak256 Cosmic Seed]
    G -->|6. Rút thăm deterministic| H[Fisher-Yates Sparse Swap]
    H -->|7. Chọn người thắng| I[Winner Board]
    H -->|8. Tạo chứng chỉ| J[Merkle Proofs]

    style A fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style B fill:#0f172a,stroke:#22d3ee,color:#e0f2fe
    style C fill:#0f172a,stroke:#34d399,color:#d1fae5
    style F fill:#0f172a,stroke:#f59e0b,color:#fef3c7
    style G fill:#0f172a,stroke:#a78bfa,color:#ede9fe
    style I fill:#1e3a8a,stroke:#3b82f6,color:#eff6ff
```

| Tính năng | Cosmic Raffle (Cũ) | cTRNG Standalone (Mới) |
|---|---|---|
| **Môi trường chuỗi** | Smart contract trên Arc Testnet | Off-chain (Chạy hoàn toàn trên Next.js Server) |
| **Xác thực người dùng** | Privy Web3 Wallet Connect | Admin Password Session (`ADMIN_PASSWORD`) |
| **Entropy ngẫu nhiên** | SpaceComputer cTRNG + Arc Blockhash | SpaceComputer cTRNG + Campaign Metadata |
| **Bảo mật rút thăm** | Khóa target Block tương lai (10 blocks) | Khóa target Timestamp tương lai (15 giây) |
| **Chi phí Gas** | ~0.001 USDC (On-chain Gas) | **Hoàn toàn miễn phí** (0.00 USDC) |
| **Xác minh kết quả** | On-chain contract + Merkle Proof | Seed + Merkle Proof trực tiếp tại Browser |

---

## 🛠️ Quy Trình Khởi Chạy Dự Án

### 1. Cấu hình Môi trường (`.env`)
Tạo file `.env` từ file mẫu `.env.example` và cấu hình các biến môi trường sau:

```bash
# Đường dẫn kết nối PostgreSQL (Ví dụ: Supabase, local PostgreSQL, Neon DB, v.v.)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ctrng_raffle

# Mật khẩu quản trị viên để tạo chiến dịch & thực hiện rút thăm
ADMIN_PASSWORD=ctrng-admin-secret-99

# API credentials từ cổng thông tin SpaceComputer (https://spacecomputer.io)
# Nếu để trống, hệ thống sẽ tự động chuyển sang IPFS public gateway mirrors.
ORBITPORT_CLIENT_ID=
ORBITPORT_CLIENT_SECRET=
```

### 2. Cập nhật và Khởi tạo Database
Dự án sử dụng **Drizzle ORM** để quản lý database schema. Chạy các lệnh sau để tự động khởi tạo bảng:

```bash
# Tự động đồng bộ cấu trúc bảng schema vào PostgreSQL của bạn
npx drizzle-kit push
```

### 3. Cài đặt các gói phụ thuộc (Dependencies)
Nếu bạn cài đặt từ đầu, hãy chạy lệnh sau:

```bash
pnpm install
```

### 4. Khởi chạy Server Phát triển (Development)
Khởi động Next.js ở môi trường phát triển:

```bash
pnpm dev
```
Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để trải nghiệm giao diện!

---

## 🔑 Hướng Dẫn Sử Dụng Chức Năng

### 1. Xem danh sách & Chi tiết chiến dịch (Public)
* Mọi người dùng bình thường đều có thể truy cập trang chủ (`/`) để xem danh sách các chiến dịch đã được khởi tạo.
* Người tham gia có thể click vào chi tiết chiến dịch (`/raffle/[id]`) để xem:
  - Bảng đếm ngược thời gian khóa (Commitment countdown).
  - Trạng thái chiến dịch (Active / Drawn).
  - Tra cứu kết quả và tự sinh chứng chỉ Merkle Proof cá nhân thông qua thanh tìm kiếm ở **Check Winning Tickets**.

### 2. Tạo chiến dịch Rút thăm mới (Admin)
* Truy cập trang `/create` và làm theo wizard 3 bước:
  1. **Bước 1 (Information)**: Nhập tiêu đề chiến dịch, mô tả giải thưởng và số lượng người thắng giải.
  2. **Bước 2 (Contestants)**: Nhập hoặc paste danh sách thí sinh (hỗ trợ định dạng plain text dòng đơn hoặc CSV). Hệ thống sẽ tự động lọc trùng và tạo mã hóa **Merkle Tree Root** cùng mốc khóa cam kết thời gian (Commitment Timestamp) tự động cộng thêm 15 giây.
  3. **Bước 3 (Deployment)**: Xem lại tổng quan chiến dịch.
     - **Nếu bạn chưa đăng nhập**: Hệ thống sẽ hiển thị một ô nhập mật khẩu admin **Admin Password** bảo mật cao ngay trong khung.
     - Nhập mật khẩu admin đã cấu hình trong `.env` để Deploy chiến dịch lên database.

### 3. Thực hiện Rút thăm (Admin)
* Tại trang chi tiết chiến dịch `/raffle/[id]`, sau khi bộ đếm ngược thời gian cam kết kết thúc (Unlocked):
* Nếu Admin chưa xác thực session, hệ thống sẽ hiển thị form yêu cầu nhập **Admin Password** để kích hoạt quyền rút thăm.
* Nhấp **Trigger Off-Chain Draw (cTRNG)**:
  - Hệ thống sẽ hiển thị bảng điều khiển Cyberpunk live-terminal tuyệt đẹp, cuộn logs thời gian thực khi kết nối với vệ tinh SpaceComputer cTRNG.
  - Sau khi giải mã thành công Cosmic Seed, thuật toán Fisher-Yates sẽ tính toán ra danh sách người chiến thắng và tạo Merkle Proofs cho từng người.
  - Bảng vàng người trúng giải (Winner Board) được hiển thị dạng hiệu ứng stagger lấp lánh sang trọng.

### 4. Xác minh kết quả độc lập (Offline Verification Console)
* Ở góc trên bên phải trang chi tiết chiến dịch, click vào **Offline Self-Verification Console**.
* Trang này chạy **100% độc lập bằng JavaScript thuần trên trình duyệt** (không gọi bất kỳ API nào về máy chủ) cho phép bất kỳ ai cũng có thể paste danh sách thí sinh thô và Cosmic Seed để tự tính toán lại:
  1. Xác minh Merkle Root trùng khớp tuyệt đối 1-1 với root đã cam kết.
  2. Mô phỏng thuật toán swap Fisher-Yates off-chain để chứng minh kết quả rút thăm hoàn toàn ngẫu nhiên và chính xác tuyệt đối.

---

## ⚡ Đặc Tả Thuật Toán Chứng Minh Tính Minh Bạch (Provably Fair Spec)

Để đảm bảo tính xác thực tối đa cho các nhà phát triển và người tham gia, thuật toán cốt lõi hoạt động như sau:

1. **Khởi tạo Merkle Tree (merkle.ts)**:
   - Từng dòng thí sinh normalized được hash kép bằng Keccak256: `leafHash = keccak256(keccak256(entry))`.
   - Kết hợp các cặp lá theo quy chuẩn OpenZeppelin: `combineHash = a < b ? keccak256(a + b) : keccak256(b + a)`.
   - Thu được gốc **Merkle Root** đại diện cho toàn bộ danh sách thí sinh đóng băng.

2. **Tạo Cosmic Seed (fetchCosmicSeed.ts)**:
   - Khi hết thời gian khóa, SpaceComputer cTRNG cung cấp entropy vật lý `spaceComputerEntropy` từ vũ trụ.
   - Hạt giống Cosmic Seed được tạo ra bằng cách trộn: `finalSeed = keccak256(raffleId + commitTimestamp + spaceComputerEntropy)`.

3. **Rút thăm Fisher-Yates Swap (draw.ts)**:
   - Với mỗi người thắng giải thứ `i` từ `0` đến `winnerCount - 1`:
     - `rand = keccak256(seed + i)`.
     - Chỉ số `j = i + (rand % (totalEntries - i))`.
     - Thực hiện tráo đổi phần tử sparse array tại vị trí `i` và `j` để xác định trúng thưởng mà không thay đổi thứ tự gốc của Merkle Tree.
