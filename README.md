# Order Flow Manager

Ứng dụng Expo SDK 57 dành cho chủ quán, dùng Expo Router và API thật của Order Flow.

## Chạy local

```bash
npm install
cp .env.example .env.local
npx expo start --dev-client
```

Cập nhật `EXPO_PUBLIC_API_BASE_URL` trong `.env.local` theo thiết bị:

- Điện thoại thật: IP LAN của máy chạy backend, ví dụ `http://192.168.1.10:3001/api/v1`.
- iOS Simulator: `http://127.0.0.1:3001/api/v1`.
- Android Emulator: `http://10.0.2.2:3001/api/v1`.

Không dùng `localhost` trên điện thoại thật và không đặt secret trong biến `EXPO_PUBLIC_*`.

## Build profiles

| Profile | Variant | Phân phối | API |
| --- | --- | --- | --- |
| `development` | Dev Client | Internal, thiết bị thật | HTTP LAN được phép |
| `development-simulator` | Dev Client | iOS Simulator | HTTP local được phép |
| `staging` | Release-like | Internal (`.apk` trên Android) | Bắt buộc HTTPS |
| `production` | Store | App Store/Google Play | Bắt buộc HTTPS |

Development, staging và production có tên ứng dụng, scheme và application identifier riêng, nên có thể cài cạnh nhau. Chỉ development bật cleartext traffic và quyền kết nối mạng local.

### Cấu hình EAS Environment variables

Đăng nhập và liên kết project Expo trước lần build cloud đầu tiên:

```bash
npx eas-cli login
npx eas-cli init
```

Đặt URL HTTPS công khai. Profile staging dùng EAS environment `preview`:

```bash
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_API_BASE_URL --value https://staging-api.example.com/api/v1 --visibility plaintext
npx eas-cli env:create --environment production --name EXPO_PUBLIC_API_BASE_URL --value https://api.example.com/api/v1 --visibility plaintext
```

Các URL phía client không phải secret và sẽ được đóng vào bundle. Không đưa token, JWT secret, bot secret hoặc credential backend vào EAS client environment.

### Tạo build

```bash
npx eas-cli build --profile development --platform all
npx eas-cli build --profile development-simulator --platform ios
npx eas-cli build --profile staging --platform all
npx eas-cli build --profile production --platform all
```

Production mặc định tạo artifact dành cho store. Staging tạo bản internal để cài và kiểm thử trước khi phát hành.

## Kiểm tra chất lượng

```bash
npm test
npm run typecheck
npm run lint
npx expo install --check
```
