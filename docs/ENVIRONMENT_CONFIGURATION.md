# 環境配置指南 (Environment Configuration Guide)

本專案支援基於環境的配置管理，自動根據 `NODE_ENV` 載入對應的環境變數檔案。

## 📁 支援的環境檔案

### 1. 開發環境 (Development)

- **主要檔案**: `.env`
- **本地覆蓋**: `.env.local`
- **載入順序**: `.env` → `.env.local` (後者會覆蓋前者的同名變數)

### 2. 生產環境 (Production)

- **主要檔案**: `.env`
- **生產覆蓋**: `.env.production`
- **載入順序**: `.env` → `.env.production`

### 3. 測試環境 (Test)

- **主要檔案**: `.env`
- **測試覆蓋**: `.env.test`
- **載入順序**: `.env` → `.env.test`

## 🚀 使用方式

### 開發環境 (Local Development)

1. **複製環境檔案範例**:

   ```bash
   # 創建基本配置
   cp .env.local.example .env.local

   # 根據需要編輯配置
   nano .env.local
   ```

2. **啟動開發伺服器**:

   ```bash
   # 使用 nodemon 熱重載
   npm run dev

   # 或者使用編譯後的檔案
   npm run build
   npm run start:dev
   ```

### 生產環境 (Docker)

1. **創建生產環境配置**:

   ```bash
   # 創建生產配置
   cp .env.production.example .env.production

   # 編輯生產環境變數
   nano .env.production
   ```

2. **使用 Docker 部署**:

   ```bash
   # 生產環境部署
   npm run docker:build

   # 或者
   docker compose up --build
   ```

3. **開發環境 Docker**:

   ```bash
   # 使用開發環境配置
   npm run docker:dev

   # 或者手動指定
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up
   ```

### API 文件存取 (Swagger)

#### 開發環境

```bash
# 直接存取，無需認證
http://localhost:3000/api-docs
```

#### 生產環境

```bash
# 需要基本認證 (Basic Auth)
https://your-domain.com/api-docs

# 認證資訊
Username: 使用 ME_CONFIG_BASICAUTH_USERNAME 的值
Password: 使用 ME_CONFIG_BASICAUTH_PASSWORD 的值
```

**瀏覽器存取方式**:

1. 開啟 API 文件 URL
2. 瀏覽器會彈出認證對話框
3. 輸入帳號密碼即可存取

**API 工具存取方式** (如 Postman, curl):

```bash
# 使用 curl 存取
curl -u admin:admin https://your-domain.com/api-docs
```

## 🔧 環境變數清單

### 基本配置

| 變數名稱   | 預設值                  | 說明                                         |
| ---------- | ----------------------- | -------------------------------------------- |
| `NODE_ENV` | `development`           | 執行環境 (`development`/`production`/`test`) |
| `PORT`     | `3000`                  | 伺服器埠號                                   |
| `BASE_URL` | `http://localhost:3000` | 應用程式基礎 URL                             |

### 資料庫配置

| 變數名稱      | 說明             |
| ------------- | ---------------- |
| `MONGODB_URI` | MongoDB 連接字串 |

### API 配置

| 變數名稱          | 預設值 | 說明                      |
| ----------------- | ------ | ------------------------- |
| `SWAGGER_ENABLED` | `true` | 是否啟用 Swagger API 文件 |

### Swagger 認證 (生產環境)

生產環境下，Swagger API 文件會自動啟用基本認證保護：

| 變數名稱                       | 預設值  | 說明                           |
| ------------------------------ | ------- | ------------------------------ |
| `ME_CONFIG_BASICAUTH_USERNAME` | `admin` | Swagger & MongoDB Express 帳號 |
| `ME_CONFIG_BASICAUTH_PASSWORD` | `admin` | Swagger & MongoDB Express 密碼 |

**注意**: 這些認證資訊同時用於 MongoDB Express 和生產環境的 Swagger 文件存取。

### 速率限制

| 變數名稱                  | 預設值   | 說明                     |
| ------------------------- | -------- | ------------------------ |
| `RATE_LIMIT_WINDOW_MS`    | `900000` | 速率限制時間窗口 (毫秒)  |
| `RATE_LIMIT_MAX_REQUESTS` | `100`    | 每個時間窗口的最大請求數 |

### MongoDB Express (開發環境)

| 變數名稱                       | 預設值  | 說明                       |
| ------------------------------ | ------- | -------------------------- |
| `ME_CONFIG_BASICAUTH_USERNAME` | `admin` | MongoDB Express 使用者名稱 |
| `ME_CONFIG_BASICAUTH_PASSWORD` | `admin` | MongoDB Express 密碼       |

## 📝 配置檔案範例

### `.env.local` (開發環境)

```bash
# 開發環境配置
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# 資料庫配置 (本地開發)
MONGODB_URI=mongodb://localhost:27017/url-shortener-dev

# API 配置
SWAGGER_ENABLED=true

# 速率限制配置 (開發環境較寬鬆)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# MongoDB Express
ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=admin123

# 開發環境特定配置
DEBUG=true
LOG_LEVEL=debug
```

### `.env.production` (生產環境)

```bash
# 生產環境配置
NODE_ENV=production
PORT=3000
BASE_URL=https://your-domain.com

# 資料庫配置 (生產環境)
MONGODB_URI=mongodb://mongo:27017/url-shortener

# API 配置
SWAGGER_ENABLED=true

# Swagger 認證 (生產環境)
ME_CONFIG_BASICAUTH_USERNAME=your-secure-username
ME_CONFIG_BASICAUTH_PASSWORD=your-secure-password

# 速率限制配置 (生產環境較嚴格)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 安全配置
# SESSION_SECRET=your-production-session-secret
# CSP_REPORT_URI=https://your-csp-report-uri.com/report
```

## 🔒 安全注意事項

1. **永遠不要提交實際的環境檔案到版本控制**:

   ```bash
   # .gitignore 應包含
   .env
   .env.local
   .env.production
   .env.test
   ```

2. **只提交範例檔案**:

   - `.env.example`
   - `.env.local.example`
   - `.env.production.example`

3. **生產環境使用強密碼和安全連接字串**

4. **定期更新敏感資訊** (如 API 金鑰、資料庫密碼等)

5. **Swagger 安全設定**:
   - 生產環境建議使用強密碼
   - 考慮完全關閉生產環境的 Swagger (`SWAGGER_ENABLED=false`)
   - 如需保留，務必設定不同於預設值的認證資訊

## 🛠️ 故障排除

### 環境變數未載入

1. 檢查檔案路徑是否正確
2. 確認 `NODE_ENV` 設定正確
3. 查看伺服器啟動日誌中的環境配置資訊

### Docker 環境問題

1. 確認 `docker-compose.yml` 中的環境變數設定
2. 檢查是否正確使用 `.env.production`
3. 重新建構 Docker 映像檔

### 開發環境熱重載問題

1. 確認使用 `npm run dev` 而非 `npm start`
2. 檢查 `nodemon.json` 配置
3. 確認 `NODE_ENV=development` 已設定

## 📚 相關指令

```bash
# 開發環境
npm run dev                    # 開發模式 (熱重載)
npm run dev:prod              # 生產模式測試

# 生產環境
npm run build                 # 編譯 TypeScript
npm start                     # 啟動生產伺服器

# Docker
npm run docker:dev            # 開發環境 Docker
npm run docker:build          # 生產環境 Docker

# 測試
npm test                      # 執行測試
npm run test:coverage         # 測試覆蓋率報告
```

---

需要更多幫助，請參考專案的其他文件或建立 issue。
