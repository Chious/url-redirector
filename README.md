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

## Spec & API Endpoints

TD;LR

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

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server (requires build)
- `npm run dev` - Start development server with TypeScript
- `npm run dev:watch` - Compile TypeScript in watch mode
- `npm run clean` - Remove build directory
- `npm run docker:up` - Start Docker Compose services
- `npm run docker:down` - Stop Docker Compose services
- `npm run docker:build` - Build and start Docker services

## 📁 Project Structure

```
url-redirector/
├── src/
│   ├── types/           # TypeScript type definitions
│   ├── controllers/     # Request handlers
│   ├── routes/         # API routes (TypeScript)
│   ├── models/         # Database models
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Helper functions
│   ├── config/         # Configuration files (TypeScript)
│   └── server.ts       # Main application file (TypeScript)
├── dist/               # Compiled JavaScript (build output)
├── scripts/
│   └── mongo-init.js   # MongoDB initialization
├── tsconfig.json       # TypeScript configuration
├── nodemon.json        # Nodemon configuration
├── Dockerfile          # Docker configuration
└── docker-compose.yml  # Multi-container setup
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

PRD: [prd.md](prd.md)
Prisma Setup: [PRISMA_SETUP.md](PRISMA_SETUP.md)
