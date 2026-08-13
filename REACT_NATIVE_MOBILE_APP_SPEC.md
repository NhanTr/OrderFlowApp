# Order Flow — React Native Manager Dashboard

> Phiên bản: 1.0  
> Ngày đối chiếu code: 2026-08-13  
> Phạm vi: ứng dụng iOS/Android chỉ dành cho `OWNER`, hiển thị dashboard quản lý ở chế độ read-only.  
> Stack khuyến nghị: Expo + React Native + TypeScript.

## 1. Mục tiêu

Xây dựng ứng dụng React Native giúp chủ quán theo dõi hoạt động từ backend Order Flow:

- Đăng nhập bằng tài khoản `OWNER`.
- Khôi phục phiên, refresh token và đăng xuất an toàn.
- Xem dashboard doanh thu, đơn hàng, tình trạng vận hành và cảnh báo.
- Xem danh sách, bộ lọc và chi tiết đơn hàng.
- Xem danh mục, thực đơn và nhân viên.
- Hoạt động trên iOS và Android từ cùng một codebase.

Ứng dụng không dành cho `SERVICE_STAFF` hoặc `BARISTA`. MVP không tạo đơn, xác nhận thanh toán, claim đơn, chuyển trạng thái pha chế hoặc chỉnh sửa dữ liệu quản trị.

## 2. Nguồn sự thật

Khi triển khai, ưu tiên theo thứ tự:

1. Tài liệu này cho phạm vi và kiến trúc mobile React Native.
2. `backend/apps/api/src/` cho hành vi API đang chạy.
3. `backend/docs/openapi.yaml` cho request/response contract.
4. `backend/docs/api-contract.md` cho trạng thái triển khai route.
5. `frontend/src/app/(admin)/dashboard/page.tsx` chỉ để tham khảo bố cục.

Không dùng dữ liệu mock trong frontend làm dữ liệu production.

## 3. Lựa chọn công nghệ

| Nhu cầu | Giải pháp |
| --- | --- |
| Runtime | Expo, React Native, TypeScript strict mode |
| Điều hướng | Expo Router |
| Server state | TanStack Query |
| HTTP | Axios với một API client tập trung |
| Form | React Hook Form + Zod |
| Token bí mật | Expo SecureStore |
| State phiên | React Context hoặc Zustand; không nhân bản server state |
| Cache offline | TanStack Query persistence, chỉ lưu dữ liệu không nhạy cảm |
| Biểu đồ | Victory Native hoặc thư viện chart tương thích Expo hiện tại |
| Test | Jest, React Native Testing Library, MSW |
| Format/lint | ESLint + Prettier |

Không lưu refresh token bằng AsyncStorage. Access token chỉ giữ trong memory; refresh token lưu bằng SecureStore.

## 4. Khởi tạo dự án

Tạo app ở ngoài thư mục Swift hiện tại hoặc trong monorepo dưới tên `mobile/`:

```bash
npx create-expo-app@latest order-flow-mobile --template
cd order-flow-mobile
npx expo install expo-router expo-secure-store expo-status-bar
npm install @tanstack/react-query axios react-hook-form zod @hookform/resolvers
```

Bật TypeScript strict trong `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

Tên package/bundle gợi ý:

```json
{
  "expo": {
    "name": "Order Flow Manager",
    "slug": "order-flow-manager",
    "scheme": "orderflow",
    "ios": { "bundleIdentifier": "nhantr.OrderFlowManager" },
    "android": { "package": "nhantr.orderflowmanager" }
  }
}
```

## 5. Cấu hình môi trường và mạng local

Tạo `.env.local`, không commit file này:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://10.251.10.188:3001/api/v1
EXPO_PUBLIC_API_ENVIRONMENT=Development
```

Chỉ biến có tiền tố `EXPO_PUBLIC_` mới được dùng trong JavaScript bundle. Không đặt secret backend vào bất kỳ biến `EXPO_PUBLIC_*` nào.

Quy tắc địa chỉ API:

