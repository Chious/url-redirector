# 🔗 URL Redirector

**備註**：這個是一個 toy project，用來練閒短網址產生器相關的專案。

A URL shortener service built with Express.js, TypeScript, MongoDB, and Docker.

## Tech Stack

- **Backend**: Express.js + TypeScript
- **ORM**: Prisma
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose
- **Documentation**: Swagger UI
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 📡 API 端點與前端介面

### 🚀 前端介面

- **網頁介面**: `http://localhost:3000/` - 完整的 URL 縮短服務前端
  - 響應式設計，支援桌面和行動裝置
  - URL 輸入與即時驗證
  - QR Code 自動生成與顯示
  - 點擊統計即時更新
  - 一鍵複製短網址功能

### 📡 主要 API 端點

| 方法   | 端點                   | 功能     | 說明                     |
| ------ | ---------------------- | -------- | ------------------------ |
| `GET`  | `/`                    | 前端介面 | 網頁版 URL 縮短服務      |
| `POST` | `/api/shorten`         | 縮短 URL | 將長網址轉換為短網址     |
| `GET`  | `/:shortCode`          | 重新導向 | 使用短碼重新導向至原網址 |
| `GET`  | `/api/info/:shortCode` | URL 統計 | 取得點擊次數和建立時間   |
| `GET`  | `/api/qr/:shortCode`   | QR Code  | 生成短網址的 QR Code     |
| `GET`  | `/api/stats`           | 系統統計 | 整體使用統計資訊         |
| `GET`  | `/health`              | 健康檢查 | 系統狀態監控             |

### 📋 API 使用範例

**縮短 URL**:

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com/very/long/url"}'
```

**取得 QR Code**:

```bash
# PNG 格式 (預設)
curl http://localhost:3000/api/qr/abc123 --output qr.png

# Base64 格式
curl "http://localhost:3000/api/qr/abc123?format=base64"
```

**查看統計**:

```bash
curl http://localhost:3000/api/info/abc123
```

### 🔧 進階功能

- **QR Code 自訂**: 支援不同尺寸 (100-500px) 和格式 (PNG/Base64)
- **點擊追蹤**: 自動記錄每次短網址的存取
- **重複檢測**: 相同 URL 返回已存在的短碼
- **nanoid 短碼**: 使用 nanoid 產生安全、唯一的短碼

### 📚 詳細文檔

- **完整 API 規格**: [docs/API_SPEC.md](docs/API_SPEC.md)
- **Swagger UI**: `http://localhost:3000/api-docs`
- **測試文檔**: [tests/README.md](tests/README.md)

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)

### 🚀 一鍵啟動 (適合新開發者)

**只需要一個指令就能啟動整個應用：**

```bash
git clone <your-repo-url>
cd url-redirector
docker compose up
```

就這樣！應用會自動：

- 建立 Docker 容器
- 安裝所有依賴套件
- 啟動 Express 應用程式
- 啟動 MongoDB 資料庫
- 啟動 MongoDB 管理介面

### 📋 詳細安裝步驟

1. **Clone 專案**

   ```bash
   git clone <your-repo-url>
   cd url-redirector
   ```

2. **環境變數設定 (可選)**

   ```bash
   cp .env.example .env
   # 如需要可以編輯 .env 檔案
   ```

3. **啟動服務**

   ```bash
   # 使用 Docker (推薦)
   docker compose up

   # 或使用 npm 腳本
   npm run docker:up
   ```

4. **Access the application**
   - API: http://localhost:3000
   - Health Check: http://localhost:3000/health
   - MongoDB Admin: http://localhost:8081 (admin/admin123)

### Development

前置步驟：起動 MongoDB 資料庫、配置環境變數

```bash
docker compose up mongo # 起動 MongoDB 資料庫
cp .env.example .env # 複製一份環境變數檔案
```

**Local development:**

```bash
npm install
npm run build    # Compile TypeScript
npm run dev      # Start development server with TypeScript
```

**TypeScript development with watch mode:**

```bash
npm run dev:watch  # Compile TypeScript in watch mode
npm run dev        # Start development server (in another terminal)
```

**Docker development:**

```bash
npm run docker:build  # Build and start
npm run docker:down   # Stop services
```

## 📋 Available Scripts

### 🏗️ 建置與開發

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server (requires build)
- `npm run dev` - Start development server with TypeScript
- `npm run dev:watch` - Compile TypeScript in watch mode
- `npm run clean` - Remove build directory

### 🐳 Docker 容器管理

- `npm run docker:up` - Start Docker Compose services
- `npm run docker:down` - Stop Docker Compose services
- `npm run docker:build` - Build and start Docker services

### 🧪 測試相關

- `npm test` - 執行所有測試 (Vitest)
- `npm run test:run` - 執行測試一次 (CI 模式)
- `npm run test:watch` - 監聽模式執行測試
- `npm run test:coverage` - 產生測試覆蓋率報告
- `npm run test:ui` - 啟動測試 UI 介面

