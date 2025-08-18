# 🔗 URL Redirector

**備註**：這個是一個 toy project，用來練閒短網址產生器相關的專案。

A URL shortener service built with Express.js, MongoDB, and Docker.

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

**Local development:**

```bash
npm install
npm run dev
```

**Docker development:**

```bash
npm run docker:build  # Build and start
npm run docker:down   # Stop services
```

## 📋 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run docker:up` - Start Docker Compose services
- `npm run docker:down` - Stop Docker Compose services
- `npm run docker:build` - Build and start Docker services

## 🛠️ Tech Stack

- **Backend**: Express.js
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose
- **Documentation**: Swagger UI (coming soon)

## 📁 Project Structure

```
url-redirector/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/         # API routes
│   ├── models/         # Database models
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Helper functions
│   └── config/         # Configuration files
├── scripts/
│   └── mongo-init.js   # MongoDB initialization
├── server.js           # Main application file
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

## ⚡ Next Steps

1. Implement URL shortening logic
2. Add MongoDB models and services
3. Create API endpoints
4. Add Swagger documentation
5. Implement security measures

## 📝 License

MIT