| Thiết bị chạy app | Base URL local |
| --- | --- |
| iPhone/Android thật | IP LAN hiện tại của máy chạy backend, hai thiết bị cùng Wi-Fi |
| iOS Simulator | `http://127.0.0.1:3001/api/v1` |
| Android Emulator | `http://10.0.2.2:3001/api/v1` |
| Staging/Production | URL HTTPS công khai |

Không dùng `localhost` trên điện thoại thật vì nó trỏ vào chính điện thoại. IP LAN có thể đổi khi chuyển Wi-Fi; cần cập nhật `.env.local`, khởi động lại Metro và build/cài lại app nếu giá trị đã được đóng vào bundle.

Cho phép kết nối HTTP local trong development, nhưng production bắt buộc HTTPS. Với Expo config có thể dùng:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocalNetworkUsageDescription": "Order Flow cần kết nối với máy chủ quản lý trong cùng mạng Wi-Fi.",
        "NSAppTransportSecurity": { "NSAllowsLocalNetworking": true }
      }
    },
    "android": { "usesCleartextTraffic": true }
  }
}
```

Chỉ bật `usesCleartextTraffic` cho bản development nếu quy trình build cho phép tách cấu hình theo môi trường.

## 6. Quy tắc bảo mật

1. Chỉ `OWNER` được vào app. Nếu login hoặc `/me` trả role khác, xóa session và hiển thị “Ứng dụng chỉ dành cho chủ quán”.
2. Không nhúng `BOT_INTERNAL_SECRET`, `TELEGRAM_BOT_TOKEN`, JWT secret, SePay credential hoặc database key.
3. App chỉ gửi `Authorization: Bearer <accessToken>`.
4. Refresh token lưu bằng SecureStore; access token giữ trong memory.
5. Không ghi token vào log, analytics, error report, URL hoặc query string.
6. Chỉ dùng HTTPS ở staging/production.
7. Dữ liệu backend là nguồn sự thật; app không tự tính doanh thu toàn hệ thống từ một page orders.
8. Khi logout, luôn xóa local token kể cả request logout thất bại.

## 7. API hiện có

Base path: `/api/v1`.

### Authentication

| Method | Path | Mục đích |
| --- | --- | --- |
| `POST` | `/admin/auth/login` | Login username/password |
| `POST` | `/admin/auth/refresh` | Rotate refresh token |
| `POST` | `/admin/auth/logout` | Kết thúc session |
| `GET` | `/admin/auth/me` | Profile OWNER hiện tại |

### Dashboard và orders

| Method | Path | Query |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | `days=1...90`, mặc định `7` |
| `GET` | `/admin/orders` | `fulfillmentStatus?`, `paymentStatus?`, `createdByUserId?`, `assignedBaristaId?`, `page`, `limit` |
| `GET` | `/admin/orders/:orderId` | — |

Các route này đã được backend triển khai. Dashboard yêu cầu OWNER. Admin orders yêu cầu authenticated admin access. MVP chỉ gọi GET, không gọi `override-status`.

Dashboard hiện trả:

- Live PostgreSQL aggregates.
- Revenue amount dạng decimal string do backend dùng `BigInt`.
- `days=1`: 24 bucket theo giờ.
- `days>1`: bucket theo ngày.
- Timezone doanh thu: `Asia/Ho_Chi_Minh`.
- Recent orders và payment alerts trong cùng snapshot.

### Employees và menu

| Method | Path |
| --- | --- |
| `GET` | `/admin/employees?page=&limit=&search=&role=&status=` |
| `GET` | `/admin/employees/:employeeId` |
| `GET` | `/admin/menu-categories?search=&isActive=` |
| `GET` | `/admin/menu-items?page=&limit=&categoryId=&search=&isAvailable=` |
| `GET` | `/admin/menu-items/:itemId` |

Không gọi POST/PATCH/DELETE trong MVP.

### Envelope và lỗi

Single resource:

```json
{ "data": {} }
```

List:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 30, "total": 0, "totalPages": 0 }
}
```

Client phải hỗ trợ error envelope thực tế của backend và luôn có fallback message khi response không đúng schema.

## 8. TypeScript domain model