### 🗄️ 資料庫相關

- `npm run db:generate` - 產生 Prisma 客戶端
- `npm run db:push` - 推送 schema 變更至資料庫
- `npm run db:seed` - 執行資料庫種子資料
- `npm run db:studio` - 啟動 Prisma Studio 管理介面

## 📁 Project Structure

```
url-redirector/
├── src/                    # 📦 原始碼
│   ├── types/              # TypeScript type definitions
│   ├── controllers/        # Request handlers (API controllers)
│   ├── routes/             # API routes (TypeScript)
│   ├── models/             # Database models (Prisma)
│   ├── services/           # Business logic layer
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Helper functions
│   ├── config/             # Configuration files (TypeScript)
│   └── server.ts           # Main application file (TypeScript)
├── tests/                  # 🧪 測試檔案
│   ├── setup.ts            # 測試環境設定
│   ├── controllers/        # Controller 整合測試
│   ├── services/           # Service 單元測試
│   ├── utils/              # Utils 單元測試
│   └── README.md           # 測試文檔說明
├── public/                 # 🎨 前端靜態檔案
│   └── index.html          # URL 縮短服務前端介面
├── prisma/                 # 🗄️ 資料庫設定
│   ├── schema.prisma       # 資料庫 schema 定義
│   └── seed.ts             # 種子資料
├── dist/                   # 📦 編譯後的 JavaScript
├── scripts/                # 🔧 輔助腳本
│   └── mongo-init.js       # MongoDB 初始化
├── docs/                   # 📚 文檔
│   ├── API_SPEC.md         # API 規格文檔
│   └── TASK3_COMPLETION_SUMMARY.md # Task 3 完成總結
├── .taskmaster/            # 📋 TaskMaster 專案管理
│   ├── tasks/              # 任務清單
│   └── docs/               # 專案文檔
├── tsconfig.json           # TypeScript 設定
├── vitest.config.ts        # Vitest 測試設定
├── nodemon.json            # Nodemon 設定
├── Dockerfile              # Docker 容器設定
└── docker-compose.yml      # 多容器編排設定
```

## 🔧 Configuration

Environment variables in `.env`:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `BASE_URL` - Base URL for short links
- `SHORT_CODE_LENGTH` - Length of generated short codes
- `RATE_LIMIT_*` - Rate limiting configuration

## Database Setup

1. 環境變數請參考 `.env.example` 檔案，並複製一份到 `.env` 檔案

```bash
cp .env.example .env
```

```bash
MONGO_INITDB_ROOT_USERNAME= #Mongo帳號
MONGO_INITDB_ROOT_PASSWORD= #Mongo密碼
```

2. 啟動 MongoDB 資料庫

```bash
docker compose up mongo
```

3. Database 管理介面，目前有配置 `mongo-express` 服務，可以透過 `http://localhost:8081` 進入，相關環境變數配置同樣請參考 `.env.example` 檔案

```bash
MONGO_INITDB_ROOT_USERNAME= #Mongo帳號
MONGO_INITDB_ROOT_PASSWORD= #Mongo密碼
ME_CONFIG_BASICAUTH_USERNAME=  # 後台登入帳號
ME_CONFIG_BASICAUTH_PASSWORD=  # 後台登入密碼
```

### 備案 2：資料庫預覽 UI -- Prisma Studio

```bash
npx prisma generate // 產生 prisma 客戶端，供 DB 存取
npm run db:studio // 啟動 prisma studio，可以透過這個介面瀏覽資料庫
```

詳細設定請參考 [PRISMA_SETUP.md](PRISMA_SETUP.md)，裡面包含 schema 及 Prisma 相關指令說明。

## ⚡ Next Steps

1. Implement URL shortening logic
2. Add MongoDB models and services
3. Create API endpoints
4. Add Swagger documentation
5. Implement security measures

## 📝 License

MIT

## 📚 Reference

### 📋 專案文檔

- **PRD**: [prd.md](prd.md) - 產品需求文檔
- **API 規格**: [docs/API_SPEC.md](docs/API_SPEC.md) - 完整 API 文檔
- **測試說明**: [tests/README.md](tests/README.md) - 測試架構與案例

### 🔧 技術文檔

- **Prisma 設定**: [PRISMA_SETUP.md](PRISMA_SETUP.md) - 資料庫設定指南
- **Task 3 總結**: [docs/TASK3_COMPLETION_SUMMARY.md](docs/TASK3_COMPLETION_SUMMARY.md) - 實作完成報告

### 🌐 線上資源

- **Swagger UI**: http://localhost:3000/api-docs - 互動式 API 文檔
- **前端介面**: http://localhost:3000/ - URL 縮短服務
- **健康檢查**: http://localhost:3000/health - 系統狀態監控
- **資料庫管理**: http://localhost:8081 - Mongo Express (admin/admin123)
