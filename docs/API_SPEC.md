# 📡 API 規格文檔

URL Redirector 提供完整的 RESTful API 服務，支援 URL 縮短、QR Code 生成、統計查詢等功能。

## 🌐 基本資訊

- **Base URL**: `http://localhost:3000`
- **API Version**: `1.0.0`
- **Content-Type**: `application/json`
- **API Documentation**: `http://localhost:3000/api-docs` (Swagger UI)

## 📋 API 端點總覽

| 方法 | 端點 | 功能 | 狀態 |
|------|------|------|------|
| `POST` | `/api/shorten` | 縮短 URL | ✅ |
| `GET` | `/:shortCode` | 重新導向至原始 URL | ✅ |
| `GET` | `/api/info/:shortCode` | 取得 URL 統計資訊 | ✅ |
| `GET` | `/api/qr/:shortCode` | 生成 QR Code | ✅ |
| `GET` | `/api/stats` | 取得系統統計 | ✅ |
| `GET` | `/health` | 健康檢查 | ✅ |
| `GET` | `/api` | API 資訊 | ✅ |
| `GET` | `/` | 前端介面 | ✅ |

---

## 🔗 URL 縮短服務

### POST /api/shorten
縮短一個長網址，返回短網址和 QR Code URL。

#### 請求
```http
POST /api/shorten
Content-Type: application/json

{
  "url": "https://www.example.com/very/long/url/path"
}
```

#### 請求參數
| 參數 | 類型 | 必需 | 描述 |
|------|------|------|------|
| `url` | string | ✅ | 要縮短的原始 URL (必須是 http/https) |

#### 回應範例
```json
{
  "success": true,
  "message": "URL shortened successfully",
  "data": {
    "shortUrl": "http://localhost:3000/abc123",
    "originalUrl": "https://www.example.com/very/long/url/path",
    "shortCode": "abc123",
    "isNew": true,
    "qrCodeUrl": "http://localhost:3000/api/qr/abc123"
  }
}
```

#### 錯誤回應
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "url",
      "message": "Must be a valid URL"
    }
  ]
}
```

#### 狀態碼
- `200` - 成功 (新建立或已存在)
- `400` - 請求參數錯誤
- `500` - 伺服器內部錯誤

---

## 🔄 URL 重新導向

### GET /:shortCode
使用短碼重新導向至原始 URL，並自動增加點擊次數。

#### 請求
```http
GET /abc123
```

#### 路徑參數
| 參數 | 類型 | 描述 |
|------|------|------|
| `shortCode` | string | 短網址代碼 (3-10 字元) |

#### 回應
- **成功**: HTTP 302 重新導向至原始 URL
- **失敗**: 返回 404 錯誤頁面

#### 錯誤回應
```json
{
  "success": false,
  "message": "Short URL not found"
}
```

#### 狀態碼
- `302` - 重新導向成功
- `400` - 短碼格式錯誤
- `404` - 短碼不存在
- `500` - 伺服器內部錯誤

---

## 📊 統計資訊

### GET /api/info/:shortCode
取得特定短網址的詳細統計資訊。

#### 請求
```http
GET /api/info/abc123
```

#### 路徑參數
| 參數 | 類型 | 描述 |
|------|------|------|
| `shortCode` | string | 短網址代碼 |

#### 回應範例
```json
{
  "success": true,
  "message": "URL statistics retrieved successfully",
  "data": {
    "originalUrl": "https://www.example.com/very/long/url/path",
    "shortCode": "abc123",
    "clickCount": 42,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:25:30.000Z"
  }
}
```

#### 狀態碼
- `200` - 查詢成功
- `400` - 短碼格式錯誤
- `404` - 短碼不存在
- `500` - 伺服器內部錯誤

### GET /api/stats
取得系統整體統計資訊。

#### 請求
```http
GET /api/stats
```

#### 回應範例
```json
{
  "success": true,
  "data": {
    "totalUrls": 1234,
    "recentUrls": [
      {
        "id": "507f1f77bcf86cd799439011",
        "originalUrl": "https://example.com",
        "shortCode": "abc123",
        "clickCount": 5,
        "createdAt": "2024-01-20T10:00:00.000Z",
        "updatedAt": "2024-01-20T15:30:00.000Z"
      }
    ]
  }
}
```

---

## 🧩 QR Code 生成

### GET /api/qr/:shortCode
為短網址生成 QR Code，支援多種格式和尺寸。

#### 請求
```http
GET /api/qr/abc123?format=png&size=200
```

#### 路徑參數
| 參數 | 類型 | 描述 |
|------|------|------|
| `shortCode` | string | 短網址代碼 |

#### 查詢參數
| 參數 | 類型 | 預設值 | 描述 |
|------|------|--------|------|
| `format` | string | `png` | 輸出格式 (`png` 或 `base64`) |
| `size` | number | `200` | 圖片尺寸 (100-500 像素) |

#### 回應

**PNG 格式 (預設)**:
```http
Content-Type: image/png
Cache-Control: public, max-age=86400