```ts
export type UserRole = 'OWNER' | 'SERVICE_STAFF' | 'BARISTA';
export type EmployeeRole = 'SERVICE_STAFF' | 'BARISTA';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type PaymentMethod = 'CASH' | 'QR';
export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PAID'
  | 'UNDERPAID'
  | 'OVERPAID'
  | 'REVIEW';
export type FulfillmentStatus =
  | 'PENDING_PAYMENT'
  | 'QUEUED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export type Money = string;

export interface AuthUser {
  id: string;
  fullName: string;
  username?: string | null;
  telegramUserId?: string | null;
  role: UserRole;
}
```

Giữ tiền từ API dưới dạng decimal string trong transport/domain layer để không mất chính xác. Chỉ chuyển sang `number` khi chắc chắn giá trị nằm trong giới hạn an toàn và thư viện chart bắt buộc dùng number. Không dùng phép toán tiền bằng floating point cho nghiệp vụ.

Các model cần có:

```text
DashboardSnapshot
  generatedAt, timeZone, range, summary, health,
  revenueSeries, recentOrders, paymentAlerts

OrderSummary
  id, orderCode, paymentMethod?, paymentStatus, fulfillmentStatus,
  totalAmount:Money, createdByUserId, assignedBaristaId?, createdAt

OrderDetail
  các field OrderSummary + customerNote?, cancellationReason?, paidAt?,
  items, timeline, updatedAt

OrderItem
  id, menuItemId, itemName, unitPrice:Money, quantity, note?

Employee
  id, fullName, telegramUserId, telegramChatId?, username?,
  role, status, createdAt, updatedAt

MenuCategory
  id, name, displayOrder, isActive, createdAt, updatedAt

MenuItem
  id, categoryId, name, description?, price:Money,
  isAvailable, imageUrl?, displayOrder, createdAt, updatedAt
```

Tạo DTO ở `src/api/dto/` và mapper sang domain model. Không để compatibility naming như `orderCode/code` hoặc `itemName/name` lan vào component.

## 9. Cấu trúc thư mục

```text
order-flow-mobile/
├── app/
│   ├── _layout.tsx
│   ├── (auth)/
│   │   └── login.tsx
│   └── (app)/
│       ├── _layout.tsx
│       ├── (tabs)/
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   ├── orders.tsx
│       │   ├── catalog.tsx
│       │   └── more.tsx
│       ├── orders/[id].tsx
│       ├── menu/[id].tsx
│       └── employees/[id].tsx
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints/
│   │   ├── dto/
│   │   └── mappers/
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   ├── session.ts
│   │   └── tokenStore.ts
│   ├── components/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── menu/
│   │   ├── employees/
│   │   └── account/
│   ├── hooks/
│   ├── query/
│   ├── theme/
│   ├── types/
│   └── utils/
├── assets/
├── __tests__/
├── app.config.ts
└── package.json
```

Screen/component không gọi Axios trực tiếp. Endpoint function, DTO validation, mapper, query hook và UI state phải tách riêng.

## 10. Điều hướng và màn hình

App có bốn tab:

1. `Tổng quan`
2. `Đơn hàng`
3. `Danh mục`
4. `Khác` — Thực đơn, Nhân viên, Tài khoản

### Login

- Username, password và nút “Đăng nhập”.
- Dùng API thật, không giữ credential demo.
- Validate bằng Zod, loading khi submit, lỗi hiển thị trong form.
- Sau login phải kiểm tra `user.role === 'OWNER'`.
- Khi mở app, đọc refresh token từ SecureStore và restore session trước khi quyết định route.
- Dùng splash/loading screen trong lúc restore để tránh nháy màn hình Login.

### Tổng quan

- Header, tên OWNER và nút refresh.
- Chọn khoảng `1 ngày`, `7 ngày`, `30 ngày` và gửi query `days`.
- KPI: doanh thu kỳ, hôm nay, tổng đơn, trung bình mỗi đơn.
- Revenue chart; `days=1` hiển thị theo giờ, khoảng dài hiển thị theo ngày.
- Tình trạng vận hành, cảnh báo và đơn mới nhất.
- Pull-to-refresh và giữ dữ liệu cũ trong lúc refetch.
- Khi đổi `days`, query key phải đổi và request cũ có thể được hủy bằng `AbortSignal`.

