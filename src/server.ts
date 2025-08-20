import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import routes from "./routes/index";
import initSwagger from "./config/swagger";
import HealthService from "./services/healthService";
import {
  HealthResponse,
  ApiResponse,
  ErrorResponse,
  RateLimitConfig,
} from "./types";

// Load environment variables
dotenv.config();

const app = express();
const PORT: number = parseInt(process.env["PORT"] || "3000");

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting configuration
const rateLimitConfig: RateLimitConfig = {
  windowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000"), // 15 minutes
  max: parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "100"), // limit each IP to 100 requests per windowMs
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
app.get("/", (req: Request, res: Response<ApiResponse>) => {
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

// Mount all routes
app.use("/", routes);

// 404 handler
app.use("*", (req: Request, res: Response<ErrorResponse>) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(
  (
    error: Error,
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
  ) => {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env["NODE_ENV"] === "development"
          ? error.message
          : "Something went wrong",
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env["NODE_ENV"] || "development"}`);
});

export default app;
