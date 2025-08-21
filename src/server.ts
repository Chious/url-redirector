import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import routes from "./routes/index";
import initSwagger from "./config/swagger";
import HealthService from "./services/healthService";
import EnvironmentConfig from "./config/environment";
import {
  HealthResponse,
  ApiResponse,
  ErrorResponse,
  RateLimitConfig,
} from "./types";

// 初始化環境配置 (根據 NODE_ENV 自動載入對應的 .env 檔案)
EnvironmentConfig.getInstance().configure();

const app = express();
const PORT: number = EnvironmentConfig.getNumber("PORT", 3000);

// 設定樣板引擎 (EJS)
app.set("view engine", "ejs");
// 根據執行環境設定 views 目錄路徑
const isProduction = EnvironmentConfig.get("NODE_ENV") === "production";
const viewsPath = isProduction
  ? path.join(__dirname, "views") // 生產環境：使用 dist/views
  : path.join(__dirname, "../src/views"); // 開發環境：使用 src/views
app.set("views", viewsPath);

// Security middleware - 使用 helmet 設定 CSP (根據環境動態調整)
const isDevelopment = EnvironmentConfig.get("NODE_ENV") === "development";

// 基礎 CSP 設定
const baseCSPDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // 允許內聯腳本
    "'unsafe-eval'", // 允許 eval() (某些功能可能需要)
  ],
  scriptSrcAttr: [
    "'unsafe-inline'", // 明確允許內聯事件處理器 (onclick, onload 等)
    "'unsafe-hashes'", // 允許事件處理器的雜湊值
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // 允許內聯樣式
    "https://fonts.googleapis.com",
  ],
  styleSrcAttr: [
    "'unsafe-inline'", // 允許 style 屬性
  ],
  imgSrc: [
    "'self'",
    "data:", // 允許 data URIs (例如 base64 圖片)
    "blob:", // 允許 blob URIs
    "https:", // 允許所有 HTTPS 圖片來源
    "https://api.qrserver.com", // QR Code 服務
    "https://chart.googleapis.com", // Google Charts (如果需要)
  ],
  connectSrc: [
    "'self'",
    "https:", // 允許 HTTPS API 呼叫
  ],
  fontSrc: [
    "'self'",
    "data:",
    "https://fonts.gstatic.com",
    "https://fonts.googleapis.com",
  ],
  styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  objectSrc: ["'none'"], // 禁止 object 標籤 (安全考量)
  baseUri: ["'self'"], // 限制 base 標籤
  formAction: ["'self'"], // 限制表單提交目標
};

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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: baseCSPDirectives,
    },
  })
);
app.use(cors());

// Rate limiting configuration
const rateLimitConfig: RateLimitConfig = {
  windowMs: EnvironmentConfig.getNumber("RATE_LIMIT_WINDOW_MS", 900000), // 15 minutes
  max: EnvironmentConfig.getNumber("RATE_LIMIT_MAX_REQUESTS", 100), // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
};

const limiter = rateLimit(rateLimitConfig);

// Swagger UI setup
initSwagger(app);

app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 靜態檔案服務 (CSS, JS, 圖片等)
const publicPath = isProduction
  ? path.join(__dirname, "public") // 生產環境：使用 dist/public
  : path.join(__dirname, "../public"); // 開發環境：使用 public
app.use(express.static(publicPath));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Comprehensive health check endpoint
 *     description: Check if the server and database are functioning properly
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server and database are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok, error]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [connected, disconnected, error]
 *                     responseTime:
 *                       type: number
 *                       description: Database response time in milliseconds
 *                     lastChecked:
 *                       type: string
 *                       format: date-time
 *                 details:
 *                   type: object
 *                   properties:
 *                     totalUrls:
 *                       type: number
 *                       description: Total number of URLs in database
 *                     version:
 *                       type: string
 *       500:
 *         description: Server or database is unhealthy
 */
app.get("/health", async (req: Request, res: Response) => {
  try {
    const healthResult = await HealthService.performHealthCheck();

    // Return appropriate status code based on health check result
    const statusCode = healthResult.status === "ok" ? 200 : 500;

    res.status(statusCode).json(healthResult);
  } catch (error) {
    console.error("Health check endpoint error:", error);
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: "error",
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Health check failed",
      },
    });
  }
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Lightweight API health check
 *     description: Quick health check with database ping
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API and database are responsive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   example: "connected"
 *       500:
 *         description: Database is not accessible
 */
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const dbPing = await HealthService.pingDatabase();
    const status = dbPing ? "ok" : "error";
    const statusCode = dbPing ? 200 : 500;

    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      database: dbPing ? "connected" : "disconnected",
    });
  } catch (error) {
    console.error("API health check error:", error);
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "error",
      error: error instanceof Error ? error.message : "Health check failed",
    });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: URL Shortener Homepage
 *     description: Render the main page for URL shortening interface
 *     tags: [Frontend]
 *     responses:
 *       200:
 *         description: Homepage rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get("/", (req: Request, res: Response) => {
  res.render("index", {
    title: "縮網址產生器 - URL Shortener",
    pageTitle: "🔗 縮網址產生器",
    subtitle: "將長網址轉換為簡短易記的短網址，並產生 QR Code",
    env: EnvironmentConfig.get("NODE_ENV", "development"),
  });
});

/**
 * @swagger
 * /api/info:
 *   get:
 *     summary: API information
 *     description: Get basic information about the URL Redirector API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiInfo'
 */
app.get("/api/info", (req: Request, res: Response<ApiResponse>) => {
  res.json({
    message: "URL Shortener API",
    version: "1.0.0",
    description: "A simple and powerful URL shortening service",
    features: [
      "🔗 URL shortening",
      "📊 Click tracking",
      "🔄 Automatic redirection",
      "📝 Full CRUD operations",
      "✅ Input validation",
    ],
    endpoints: {
      health: "/health",
      api: "/api",
      docs: "/api-docs",
    },
    repository: "https://github.com/chious/url-redirector",
  });
});

// 注意：所有 API 路由現在由 routes/ 目錄中的專門控制器處理

// Mount all routes
app.use("/", routes);

// 404 handler
app.use("*", (req: Request, res: Response): void => {
  // 如果是 API 請求，返回 JSON
  if (req.originalUrl.startsWith("/api/")) {
    res.status(404).json({
      error: "Route not found",
      path: req.originalUrl,
    });
    return;
  }

  // 否則渲染錯誤頁面
  res.status(404).render("error", {
    title: "找不到頁面 - 404",
    pageTitle: "找不到頁面",
    subtitle: "您要尋找的頁面不存在",
    env: EnvironmentConfig.get("NODE_ENV", "development"),
  });
});

// Error handling middleware
app.use(
  (error: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error("Error:", error);

    // 如果是 API 請求，返回 JSON
    if (req.originalUrl.startsWith("/api/")) {
      res.status(500).json({
        error: "Internal server error",
        message: isDevelopment ? error.message : "Something went wrong",
      });
      return;
    }

    // 否則渲染錯誤頁面
    res.status(500).render("error", {
      title: "伺服器錯誤 - 500",
      pageTitle: "伺服器錯誤",
      subtitle: "發生未預期的錯誤，請稍後再試",
      env: EnvironmentConfig.get("NODE_ENV", "development"),
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(
    `🔧 Environment: ${EnvironmentConfig.get("NODE_ENV", "development")}`
  );
});

export default app;