### Đơn hàng

- Filter payment status và fulfillment status.
- Dùng infinite query hoặc pagination từ backend.
- Không filter giả toàn bộ danh sách từ một page đã tải.
- Card hiển thị mã đơn, thời gian, tổng tiền, payment method và hai status badge.
- Detail hiển thị item, tổng, creator/assignee, payment, fulfillment và timeline.
- Read-only, không có cancel, override, claim, ready hoặc deliver.

### Danh mục và thực đơn

- Category sắp theo `displayOrder`.
- Item card có ảnh, tên, mô tả, giá VND và availability.
- OWNER thấy cả active/inactive và available/unavailable.
- Không có thêm/sửa/xóa trong MVP.

### Nhân viên

- List/search/filter theo role và status.
- Detail có Telegram ID/chat ID nếu backend trả về.
- Read-only.

### Tài khoản

- Full name, username, role và tên môi trường.
- Chỉ hiển thị base URL development khi cần chẩn đoán; không hiển thị secret.
- Logout gọi API rồi luôn xóa SecureStore và query cache.

## 11. Session và networking

Luồng request chuẩn:

1. Axios request interceptor gắn access token từ memory.
2. Khi nhận `401`, chỉ một refresh request được chạy tại một thời điểm.
3. Các request khác chờ cùng một Promise refresh.
4. Refresh thành công: cập nhật access token, lưu refresh token mới và replay request đúng một lần.
5. Refresh thất bại hoặc replay vẫn `401`: xóa session, query cache và chuyển về Login.
6. `403`: không refresh; hiển thị lỗi quyền/tài khoản inactive.

Backend rotate refresh token sau mỗi lần dùng, vì vậy single-flight là bắt buộc. Gắn cờ `_retry` cho request để tránh vòng lặp interceptor vô hạn.

GET có thể retry giới hạn bằng TanStack Query. Không retry `401`, `403` hoặc lỗi validation `4xx`. Có thể retry lỗi mạng/`5xx` tối đa 2 lần với backoff.

Khi app trở lại foreground, dùng `AppState` kết hợp focus manager của TanStack Query để refetch dữ liệu đang active.

## 12. Cache và offline

- Cache dashboard/orders/menu/employees bằng TanStack Query.
- Có thể persist snapshot không nhạy cảm bằng AsyncStorage.
- Không persist access token, refresh token, password hoặc Authorization header trong query cache.
- Khi offline và có cache, hiển thị dữ liệu cũ cùng nhãn “Dữ liệu có thể đã cũ”.
- Lần load đầu không có cache: dùng skeleton.
- Refetch lỗi nhưng có data cũ: giữ data và hiển thị banner nhỏ, không thay toàn màn hình bằng error.

## 13. Status hiển thị

Payment:

| Code | Nhãn |
| --- | --- |
| `UNPAID` | Chưa thanh toán |
| `PENDING` | Chờ xác nhận |
| `PAID` | Đã thanh toán |
| `UNDERPAID` | Thiếu tiền |
| `OVERPAID` | Thừa tiền |
| `REVIEW` | Cần kiểm tra |

Fulfillment:

| Code | Nhãn |
| --- | --- |
| `PENDING_PAYMENT` | Chờ thanh toán |
| `QUEUED` | Chờ pha chế |
| `PREPARING` | Đang pha chế |
| `READY` | Sẵn sàng giao |
| `DELIVERED` | Đã giao |
| `CANCELLED` | Đã hủy |

Status luôn có text, không truyền đạt chỉ bằng màu.

## 14. UI system

- Giao diện sáng, card trắng, nền slate nhạt, brand xanh teal.
- Spacing theo lưới 4pt; bo góc 12–16.
- Format VND bằng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- Dùng `useWindowDimensions`, không hard-code theo một kích thước iPhone.
- Hỗ trợ Dynamic Type/font scaling, screen reader label và vùng chạm tối thiểu 44x44.
- Keyboard tránh che input bằng `KeyboardAvoidingView`.
- `FlatList`/`SectionList` cho danh sách dài; không bọc danh sách lớn trong `ScrollView`.
- iPhone portrait là baseline; tablet có thể dùng grid hai cột.

