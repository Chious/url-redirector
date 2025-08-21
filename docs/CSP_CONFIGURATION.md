# Content Security Policy (CSP) 設定說明

## 問題描述

在開發環境中，當前端嘗試載入 QR Code 圖片時，會遇到 CSP 錯誤：

```
Refused to load the image 'localhost:3000/api/qr/p3Fc6f' because it violates the following Content Security Policy directive: "img-src 'self' data: blob: https: https://api.qrserver.com https://chart.googleapis.com".
```

## 解決方案

### 動態 CSP 設定

伺服器現在根據環境動態調整 CSP 策略：

```typescript
// 開發環境額外允許本地 HTTP 連接
if (isDevelopment) {
  baseCSPDirectives.imgSrc.push(
    "http://localhost:*", // 允許本地開發環境的 HTTP 連接
    "http://127.0.0.1:*" // 允許本地 IP 的 HTTP 連接
  );
  baseCSPDirectives.connectSrc.push(
    "http://localhost:*", // 允許本地開發環境的 API 呼叫
    "http://127.0.0.1:*" // 允許本地 IP 的 API 呼叫
  );
}
```

### 安全考量

1. **開發環境**：

   - 允許 `http://localhost:*` 和 `http://127.0.0.1:*`
   - 方便本地開發和測試

2. **生產環境**：
   - 僅允許 HTTPS 連接
   - 維持較嚴格的安全策略

### CSP 指令說明

| 指令          | 開發環境                                                                         | 生產環境                             | 說明            |
| ------------- | -------------------------------------------------------------------------------- | ------------------------------------ | --------------- |
| `img-src`     | `'self'`, `data:`, `blob:`, `https:`, `http://localhost:*`, `http://127.0.0.1:*` | `'self'`, `data:`, `blob:`, `https:` | 圖片載入來源    |
| `connect-src` | `'self'`, `https:`, `http://localhost:*`, `http://127.0.0.1:*`                   | `'self'`, `https:`                   | API 呼叫來源    |
| `script-src`  | `'self'`, `'unsafe-inline'`, `'unsafe-eval'`                                     | 同左                                 | JavaScript 執行 |
| `style-src`   | `'self'`, `'unsafe-inline'`, `https://fonts.googleapis.com`                      | 同左                                 | CSS 載入        |

### QR Code 功能流程

1. **前端請求**：

   ```javascript
   // 從 API 回應中取得 qrCodeUrl
   if (data.qrCodeUrl) {
     qrImg.src = data.qrCodeUrl; // 例如: http://localhost:3000/api/qr/p3Fc6f
   }
   ```

2. **後端生成**：

   ```typescript
   // urlService.ts 中生成 QR Code URL
   qrCodeUrl: `${this.baseUrl}/api/qr/${shortCode}`;
   ```

3. **CSP 檢查**：
   - 開發環境：允許 `http://localhost:3000/api/qr/p3Fc6f`
   - 生產環境：要求 HTTPS

## 相關檔案

- `src/server.ts`：CSP 設定
- `src/services/urlService.ts`：QR Code URL 生成
- `src/controllers/qrController.ts`：QR Code API 端點
- `public/app.js`：前端 QR Code 載入

## 疑難排解

### 問題：CSP 仍然阻擋圖片載入

**解決**：

1. 確認環境變數 `NODE_ENV` 設定正確
2. 重新啟動伺服器
3. 檢查瀏覽器開發者工具的 Console

### 問題：生產環境中 QR Code 無法載入

**解決**：

1. 確保 `BASE_URL` 環境變數使用 HTTPS
2. 檢查 SSL 憑證設定
3. 驗證 CSP 設定不包含開發環境的 HTTP 規則