[二進位 PNG 圖片資料]
```

**Base64 格式**:
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "shortCode": "abc123",
    "format": "base64",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "size": 200
  }
}
```

#### 錯誤回應
```json
{
  "success": false,
  "message": "Invalid parameters",
  "errors": [
    {
      "field": "size",
      "message": "Size must be between 100 and 500"
    }
  ]
}
```

#### 狀態碼
- `200` - 生成成功
- `400` - 參數錯誤
- `404` - 短碼不存在
- `500` - 生成失敗

---

## 🏥 系統監控

### GET /health
檢查系統健康狀態，包含資料庫連線和基本統計。

#### 請求
```http
GET /health
```

#### 回應範例
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T15:30:45.123Z",
  "uptime": 3600.256,
  "database": {
    "status": "connected",
    "responseTime": 12,
    "lastChecked": "2024-01-20T15:30:45.100Z"
  },
  "details": {
    "totalUrls": 1234,
    "version": "1.0.0"
  }
}
```

#### 狀態碼
- `200` - 系統正常
- `503` - 系統異常 (資料庫斷線等)

### GET /api
取得 API 基本資訊和端點清單。

#### 回應範例
```json
{
  "name": "URL Redirector API",
  "version": "1.0.0",
  "description": "A simple URL shortener service",
  "endpoints": {
    "POST /api/shorten": "Create a short URL",
    "GET /:shortCode": "Redirect to original URL",
    "GET /api/health": "Health check",
    "GET /api/info/:shortCode": "Get URL statistics",
    "GET /api/qr/:shortCode": "Generate QR Code for short URL"
  },
  "docs": "/api-docs"
}
```

---

## 🎨 前端介面

### GET /
提供完整的網頁使用者介面，支援所有 API 功能。

#### 功能特色
- 📱 **響應式設計** - 支援桌面和行動裝置
- 🔗 **URL 縮短** - 即時輸入驗證和縮短
- 🧩 **QR Code 顯示** - 自動生成和顯示 QR Code
- 📊 **統計資料** - 即時點擊次數和建立時間
- 📋 **一鍵複製** - 快速複製短網址
- 🔄 **自動更新** - 每 30 秒更新統計資料

#### 使用流程
1. 輸入長網址
2. 點擊「縮短網址」
3. 查看生成的短網址和 QR Code
4. 複製短網址或掃描 QR Code
5. 查看即時點擊統計

---

## 🔒 安全與限制

### 輸入驗證
- **URL 格式**: 僅接受 `http://` 和 `https://` 協議
- **短碼長度**: 3-10 字元，包含字母和數字
- **QR Code 尺寸**: 100-500 像素範圍

### 錯誤處理
所有 API 端點都採用統一的錯誤回應格式：

```json
{
  "success": false,
  "message": "錯誤描述",
  "errors": [
    {
      "field": "參數名稱",
      "message": "具體錯誤訊息"
    }
  ]
}
```

### 安全措施
- ✅ **CORS 設定** - 跨域請求控制
- ✅ **Helmet 防護** - 基本 HTTP 安全標頭
- ✅ **輸入驗證** - express-validator 參數檢查
- ⏳ **速率限制** - (規劃中) 防止濫用
- ⏳ **XSS 防護** - (規劃中) 輸入清理

---

## 📊 回應狀態碼總覽

| 狀態碼 | 說明 | 使用情境 |
|--------|------|----------|
| `200` | 成功 | 一般 API 操作成功 |
| `302` | 重新導向 | 短網址重新導向 |
| `400` | 請求錯誤 | 參數驗證失敗 |
| `404` | 找不到資源 | 短碼不存在 |
| `500` | 伺服器錯誤 | 系統內部錯誤 |
| `503` | 服務不可用 | 資料庫連線問題 |

---

## 🔧 開發工具

### Swagger UI
- **網址**: `http://localhost:3000/api-docs`
- **功能**: 互動式 API 測試介面
- **特色**: 即時測試、請求/回應範例

### 測試指令
```bash
# 健康檢查
curl http://localhost:3000/health

# 縮短 URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}'

# 取得統計
curl http://localhost:3000/api/info/abc123

# 下載 QR Code
curl http://localhost:3000/api/qr/abc123 --output qr.png
```

---

**API 設計原則**: RESTful、直觀、安全 🚀  
**更新頻率**: 隨功能開發持續更新  
**問題回報**: 請建立 Issue 或聯繫開發團隊
