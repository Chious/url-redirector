import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import routes from "./routes/index";
import initSwagger from "./config/swagger";
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
 *     summary: Health check endpoint
 *     description: Check if the server is running properly
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */
app.get("/health", (req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API health check
 *     description: Check if the API is functioning correctly
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
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
 */
app.get("/api/health", (req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
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