## 15. Query key đề xuất

```ts
export const queryKeys = {
  me: ['auth', 'me'] as const,
  dashboard: (days: number) => ['dashboard', { days }] as const,
  orders: (filters: OrderFilters) => ['orders', filters] as const,
  order: (id: string) => ['orders', id] as const,
  categories: (filters: CategoryFilters) => ['categories', filters] as const,
  menuItems: (filters: MenuItemFilters) => ['menu-items', filters] as const,
  employees: (filters: EmployeeFilters) => ['employees', filters] as const,
  employee: (id: string) => ['employees', id] as const,
};
```

Object trong query key phải ổn định và chỉ chứa giá trị serializable.

## 16. Test bắt buộc

- OWNER login; sai mật khẩu; inactive; non-OWNER bị từ chối.
- Restore session, refresh rotation và nhiều request đồng thời cùng `401`.
- Không tạo vòng lặp refresh khi refresh endpoint trả `401`.
- Dashboard `days=1/7/30`, empty state, zero values và pull-to-refresh.
- Chart với 0, 1 và nhiều data point.
- Decode tiền dạng decimal string và format VND.
- Order filters, pagination, detail và timeline.
- Menu/category/employee loading, empty, offline và error state.
- Logout online/offline đều xóa SecureStore và cache.
- API base URL cho device thật, iOS Simulator và Android Emulator.
- Accessibility label, font scaling và màn hình nhỏ.

Mock HTTP bằng MSW; không mock trực tiếp Axios trong component test. Test mapper/decoder riêng với fixture từ OpenAPI hoặc response backend thật đã loại dữ liệu nhạy cảm.

## 17. Thứ tự triển khai

1. Khởi tạo Expo Router, theme và cấu hình môi trường.
2. Tạo API client, error normalization và Zod DTO schemas.
3. Tạo SecureStore token store và single-flight refresh.
4. Hoàn thành auth gate, Login, restore và logout.
5. Hoàn thành Dashboard với API thật.
6. Hoàn thành Orders list/detail.
7. Hoàn thành Category/Menu và Employees.
8. Thêm offline cache, foreground refetch và accessibility.
9. Chạy unit/component/integration tests trên iOS và Android.
10. Tạo development build, staging build HTTPS rồi production build.

## 18. Definition of Done

- Chỉ OWNER có thể sử dụng app.
- Không chứa server secret trong bundle/config.
- App dùng đúng API thật; không dùng dashboard mock.
- Bốn tab và toàn bộ read-only screen hoạt động trên iOS và Android.
- Refresh token rotate an toàn, single-flight và lưu trong SecureStore.
- Loading, empty, offline, `401`, `403`, `5xx` có UI rõ ràng.
- Dashboard refetch khi foreground và hỗ trợ pull-to-refresh.
- Không có mutation của SERVICE_STAFF, BARISTA hoặc OWNER trong MVP.
- Local development dùng đúng IP LAN; staging/production dùng HTTPS.
- Test auth, networking, mapper, pagination và accessibility đạt yêu cầu.

## 19. Traceability

| Hạng mục | Nguồn code |
| --- | --- |
| Admin login/session | `backend/apps/api/src/modules/auth/` |
| Dashboard aggregate | `backend/apps/api/src/modules/admin/dashboard.*` |
| Admin orders | `backend/apps/api/src/modules/admin/` |
| Employee API | `backend/apps/api/src/modules/employees/` |
| Category/item API | `backend/apps/api/src/modules/menu/` |
| Status canonical | `backend/prisma/schema.prisma` |
| API contract | `backend/docs/openapi.yaml`, `backend/docs/api-contract.md` |
| Dashboard UI tham khảo | `frontend/src/app/(admin)/dashboard/page.tsx` |

Khi backend contract thay đổi, cập nhật OpenAPI, API contract, DTO schema, mapper và tài liệu này trong cùng change.
